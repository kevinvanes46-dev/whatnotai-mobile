'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {cards,productUrl,apiResponse}=require('./helpers/cardmarket-catalog.cjs');
const root=path.resolve(__dirname,'..');
let passed=0;
const pass=name=>{passed++;console.log('PASS '+name);};
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!/^[\w.-]+\.(html|js|css|json)$/.test(file)){res.writeHead(404).end();return;}
  try{res.setHeader('Content-Type',({html:'text/html',js:'text/javascript',css:'text/css',json:'application/json'})[file.split('.').pop()]);res.end(fs.readFileSync(path.join(root,file)));}catch{res.writeHead(404).end();}
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
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const requests=new Map(),waiting=new Map();
  await ctx.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.hostname==='127.0.0.1')return route.continue();
   if(url.hostname==='api.pokemontcg.io'){
    const id=url.pathname.split('/').pop();requests.set(id,(requests.get(id)||0)+1);
    const response=await new Promise(resolve=>waiting.set(id,resolve));waiting.delete(id);
    return route.fulfill(response);
   }
   if(url.hostname==='api.tcgdex.net')return route.fulfill({json:{name:'Mock catalog',cards:[]}});
   return route.abort();
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(()=>typeof resolveFinalCardmarketRoute==='function');
  // Isolate the remote stage; legacy verified URL literals are left enabled.
  await page.evaluate(()=>{DATA.knownCards=[];});
  async function select(card){
   await page.evaluate(card=>{
    for(const [id,value]of Object.entries({nameInput:card.name,numberInput:card.number,setSelect:card.set,langSelect:card.language,condSelect:card.condition,editionSelect:card.edition}))document.getElementById(id).value=value;
    document.getElementById('quickInput').value=card.name;
    selectCardmarketCard(card);updateCustomSelects();void makeLink(false);
   },card);
  }
  async function waitRequest(id){for(let n=0;n<100&&!waiting.has(id);n++)await new Promise(r=>setTimeout(r,10));assert.ok(waiting.has(id),'request missing '+id);}
  function respond(card,status=200){waiting.get(card.source_id)({status,json:status===200?{data:apiResponse(card)}:{error:'Not found'}});}
  const readyCard={...cards[23],verified:true,direct:true,url:productUrl(cards[23])};
  const sample=[cards[20],cards[22],cards[24],cards[16]];
  for(const [index,width] of [1280,390,375,320].entries()){
   await page.setViewportSize({width,height:900});
   await select(readyCard);await page.waitForFunction(()=>getComputedStyle(document.getElementById('actionDock')).opacity==='1');
   await page.locator('#actionDock').evaluate(dock=>Promise.all(dock.getAnimations().map(animation=>animation.finished)));
   const before=await page.locator('#actionDock').boundingBox();
   const card=sample[index];await select(card);await waitRequest(card.source_id);
   const pending=await page.evaluate(()=>{
    const open=document.getElementById('openBtn'),dock=document.getElementById('actionDock');
    const visible=e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!=='hidden';};
    return {href:open.getAttribute('href'),disabled:open.classList.contains('disabled'),label:open.querySelector('span').textContent,
     dockVisible:dock.classList.contains('ready'),collectionVisible:!!visible(document.getElementById('collectionAddBtn')),collectionDisabled:document.getElementById('collectionAddBtn').disabled,
     visibleCM:[...document.querySelectorAll('#makeBtn,#openBtn,#resultOpenBtn')].filter(visible).map(e=>e.id),overflow:document.documentElement.scrollWidth>innerWidth};
   });
   assert.equal(pending.href,'#');assert.equal(pending.disabled,true);assert.equal(pending.label,'Cardmarket zoeken…');assert.equal(pending.dockVisible,true);assert.equal(pending.collectionVisible,true);assert.equal(pending.collectionDisabled,true);assert.deepEqual(pending.visibleCM,['openBtn']);assert.equal(pending.overflow,false);
   assert.equal(await page.evaluate(id=>window.routeEvents.filter(e=>e.card.source_id===id).length,card.source_id),0);
   assert.equal(await page.evaluate(()=>localStorage.getItem('cardscout_collection_v133')),seed);
   assert.deepEqual(await page.locator('#actionDock').boundingBox(),before);
   if(process.env.V147_SCREENSHOT_DIR && [1280,375].includes(width))await page.screenshot({path:path.join(process.env.V147_SCREENSHOT_DIR,`v147-pending-${width}.png`),fullPage:true});
   respond(card,index%2?404:200);
   await page.waitForFunction(()=>document.getElementById('openBtn').dataset.cmState==='ready');
   const url=await page.locator('#openBtn').getAttribute('href');
   if(index%2)assert.equal(new URL(url).searchParams.get('searchString'),card.name);
   else assert.equal(url.split('?')[0],productUrl(card));
   assert.equal(await page.locator('#openBtn span').textContent(),'Open Cardmarket');assert.equal(await page.locator('#collectionAddBtn').isEnabled(),true);
   assert.deepEqual(await page.locator('#actionDock').boundingBox(),before);
   await page.locator('#collectionAddBtn').click();
   const editor=JSON.parse(await page.locator('#collectionEditor').getAttribute('data-pending'));
   assert.equal(editor.cardmarketUrl,url);await page.locator('#collectionEditorClose').click();
   pass(`${width}px pending/resolved: one CM button, collection visible/blocked until final, no overflow or layout jump, final editor URL`);
  }
  // A slow response must never change the selected card or enable saving its temporary route.
  const a=cards[10],b=cards[11];await select(a);await waitRequest(a.source_id);await select(b);await waitRequest(b.source_id);respond(b);await page.waitForFunction(url=>document.getElementById('openBtn').href.startsWith(url),productUrl(b));respond(a);
  await page.waitForFunction(()=>cmPendingRoutes.size===0);
  assert.equal((await page.locator('#openBtn').getAttribute('href')).split('?')[0],productUrl(b));assert.equal(await page.evaluate(id=>window.routeEvents.some(e=>e.card.source_id===id),a.source_id),false);
  pass('Stale response ignored by dock and collection selection');
  await page.locator('#collectionAddBtn').click();
  await page.locator('[data-editor-list="WISHLIST"]').click();await page.locator('#collectionEditorSave').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cardscout_collection_v133')));
  assert.deepEqual(saved.find(e=>e.uid==='existing-v147'),oldItem);const added=saved.find(e=>e.uid!=='existing-v147');assert.equal(added.cardmarketUrl.split('?')[0],productUrl(b));assert.equal(added.sourceId,b.source_id);
  pass('Actual collection save contains final URL; existing purchase/condition/stamped data unchanged');
  const count=requests.get(b.source_id);await select(readyCard);await select(b);
  assert.equal(await page.locator('#openBtn').getAttribute('data-cm-state'),'ready');assert.equal(requests.get(b.source_id),count);
  pass('Cached route immediately active without API request');
  const c=cards[17];await select(c);await waitRequest(c.source_id);await select(c);assert.equal(requests.get(c.source_id),1);respond(c);await page.waitForFunction(()=>document.getElementById('openBtn').dataset.cmState==='ready');
  assert.equal(await page.evaluate(id=>window.routeEvents.filter(e=>e.card.source_id===id).length,c.source_id),1);
  pass('Duplicate selection deduplicates network and final-ready publication');
  assert.deepEqual(errors,[]);pass('No browser runtime errors');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
 console.log(`${passed} v147 browser tests passed`);
})().catch(e=>{console.error(e);process.exitCode=1;});
