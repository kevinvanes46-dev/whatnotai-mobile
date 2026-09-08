'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.UI_SCREENSHOT_DIR||'artifacts/keyboard-v154';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({html:'text/html',js:'text/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(f)));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
 for(const width of [320,390,430]){
 const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='api.tcgdex.net'&&u.pathname.endsWith('/sets/ex15'))return r.fulfill({json:{name:'EX Dragon Frontiers',cards:Array.from({length:24},(_,i)=>({id:'ex15-'+(100+i),localId:String(100+i),name:'Bagon'}))}});return r.fulfill({json:{cards:[]}});});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('.visiblePreferences [data-value="EN"]').click();await page.waitForFunction(()=>window.CardCatalog?.byId('ex15-100','EN'));
 await page.locator('#quickInput').fill('Bagon');await page.waitForFunction(()=>document.querySelectorAll('.suggestion').length>=10);
 const initial=await page.evaluate(()=>{window.testRows=[...document.querySelectorAll('.suggestion')];window.testPrefs=['langSelect','condSelect','editionSelect'].map(id=>document.getElementById(id).value);window.testStamp=document.querySelector('#stampedToggle').getAttribute('aria-pressed');return testRows.length;});
 await page.evaluate(()=>{Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>innerHeight-300});visualViewport.dispatchEvent(new Event('resize'));});
 await page.waitForFunction(()=>document.body.classList.contains('mobileKeyboard'));
 // A tap or horizontal movement must not dismiss; only vertical intent does.
 await page.evaluate(()=>{const r=document.querySelector('#smartSuggestions');window.touch=(type,x,y)=>{const e=new Event(type,{bubbles:true});Object.defineProperty(e,'touches',{value:type==='touchend'?[]:[{clientX:x,clientY:y}]});r.dispatchEvent(e);};touch('touchstart',100,200);touch('touchmove',130,202);touch('touchend',130,202);});
 assert.equal(await page.locator('#quickInput').evaluate(e=>e===document.activeElement),true);
 await page.evaluate(()=>{window.scrollTo(0,80);window.beforeDismissY=scrollY;document.querySelector('#smartSuggestions').scrollTop=120;touch('touchstart',100,220);touch('touchmove',102,170);touch('touchend',102,170);});
 assert.equal(await page.locator('#quickInput').evaluate(e=>e===document.activeElement),false);
 // Keep chrome hidden throughout the closing animation, including after blur.
 assert.equal(await page.locator('.bottomNav').evaluate(e=>getComputedStyle(e).visibility),'hidden');
 await page.evaluate(()=>{delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'));});await page.waitForTimeout(250);
 assert.equal(await page.locator('#quickInput').inputValue(),'Bagon');assert.equal(await page.locator('#smartSuggestions').isVisible(),true);
 assert.ok(await page.locator('#smartSuggestions').evaluate(e=>e.scrollTop>=100));
 assert.ok(await page.evaluate(()=>Math.abs(scrollY-beforeDismissY)<=1));
 assert.equal(await page.evaluate(()=>testRows.every((e,i)=>e===document.querySelectorAll('.suggestion')[i])),true);
 assert.deepEqual(await page.evaluate(()=>['langSelect','condSelect','editionSelect'].map(id=>document.getElementById(id).value)),await page.evaluate(()=>testPrefs));
 assert.equal(await page.locator('#stampedToggle').getAttribute('aria-pressed'),await page.evaluate(()=>testStamp));
 // Continue down and back up after the keyboard closed; no list or page reset.
 await page.locator('#smartSuggestions').evaluate(e=>e.scrollTop=e.scrollHeight);await page.waitForTimeout(50);assert.ok(await page.locator('#smartSuggestions').evaluate(e=>e.scrollTop>0));
 await page.locator('#smartSuggestions').evaluate(e=>e.scrollTop=80);
 await page.locator('#quickInput').focus();assert.equal(await page.locator('#smartSuggestions').evaluate(e=>e.scrollTop),80);
 // Native toolbar Done is blur, with no key/search event.
 await page.evaluate(()=>{window.testSearches=0;window.oldMake=makeLink;makeLink=async()=>{testSearches++;};Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>innerHeight-300});visualViewport.dispatchEvent(new Event('resize'));});
 await page.locator('#quickInput').blur();await page.evaluate(()=>{delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'));});await page.waitForTimeout(250);
 assert.equal(await page.evaluate(()=>testSearches),0);assert.equal(await page.locator('#smartSuggestions').evaluate(e=>e.scrollTop),80);
 const url=page.url();await page.locator('#quickInput').focus();
 await page.locator('#quickInput').dispatchEvent('keydown',{key:'Enter',isComposing:true});assert.equal(await page.evaluate(()=>testSearches),0);
 await page.locator('#quickInput').press('Enter');
 await page.locator('#quickInput').dispatchEvent('keydown',{key:'Enter',repeat:true});await page.waitForTimeout(250);
 assert.equal(await page.evaluate(()=>testSearches),1);assert.equal(page.url(),url);assert.equal(await page.locator('#quickInput').evaluate(e=>e===document.activeElement),false);
 assert.equal(await page.locator('#quickInput').inputValue(),'Bagon');assert.equal(await page.evaluate(()=>testRows.every((e,i)=>e===document.querySelectorAll('.suggestion')[i])),true);
 await page.evaluate(()=>makeLink=oldMake);
 await page.locator('#quickInput').focus();await page.locator('#quickInput').press('Enter');await page.waitForFunction(()=>document.querySelector('#openBtn').dataset.cmState==='ready');
 assert.equal(page.url(),url);assert.equal(await page.locator('#quickInput').inputValue(),'Bagon');assert.equal(await page.locator('#smartSuggestions').isVisible(),true);
 await page.evaluate(()=>{Object.defineProperty(visualViewport,'scale',{configurable:true,get:()=>2});Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>innerHeight/2});});assert.equal(await page.evaluate(()=>window.RareWorthKeyboard.isKeyboardVisible()),false);await page.evaluate(()=>{delete visualViewport.scale;delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'));});await page.waitForTimeout(250);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 await page.waitForFunction(()=>document.querySelector('#toast').hidden);await page.screenshot({path:out+'/results-'+width+'.png'});console.log('PASS '+width+'px: '+initial+' results; vertical swipe blur; tap/horizontal preserved; viewport/Done/Enter and scroll state retained');await ctx.close();
 }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
