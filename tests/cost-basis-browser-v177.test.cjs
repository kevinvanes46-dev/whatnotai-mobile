'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),os=require('node:os');
const {chromium}=require('../scripts/node_modules/playwright'),F=require('./fixtures/market-v176.cjs'),C=require('../cost-basis-v177');
const KEY='cardscout_collection_v133';let browser,server,origin;
before(async()=>{server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(f==='seed')return res.end('<html></html>');res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(f)));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true});});
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
test('legacy metadata save never confirms; confirm, ignore and clear are explicit',async t=>{
 const {page:p}=await setup(t);assert.match(await row(p).innerText(),/Oude aankoopprijs/);assert.match(await p.locator('#collectionPaidCoverage').innerText(),/0 van 2/);assert.equal(await p.locator('#collectionDifference').innerText(),'—');
 await edit(p);await p.locator('[data-editor-condition="NM"]').click();await save(p);let x=(await read(p))[0];assert.equal(C.state(x),'LEGACY_UNCONFIRMED');assert.equal(x.paidEach,7);assert.equal(x.condition,'NM');
 const before=await signature(p);await edit(p);await p.locator('#collectionCostConfirm').click();await save(p);x=(await read(p))[0];assert.equal(x.costBasis.total,14);assert.notEqual(await signature(p),before);
 await edit(p);await p.locator('#collectionCostClear').click();await save(p);assert.equal(C.state((await read(p))[0]),'UNKNOWN');assert.equal((await read(p))[0].paidEach,7);
 await p.evaluate(({KEY,item})=>{localStorage.setItem(KEY,JSON.stringify([item]));cardscoutCollectionUI.render();},{KEY,item:F.item});await edit(p);await p.locator('#collectionCostIgnore').click();await save(p);assert.equal(C.state((await read(p))[0]),'UNKNOWN');assert.equal((await read(p))[0].paidEach,7);
});
test('plus acquisition, weighted duplicate, exact undo and unknown addition',async t=>{
 const {page:p}=await setup(t,[C.initialize(F.item,1,10)]);const initial=await read(p);
 await row(p).locator('[data-act="plus"]').click();assert.deepEqual(await read(p),initial);assert.equal(await p.locator('#collectionEditorEyebrow').textContent(),'Exemplaar toevoegen');await p.locator('#collectionEditorPaid').fill('20');await save(p);
 let x=(await read(p))[0];assert.equal(x.qty,2);assert.equal(x.costBasis.total,30);assert.equal(C.average(x),15);
 await p.locator('#collectionUndo button').click();assert.deepEqual(await read(p),initial);
 await row(p).locator('[data-act="plus"]').click();await save(p);x=(await read(p))[0];assert.equal(x.qty,2);assert.equal(x.costBasis.knownQty,1);assert.equal(C.state(x),'PARTIAL');assert.match(await row(p).innerText(),/Over 1 van 2 exemplaren/);
});
test('duplicate into legacy retains old paidEach without confirming it',async t=>{
 const {page:p}=await setup(t);await row(p).locator('[data-act="plus"]').click();await p.locator('#collectionEditorPaid').fill('20');await save(p);const x=(await read(p))[0];assert.equal(x.qty,3);assert.equal(x.costBasis.knownQty,1);assert.equal(x.costBasis.total,20);assert.equal(x.paidEach,7);assert.match(await p.locator('#collectionPaidCoverage').innerText(),/1 van 3/);
});
test('confirmed minus, partial choice and legacy minus are safe',async t=>{
 const {page:p}=await setup(t,[C.initialize(F.item,3,20)]);await row(p).locator('[data-act="minus"]').click();let x=(await read(p))[0];assert.equal(x.qty,2);assert.equal(x.costBasis.total,40);
 await row(p).locator('[data-act="plus"]').click();await save(p);const before=await read(p);await row(p).locator('[data-act="minus"]').click();assert.deepEqual(await read(p),before);await p.locator('#collectionRemoveUnknown').click();await save(p);x=(await read(p))[0];assert.equal(x.qty,2);assert.equal(x.costBasis.total,40);
 await p.evaluate(({KEY,item})=>{localStorage.setItem(KEY,JSON.stringify([item]));cardscoutCollectionUI.render();},{KEY,item:F.item});await row(p).locator('[data-act="minus"]').click();assert.equal((await read(p))[0].qty,2);await p.locator('#collectionCostIgnore').click();await save(p);assert.equal((await read(p))[0].qty,1);assert.equal(C.state((await read(p))[0]),'UNKNOWN');
});
test('metadata retains exact basis; manual correction and dormant Wishlist preserve user intent',async t=>{
 const start=C.initialize(F.item,4,10),{page:p}=await setup(t,[start]);await edit(p);await p.locator('[data-editor-condition="GD"]').click();await p.locator('[data-editor-variant="STAMPED"]').click();await save(p);assert.deepEqual((await read(p))[0].costBasis,start.costBasis);
 await edit(p);await p.locator('#collectionCostAverage').click();await p.locator('#collectionEditorPaid').fill('12,50');await save(p);assert.equal((await read(p))[0].costBasis.total,50);
 const basis=(await read(p))[0].costBasis;await edit(p);await p.locator('[data-editor-list="WISHLIST"]').click();await save(p);assert.deepEqual((await read(p))[0].costBasis,basis);assert.equal(await p.locator('#collectionPaid').innerText(),'—');
 await row(p).locator('[data-act="bought"]').click();await p.locator('#collectionEditorQty').fill('2');await save(p);assert.equal((await read(p))[0].qty,2);assert.equal(C.state((await read(p))[0]),'UNKNOWN');
});
test('new selection duplicate purchases merge with weighted costs; explicit free and Wishlist creation',async t=>{
 const {page:p}=await setup(t,[]);await p.locator('#navSearch').click();
 await p.locator('.visiblePreferences [data-value="EN"]').click();await p.locator('#quickInput').fill('Charizard 4 Base Set');await p.locator('.suggestion').first().click();
 for(const price of ['10','20']){await p.locator('#collectionAddBtn').click();await p.locator('#collectionEditorPaid').fill(price);await save(p);}
 let x=(await read(p))[0];assert.equal((await read(p)).length,1);assert.equal(x.costBasis.total,30);assert.equal(x.qty,2);
 await p.locator('#collectionAddBtn').click();await p.locator('[data-editor-condition="PL"]').click();await p.locator('#collectionEditorPaid').fill('0');await save(p);x=(await read(p)).find(x=>x.condition==='PL');assert.equal(C.state(x),'CONFIRMED');assert.equal(x.costBasis.total,0);
 await p.locator('#collectionAddBtn').click();await p.locator('[data-editor-list="WISHLIST"]').click();await save(p);x=(await read(p)).find(x=>x.listType==='WISHLIST');assert.equal(x.costBasis,undefined);
});
test('old and v177 backups roundtrip, malformed basis and unknown fields survive',async t=>{
 const {page:p}=await setup(t);const importData=async rows=>{await p.locator('#collectionImportFile').setInputFiles({name:'collection.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({collection:rows}))});await p.waitForFunction(rows=>JSON.stringify(JSON.parse(localStorage.getItem('cardscout_collection_v133')))===JSON.stringify(rows),rows);};
 const legacy={...F.item,qty:3};await importData([legacy]);assert.equal(C.state((await read(p))[0]),'LEGACY_UNCONFIRMED');
 const known=C.initialize(F.item,3,12.5);await importData([known]);assert.deepEqual((await read(p))[0].costBasis,known.costBasis);
 await p.locator('#navSettings').click();const download=p.waitForEvent('download');await p.locator('#collectionExportBtn').click();const d=await download;const backup=JSON.parse(fs.readFileSync(await d.path(),'utf8'));assert.deepEqual(backup.collection,await read(p));await importData(backup.collection);assert.deepEqual(await read(p),backup.collection);
 const bad={...known,costBasis:{...known.costBasis,knownQty:99},future:{retain:'yes'}};await importData([bad]);assert.equal(C.state((await read(p))[0]),'LEGACY_UNCONFIRMED');assert.deepEqual((await read(p))[0].future,bad.future);assert.equal(await p.locator('#collectionDifference').innerText(),'—');
});
test('market refresh is immutable; offline PWA v177 retains user costs and comparison',async t=>{
 const {page:p,context}=await setup(t,[C.initialize(F.item,2,10)]);const before=await read(p),sig=await signature(p);await p.evaluate(()=>cardscoutCollectionUI.refreshPrices(true));assert.deepEqual(await read(p),before);assert.equal(await signature(p),sig);assert.match(await p.locator('#collectionDifference').innerText(),/30,00/);
 await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);await p.reload();await p.locator('#navCollection').click();assert.deepEqual(await read(p),before);assert.match(await p.locator('#collectionDifference').innerText(),/30,00/);
 const urls=await p.evaluate(async()=> (await(await caches.open('rareworth-shell-v177')).keys()).map(r=>r.url));assert.ok(urls.some(u=>u.includes('cost-basis-v177.js')));assert.ok(urls.every(u=>new URL(u).origin===origin));
});
test('mobile summary, legacy choices, acquisition and positive/negative partial results',async t=>{
 const negative=C.initialize({...F.item,uid:'negative'},2,50),partial=C.addUnknown(C.initialize({...F.item,uid:'partial'},2,10),3),{page:p}=await setup(t,[F.item,negative,partial]);
 for(const width of [320,375,390,430]){await p.setViewportSize({width,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.match(await row(p,'negative').innerText(),/−€.*50,00/);assert.match(await row(p,'partial').innerText(),/Over 2 van 5/);await edit(p);assert.ok(await p.locator('#collectionCostConfirm').isVisible());assert.ok(await p.evaluate(()=>document.querySelector('#collectionEditor').scrollWidth<=document.querySelector('#collectionEditor').clientWidth));await p.locator('#collectionEditorClose').click();await row(p).locator('[data-act="plus"]').click();assert.ok(await p.locator('#collectionEditorPaid').isEnabled());await p.screenshot({path:path.join(os.tmpdir(),'holokeep-v177-editor-'+width+'.png')});await p.locator('#collectionEditorClose').click();}
});
