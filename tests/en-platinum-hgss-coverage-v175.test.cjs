'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {chromium}=require('../scripts/node_modules/playwright');
const targets=require('./fixtures/en-sets-v175/targets.json');
const fixtures=Object.fromEntries(targets.map(([,id])=>[id,require('./fixtures/en-sets-v175/'+id+'.json')]));
const baseline='56036fd04b309117a35dee55f5e884811dce51e3';
const representatives={pl1:'pl1-122',pl2:'pl2-RT1',pl3:'pl3-SH7',pl4:'pl4-1',hgss1:'hgss1-111',hgss2:'hgss2-TWO',hgss3:'hgss3-86',hgss4:'hgss4-FOUR',col1:'col1-SL10',hgssp:'hgssp-HGSS01'};
const counts={pl1:133,pl2:120,pl3:153,pl4:111,hgss1:124,hgss2:96,hgss3:91,hgss4:103,col1:106,hgssp:25};
const sample=id=>fixtures[id].cards.find(c=>c.id===(representatives[id]||fixtures[id].cards[0].id));
const text=f=>fs.readFileSync(f,'utf8').replace(/\r\n?/g,'\n');
test('10 official frozen set IDs, full counts, definitions and manual option order',()=>{
  const sets=JSON.parse(text('cards.json')).sets,html=text('index.html');
  let previous=html.indexOf('<option value="POP SERIES 9">');
  for(const [key,id,code,label,aliases] of targets){
    assert.equal(fixtures[id].id,id);assert.equal(fixtures[id].cards.length,counts[id]);
    assert.equal(new Set(fixtures[id].cards.map(c=>c.id)).size,fixtures[id].cards.length);
    assert.deepEqual(sets[key],{label,code,aliases});
    const index=html.indexOf('<option value="'+key+'">');assert.ok(index>previous);previous=index;
    for(const f of ['app-v137.js','ui-v137-focus.js','ui-v137-collection.js'])assert.ok(text(f).includes(`'${key}':['${id}']`),f+' '+id);
  }
  assert.equal(Object.values(fixtures).reduce((n,f)=>n+f.cards.length,0),1062);
});
test('reviewed coverage edits only; JP, scanner, pricing, storage and backend stay exact',()=>{
  for(const f of ['app-v137.js','ui-v137-focus.js','ui-v137-collection.js']){
    const old=execFileSync('git',['show',baseline+':'+f],{encoding:'utf8',maxBuffer:16*1024*1024}).replace(/\r\n?/g,'\n');
    assert.equal(require('./coverage-scope-v175.cjs')(f,text(f)),old,f);
  }
  const files=execFileSync('git',['ls-tree','-r','--name-only',baseline],{encoding:'utf8'}).trim().split('\n');
  for(const f of files.filter(f=>/^(jp-|cloud-|supabase|account-|onboarding-|pwa-|card-identity-|cardmarket-|assets\/cards\/jp)/.test(f))){
    const old=execFileSync('git',['show',baseline+':'+f],{maxBuffer:16*1024*1024});
    // Git checks out text with CRLF on Windows; binary assets remain byte-exact.
    if(/\.(js|css|json|sql|md)$/.test(f))assert.equal(text(f),old.toString().replace(/\r\n?/g,'\n'),f);
    else assert.ok(fs.readFileSync(f).equals(old),f);
  }
  const oldFocus=execFileSync('git',['show',baseline+':ui-v137-focus.js'],{encoding:'utf8'});
  assert.equal(text('ui-v137-focus.js').match(/const STAMPED_SET_KEYS[^;]+;/s)[0],oldFocus.match(/const STAMPED_SET_KEYS[^;]+;/s)[0].replace(/\r\n?/g,'\n'));
  assert.equal(text('app-v137.js').match(/const SET_TOTAL_HINTS[^;]+;/s)[0],execFileSync('git',['show',baseline+':app-v137.js'],{encoding:'utf8'}).match(/const SET_TOTAL_HINTS[^;]+;/s)[0].replace(/\r\n?/g,'\n'));
});
let browser,server,origin;
before(async()=>{
  server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(f)));}catch{res.writeHead(404).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true});
});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
async function setup(t,{hold=false,failSet='',prime=false}={}){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});t.after(()=>context.close());
  await context.addInitScript(()=>sessionStorage.setItem('rareworth_guest_session_v171_1','1'));
  const page=await context.newPage(),errors=[],requests=[],waiting=[];let active=0,maxActive=0,offline=false;
  page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
  await context.route('**/*',async r=>{
    const u=new URL(r.request().url());if(u.origin===origin)return r.continue();
    if(offline)return r.abort('internetdisconnected');
    if(u.hostname==='api.tcgdex.net'){
      requests.push(u.pathname);const parts=u.pathname.split('/'),id=parts.at(-1);
      if(parts[3]==='sets'){
        active++;maxActive=Math.max(maxActive,active);
        if(hold)await new Promise(resolve=>waiting.push(resolve));
        active--;if(id===failSet)return r.fulfill({status:503,json:{error:'fixture unavailable'}});return r.fulfill({json:parts[2]==='en'?(fixtures[id]||{cards:[]}):{cards:[]}});
      }
      const set=id.slice(0,id.lastIndexOf('-')),card=fixtures[set]?.cards.find(c=>c.id===id);
      if(prime&&id==='hgss3-86')return r.fulfill({json:require('./fixtures/en-sets-v175/prime-hgss3-86.json')});
      return r.fulfill({json:card?{...card,set:{id:set,name:fixtures[set].name}}:{}});
    }
    if(u.hostname==='assets.tcgdex.net')return r.fulfill({contentType:'image/png',body:fs.readFileSync('icon-rareworth-192.png')});
    return r.fulfill({json:{data:[]}});
  });
  await page.goto(origin);
  return {page,context,requests,async setOffline(value){offline=value;await context.setOffline(value);},release(){hold=false;waiting.splice(0).forEach(r=>r());},maxActive:()=>maxActive};
}
async function ready(page){await page.waitForFunction(()=>CardCatalog.marketplaceCards().length===1062);}
async function search(page,query){await page.locator('#navSearch').click();await page.locator('#quickInput').fill(query);}
async function choose(page,id,alias){
  const set=id.slice(0,id.lastIndexOf('-')),c=fixtures[set].cards.find(c=>c.id===id);
  await search(page,`${c.name} ${c.localId} ${alias||set}`);
  await page.locator('.suggestion').filter({hasText:'#'+c.localId}).first().click();
  await page.waitForFunction(id=>selectedCardIdentity(document.querySelector('#openBtn').href).source_id===id,id);
  await page.waitForFunction(()=>!document.querySelector('#openBtn').classList.contains('disabled'));
}
for(const [key,id,code,label,aliases] of targets)test(`${id}: aliases, exact EN identity, truthful route, Recent and collection reload`,async t=>{
  const {page}=await setup(t);await ready(page);const c=sample(id);
  assert.equal(await page.evaluate(k=>CardCatalog.marketplaceCards().filter(c=>c.source_set_id===k).length,id),fixtures[id].cards.length);
  for(const alias of new Set([...aliases,label])){
    assert.equal(await page.evaluate(q=>detectSet(q),`${c.name} ${c.localId} ${alias}`),key);
    await search(page,`${c.name} ${c.localId} ${alias}`);
    await page.waitForFunction(()=>document.querySelectorAll('.suggestion').length>0).catch(async error=>{throw Error(alias+' '+JSON.stringify(await page.evaluate(id=>({card:CardCatalog.byId(id,'EN'),query:document.querySelector('#quickInput').value}),c.id))+' '+error.message);});
    const metas=await page.locator('.suggestionMeta').allTextContents();assert.ok(metas.every(m=>m.startsWith(label+' · EN')),alias+JSON.stringify(metas));
  }
  await choose(page,c.id);
  const selected=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));
  for(const [field,value] of Object.entries({source_id:c.id,source_set_id:id,set:key,set_name:label,language:'EN',number:c.localId}))assert.equal(selected[field],value,field);
  for(const [condition,expected] of [['NM','2'],['EX','3'],['GD','4'],['PL','6']]){
    await page.locator(`.visiblePreferences [data-value="${condition}"]`).click();
    await page.waitForFunction(expected=>new URL(document.querySelector('#openBtn').href).searchParams.get('minCondition')===expected,expected);
    const u=new URL(await page.locator('#openBtn').getAttribute('href'));assert.equal(u.origin,'https://www.cardmarket.com');
    assert.equal(u.pathname,'/en/Pokemon/Products/Search');assert.ok(u.searchParams.get('searchString').includes(label));assert.ok(u.searchParams.get('searchString').includes(c.localId));assert.ok(u.searchParams.get('searchString').includes(await page.evaluate(c=>cleanCardmarketName(c.name,c.localId),c)));assert.equal(u.searchParams.has('idProduct'),false);
  }
  await page.locator('.visiblePreferences [data-value="EX"]').click();await page.evaluate(()=>makeLink(false));
  await page.reload();await ready(page);await page.locator('#navRecent').click();
  const recent=page.locator('#recentList .item').first();await recent.locator('.useBtn').waitFor();assert.ok((await recent.textContent()).includes(label));
  const savedRecent=await page.evaluate(()=>JSON.parse(localStorage.getItem('whatnotai_mobile_recent_v37'))[0]);assert.equal(savedRecent.source_id,c.id);assert.equal(savedRecent.source_set_id,id);
  await recent.locator('.useBtn').click();await page.waitForFunction(id=>selectedCardIdentity(document.querySelector('#openBtn').href).source_id===id,c.id);
  await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorQty').fill('2');await page.locator('#collectionEditorPaid').fill('4.25');await page.locator('#collectionEditorSave').click();
  const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('cardscout_collection_v133'))[0]);const saved=await read();
  assert.equal(saved.name,c.name);assert.equal(saved.number,c.localId);assert.equal(saved.price,null);assert.equal(saved.sourceId,c.id);assert.equal(saved.source_set_id,id);assert.equal(saved.set,key);assert.equal(saved.setName,label);assert.equal(saved.qty,2);assert.equal(saved.paidEach,4.25);assert.equal(saved.condition,'EX');assert.equal(saved.variant,'NORMAL');assert.equal(saved.listType,'OWNED');
  await page.reload();await ready(page);await page.locator('#navCollection').click();await page.locator('#collectionList .collectionCard').waitFor();assert.deepEqual(await read(),saved);assert.ok((await page.locator('#collectionList').innerText()).includes(label));
  await page.waitForFunction(()=>{const img=document.querySelector('#collectionList img');return img?.complete && img.naturalWidth>0;});
  assert.ok((await page.locator('#collectionList img').getAttribute('src')).startsWith(c.image+'/'));
});
test('local shell first, concurrency <=6, old EN cache ignored and user storage preserved',async t=>{
  const {page,requests,release,maxActive}=await setup(t,{hold:true});
  await page.waitForFunction(()=>!!CardCatalog.find({name:'Charizard',number:'4',set:'BASE',language:'EN'}));
  assert.ok(requests.length<=6);assert.ok(requests.every(p=>p.includes('/sets/')));release();await ready(page);assert.ok(maxActive()<=6);
  const old='cardscout_search_catalog_v152_EN';await page.evaluate(old=>{localStorage.setItem(old,JSON.stringify({savedAt:Date.now(),cards:[{name:'Stale',language:'EN'}]}));localStorage.removeItem('cardscout_search_catalog_v152_EN_v175');localStorage.setItem('whatnotai_mobile_favorites_v37','[]');},old);
  requests.length=0;await page.reload();await ready(page);assert.ok(requests.some(p=>p.endsWith('/hgssp')));assert.equal(await page.evaluate(()=>localStorage.getItem('whatnotai_mobile_favorites_v37')),'[]');assert.ok(await page.evaluate(old=>localStorage.getItem(old),old));
});
test('same-storage real offline reload finds Platinum/HGSS; empty cache retains local cards; mobile and branding',async t=>{
  const {page,setOffline,requests}=await setup(t);await ready(page);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  for(const width of [320,375,390,430]){await page.setViewportSize({width,height:844});await search(page,'rayquaza col');await page.locator('.suggestion').first().waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.locator('#setSelect').isVisible(),false);}
  for(const id of ['pl1','hgss1']){const c=sample(id);await search(page,`${c.name} ${id}`);await page.locator('.suggestion').first().waitFor();}
  requests.length=0;await setOffline(true);await page.reload();await ready(page);assert.ok(!requests.some(p=>p.includes('/en/sets/')));
  for(const id of ['pl1','hgss1','col1','hgssp']){const c=sample(id);await search(page,`${c.name} ${id}`);await page.locator('.suggestion').first().waitFor();}
  assert.equal(await page.locator('.brandText strong').innerText(),'HoloKeep');await page.locator('#navSettings').click();assert.match(await page.locator('.aboutCard').innerText(),/v176 · Beta/);
  const urls=await page.evaluate(async()=> (await (await caches.open('rareworth-shell-v176')).keys()).map(r=>r.url));assert.ok(urls.length>20);assert.ok(urls.every(u=>new URL(u).origin===origin));assert.ok(urls.some(u=>u.endsWith('/cards.json?build=175-en-platinum-hgss-coverage')));
  await page.evaluate(()=>localStorage.removeItem('cardscout_search_catalog_v152_EN_v175'));await page.reload();await search(page,'charizard base');await page.locator('.suggestion').first().waitFor();
});

test('approved promo aliases use hgssp identity and never request /sets/hsp',async t=>{
  const {page,requests}=await setup(t);await ready(page);
  assert.ok(requests.includes('/v2/en/sets/hgssp'));
  assert.ok(!requests.some(p=>p==='/v2/en/sets/hsp'));
  for(const q of ['hsp','hgssp']){
    assert.equal(await page.evaluate(q=>detectSet(q),q),'HGSS BLACK STAR PROMOS');
    await choose(page,'hgssp-HGSS01',q);
    assert.equal(await page.evaluate(()=>selectedCardIdentity().source_set_id),'hgssp');
  }
  assert.equal(await page.evaluate(()=>CardCatalog.marketplaceCards().some(c=>c.source_set_id==='hsp'||c.source_id.startsWith('hsp-'))),false);
});

test('explicit source aliases win; ambiguous names and numbers never invent set identity',async t=>{
  const {page}=await setup(t);await ready(page);
  for(const [key,id] of targets){
    await search(page,'1 '+id);await page.locator('.suggestion').first().waitFor();
    assert.ok((await page.locator('.suggestionMeta').allTextContents()).every(m=>m.startsWith(targets.find(t=>t[1]===id)[3]+' · EN')));
  }
  for(const q of ['1','1/111','1/124','Arceus','Arceus 94','Arceus LV.X 94','Arceus AR1'])assert.equal(await page.evaluate(q=>detectSet(q),q),'AUTO',q);
  assert.equal(await page.evaluate(()=>detectSet('Arceus pl1')),'PLATINUM');
  for(const q of ['pikachu platinum','pikachu pl1','lugia unleashed','lugia hgss2','arceus pl1']){
    await search(page,q);await page.waitForFunction(()=>!document.querySelector('.suggestion'));assert.equal(await page.locator('.suggestion').count(),0,q);
  }
  for(const [q,id] of [['charizard arceus','pl4'],['charizard pl4','pl4'],['umbreon undaunted','hgss3'],['umbreon hgss3','hgss3'],['rayquaza call of legends','col1'],['rayquaza col','col1'],['ho-oh hgss promo','hgssp']]){
    await search(page,q);await page.locator('.suggestion').first().waitFor();assert.ok((await page.locator('.suggestionMeta').allTextContents()).every(m=>m.startsWith(targets.find(t=>t[1]===id)[3]+' · EN')),q);
  }
});

for(const id of ['pl1-SH4','pl4-AR1','hgss1-ONE','hgss3-THREE'])test(id+': special localId survives select, Recent, collection and reload',async t=>{
  const {page}=await setup(t);await ready(page);await choose(page,id);
  const sid=id.slice(0,id.lastIndexOf('-')),c=fixtures[sid].cards.find(c=>c.id===id);
  await page.evaluate(()=>makeLink(false));await page.reload();await ready(page);await page.locator('#navRecent').click();
  await page.locator('#recentList .item .useBtn').first().click();
  await page.waitForFunction(id=>selectedCardIdentity().source_id===id,id);
  const recent=await page.evaluate(()=>JSON.parse(localStorage.getItem('whatnotai_mobile_recent_v37'))[0]);
  assert.equal(recent.number,c.localId);assert.equal(recent.name,c.name);assert.equal(recent.source_id,id);assert.equal(recent.source_set_id,sid);
  await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();await page.reload();await ready(page);await page.locator('#navCollection').click();
  await page.locator('#collectionList .collectionCard').waitFor();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cardscout_collection_v133'))[0]);assert.equal(saved.number,c.localId);assert.equal(saved.name,c.name);assert.equal(saved.sourceId,id);assert.equal(saved.source_set_id,sid);
  const url=new URL(saved.cardmarketUrl);assert.equal(url.hostname,'www.cardmarket.com');assert.ok(url.searchParams.get('searchString').includes(c.localId));
});

test('verified Prime metadata uses idProduct; LV.X and LEGEND names retain source identity',async t=>{
  const {page}=await setup(t,{prime:true});await ready(page);
  const prime=require('./fixtures/en-sets-v175/prime-hgss3-86.json');assert.equal(prime.suffix,'Prime');assert.equal(prime.rarity,'Rare PRIME');
  await choose(page,prime.id);await page.waitForFunction(()=>new URL(document.querySelector('#openBtn').href).searchParams.get('idProduct')==='279339');
  for(const [cond,value] of [['NM','2'],['EX','3'],['GD','4'],['PL','6']]){
    await page.locator(`.visiblePreferences [data-value="${cond}"]`).click();await page.waitForFunction(value=>new URL(document.querySelector('#openBtn').href).searchParams.get('minCondition')===value,value);
    const u=new URL(await page.locator('#openBtn').getAttribute('href'));assert.equal(u.origin,'https://www.cardmarket.com');assert.equal(u.searchParams.get('idProduct'),String(prime.pricing.cardmarket.idProduct));
  }
  for(const id of ['pl1-122','hgss1-111','hgss1-112']){
    await choose(page,id);const c=fixtures[id.split('-')[0]].cards.find(c=>c.id===id),actual=await page.evaluate(()=>selectedCardIdentity());assert.equal(actual.name,c.name);assert.equal(actual.number,c.localId);assert.equal(actual.source_id,id);
  }
});

test('one failed set leaves shell, local catalog and other sets usable without false loaded data',async t=>{
  const {page,requests}=await setup(t,{failSet:'pl2'});
  await page.waitForFunction(()=>CardCatalog.marketplaceCards().length===942);
  assert.ok(requests.includes('/v2/en/sets/pl2'));
  assert.equal(await page.evaluate(()=>CardCatalog.marketplaceCards().filter(c=>c.source_set_id==='pl2').length),0);
  await choose(page,'pl4-1');await search(page,'charizard base');await page.locator('.suggestion').first().waitFor();
  await search(page,'pikachu pl2');await page.waitForFunction(()=>!document.querySelector('.suggestion'));
});

test('v174 catalog invalidation preserves all unrelated user storage and valid Cardmarket cache',async t=>{
  const {page,requests}=await setup(t);await ready(page);
  const kept={cardscout_collection_v133:'[]',whatnotai_mobile_recent_v37:'[]',whatnotai_mobile_favorites_v37:'[]',rareworth_cloud_sync_v170:JSON.stringify({fixture:'preserve'}),rareworth_account_enabled_v170:'false',rareworth_device_id_v170:'v175-fixture',rareworth_onboarding_v171:'1',cardscout_cm_route_cache_v146:JSON.stringify({'fixture':{url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=279339',savedAt:Date.now()}})};
  await page.evaluate(kept=>{for(const [k,v]of Object.entries(kept))localStorage.setItem(k,v);localStorage.setItem('cardscout_search_catalog_v152_EN_v174',JSON.stringify({savedAt:Date.now(),cards:[{name:'Old',language:'EN'}]}));localStorage.removeItem('cardscout_search_catalog_v152_EN_v175');},kept);
  requests.length=0;await page.reload();await ready(page);assert.ok(requests.includes('/v2/en/sets/hgssp'));
  assert.deepEqual(await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(kept)),kept);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('rareworth_guest_session_v171_1')),'1');
});

test('quick parsing preserves verified special localIds and PL condition with another set alias',async t=>{
  const {page}=await setup(t);await ready(page);
  for(const id of ['pl1-SH4','pl2-RT1','pl4-AR1','hgss1-ONE','col1-SL10','hgssp-HGSS01']){
    const sid=id.slice(0,id.lastIndexOf('-')),c=fixtures[sid].cards.find(c=>c.id===id);
    const actual=await page.evaluate(q=>{quickInput.value=q;parseQuick();return {name:nameInput.value,number:numberInput.value,set:setSelect.value,condition:condSelect.value};},`${c.name} ${c.localId} ${sid} PL`);
    assert.equal(actual.number,c.localId);assert.equal(actual.set,targets.find(t=>t[1]===sid)[0]);assert.equal(actual.condition,'PL');
  }
  assert.equal(await page.evaluate(()=>detectSet('Charizard base PL')),'BASE');
  assert.equal(await page.evaluate(()=>detectSet('Charizard pl')),'PLATINUM');
});

test('all 1062 catalog records preserve source identity; prior EN definitions remain intact',async t=>{
  const {page}=await setup(t);await ready(page);
  const actual=await page.evaluate(()=>CardCatalog.marketplaceCards().map(c=>({source_id:c.source_id,source_set_id:c.source_set_id,number:c.number,name:c.name,set:c.set,set_name:c.set_name,language:c.language})));
  assert.equal(new Set(actual.map(c=>c.source_id)).size,1062);
  for(const [key,id,code,label]of targets)for(const c of fixtures[id].cards){
    assert.deepEqual(actual.find(a=>a.source_id===c.id),{source_id:c.id,source_set_id:id,number:c.localId,name:c.name,set:key,set_name:label,language:'EN'});
  }
  const old=JSON.parse(execFileSync('git',['show',baseline+':cards.json'],{encoding:'utf8'})),current=JSON.parse(text('cards.json'));
  for(const [key,value]of Object.entries(old.sets))assert.deepEqual(current.sets[key],value,key);
  assert.equal(Object.keys(current.sets).length,Object.keys(old.sets).length+10);
  const {sets:oldSets,...oldData}=old,{sets:newSets,...newData}=current;assert.deepEqual(newData,oldData);
});
