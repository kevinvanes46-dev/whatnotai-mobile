'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const {chromium}=require('../scripts/node_modules/playwright');
const jungle=require('../nl-jungle-v242.js');

let browser,server,origin;
const legacyKey=jungle.LEGACY_OWNED_KEY;
const collectionKey='cardscout_collection_v133';
const jungleData={id:'base2',name:'Jungle',cardCount:{total:64},cards:jungle.CATALOG.map((name,index)=>({
  id:'base2-'+(index+1),localId:String(index+1),name,
  image:'https://assets.tcgdex.net/en/base/base2/'+(index+1)
}))};

before(async()=>{
  server=http.createServer((req,res)=>{
    try{
      const file=new URL(req.url,'http://local').pathname.slice(1)||'index.html';
      res.setHeader('Content-Type',({js:'text/javascript',css:'text/css',html:'text/html',json:'application/json',svg:'image/svg+xml',woff2:'font/woff2'})[file.split('.').pop()]||'application/octet-stream');
      res.end(fs.readFileSync(file));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch();
});
after(async()=>{await browser?.close();await new Promise(resolve=>server.close(resolve));});

async function setup(t,seed={}) {
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  t.after(()=>context.close());
  await context.addInitScript(data=>{for(const [key,value] of Object.entries(data))localStorage.setItem(key,JSON.stringify(value));},seed);
  const requests=[];
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.origin===origin)return route.continue();
    requests.push(url.href);
    if(url.hostname==='api.tcgdex.net'&&url.pathname==='/v2/en/sets/base2')return route.fulfill({json:jungleData});
    if(url.hostname==='api.tcgdex.net'&&url.pathname==='/v2/en/cards/base2-7')
      return route.fulfill({json:{id:'base2-7',localId:'7',name:'Nidoqueen',set:{id:'base2'},variants_detailed:[]}});
    if(url.hostname==='assets.tcgdex.net')return route.fulfill({contentType:'image/png',body:fs.readFileSync('icon-rareworth-192.png')});
    return route.abort();
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  t.after(()=>assert.deepEqual(errors,[]));
  await page.goto(origin);
  await page.locator('#onboardingGuest').click();
  await page.locator('#navSearch').click();
  await page.waitForFunction(()=>window.HoloDexLibraryUI?.library);
  return {page,context,requests};
}

test('NL Jungle works in the standard set browser, collection, Cardmarket, and mobile layouts',async t=>{
  const enItem={uid:'en-nidoqueen',listType:'OWNED',name:'Nidoqueen',number:'7',set:'JUNGLE',setName:'Jungle',
    sourceId:'base2-7',source_set_id:'base2',language:'EN',condition:'NM',variant:'NORMAL',edition:'AUTO',qty:1,paidEach:null,addedAt:1};
  const {page}=await setup(t,{[collectionKey]:[enItem]});
  await page.locator('#libraryToggle').click();
  await page.getByLabel('Bibliotheektaal').selectOption('NL');
  assert.equal(await page.locator('.librarySet').count(),1);
  assert.match(await page.locator('.librarySet').innerText(),/Jungle/);
  assert.doesNotMatch(await page.locator('#libraryBrowser').innerText(),/Base Set|Fossil/);
  await page.locator('[data-set-id="base2"]').click();
  await page.waitForFunction(()=>document.getElementById('librarySetDetail').textContent.includes('64 beschikbare kaarten'));
  assert.match(await page.locator('#librarySetDetail').innerText(),/Afbeeldingen zijn Engelse referentiebeelden/);
  assert.equal(await page.locator('.libraryCard').count(),24);
  await page.locator('.libraryCard').nth(6).click();
  const marketLink=page.locator('#cardSheetLink');
  await page.waitForFunction(()=>!document.getElementById('cardSheetLink').hidden);
  const route=new URL(await marketLink.getAttribute('href'));
  assert.match(route.pathname,/\/Singles\/Jungle\/Nidoqueen-V1-JU7$/);
  assert.equal(route.searchParams.get('language'),'12');
  assert.equal(route.searchParams.get('minCondition'),'2');
  await page.locator('#cardSheetAction').click();
  await page.locator('#collectionEditorSave').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('cardscout_collection_v133')||'[]').some(item=>item.language==='NL'));
  let items=await page.evaluate(()=>JSON.parse(localStorage.getItem('cardscout_collection_v133')));
  assert.equal(items.length,2);
  assert.ok(items.some(item=>item.uid==='en-nidoqueen'&&item.language==='EN'));
  const dutch=items.find(item=>item.language==='NL');
  assert.equal(dutch.sourceId,'base2-7');
  assert.equal(dutch.source_set_id,'base2');
  assert.equal(dutch.image,'https://assets.tcgdex.net/en/base/base2/7');
  assert.equal(new URL(dutch.cardmarketUrl).searchParams.get('language'),'12');
  await page.locator('#navCollection').click();
  assert.match(await page.locator('#collectionSets').innerText(),/NL · 1 \/ 64/);
  await page.locator('#collectionQuickFilters [data-filter-language="NL"]').click();
  assert.equal(await page.locator('#collectionList .collectionCard').count(),1);
  assert.match(await page.locator('#collectionList').innerText(),/NL/);
  assert.match(await page.locator('.collectionFootnote').innerText(),/Engelse referentiebeelden/);
  for(const width of [320,375,390,430]){
    await page.setViewportSize({width,height:844});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'horizontal overflow at '+width);
  }
});

test('legacy Jungle checks require consent, import as NL without replacing data, and remain stored',async t=>{
  const enItem={uid:'keep-en',listType:'OWNED',name:'Nidoqueen',number:'7',set:'JUNGLE',setName:'Jungle',
    sourceId:'base2-7',source_set_id:'base2',language:'EN',condition:'EX',variant:'NORMAL',edition:'AUTO',qty:2,paidEach:4,addedAt:1};
  const nlItem={uid:'keep-nl',listType:'OWNED',name:'Vaporeon',number:'12',set:'JUNGLE',setName:'Jungle',
    sourceId:'base2-12',source_set_id:'base2',language:'NL',condition:'EX',variant:'NORMAL',edition:'AUTO',qty:3,paidEach:8,addedAt:2};
  const legacy=['7','12'];
  const {page}=await setup(t,{[collectionKey]:[enItem,nlItem],[legacyKey]:legacy});
  await page.locator('#navCollection').click();
  const importButton=page.locator('#collectionImportLegacyJungle');
  await importButton.waitFor({state:'visible'});
  assert.match(await importButton.innerText(),/2/);
  page.on('dialog',dialog=>dialog.accept());
  await importButton.click();
  await page.waitForFunction(()=>Boolean(localStorage.getItem('holokeep_nl_jungle_beurs_import_v245')));
  const items=await page.evaluate(()=>JSON.parse(localStorage.getItem('cardscout_collection_v133')));
  assert.equal(items.length,3);
  assert.deepEqual(items.find(item=>item.uid==='keep-en'),enItem);
  assert.deepEqual(items.find(item=>item.uid==='keep-nl'),nlItem);
  const added=items.find(item=>item.language==='NL'&&item.sourceId==='base2-7');
  assert.equal(added.name,'Nidoqueen');
  assert.equal(new URL(added.cardmarketUrl).searchParams.get('language'),'12');
  assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),legacyKey),legacy);
  await page.reload();
  await page.locator('#navCollection').click();
  assert.equal(await page.locator('#collectionImportLegacyJungle').isVisible(),false);
});

test('cached NL Jungle cards remain openable when the API is unavailable after reload',async t=>{
  const {page,context,requests}=await setup(t);
  await page.locator('#libraryToggle').click();
  await page.getByLabel('Bibliotheektaal').selectOption('NL');
  await page.locator('[data-set-id="base2"]').click();
  await page.locator('.libraryCard').first().waitFor();
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('holodex_library_v185_NL-set-base2')||'{}'));
  assert.equal(before.value.cards.length,64);
  await context.route('https://api.tcgdex.net/**',route=>route.abort());
  await page.reload();
  await page.locator('#navSearch').click();
  await page.locator('#libraryToggle').click();
  await page.getByLabel('Bibliotheektaal').selectOption('NL');
  await page.locator('[data-set-id="base2"]').click();
  await page.locator('.libraryCard').first().waitFor();
  assert.equal(await page.locator('.libraryCard').count(),24);
  assert.equal((await page.locator('#librarySetDetail').innerText()).includes('64 beschikbare kaarten'),true);
  assert.ok(requests.some(url=>url.includes('/v2/en/sets/base2')));
});
