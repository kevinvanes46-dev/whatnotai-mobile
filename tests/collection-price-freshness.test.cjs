'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'../scripts/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),key='cardscout_collection_v133';
const out=process.env.UI_SCREENSHOT_DIR||path.join(require('node:os').tmpdir(),'holokeep-price-freshness');
const Market=require('../market-v176');
const old=Date.now()-86400000;
const item={uid:'owned',name:'Charizard',number:'4',set:'BASE',sourceId:'base1-4',language:'EN',condition:'EX',variant:'NORMAL',edition:'AUTO',qty:3,paidEach:7,addedAt:1,listType:'OWNED',price:10,priceUpdated:old,priceSource:'CM trend',cardmarketUrl:'https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=Charizard'};
let count=0;
(async()=>{
 const server=http.createServer((req,res)=>{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!/^[\w.-]+\.(html|css|js|json)$/.test(f)){res.writeHead(404).end();return;}try{res.setHeader('Content-Type',({html:'text/html',css:'text/css',js:'text/javascript',json:'application/json'})[f.split('.').pop()]);res.end(fs.readFileSync(path.join(root,f)));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  async function scenario(name,rows,response,check,cache=null){
   const ctx=await browser.newContext({viewport:{width:375,height:844},reducedMotion:'reduce'});
   await ctx.addInitScript(({key,rows,cache})=>{sessionStorage.setItem('rareworth_guest_session_v171_1','1');localStorage.setItem(key,JSON.stringify(rows));if(cache)localStorage.setItem('holokeep_market_cache_v176',JSON.stringify(cache));},{key,rows,cache});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/ui-v150-experience.js*',r=>r.fulfill({body:'',contentType:'text/javascript'}));
   await ctx.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='api.tcgdex.net'&&u.pathname.endsWith('/cards/base1-4'))return response({abort:(...a)=>r.abort(...a),fulfill:o=>r.fulfill({...o,json:o.json?{id:'base1-4',name:'Charizard',localId:'4',set:{id:'base1'},variants:{normal:true,holo:false,reverse:false},...o.json,pricing:{cardmarket:{unit:'EUR',idProduct:273699,...o.json.pricing?.cardmarket}}}:o.json})},page);if(u.hostname==='api.tcgdex.net')return r.fulfill({json:{cards:[]}});return r.abort();});
   try{await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.locator('#navCollection').click();await check(page);assert.deepEqual(errors,[]);console.log('PASS '+name);count++;}finally{await ctx.close();}
  }
  const settle=p=>p.waitForFunction(()=>!document.querySelector('#collectionRefreshBtn').disabled);
  const read=p=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  const cached=value=>({version:176,entries:{[Market.key(item)]:Market.observe({id:'base1-4',name:'Charizard',localId:'4',set:{id:'base1'},variants:{normal:true,holo:false,reverse:false},pricing:{cardmarket:{unit:'EUR',idProduct:273699,trend:value,updated:new Date().toISOString()}}},item,{requestedLanguage:'en'})}});
  await scenario('Missing price preserves old value and purchase data',[item],r=>r.fulfill({json:{pricing:{cardmarket:{}}}}),async p=>{await settle(p);assert.deepEqual(await read(p),[item]);assert.match(await p.locator('#collectionList').textContent(),/Geen marktprijs beschikbaar/);assert.equal(await p.locator('#collectionMarket').textContent(),'—');assert.match(await p.locator('#collectionPriceCoverage').textContent(),/0 van 3 exemplaren/);fs.mkdirSync(out,{recursive:true});await p.screenshot({path:path.join(out,'retained-price-mobile.png'),fullPage:true});});
  await scenario('Network failures preserve old value',[item],r=>r.abort(),async p=>{await settle(p);assert.deepEqual(await read(p),[item]);});
  await scenario('New price updates total without changing paid amount',[item],r=>r.fulfill({json:{pricing:{cardmarket:{trend:12,updated:new Date().toISOString()}}}}),async p=>{await settle(p);const [x]=await read(p);assert.equal(x.price,10);assert.equal(x.paidEach,7);assert.equal(x.qty,3);assert.match(await p.locator('#collectionMarket').textContent(),/36/);assert.match(await p.locator('.priceFreshness').textContent(),/Bijgewerkt/);});
  await scenario('All missing prices show unknown total',[{...item,price:null,priceUpdated:0}],r=>r.fulfill({json:{}}),async p=>{await settle(p);assert.equal(await p.locator('#collectionMarket').textContent(),'—');assert.match(await p.locator('#collectionPriceCoverage').textContent(),/0 van 3/);});
  await scenario('Invalid and unvalidated legacy prices are excluded',[item,{...item,uid:'invalid',qty:1,price:-9,priceUpdated:0}],r=>r.fulfill({json:{}}),async p=>{await settle(p);assert.equal(await p.locator('#collectionMarket').textContent(),'—');assert.match(await p.locator('#collectionPriceCoverage').textContent(),/0 van 4/);});
  await scenario('Legacy amounts without validated observations show zero coverage',[item,{...item,uid:'missing',price:null,priceUpdated:0,qty:2}],r=>r.fulfill({json:{}}),async p=>{await settle(p);assert.match(await p.locator('#collectionPriceCoverage').textContent(),/0 van 5/);assert.equal(await p.locator('#collectionMarket').textContent(),'—');await p.screenshot({path:path.join(out,'incomplete-mobile.png'),fullPage:true});});
  await scenario('Concurrent quantity and purchase edits survive refresh',[item],async(r,p)=>{await p.evaluate(key=>{const a=JSON.parse(localStorage.getItem(key));a[0].qty=5;a[0].paidEach=9;localStorage.setItem(key,JSON.stringify(a));},key);await r.fulfill({json:{pricing:{cardmarket:{trend:12}}}});},async p=>{await settle(p);const [x]=await read(p);assert.equal(x.qty,5);assert.equal(x.paidEach,9);assert.equal(x.price,10);});
  await scenario('Deleted card is not resurrected',[item],async(r,p)=>{await p.evaluate(key=>localStorage.setItem(key,'[]'),key);await r.fulfill({json:{pricing:{cardmarket:{trend:12}}}});},async p=>{await settle(p);assert.deepEqual(await read(p),[]);});
  await scenario('Changed variant rejects old in-flight quote',[item],async(r,p)=>{await p.evaluate(key=>{const a=JSON.parse(localStorage.getItem(key));a[0].variant='STAMPED';a[0].price=null;a[0].priceUpdated=0;localStorage.setItem(key,JSON.stringify(a));},key);await r.fulfill({json:{pricing:{cardmarket:{trend:12}}}});},async p=>{await settle(p);const [x]=await read(p);assert.equal(x.variant,'STAMPED');assert.equal(x.price,null);});
  await scenario('Older source quote cannot replace newer saved quote',[item],r=>r.fulfill({json:{pricing:{cardmarket:{trend:2,updated:new Date(old-86400000).toISOString()}}}}),async p=>{await settle(p);assert.deepEqual(await read(p),[item]);});
  let requests=0;
  await scenario('Fresh quotes skip automatic fetch, manual refresh still works',[{...item,priceUpdated:Date.now()}],r=>{requests++;return r.fulfill({json:{pricing:{cardmarket:{trend:15,updated:new Date().toISOString()}}}});},async p=>{await settle(p);assert.equal(requests,0);await p.locator('#collectionRefreshBtn').click();await settle(p);assert.equal(requests,1);assert.equal((await read(p))[0].price,10);assert.match(await p.locator('#collectionMarket').textContent(),/45/);},cached(10));
  await scenario('First edition excludes generic quote but preserves stored data',[{...item,edition:'1ST'}],r=>r.fulfill({json:{pricing:{cardmarket:{trend:99}}}}),async p=>{await settle(p);assert.equal((await read(p))[0].price,10);assert.equal((await p.locator('#collectionMarket').textContent()).charCodeAt(0),8212);assert.match(await p.locator('#collectionList').textContent(),/1st Edition-prijs/);assert.match(await p.locator('.stampBadge').textContent(),/1st Edition/);});
  for(const confirmed of [false,true]){
    await scenario('Stamped editor '+(confirmed?'accepts confirmed set-logo':'allows user-selected unconfirmed variant'),[{...item,priceUpdated:Date.now()}],r=>r.fulfill({json:{variants:{reverse:false},variants_detailed:confirmed?[{stamp:['set-logo']}]:[],pricing:{cardmarket:{'trend-holo':20}}}}),async p=>{
      await settle(p);await p.locator('.collectionCardOpen').click();await p.locator('[data-editor-variant="STAMPED"]').click();await p.locator('#collectionEditorSave').click();
      await p.waitForFunction(()=>!document.querySelector('#collectionEditorSave').disabled);
      assert.equal((await read(p))[0].variant,'STAMPED');
      assert.equal(await p.locator('#collectionEditor').isVisible(),false);
    });
  }
  console.log(`${count} price freshness scenarios passed`);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
