'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {chromium}=require('../scripts/node_modules/playwright');
const targets=require('./fixtures/en-sets-v174/targets.json');
const fixtures=Object.fromEntries(targets.map(([,id])=>[id,require('./fixtures/en-sets-v174/'+id+'.json')]));
const baseline='5cfda7e927b89555c6cbb784b4d7a6ac8149640b';
const representatives={dp1:'dp1-1',dp2:'dp2-122',dp7:'dp7-103',dpp:'dpp-DP17',pop5:'pop5-3'};
const sample=id=>fixtures[id].cards.find(c=>c.id===(representatives[id]||fixtures[id].cards[0].id));
const text=f=>fs.readFileSync(f,'utf8').replace(/\r\n?/g,'\n');
test('17 official frozen set IDs, full counts, definitions and manual option order',()=>{
  const sets=JSON.parse(text('cards.json')).sets,html=text('index.html');
  let previous=html.indexOf('<option>EX TRAINER KIT 2</option>');
  for(const [key,id,code,label,aliases] of targets){
    assert.equal(fixtures[id].id,id);assert.equal(fixtures[id].cards.length,({dp1:130,dp2:124,dp3:132,dp4:106,dp5:100,dp6:146,dp7:106,dpp:56})[id]||17);
    assert.equal(new Set(fixtures[id].cards.map(c=>c.id)).size,fixtures[id].cards.length);
    assert.deepEqual(sets[key],{label,code,aliases});
    const index=html.indexOf('<option value="'+key+'">');assert.ok(index>previous);previous=index;
    for(const f of ['app-v137.js','ui-v137-focus.js','ui-v137-collection.js'])assert.ok(text(f).includes(`'${key}':['${id}']`),f+' '+id);
  }
  assert.equal(Object.values(fixtures).reduce((n,f)=>n+f.cards.length,0),1053);
});
test('reviewed coverage edits only; JP, scanner, pricing, storage and backend stay exact',()=>{
  for(const f of ['app-v137.js','ui-v137-focus.js','ui-v137-collection.js']){
    const old=execFileSync('git',['show',baseline+':'+f],{encoding:'utf8',maxBuffer:16*1024*1024}).replace(/\r\n?/g,'\n');
    assert.equal(require('./coverage-scope-v174.cjs')(f,text(f)),old,f);
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
async function setup(t,{hold=false}={}){
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
        active--;return r.fulfill({json:parts[2]==='en'?(fixtures[id]||{cards:[]}):{cards:[]}});
      }
      const set=id.slice(0,id.lastIndexOf('-')),card=fixtures[set]?.cards.find(c=>c.id===id);
      return r.fulfill({json:card?{...card,set:{id:set,name:fixtures[set].name}}:{}});
    }
    if(u.hostname==='assets.tcgdex.net')return r.fulfill({contentType:'image/png',body:fs.readFileSync('icon-rareworth-192.png')});
    return r.fulfill({json:{data:[]}});
  });
  await page.goto(origin);
  return {page,context,requests,async setOffline(value){offline=value;await context.setOffline(value);},release(){hold=false;waiting.splice(0).forEach(r=>r());},maxActive:()=>maxActive};
}
async function ready(page){await page.waitForFunction(()=>CardCatalog.marketplaceCards().length===1053);}
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
    assert.equal(await page.evaluate(alias=>detectSet(alias),alias),key);
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
    if(id==='dp6'){
      assert.equal(u.pathname,'/en/Pokemon/Products');assert.equal(u.searchParams.get('idProduct'),'278150');
      assert.equal(await page.evaluate(()=>CM_PRODUCT_CATALOG['dp6-1'].product),278150);
    }else{
    assert.equal(u.pathname,'/en/Pokemon/Products/Search');assert.ok(u.searchParams.get('searchString').includes(label));assert.ok(u.searchParams.get('searchString').includes(c.localId));assert.ok(u.searchParams.get('searchString').toLowerCase().includes(c.name.replace(' δ','').toLowerCase()));assert.equal(u.searchParams.has('idProduct'),false);
    }
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
test('explicit DP4/DP7 and POP1/POP9 win; nonexistent Pikachu DP1 never swaps sets',async t=>{
  const {page}=await setup(t);await ready(page);
  for(const id of ['dp4','dp7','pop1','pop9']){await search(page,'1 '+id);await page.locator('.suggestion').first().waitFor();assert.ok((await page.locator('.suggestionMeta').allTextContents()).every(s=>s.startsWith(targets.find(t=>t[1]===id)[3]+' ·')));}
  for(const q of ['pikachu dp','pikachu dp1']){await search(page,q);await page.waitForFunction(()=>!document.querySelector('.suggestion'));assert.equal(await page.evaluate(q=>detectSet(q),q),'DIAMOND PEARL');}
  for(const [q,id] of [['charizard stormfront','dp7'],['charizard sf','dp7'],['mew pop 5','pop5'],['mew pop5','pop5'],['lucario mysterious treasures','dp2'],['dialga dp promo','dpp']]){await search(page,q);await page.locator('.suggestion').first().waitFor();assert.ok((await page.locator('.suggestionMeta').allTextContents()).every(s=>s.startsWith(targets.find(t=>t[1]===id)[3]+' ·')));}
  for(const q of ['5','5/17','1/106'])assert.equal(await page.evaluate(q=>detectSet(q),q),'AUTO');
});
test('local shell first, concurrency <=6, old EN cache ignored and user storage preserved',async t=>{
  const {page,requests,release,maxActive}=await setup(t,{hold:true});
  await page.waitForFunction(()=>!!CardCatalog.find({name:'Charizard',number:'4',set:'BASE',language:'EN'}));
  assert.ok(requests.length<=6);assert.ok(requests.every(p=>p.includes('/sets/')));release();await ready(page);assert.ok(maxActive()<=6);
  const old='cardscout_search_catalog_v152_EN';await page.evaluate(old=>{localStorage.setItem(old,JSON.stringify({savedAt:Date.now(),cards:[{name:'Stale',language:'EN'}]}));localStorage.removeItem('cardscout_search_catalog_v152_EN_v174');localStorage.setItem('whatnotai_mobile_favorites_v37','[]');},old);
  requests.length=0;await page.reload();await ready(page);assert.ok(requests.some(p=>p.endsWith('/pop9')));assert.equal(await page.evaluate(()=>localStorage.getItem('whatnotai_mobile_favorites_v37')),'[]');assert.ok(await page.evaluate(old=>localStorage.getItem(old),old));
});
test('same-storage real offline reload finds DP/POP; empty cache retains local cards; mobile and branding',async t=>{
  const {page,setOffline,requests}=await setup(t);await ready(page);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  for(const width of [320,375,390,430]){await page.setViewportSize({width,height:844});await search(page,'mew pop 5');await page.locator('.suggestion').first().waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.locator('#setSelect').isVisible(),false);}
  requests.length=0;await setOffline(true);await page.reload();await ready(page);assert.ok(!requests.some(p=>p.includes('/en/sets/')));
  for(const id of ['dp1','dp7','dpp','pop5']){const c=sample(id);await search(page,`${c.name} ${id}`);await page.locator('.suggestion').first().waitFor();}
  assert.equal(await page.locator('.brandText strong').innerText(),'HoloKeep');await page.locator('#navSettings').click();assert.match(await page.locator('.aboutCard').innerText(),/v174 · Beta/);
  const urls=await page.evaluate(async()=> (await (await caches.open('rareworth-shell-v174')).keys()).map(r=>r.url));assert.ok(urls.length>20);assert.ok(urls.every(u=>new URL(u).origin===origin));assert.ok(urls.some(u=>u.endsWith('/cards.json?build=174-en-dp-pop-coverage')));
  await page.evaluate(()=>localStorage.removeItem('cardscout_search_catalog_v152_EN_v174'));await page.reload();await search(page,'charizard base');await page.locator('.suggestion').first().waitFor();
});
