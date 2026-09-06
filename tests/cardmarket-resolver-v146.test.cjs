'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const source = fs.readFileSync('app-v137.js','utf8');
const CACHE = 'cardscout_cm_route_cache_v146';
const BAG = 'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Bagon-Delta-Species-DF43';
const AZU = 'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Delta-Species/Azumarill-Delta-Species-DS19';
const azumarill = {name:'Azumarill Δ',number:'19',set:'EX DELTA SPECIES',set_name:'EX Delta Species',language:'EN',source:'tcgdex',source_id:'ex11-19',condition:'NM',edition:'1ST'};
const bagon = {...azumarill,name:'Bagon Delta Species',number:'43',set:'EX DRAGON FRONTIERS',set_name:'EX Dragon Frontiers',source_id:'ex15-43'};
function api(card=azumarill, url=AZU){return {id:card.source_id,name:card.name,number:card.number,set:{id:card.source_id.split('-')[0],name:card.set_name.replace(/^EX /,'')},cardmarket:{url}};}
const {context,fields,fallback,isFallback}=require('./helpers/cardmarket-harness.cjs');
for(const [input,set,remaining] of [
 ['Bagon Delta Species 43 EX Dragon Frontiers','EX DRAGON FRONTIERS','bagon 43'],
 ['Charizard 4 Base Set 2','BASE SET 2','charizard 4'],
 ['Dark Dragonite 5 EX Team Rocket Returns','EX TEAM ROCKET RETURNS','dark dragonite 5'],
 ['Bagon 50 EX Dragon','EX DRAGON','bagon 50']
]) test('Longest alias: '+input,()=>{const {c}=context();assert.equal(c.detectSet(input),set);assert.equal(c.removeSetWords(input).replace(/\s+/g,' '),remaining);});
test('Delta symbols, duplicate Delta Species and invisible characters cleaned only for routing',()=>{
 const {c}=context();assert.equal(c.cleanCardmarketName('Azu\u200bmarill Δ δ \ufffd Delta Species Delta Species #019/113','19'),'Azumarill');
 fields(c,azumarill);c.buildUrl();assert.equal(c.nameInput.value,'Azumarill Δ');
 assert.equal(c.buildSearchTerm('Bagon Delta Species','43','EX DRAGON FRONTIERS'),'Bagon');
 assert.equal(c.buildSearchTerm('Porygon2','12','NEO REVELATION'),'Porygon2');
});
test('Bagon #43 uses existing exact special without API',async()=>{const {c,calls}=context();fields(c,bagon);const result=await c.resolveCardmarketRoute(bagon,c.buildUrl());assert.equal(result.url.split('?')[0],BAG);assert.equal(result.exact,true);assert.equal(calls.length,0);});
for(const [card,url] of [[bagon,BAG],[azumarill,AZU]]) test(card.name+' mocked resolver returns exact product URL',async()=>{
 const {c,calls,storage}=context({fetch:async()=>({ok:true,json:async()=>({data:api(card,url)})})});
 const result=await c.resolveCardmarketRoute(card,fallback(c,card));assert.equal(result.url.split('?')[0],url);assert.equal(result.exact,true);assert.equal(calls.length,1);
 assert.equal(calls[0][0],'https://api.pokemontcg.io/v2/cards/'+card.source_id);
 assert.deepEqual(Object.keys(calls[0][1]),['signal']);
 const entries=JSON.parse(storage.get(CACHE));assert.deepEqual(Object.keys(entries[0]).sort(),['source_id','timestamp','url']);assert.equal(entries[0].url,url);
});
test('Verified local route has priority over specials/API',async()=>{const {c,calls}=context();const result=await c.resolveCardmarketRoute({...azumarill,verified:true,direct:true,url:AZU},{url:BAG,exact:true});assert.equal(result.url.split('?')[0],AZU);assert.equal(calls.length,0);});
test('Charizard CG4 remains exact',()=>{const {c}=context();fields(c,{...azumarill,name:'Charizard',number:'4',set:'EX CRYSTAL GUARDIANS'});assert.match(c.buildUrl().url,/Charizard-Delta-Species-CG4/);assert.equal(c.buildUrl().exact,true);});
for(const [name,number,set] of [['Duskull','50','EX POWER KEEPERS'],['Igglybuff','21','EX CRYSTAL GUARDIANS'],['Dark Raticate','51','ROCKET']]) test(name+' name-only fallback without filters',()=>{const {c}=context();fields(c,{...azumarill,name,number,set});isFallback(c.buildUrl(),name);});
test('JP fallback never calls EN resolver',async()=>{const {c,calls}=context();const card={...azumarill,language:'JP',name:'ピカチュウ δ'};isFallback(await c.resolveCardmarketRoute(card,fallback(c,card)),'ピカチュウ');assert.equal(calls.length,0);});
test('API 404 and corrupt cache safely fall back',async()=>{const {c}=context({storage:[[CACHE,'{broken']]});isFallback(await c.resolveCardmarketRoute(azumarill,fallback(c,azumarill)),'Azumarill');});
test('Both API stages time out even if fetch ignores abort',async()=>{let delay,cb;const {c}=context({fetch:()=>new Promise(()=>{}),setTimeout:(fn,ms)=>{delay=ms;cb=fn;return 1;},clearTimeout:()=>{}});const pending=c.resolveCardmarketRoute(azumarill,fallback(c,azumarill));assert.equal(delay,3000);cb();await new Promise(resolve=>setImmediate(resolve));assert.equal(delay,8000);cb();isFallback(await pending,'Azumarill');});
test('Invalid JSON / network failure safely fall back',async()=>{for(const fetch of [async()=>{throw Error('offline');},async()=>({ok:true,json:async()=>{throw Error('bad JSON');}})]){const {c}=context({fetch});isFallback(await c.resolveCardmarketRoute(azumarill,fallback(c,azumarill)),'Azumarill');}});
test('Valid cached direct route performs no API request',async()=>{const {c,calls}=context({storage:[[CACHE,JSON.stringify([{source_id:'ex11-19',url:AZU,timestamp:Date.now()}])]]});const r=await c.resolveCardmarketRoute(azumarill,fallback(c,azumarill));assert.equal(r.url.split('?')[0],AZU);assert.equal(calls.length,0);});
test('Expired, future, malformed and non-array cache entries are ignored',async()=>{for(const raw of [JSON.stringify({oops:true}),...[-31*86400000,60000].map(age=>JSON.stringify([{source_id:'ex11-19',url:AZU,timestamp:Date.now()+age}])),JSON.stringify([{source_id:'ex11-19',url:'http://evil.test/',timestamp:Date.now()}])]){const {c,calls}=context({storage:[[CACHE,raw]]});isFallback(await c.resolveCardmarketRoute(azumarill,fallback(c,azumarill)),'Azumarill');assert.equal(calls.length,2);}});
for(const [label,mutate] of [
 ['wrong ID',d=>d.id='ex11-20'],['wrong number',d=>d.number='20'],['wrong name',d=>d.name='Pikachu'],
 ['wrong set ID',d=>d.set.id='ex15'],['wrong set name',d=>d.set.name='Dragon Frontiers'],
 ['HTTP',d=>d.cardmarket.url=AZU.replace('https:','http:')],['other host',d=>d.cardmarket.url='https://evil.test/card'],
 ['search URL',d=>d.cardmarket.url='https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=Azumarill'],
 ['spoofed host',d=>d.cardmarket.url=AZU.replace('www.cardmarket.com','www.cardmarket.com.evil.test')],
 ['wrong redirect ID',d=>d.cardmarket.url='https://prices.pokemontcg.io/cardmarket/ex11-20']
]) test('Reject API '+label,async()=>{const data=api();mutate(data);const {c,storage}=context({fetch:async()=>({ok:true,json:async()=>({data})})});isFallback(await c.resolveCardmarketRoute(azumarill,fallback(c,azumarill)),'Azumarill');assert.equal(storage.has(CACHE),false);});
test('Official API Cardmarket redirect supported for exact source ID',async()=>{const url='https://prices.pokemontcg.io/cardmarket/ex11-19';const {c}=context({fetch:async()=>({ok:true,json:async()=>({data:api(azumarill,url)})})});const r=await c.resolveCardmarketRoute(azumarill,fallback(c,azumarill));assert.equal(r.exact,true);assert.equal(r.url.split('?')[0],url);});
test('Storage denial does not break successful resolver',async()=>{const {c}=context({fetch:async()=>({ok:true,json:async()=>({data:api()})})});c.localStorage={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};assert.equal((await c.resolveCardmarketRoute(azumarill,fallback(c,azumarill))).exact,true);});
test('Concurrent requests deduplicated',async()=>{let done;const {c,calls}=context({fetch:()=>new Promise(resolve=>done=resolve)});const a=c.resolveCardmarketRoute(azumarill,fallback(c,azumarill));const b=c.resolveCardmarketRoute(azumarill,fallback(c,azumarill));assert.equal(calls.length,1);done({ok:true,json:async()=>({data:api()})});assert.equal((await a).exact,true);assert.equal((await b).exact,true);});
test('Pending blocks fallback and publishes only final selected URL',async()=>{let done;const {c,events}=context({fetch:()=>new Promise(resolve=>done=resolve)});fields(c,azumarill);c.selectCardmarketCard(azumarill);const pending=c.makeLink(false);assert.equal(c.openBtn.href,'#');assert.equal(c.openBtn.dataset.cmState,'pending');assert.equal(events.filter(e=>e.type==='cardscout:cm-route-ready').length,0);done({ok:true,json:async()=>({data:api()})});await pending;assert.equal(c.openBtn.href.split('?')[0],AZU);assert.equal(events.at(-1).detail.cardmarketUrl,c.openBtn.href);});
test('Late API result never overwrites another selection',async()=>{let done;const {c}=context({fetch:()=>new Promise(resolve=>done=resolve)});fields(c,azumarill);c.selectCardmarketCard(azumarill);const pending=c.makeLink(false);const next={...azumarill,name:'Duskull',number:'50',set:'EX POWER KEEPERS',source_id:''};fields(c,next);await c.makeLink(false);const expected=c.openBtn.href;done({ok:true,json:async()=>({data:api()})});await pending;assert.equal(c.openBtn.href,expected);assert.equal(new URL(expected).searchParams.get('searchString'),'Duskull');});
