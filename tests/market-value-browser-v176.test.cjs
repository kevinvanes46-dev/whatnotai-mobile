'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('../scripts/node_modules/playwright'),fixture=require('./fixtures/market-v176.cjs');
let browser,server,origin;
before(async()=>{
 server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(f==='seed')return res.end('<html></html>');res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(f)));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true});
});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
async function setup(t,items=[fixture.item]){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});t.after(()=>context.close());
 await context.addInitScript(()=>sessionStorage.setItem('rareworth_guest_session_v171_1','1'));
 let fail=false,count=0,response=structuredClone(fixture.card);const errors=[];
 await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin)return r.continue();
  if(u.hostname==='api.tcgdex.net'){if(u.pathname.includes('/cards/')){if(r.request().headers().accept==='application/json')count++;return fail?r.fulfill({status:503,json:{}}):r.fulfill({json:response});}return r.fulfill({json:{cards:[]}});}
  if(u.hostname==='assets.tcgdex.net')return r.fulfill({contentType:'image/png',body:fs.readFileSync('icon-rareworth-192.png')});return r.fulfill({json:{data:[]}});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
 await page.goto(origin+'/seed');await page.evaluate(items=>localStorage.setItem('cardscout_collection_v133',JSON.stringify(items)),items);await page.goto(origin);
 await page.waitForFunction(()=>!!window.cardscoutCollectionUI&&!!window.RareWorthCloudSync);
 return {page,context,count:()=>count,fail:()=>{fail=true;},response:c=>{response=c;}};
}
const snapshot=p=>p.evaluate(()=>{const raw=localStorage.getItem('cardscout_collection_v133');return {raw,signature:RareWorthCloudSync.createLocalSnapshot(JSON.parse(raw)).signature};});
test('real refresh preserves exact collection and cloud signature; labels, failures and mobile',async t=>{
 const {page,fail,count,response}=await setup(t);const before=await snapshot(page);
 assert.equal(await page.evaluate(()=>cardscoutCollectionUI.refreshOnePrice('market-test')),'updated');assert.deepEqual(await snapshot(page),before);assert.equal(count(),1);
 await page.locator('#navCollection').click();await page.waitForFunction(()=>!document.querySelector('#collectionRefreshBtn').disabled);assert.equal(count(),1);
 assert.match(await page.locator('#collectionMarket').innerText(),/50/);assert.match(await page.locator('#collectionPriceCoverage').innerText(),/2 van 2 exemplaren/);assert.match(await page.locator('#collectionPaidCoverage').innerText(),/2 van 2 exemplaren/);
 assert.match(await page.locator('#collectionList').innerText(),/Algemene marktindicatie/);assert.match(await page.locator('#collectionList').innerText(),/Conditie niet verwerkt/);assert.match(await page.locator('#collectionList').innerText(),/Cardmarket trend/);
 for(const width of [320,375,390,430]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),String(width));assert.ok(await page.locator('#collectionMarket').isVisible());}
 const c=structuredClone(fixture.card);delete c.pricing.cardmarket['trend-holo'];response(c);await page.evaluate(()=>cardscoutCollectionUI.refreshPrices(true));assert.match(await page.locator('#collectionList').innerText(),/7-daags gemiddelde/);assert.doesNotMatch(await page.locator('#collectionList').innerText(),/Cardmarket trend/);
 delete c.pricing.cardmarket['avg7-holo'];response(c);await page.evaluate(()=>cardscoutCollectionUI.refreshPrices(true));assert.match(await page.locator('#collectionList').innerText(),/30-daags gemiddelde/);
 const cached=await page.evaluate(()=>localStorage.getItem(HoloKeepMarket.KEY));fail();await page.evaluate(()=>cardscoutCollectionUI.refreshPrices(true));
 assert.equal(await page.evaluate(()=>localStorage.getItem(HoloKeepMarket.KEY)),cached);assert.deepEqual(await snapshot(page),before);assert.match(await page.locator('.priceFreshness').innerText(),/Vernieuwen mislukt/);assert.match(await page.locator('#collectionMarket').innerText(),/46/);
 assert.doesNotMatch(await page.locator('[data-view="collection"]').innerText(),/ROI|winst|verlies|Live waarde|Exacte waarde/);
});
test('legacy excluded; special variants unavailable; quantity and cost coverage; duplicate requests deduplicated',async t=>{
 const items=[fixture.item,{...fixture.item,uid:'stamped',qty:3,variant:'STAMPED',paidEach:null},{...fixture.item,uid:'second',qty:1,condition:'PL',paidEach:0}];const {page,count}=await setup(t,items);
 assert.equal(await page.locator('#collectionMarket').textContent(),'—');assert.match(await page.locator('#collectionList').textContent(),/Oudere prijs/);const before=await snapshot(page);
 await page.evaluate(()=>cardscoutCollectionUI.refreshPrices(true));assert.equal(count(),1);assert.deepEqual(await snapshot(page),before);
 assert.equal(await page.locator('#collectionPriceCoverage').textContent(),'Prijs voor 3 van 6 exemplaren');assert.match(await page.locator('#collectionPaidCoverage').textContent(),/3 van 6/);assert.match(await page.locator('#collectionList').textContent(),/Geen betrouwbare stamped-prijs/);
 await page.evaluate(()=>{const a=JSON.parse(localStorage.getItem('cardscout_collection_v133'));a[0].edition='1ST';localStorage.setItem('cardscout_collection_v133',JSON.stringify(a));cardscoutCollectionUI.render();});
 assert.match(await page.locator('#collectionList').textContent(),/Geen passende 1st Edition-prijs/);
});
test('real service worker offline reload retains validated cache, provenance, user data and same-origin assets',async t=>{
 const {page,context}=await setup(t);await page.evaluate(()=>cardscoutCollectionUI.refreshPrices(true));await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const before=await snapshot(page),cached=await page.evaluate(()=>localStorage.getItem(HoloKeepMarket.KEY));
 await context.setOffline(true);await page.reload();await page.locator('#navCollection').click();
 assert.match(await page.locator('#collectionMarket').textContent(),/50/);assert.match(await page.locator('#collectionList').textContent(),/Cardmarket trend/);assert.match(await page.locator('#collectionList').textContent(),/Bijgewerkt/);
 assert.deepEqual(await snapshot(page),before);assert.equal(await page.evaluate(()=>localStorage.getItem(HoloKeepMarket.KEY)),cached);
 const urls=await page.evaluate(async()=> (await (await caches.open('rareworth-shell-v176')).keys()).map(r=>r.url));assert.ok(urls.some(u=>u.includes('market-v176.js?build=176-market-value-trust')));assert.ok(urls.every(u=>new URL(u).origin===origin));
});
test('mismatched response and in-flight identity change cannot attach wrong price',async t=>{
 const {page,response}=await setup(t);const c=structuredClone(fixture.card);c.id='base2-4';response(c);const before=await snapshot(page);
 assert.equal(await page.evaluate(()=>cardscoutCollectionUI.refreshOnePrice('market-test')),'failed');assert.deepEqual(await snapshot(page),before);assert.equal(await page.evaluate(()=>HoloKeepMarket.get(localStorage,JSON.parse(localStorage.getItem('cardscout_collection_v133'))[0])),null);
 response(fixture.card);
 await page.route('**/v2/en/cards/base1-4',async r=>{await page.evaluate(()=>{const a=JSON.parse(localStorage.getItem('cardscout_collection_v133'));a[0].variant='STAMPED';localStorage.setItem('cardscout_collection_v133',JSON.stringify(a));});await r.fulfill({json:fixture.card});});
 assert.equal(await page.evaluate(()=>cardscoutCollectionUI.refreshOnePrice('market-test')),'skipped');assert.equal(await page.evaluate(()=>localStorage.getItem(HoloKeepMarket.KEY)),null);
});
