'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/rareworth-v150'),key='cardscout_collection_v133';
const fixtures=Object.fromEntries(['ex15-43','ex14-4'].map(id=>[id,JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/artwork',id+'.json'),'utf8'))]));
const seed=[{uid:'original',name:'Charizard',number:'4',set:'EX CRYSTAL GUARDIANS',setName:'EX Crystal Guardians',sourceId:'ex14-4',language:'EN',condition:'EX',variant:'STAMPED',edition:'AUTO',qty:3,paidEach:7,addedAt:1,listType:'OWNED',price:20,priceUpdated:Date.now(),priceSource:'CM trend',cardmarketUrl:'https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=Charizard'}];
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((req,res)=>{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!/^[\w.-]+\.(html|css|js|json)$/.test(f)){res.writeHead(404).end();return;}try{res.setHeader('Content-Type',({html:'text/html',css:'text/css',js:'text/javascript',json:'application/json'})[f.split('.').pop()]);res.end(fs.readFileSync(path.join(root,f)));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser,groups=0;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  for(const width of [320,375,390,768,1280]){
   const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await ctx.route('**/*',r=>{
    const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();
    if(u.hostname==='assets.tcgdex.net'){const id=u.pathname.includes('/ex15/')?'ex15-43':'ex14-4';return r.fulfill({contentType:'image/webp',body:fs.readFileSync(path.join(__dirname,'fixtures/artwork',id+'.webp'))});}
    if(u.hostname==='api.tcgdex.net'){
     const id=u.pathname.split('/').pop();
     if(u.pathname.includes('/cards/')&&fixtures[id])return r.fulfill({json:{...fixtures[id],pricing:{cardmarket:{trend:12,'trend-holo':20,updated:new Date().toISOString()}}}});
     return r.fulfill({json:{cards:[]}});
    }
    return r.fulfill({json:{}});
   });
   await page.goto(`http://127.0.0.1:${server.address().port}/`);
   assert.equal(await page.title(),'Rareworth · Zoek. Bewaar. Check.');
   assert.equal(await page.locator('#manualDetails').getAttribute('open'),null);
   assert.equal(await page.locator('#quickClear').isVisible(),false);
   const shot=async name=>{await page.waitForFunction(()=>document.querySelector('#toast').hidden);await page.screenshot({path:path.join(out,`${name}-${width}.png`),fullPage:true});if(width===375)await page.screenshot({path:path.join(out,`${name}-${width}-viewport.png`)});};
   await shot('home');
   await page.locator('#quickInput').fill('Bagon 43 Dragon Frontiers');
   assert.equal(await page.locator('#quickClear').isVisible(),true);
   await page.waitForFunction(()=>document.querySelector('.suggestion img')?.naturalWidth>0);
   await shot('results');
   await page.locator('.suggestion').first().click();
   await page.waitForFunction(()=>document.querySelector('#selectedCardArt img')?.naturalWidth>0);
   assert.match(await page.locator('#selectedCardTitle').textContent(),/Bagon/);
   await page.waitForFunction(()=>document.querySelector('#selectedCardPrice').textContent.includes('12'));
   await shot('detail');
   await page.locator('#quickClear').click();
   assert.equal(await page.locator('#langSelect').inputValue(),'EN');
   assert.equal(await page.locator('#quickInput').inputValue(),'');assert.equal(await page.locator('#selectedCardPanel').isVisible(),false);
   assert.equal(await page.locator('#quickInput').evaluate(el=>el===document.activeElement),true);
   assert.equal(await page.locator('#quickClear').isVisible(),false);
   await page.locator('#quickInput').fill('Bagon 43 Dragon Frontiers');await page.locator('.suggestion').first().click();
   await page.locator('#collectionAddBtn').click();
   await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#collectionEditor').evaluate(el=>el.contains(document.activeElement)),true);
   await page.keyboard.press('Escape');assert.equal(await page.locator('#collectionEditor').isVisible(),false);
   await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();
   await page.locator('#collectionUndo button').click();
   assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),[]);
   // A second add to the same identity merges quantity; undo restores the prior quantity only.
   await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();
   await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();
   assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key))[0].qty,key),2);
   await page.locator('#collectionUndo button').click();assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key))[0].qty,key),1);
   await page.evaluate(({key,seed})=>{const arr=JSON.parse(localStorage.getItem(key));localStorage.setItem(key,JSON.stringify([...seed,...arr]));},{key,seed});
   await page.locator('#navCollection').click();
   await page.waitForFunction(()=>[...document.querySelectorAll('.collectionArtwork img')].length===2&&[...document.querySelectorAll('.collectionArtwork img')].every(i=>i.naturalWidth>0));
   await shot('collection-grid');
   await page.locator('[data-collection-view="list"]').click();await shot('collection-list');
   assert.equal(await page.locator('#collectionList').getAttribute('data-view'),'list');
   assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).find(x=>x.uid==='original'),key),seed[0]);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.locator('.collectionCardOpen').first().click();await shot('editor');await page.keyboard.press('Escape');
   await page.reload();await page.locator('#navCollection').click();assert.equal(await page.locator('#collectionList').getAttribute('data-view'),'list');
   assert.deepEqual(errors,[]);await ctx.close();console.log(`PASS ${width}px real artwork, X clear, detail, editor keyboard, add/undo, duplicate undo, grid/list, preserved data`);groups++;
  }
  console.log(`${groups} collector experience groups passed`);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
