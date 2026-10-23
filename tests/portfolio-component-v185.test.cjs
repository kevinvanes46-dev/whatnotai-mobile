'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),os=require('node:os');
const {chromium}=require('../scripts/node_modules/playwright'),F=require('./fixtures/market-v176.cjs'),C=require('../cost-basis-v177');
const KEY='cardscout_collection_v133';let browser,server,origin;
before(async()=>{server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(f==='seed')return res.end('<html></html>');res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png'})[f.split('.').pop()]||'application/octet-stream');res.end(f==='market-v176.js'?require('./helpers/market-fixture-v185.cjs')():fs.readFileSync(path.resolve(f)));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true});});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
async function setup(t,items=[F.item]){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});t.after(()=>context.close());await context.addInitScript(()=>sessionStorage.setItem('rareworth_guest_session_v171_1','1'));
 await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin)return r.continue();if(u.hostname==='api.tcgdex.net')return r.fulfill({json:u.pathname.includes('/cards/')?F.card:{cards:[]}});if(u.hostname==='assets.tcgdex.net')return r.fulfill({contentType:'image/png',body:fs.readFileSync('icon-rareworth-192.png')});return r.abort();});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
 await page.goto(origin+'/seed');await page.evaluate(({items,KEY})=>localStorage.setItem(KEY,JSON.stringify(items)),{items,KEY});await page.goto(origin);await page.waitForFunction(()=>!!window.HoloKeepCostBasis&&!!window.cardscoutCollectionUI);await page.locator('#navCollection').click();await page.locator('[data-collection-view="list"]').click();await page.waitForFunction(()=>!document.querySelector('#collectionRefreshBtn').disabled);return {page,context};
}
const read=p=>p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);
const row=(p,id='market-test')=>p.locator('.collectionCard[data-id="'+id+'"]');
const edit=(p,id)=>row(p,id).locator('.collectionCardOpen').click();
const save=async p=>{await p.locator('#collectionEditorSave').click();await p.locator('#collectionEditor').waitFor({state:'hidden'});};
const signature=p=>p.evaluate(KEY=>RareWorthCloudSync.createLocalSnapshot(JSON.parse(localStorage.getItem(KEY))).signature,KEY);

test('summary, unit/position and partial results; insights open existing editor',async t=>{
 const partial=C.addUnknown(C.initialize({...F.item,uid:'partial'},3,10),2),{page:p}=await setup(t,[partial]);
 assert.equal(await p.locator('#collectionCount').innerText(),'5');assert.match(await p.locator('#collectionMarket').innerText(),/125,00/);assert.match(await p.locator('#collectionPaid').innerText(),/30,00/);assert.match(await p.locator('#collectionDifference').innerText(),/45,00/);
 assert.match(await row(p,'partial').innerText(),/p\/st\. · €.*125,00 totaal/);assert.match(await row(p,'partial').innerText(),/Over 3 van 5/);
 assert.ok(await p.locator('#collectionInsightPreview > button').count()<=2);await p.locator('#collectionInsightPreview button').first().click();assert.ok(await p.locator('#collectionEditor').isVisible());await p.locator('#collectionEditorClose').click();
});
test('sorts, filters, attention and expanded insights do not request provider data or mutate collection',async t=>{
 const {page:p}=await setup(t,[F.item,C.initialize({...F.item,uid:'known'},3,30),C.addUnknown(C.initialize({...F.item,uid:'partial'},1,5),2)]);
 const before=await read(p),sig=await signature(p);let requests=0;p.on('request',r=>{if(new URL(r.url()).hostname==='api.tcgdex.net')requests++;});
 await p.locator('#collectionAllInsights summary').click();assert.ok(await p.locator('#collectionInsightSections').isVisible());
 await p.locator('.collectionTools summary').click();
 for(const sort of ['recent','name','set','value-desc','value-asc','positive','negative','paid-desc'])await p.locator('#collectionSort').selectOption(sort);
 for(const filter of ['with-price','without-price','complete','incomplete','legacy','stale',''])await p.locator('#collectionInsightFilter').selectOption(filter);
 await p.locator('#collectionAttention').click();assert.equal(await p.locator('#collectionInsightFilter').inputValue(),'attention');assert.ok(await row(p).isVisible());assert.match(await p.locator('#collectionAttentionCounts').innerText(),/Oude aankoopprijzen bevestigen: 1/);
 assert.deepEqual(await read(p),before);assert.equal(await signature(p),sig);assert.equal(requests,0);
});
test('reference-only JP and Wishlist excluded from owned rankings and differences',async t=>{
 const jp={...C.initialize(F.item,1,10),uid:'jp',sourceId:'PMCG1-035',source_set_id:'PMCG1',language:'JP',name:'ピカチュウ',number:'035',set:'EXPANSION PACK',setName:'Expansion Pack'},wish={...C.initialize(F.item,3,10),uid:'wish',listType:'WISHLIST'}, {page:p}=await setup(t,[jp,wish]);
 await p.evaluate(jp=>{const entry={...HoloKeepMarket.identity(jp),source:'TCGDEX_CARDMARKET',finish:'non-foil',metric:'trend',value:500,currency:'EUR',quality:'REFERENCE_ONLY',sourceUpdatedAt:new Date().toISOString(),fetchedAt:new Date().toISOString()};HoloKeepMarket.put(localStorage,jp,entry);cardscoutCollectionUI.render();},jp);
 assert.equal(await p.locator('#collectionMarket').innerText(),'—');assert.equal(await p.locator('#collectionDifference').innerText(),'—');assert.equal(await p.locator('#collectionInsightPreview button').count(),0);assert.equal(await p.locator('#collectionCount').innerText(),'1');
});
test('offline reload retains identical insights, no provider calls, only local PWA assets',async t=>{
 const {page:p,context}=await setup(t,[C.initialize(F.item,2,10)]);const before=await p.locator('#collectionInsightPreview').innerText(),saved=await read(p);
 // A previously cached catalog prevents the existing search bootstrap from fetching sets.
 await p.evaluate(()=>{for(const [suffix,card] of [['EN_v175',{source_id:'base1-4',source_set_id:'base1',name:'Charizard',number:'4',set:'BASE',language:'EN'}],['JP_v160',{source_id:'neo1-036',source_set_id:'neo1',name:'ピカチュウ',number:'036',set:'NEO GENESIS',language:'JP'}]])localStorage.setItem('cardscout_search_catalog_v152_'+suffix,JSON.stringify({savedAt:Date.now(),cards:[card]}));});
 await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);let calls=0;p.on('request',r=>{if(new URL(r.url()).hostname==='api.tcgdex.net')calls++;});
 await p.reload();await p.locator('#navCollection').click();assert.equal(await p.locator('#collectionInsightPreview').innerText(),before);assert.deepEqual(await read(p),saved);await p.locator('#collectionAllInsights summary').click();assert.equal(calls,0);
 const urls=await p.evaluate(async()=> (await(await caches.open('rareworth-shell-v189-app-experience')).keys()).map(r=>r.url));assert.ok(urls.some(u=>u.includes('portfolio-insights-v178.js')));assert.ok(urls.every(u=>new URL(u).origin===origin));
});
test('empty collection has useful search CTA and no empty dashboard',async t=>{
 const {page:p}=await setup(t,[]);assert.ok(await p.locator('.collectionSummary').isHidden());assert.ok(await p.locator('#collectionInsights').isHidden());await p.locator('#collectionFirstCard').click();assert.ok(await p.locator('#quickInput').isVisible());
});
test('mobile widths, long names, keyboard focus and signed partial comparisons',async t=>{
 const partial=C.addUnknown(C.initialize({...F.item,uid:'partial'},3,50),2),{page:p}=await setup(t,[F.item,partial]);
 await p.evaluate(()=>{const items=JSON.parse(localStorage.getItem('cardscout_collection_v133'));items[0].name='Een bijzonder lange Pokémon kaartnaam met meerdere woorden';localStorage.setItem('cardscout_collection_v133',JSON.stringify(items));cardscoutCollectionUI.render();});
 for(const width of [320,375,390,430]){await p.setViewportSize({width,height:844});await p.locator('.collectionTools').evaluate(el=>el.open=true);await p.locator('#collectionAllInsights').evaluate(el=>el.open=true);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.match(await row(p,'partial').innerText(),/−€.*75,00/);assert.match(await row(p,'partial').innerText(),/Over 3 van 5/);await p.locator('#collectionAttention').focus();assert.equal(await p.evaluate(()=>document.activeElement.id),'collectionAttention');
 await p.screenshot({path:path.join(os.tmpdir(),'holokeep-v178-'+width+'.png'),fullPage:true});}
});
