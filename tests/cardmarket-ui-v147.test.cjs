'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {cards}=require('./helpers/cardmarket-catalog.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;
const pass=name=>{passed++;console.log('PASS '+name);};
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!/^[\w.-]+\.(html|js|css|json|svg)$/.test(file)){res.writeHead(404).end();return;}
  try{res.setHeader('Content-Type',({html:'text/html',js:'text/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml'})[file.split('.').pop()]);res.end(fs.readFileSync(path.join(root,file)));}catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  const ctx=await browser.newContext();
  const oldItem={uid:'existing-v147',name:'Charizard',number:'4',set:'EX CRYSTAL GUARDIANS',setName:'EX Crystal Guardians',language:'EN',edition:'1ST',condition:'EX',variant:'STAMPED',qty:3,paidEach:19.75,addedAt:1,listType:'OWNED',price:456,priceUpdated:Date.now(),cardmarketUrl:'https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=unchanged'};
  const seed=JSON.stringify([oldItem]);
  await ctx.addInitScript(seed=>{
   localStorage.setItem('cardscout_collection_v133',seed);
   window.routeEvents=[];
   window.addEventListener('cardscout:cm-route-ready',e=>window.routeEvents.push(e.detail));
  },seed);
  await ctx.route('**/cardmarket-products-v152.js*',r=>r.fulfill({body:'',contentType:'text/javascript'}));
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const providerRequests=[];
  const assertNoLegacyProductResolverCalls=()=>assert.equal(providerRequests.some(url=>new URL(url).hostname==='api.pokemontcg.io'),false);
  await ctx.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.pathname.endsWith('/cardmarket-products-v152.js'))return route.fulfill({body:'',contentType:'text/javascript'});
   if(url.hostname==='127.0.0.1')return route.continue();
   if(url.hostname==='api.pokemontcg.io'||url.hostname==='api.tcgdex.net')providerRequests.push(url.href);
   return route.abort();
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.locator('#onboardingGuest').click();
  await page.locator('#navSearch').click();
  await page.waitForFunction(()=>typeof resolveFinalCardmarketRoute==='function');
  async function select(card){
   await page.evaluate(card=>{
    for(const [id,value]of Object.entries({nameInput:card.name,numberInput:card.number,setSelect:card.set,langSelect:card.language,condSelect:card.condition,editionSelect:card.edition}))document.getElementById(id).value=value;
    document.getElementById('quickInput').value=card.name;
    selectCardmarketCard(card);updateCustomSelects();void makeLink(false);
   },card);
  }
  async function ready(){await page.waitForFunction(()=>document.getElementById('openBtn').dataset.cmState==='ready');}
  async function expectedRoute(){return page.evaluate(()=>HoloDexLibrary.safeRoute(currentCardmarketCard()));}
  const sample=[cards[20],cards[22],cards[24],cards[16]];
  for(const [index,width] of [1280,390,375,320].entries()){
   await page.setViewportSize({width,height:900});
   await select(cards[23]);await ready();await page.waitForFunction(()=>getComputedStyle(document.getElementById('actionDock')).opacity==='1');
   await page.locator('#actionDock').evaluate(dock=>Promise.all(dock.getAnimations().map(animation=>animation.finished)));
   const before=await page.locator('#actionDock').boundingBox();
   const card=sample[index];await select(card);await ready();
   const expected=await expectedRoute(),url=new URL(await page.locator('#openBtn').getAttribute('href'));
   const resolved=await page.evaluate(()=>{
    const open=document.getElementById('openBtn'),dock=document.getElementById('actionDock');
    const visible=e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden';};
    return {href:open.getAttribute('href'),disabled:open.classList.contains('disabled'),label:open.querySelector('span').textContent,
     state:open.dataset.cmState,dockVisible:dock.classList.contains('ready'),collectionVisible:!!visible(document.getElementById('collectionAddBtn')),collectionDisabled:document.getElementById('collectionAddBtn').disabled,
     visibleCM:[...document.querySelectorAll('#makeBtn,#openBtn,#resultOpenBtn')].filter(visible).map(e=>e.id),overflow:document.documentElement.scrollWidth>innerWidth};
   });
   assert.equal(resolved.href,expected.url);assert.equal(resolved.disabled,false);assert.equal(resolved.state,'ready');assert.equal(resolved.dockVisible,true);assert.equal(resolved.collectionVisible,true);assert.equal(resolved.collectionDisabled,false);assert.deepEqual(resolved.visibleCM,['openBtn']);assert.equal(resolved.overflow,false);
   assert.equal(url.origin,'https://www.cardmarket.com');assert.equal(expected.identity.source_id,card.source_id);
   if(!expected.exact)assert.equal(url.searchParams.has('idProduct'),false);
   assert.equal(await page.evaluate(id=>window.routeEvents.filter(e=>e.card.source_id===id).length,card.source_id),1);
   assertNoLegacyProductResolverCalls();
   assert.equal(await page.evaluate(()=>localStorage.getItem('cardscout_collection_v133')),seed);
   assert.deepEqual(await page.locator('#actionDock').boundingBox(),before);
   assert.equal(await page.locator('#openBtn span').textContent(),'Bekijk zoekresultaten');assert.equal(await page.locator('#collectionAddBtn').isEnabled(),true);
   assert.deepEqual(await page.locator('#actionDock').boundingBox(),before);
   await page.locator('#collectionAddBtn').click();
   const editor=JSON.parse(await page.locator('#collectionEditor').getAttribute('data-pending'));
   assert.equal(editor.cardmarketUrl,expected.url);await page.locator('#collectionEditorClose').click();
   pass(`${width}px local safe route: one CM button, collection enabled, no overflow/layout jump, final editor URL`);
  }
  // The current EN adapter is synchronous and never publishes an unverified provider ID.
  const a=cards[10],b=cards[11];await select(a);await ready();await select(b);await ready();
  const expectedB=await expectedRoute();
  assert.equal(await page.locator('#openBtn').getAttribute('href'),expectedB.url);
  assert.equal(await page.evaluate(id=>window.routeEvents.at(-1)?.card.source_id===id,b.source_id),true);
  assertNoLegacyProductResolverCalls();
  pass('Rapid selection leaves the local safe route active without legacy product-resolver calls');
  await page.locator('#collectionAddBtn').click();
  await page.locator('[data-editor-list="WISHLIST"]').click();await page.locator('#collectionEditorSave').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cardscout_collection_v133')));
  assert.deepEqual(saved.find(e=>e.uid==='existing-v147'),oldItem);const added=saved.find(e=>e.uid!=='existing-v147');assert.equal(added.cardmarketUrl,expectedB.url);assert.equal(added.sourceId,b.source_id);
  pass('Actual collection save contains the current safe route; existing purchase/condition/stamped data unchanged');
  const c=cards[17];await select(c);await ready();const expectedC=await expectedRoute();await select(c);await ready();
  assert.equal(await page.locator('#openBtn').getAttribute('href'),expectedC.url);
  assertNoLegacyProductResolverCalls();
  pass('Repeated selection retains its safe route without provider requests');
  assert.deepEqual(errors,[]);pass('No browser runtime errors');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
 console.log(`${passed} v147 browser tests passed`);
})().catch(e=>{console.error(e);process.exitCode=1;});
