'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {context,fields,source,CACHE}=require('./helpers/cardmarket-harness.cjs');
const {cards,productUrl,apiResponse}=require('./helpers/cardmarket-catalog.cjs');
const databases=[['embedded',JSON.parse(source.match(/const EMBEDDED_DATA = (.*);/)[1])],['cards.json',JSON.parse(fs.readFileSync('cards.json','utf8'))]];
const counts={database:0,direct:0,remote:cards.length,overlap:0,setLabels:0,async:0};
function safe(result,c){
 const u=new URL(result.url);assert.equal(u.protocol,'https:');
 if(result.exact) assert.ok(c.validCardmarketRoute(result.url.split('?')[0]));
 else{
  assert.equal(u.hostname,'www.cardmarket.com');assert.equal(u.pathname,'/en/Pokemon/Products/Search');
  assert.deepEqual([...u.searchParams.keys()],['searchString']);
  const term=u.searchParams.get('searchString');assert.ok(term);assert.doesNotMatch(term,/[Δδ\p{Cc}\p{Cf}\uFFFD]/u);assert.doesNotMatch(term,/delta species.*delta species/i);
 }
}
for(const [label,data] of databases) for(const card of data.knownCards){
 counts.database++;if(card.verified&&card.direct&&card.url)counts.direct++;
 test(`database ${label} ${card.key}`,()=>{
  const {c,calls}=context();c.DATA=data;
  const result=c.resolveFinalCardmarketRoute({...card,condition:'NM',edition:'1ST'});
  assert.equal(typeof result.then,'undefined');safe(result,c);assert.equal(calls.length,0);
  if(card.verified&&card.direct&&card.url)assert.equal(result.url,c.withFilters(card.url,card.language,'NM','1ST'));
  const dirty=card.name+' Δ δ \u200b\ufffd Delta Species Delta Species #'+card.number+' #'+card.number;
  const term=c.cleanCardmarketName(dirty,card.number);
  assert.equal(term,c.cleanCardmarketName(card.name,card.number));
  safe({url:c.searchUrl(dirty,card.number,card.language,'NM',card.set),exact:false},c);
 });
}
for(const card of cards) test('remote catalog '+card.source_id+' '+card.language,async()=>{
 const {c,calls}=context({fetch:async()=>({ok:true,json:async()=>({data:apiResponse(card)})})});
 // Simulate catalog records with no local DB match; verified legacy exceptions are deliberately kept.
 c.DATA.knownCards=[];
 const result=await c.resolveFinalCardmarketRoute(card);safe(result,c);
 if(card.language==='JP'){assert.equal(result.exact,false);assert.equal(calls.length,0);}
 else{assert.equal(result.exact,true);assert.equal(result.url.split('?')[0],productUrl(card));assert.equal(calls.length,card.source_id==='ex15-43'?0:1);}
});
const aliases=JSON.parse(source.match(/const SET_ALIASES = (.*);/)[1]);
for(const [longSet,longAliases] of aliases)for(const long of longAliases)for(const [shortSet,shortAliases] of aliases)for(const short of shortAliases){
 if(longSet===shortSet||!(' '+long+' ').includes(' '+short+' '))continue;
 counts.overlap++;
 test(`set overlap ${long} > ${short}`,()=>{const {c}=context();assert.equal(c.detectSet('Pikachu 25 '+long),longSet);assert.equal(c.removeSetWords('Pikachu 25 '+long),'pikachu 25');});
}
for(const [set,def] of Object.entries(databases[0][1].sets)){
 counts.setLabels++;
 test('canonical full set label '+def.label,()=>{const {c}=context();assert.equal(c.detectSet('Pikachu 25 '+def.label),set);assert.equal(c.removeSetWords('Pikachu 25 '+def.label),'pikachu 25');});
}
// Reproducible pseudo-random sample (seed 147); excludes inherited guaranteed legacy direct examples.
let seed=147;
const sample=cards.filter(c=>c.language==='EN'&&c.source_id!=='ex15-43').map(card=>{seed=(1664525*seed+1013904223)>>>0;return {card,key:seed};}).sort((a,b)=>a.key-b.key).slice(0,5).map(x=>x.card);
for(const card of sample){
 function stage(label,fn){counts.async++;test('async '+card.source_id+' '+label,fn);}
 stage('pending -> success; ready event final only',async()=>{
  let finish;const {c,events}=context({fetch:()=>new Promise(resolve=>finish=resolve)});c.DATA.knownCards=[];fields(c,card);c.selectCardmarketCard(card);
  const pending=c.makeLink(false);assert.equal(c.openBtn.dataset.cmState,'pending');assert.equal(c.openBtn.href,'#');assert.equal(c.openBtn.classList.contains('disabled'),true);assert.equal(c.openBtn.label.textContent,'Cardmarket zoeken…');assert.equal(events.filter(e=>e.type==='cardscout:cm-route-ready').length,0);
  finish({ok:true,json:async()=>({data:apiResponse(card)})});await pending;
  assert.equal(c.openBtn.dataset.cmState,'ready');assert.equal(c.openBtn.label.textContent,'Open Cardmarket');assert.equal(c.openBtn.classList.contains('disabled'),false);assert.equal(c.openBtn.href.split('?')[0],productUrl(card));assert.equal(events.filter(e=>e.type==='cardscout:cm-route-ready').length,1);
 });
 stage('timeout -> final fallback',async()=>{
  let timeout;const {c,events}=context({fetch:()=>new Promise(()=>{}),setTimeout:(fn,ms)=>{assert.ok([3000,8000].includes(ms));timeout=fn;return 1;},clearTimeout(){}});c.DATA.knownCards=[];fields(c,card);c.selectCardmarketCard(card);
  const pending=c.makeLink(false);assert.equal(c.openBtn.href,'#');timeout();await new Promise(resolve=>setImmediate(resolve));timeout();await pending;assert.equal(c.openBtn.dataset.cmState,'ready');const ready=events.filter(e=>e.type==='cardscout:cm-route-ready');assert.equal(ready.length,1);assert.equal(new URL(ready[0].detail.cardmarketUrl).searchParams.get('searchString'),c.cleanCardmarketName(card.name,card.number));
 });
 for(const failure of ['404','invalid identity'])stage(failure+' -> final fallback',async()=>{
  const {c,events}=context({fetch:async()=>failure==='404'?{ok:false,status:404}:{ok:true,json:async()=>({data:{...apiResponse(card),number:'9999'}})}});c.DATA.knownCards=[];fields(c,card);c.selectCardmarketCard(card);await c.makeLink(false);assert.equal(c.openBtn.dataset.cmState,'ready');assert.equal(events.filter(e=>e.type==='cardscout:cm-route-ready').length,1);safe({url:c.openBtn.href,exact:false},c);
 });
 stage('stale result neutralized',async()=>{
  let finish;const {c,events}=context({fetch:()=>new Promise(resolve=>finish=resolve)});c.DATA.knownCards=[];fields(c,card);c.selectCardmarketCard(card);const pending=c.makeLink(false);
  const next={name:'Next card',number:'1',set:'AUTO',language:'JP',condition:'NM',edition:'AUTO'};fields(c,next);c.selectCardmarketCard(next);await c.makeLink(false);const url=c.openBtn.href;finish({ok:true,json:async()=>({data:apiResponse(card)})});await pending;assert.equal(c.openBtn.href,url);assert.equal(events.filter(e=>e.type==='cardscout:cm-route-ready').length,1);
 });
 stage('cache immediately ready without network/pending',async()=>{
  const {c,calls,events}=context({storage:[[CACHE,JSON.stringify([{source_id:card.source_id,url:productUrl(card),timestamp:Date.now()}])]]});c.DATA.knownCards=[];fields(c,card);c.selectCardmarketCard(card);const complete=c.makeLink(false);assert.equal(c.openBtn.dataset.cmState,'ready');assert.equal(c.openBtn.href.split('?')[0],productUrl(card));assert.equal(events.some(e=>e.detail?.state==='pending'),false);assert.equal(calls.length,0);await complete;
 });
 stage('identical concurrent requests deduplicated',async()=>{
  let finish;const {c,calls,events}=context({fetch:()=>new Promise(resolve=>finish=resolve)});c.DATA.knownCards=[];fields(c,card);c.selectCardmarketCard(card);const first=c.makeLink(false);const second=c.makeLink(false);assert.equal(calls.length,1);finish({ok:true,json:async()=>({data:apiResponse(card)})});await Promise.all([first,second]);assert.equal(events.filter(e=>e.type==='cardscout:cm-route-ready').length,1);
 });
 stage('new search text clears pending and ignores old result',async()=>{
  let finish;const {c,events}=context({fetch:()=>new Promise(resolve=>finish=resolve)});c.DATA.knownCards=[];fields(c,card);c.selectCardmarketCard(card);const pending=c.makeLink(false);c.invalidateCardmarketSelection();finish({ok:true,json:async()=>({data:apiResponse(card)})});await pending;assert.equal(c.openBtn.dataset.cmState,'idle');assert.equal(c.openBtn.href,'#');assert.equal(events.filter(e=>e.type==='cardscout:cm-route-ready').length,0);
 });
}
test('JP shared ID cannot consume EN-only v146 cache',async()=>{const card=cards.at(-1);const {c,calls}=context({storage:[[CACHE,JSON.stringify([{source_id:card.source_id,url:productUrl(cards[0]),timestamp:Date.now()}])]]});assert.equal((await c.resolveFinalCardmarketRoute(card)).exact,false);assert.equal(calls.length,0);});
test('Engine ignores unrelated live DOM filter/quick-input values',async()=>{const {c}=context();c.nameInput.value='Wrong card';c.langSelect.value='JP';c.editionSelect.value='1ST';c.quickInput.value='reverse';const card={name:'Charizard',number:'3',set:'LEGENDARY COLLECTION',language:'EN',condition:'',edition:'AUTO',quickText:''};const result=await c.resolveFinalCardmarketRoute(card);assert.match(result.url,/Charizard-V1-LC3/);assert.doesNotMatch(result.url,/isFirstEd/);assert.equal(c.nameInput.value,'Wrong card');});
test('Generic source_id works without a TCGdex-specific source marker',async()=>{for(const source of ['catalog',undefined]){const card={...cards[0],source};const {c,calls}=context({fetch:async()=>({ok:true,json:async()=>({data:apiResponse(card)})})});c.DATA.knownCards=[];assert.equal((await c.resolveFinalCardmarketRoute(card)).exact,true);assert.equal(calls.length,1);}});
process.on('exit',()=>console.log('V147 AUDIT '+JSON.stringify(counts)));
