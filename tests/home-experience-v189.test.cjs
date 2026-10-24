'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('../scripts/node_modules/playwright');
let server,browser,origin;
before(async()=>{
  server=http.createServer((request,response)=>{
    try{
      const file=new URL(request.url,'http://localhost').pathname.slice(1)||'index.html';
      if(file.split('/').includes('..'))throw Error('Unsafe path');
      const type=({html:'text/html',js:'text/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png',woff2:'font/woff2'})[file.split('.').pop()]||'application/octet-stream';
      response.setHeader('Content-Type',type);
      response.end(fs.readFileSync(path.resolve(file)));
    }catch{response.writeHead(404).end();}
  });
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true});
});
after(async()=>{await browser?.close();await new Promise(done=>server?.close(done));});

test('real mobile home is first view, routes work and small guide is accessible',async t=>{
  for(const width of [320,375,390,430]){
    const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
    t.after(()=>context.close());
    await context.route('**/*',route=>{
      const url=new URL(route.request().url());
      return url.origin===origin?route.continue():route.abort();
    });
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin);
    await page.locator('#onboardingGuest').click();
    assert.ok(await page.locator('[data-view="home"]').isVisible(),'Home visible at '+width);
    assert.equal(await page.locator('#navHome').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('.v189-action').count(),4);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow at '+width);
    assert.equal(await page.locator('.homeHero').evaluate(el=>getComputedStyle(el,'::before').animationName),'none');
    await page.locator('.v189-guide summary').click();
    assert.equal(await page.locator('.v189-guide li').count(),3);
    await page.locator('.v189-action').nth(0).click();
    assert.ok(await page.locator('[data-view="search"]').isVisible());
    await page.locator('#brandHomeBtn').click();
    assert.ok(await page.locator('[data-view="home"]').isVisible());
    await page.locator('.v189-action').nth(2).click();
    assert.ok(await page.locator('[data-view="collection"]').isVisible());
    await page.locator('#navHome').click();
    await page.locator('.v189-action').nth(3).click();
    assert.ok(await page.locator('[data-view="recent"]').isVisible());
    await page.locator('#navHome').click();
    await page.locator('.v189-action').nth(1).click();
    assert.ok(await page.locator('[data-view="search"]').isVisible());
    assert.ok(await page.locator('#libraryBrowser').isVisible());
    assert.deepEqual(errors,[],JSON.stringify(errors));
  }
});

test('previous links, price models and storage stay untouched by the home layer',()=>{
  const script=fs.readFileSync('ui-v189-home.js','utf8');
  assert.doesNotMatch(script,/localStorage|sessionStorage|setItem|removeItem|CardmarketPreview|fetch\s*\(|XMLHttpRequest/);
  const html=fs.readFileSync('index.html','utf8');
  assert.match(html,/id="makeBtn"[^>]*>Open Cardmarket/);
  assert.match(html,/id="collectionEditorSave"/);
  assert.match(html,/ui-v189-home\.js\?build=189-app-experience/);
  const worker=fs.readFileSync('sw.js','utf8');
  assert.match(worker,/const CACHE = 'rareworth-shell-v193-cardmarket-nm-prices'/);
  assert.match(worker,/style-v189-home\.css\?build=189-app-experience/);
  assert.match(worker,/ui-v189-home\.js\?build=189-app-experience/);
});
