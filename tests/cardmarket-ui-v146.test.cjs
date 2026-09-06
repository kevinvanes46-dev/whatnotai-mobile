'use strict';
// Run with PLAYWRIGHT_MODULE pointing to an installed playwright package when it is not on NODE_PATH.
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const AZU='https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Delta-Species/Azumarill-Delta-Species-DS19';
let passed=0;
const pass=name=>{passed++;console.log('PASS '+name);};
(async()=>{
 const server=http.createServer((req,res)=>{
  const filename=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
  if(!/^[\w.-]+\.(html|js|css|json)$/.test(filename)){res.writeHead(404).end();return;}
  try{const body=fs.readFileSync(path.join(root,filename));res.setHeader('Content-Type',({'html':'text/html','js':'text/javascript','css':'text/css','json':'application/json'})[filename.split('.').pop()]);res.end(body);}catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  const ctx=await browser.newContext();
  const savedCollection=JSON.stringify([{uid:'v146-fixture',name:'Charizard',number:'4',set:'EX CRYSTAL GUARDIANS',setName:'EX Crystal Guardians',language:'EN',edition:'AUTO',condition:'NM',variant:'STAMPED',qty:2,paidEach:12.5,addedAt:1,listType:'OWNED',price:123,priceUpdated:Date.now(),cardmarketUrl:'https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=old'}]);
  await ctx.addInitScript(value=>localStorage.setItem('cardscout_collection_v133',value),savedCollection);
  const page=await ctx.newPage();
  const errors=[];let apiCalls=0;
  page.on('pageerror',err=>errors.push(err.message));
  await ctx.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.hostname==='127.0.0.1') return route.continue();
   if(url.hostname==='api.pokemontcg.io'){
    apiCalls++;
    return route.fulfill({json:{data:{id:'ex11-19',name:'Azumarill',number:'19',set:{id:'ex11',name:'Delta Species'},cardmarket:{url:AZU}}}});
   }
   if(url.hostname==='api.tcgdex.net'){
    const isAzumarill=url.pathname==='/v2/en/sets/ex11';
    return route.fulfill({json:{name:isAzumarill?'EX Delta Species':'Mock set',cards:isAzumarill?[{id:'ex11-19',localId:'19',name:'Azumarill Δ'}]:[]}});
   }
   return route.abort();
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(()=>typeof buildUrl==='function');
  await page.locator('#langSelect').selectOption('EN',{force:true});
  await page.locator('#quickInput').fill('Bagon Delta Species 43 EX Dragon Frontiers');
  await page.locator('#quickInput').press('Enter');
  await page.waitForFunction(()=>document.querySelector('#openBtn').href.includes('Bagon-Delta-Species-DF43'));
  assert.equal(await page.locator('#setSelect').inputValue(),'EX DRAGON FRONTIERS');pass('Bagon quick input selects Dragon Frontiers and exact DF43');
  for(const width of [1280,390,375,320]){
   await page.setViewportSize({width,height:900});
   await page.waitForFunction(()=>{
    const dock=document.querySelector('#actionDock');
    return dock.classList.contains('ready') && getComputedStyle(dock).opacity==='1';
   });
   const result=await page.evaluate(()=>{
    const visible=el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0';};
    return {buttons:[...document.querySelectorAll('a,button')].filter(el=>/Open Cardmarket/.test(el.textContent)&&visible(el)).map(el=>el.id),
     make:getComputedStyle(document.querySelector('#makeBtn')).display,collection:visible(document.querySelector('#collectionAddBtn')),
     overflow:document.documentElement.scrollWidth>innerWidth};
   });
   assert.deepEqual(result.buttons,['openBtn']);assert.equal(result.make,'none');assert.equal(result.collection,true);assert.equal(result.overflow,false);
   pass(`One visible Cardmarket button, collection visible, no overflow at ${width}px`);
   if(process.env.V146_SCREENSHOT_DIR && [1280,375].includes(width)) await page.screenshot({path:path.join(process.env.V146_SCREENSHOT_DIR,`v146-${width}.png`),fullPage:true});
  }
  await page.setViewportSize({width:1280,height:900});
  await page.locator('#quickInput').fill('Azumarill 19');
  const suggestion=page.locator('.suggestion').filter({hasText:'Azumarill'}).filter({hasText:'volledige catalogus'});
  await suggestion.first().click();
  await page.waitForFunction(url=>document.querySelector('#openBtn').href.startsWith(url),AZU);
  assert.equal(apiCalls,1);
  await page.locator('#collectionAddBtn').click();
  const pending=JSON.parse(await page.locator('#collectionEditor').getAttribute('data-pending'));
  assert.equal(pending.cardmarketUrl.split('?')[0],AZU);assert.equal(pending.sourceId,'ex11-19');
  await page.locator('#collectionEditorClose').click();
  pass('TCGdex selection resolves Azumarill; collection editor receives final URL');
  for(const [id,value,expected] of [['condSelect','EX','minCondition=3'],['editionSelect','1ST','isFirstEd=Y'],['langSelect','JP','searchString=Azumarill']]){
   await page.locator('#'+id).selectOption(value,{force:true});
   await page.waitForFunction(value=>document.querySelector('#openBtn').href.includes(value),expected);
  }
  await page.locator('#langSelect').selectOption('EN',{force:true});
  await page.waitForFunction(url=>document.querySelector('#openBtn').href.startsWith(url),AZU);
  assert.equal(apiCalls,1);
  await page.locator('#manualDetails summary').click();
  await page.locator('#nameInput').fill('Duskull');
  await page.waitForFunction(()=>document.querySelector('#openBtn').href.includes('searchString=Duskull'));
  await page.locator('#numberInput').fill('50');
  await page.locator('#setSelect').selectOption('EX POWER KEEPERS',{force:true});
  await page.waitForFunction(()=>document.querySelector('#matchBox').textContent.includes('EX POWER KEEPERS'));
  assert.equal(new URL(await page.locator('#openBtn').getAttribute('href')).searchParams.get('searchString'),'Duskull');
  pass('All six manual fields rebuild dock link without makeBtn; cached route avoids new request');
  const storage=await page.evaluate(()=>localStorage.getItem('cardscout_collection_v133'));
  assert.equal(storage,savedCollection);assert.deepEqual(errors,[]);
  pass('Existing collection including purchase/stamped prices unchanged; no browser runtime errors');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
 console.log(`${passed} browser tests passed`);
})().catch(err=>{console.error(err);process.exitCode=1;});
