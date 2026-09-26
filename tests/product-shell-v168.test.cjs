'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('../scripts/node_modules/playwright');
const html=fs.readFileSync('index.html','utf8');

test('v168 shell metadata, navigation and product script order',()=>{
  const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));
  assert.equal(manifest.start_url,'./#search');
  assert.equal(manifest.short_name,'RareWorth');
  assert.equal(manifest.name,'RareWorth — Pokémon TCG');
  assert.equal(manifest.display,'standalone');
  assert.equal(manifest.orientation,'portrait-primary');
  assert.doesNotMatch(manifest.description,/scan|cloud|login/i);
  assert.match(html,/<title>RareWorth · Zoek\. Bewaar\. Check\.<\/title>/);
  assert.doesNotMatch(html,/Rareworth|UI 150|V137 CORE|COLLECTION PRO|LOKALE COLLECTIE/);
  assert.deepEqual([...html.matchAll(/data-tab="([^"]+)"/g)].map(m=>m[1]),['search','collection','recent','settings']);
  assert.deepEqual([...html.matchAll(/<script src="([^?]+)\?/g)].map(m=>m[1]),[
    'cardmarket-products-v152.js','card-identity-v154.js','app-v137.js','jp-cardmarket-twin-v157.js',
    'jp-artwork-v158.js','cardmarket-ui-v156.js','jp-set-catalog-v160.js','jp-cardmarket-native-v165.js',
    'jp-cardmarket-native-v163.js','jp-image-manifest-v161.js','jp-image-library-v161.js','ui-v137-focus.js',
    'ui-v137-collection.js','ui-v150-experience.js','ui-v154-keyboard.js','ui-v153-mobile.js']);
  assert.match(fs.readFileSync('ui-v137-collection.js','utf8'),/cardscout_collection_v133/);
});

test('v168 mobile shell and search → Recent → collection reload',async()=>{
  const server=http.createServer((req,res)=>{
    try{
      const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
      res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json'})[file.split('.').pop()]||'application/octet-stream');
      res.end(fs.readFileSync(path.resolve(file)));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  let browser;
  try{
    browser=await chromium.launch({headless:true});
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=','base64');
    await page.context().route('**/*',r=>{
      const u=new URL(r.request().url());
      if(u.hostname==='www.cardmarket.com')return r.fulfill({contentType:'text/html',body:'Fixture marketplace'});
      if(r.request().resourceType()==='image')return r.fulfill({contentType:'image/png',body:pixel});
      if(u.hostname==='127.0.0.1')return r.continue();
      if(u.hostname==='api.tcgdex.net'){
        const p=u.pathname.split('/'),file=`tests/fixtures/jp-sets-v160/${p.at(-1)}.json`;
        if(p[2]==='ja'&&p[3]==='sets'&&fs.existsSync(file))return r.fulfill({json:JSON.parse(fs.readFileSync(file))});
        return r.fulfill({json:p[3]==='sets'?{cards:[]}:{}});
      }
      return r.abort();
    });
    await page.goto('http://127.0.0.1:'+server.address().port);
    await page.locator('.visiblePreferences [data-value="JP"]').click();
    await page.waitForFunction(()=>window.CardCatalog?.byId?.('neo4-001','JP'));
    await page.locator('.visiblePreferences [data-value="EX"]').click();
    await page.locator('#quickInput').fill('Pikachu');
    await page.locator('.suggestion').filter({hasText:'neo1-036'}).click();
    const expected='https://www.cardmarket.com/en/Pokemon/Products/Singles/Gold-Silver-to-a-New-World/Pikachu-GSNW?minCondition=3';
    await page.waitForFunction(url=>document.querySelector('#openBtn').href===url,expected);
    // Exercise the real CTA without navigating to a live marketplace.
    const popupPromise=page.waitForEvent('popup');
    await page.locator('#openBtn').click();
    const popup=await popupPromise;await popup.waitForLoadState();assert.equal(popup.url(),expected);await popup.close();
    await page.locator('#navRecent').click();
    await page.locator('#recentList .useBtn').first().click();
    await page.waitForFunction(url=>document.querySelector('#openBtn').href===url,expected);
    await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();
    await page.reload();await page.locator('#navCollection').click();
    assert.match(await page.locator('#collectionList').innerText(),/Neo Genesis/);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('cardscout_collection_v133'))[0].sourceId),'neo1-036');
    await page.locator('#navRecent').click();await page.locator('#recentList .useBtn').first().click();
    await page.waitForFunction(url=>document.querySelector('#openBtn').href===url,expected);
    for(const width of [320,375,390,430]){
      await page.setViewportSize({width,height:844});
      for(const tab of ['search','collection','recent','settings']){
        await page.locator(`[data-tab="${tab}"]`).click();
        await page.waitForFunction(()=>!document.body.classList.contains('mobileKeyboard'));
        assert.deepEqual(await page.locator('.bottomNav button span').allTextContents(),['Zoeken','Collectie','Recent','Meer']);
        assert.equal(await page.locator('#favoriteBtn').isVisible(),false);
        assert.equal(await page.locator('[data-view="favorites"]').isVisible(),false);
        assert.equal(await page.locator('[data-view="scan"]').isVisible(),false);
        assert.equal(await page.locator('#favoriteList').count(),1);
        assert.equal(await page.locator('#clearFavBtn').count(),1);
        const layout=await page.evaluate(()=>{
          const nav=document.querySelector('.bottomNav').getBoundingClientRect(),dock=document.querySelector('#actionDock');
          const buttons=[...document.querySelectorAll('.bottomNav button')].map(b=>b.getBoundingClientRect());
          return {overflow:document.documentElement.scrollWidth>innerWidth,
            navFits:nav.left>=0&&nav.right<=innerWidth+1&&nav.bottom<=innerHeight+1,
            labelsFit:buttons.every((b,i)=>b.width>0&&(!i||b.left>=buttons[i-1].right-1)),
            dockClear:getComputedStyle(dock).display==='none'||getComputedStyle(dock).visibility==='hidden'||(getComputedStyle(dock).opacity==='0'&&getComputedStyle(dock).pointerEvents==='none')||dock.getBoundingClientRect().bottom<=nav.top+1};
        });
        assert.deepEqual(layout,{overflow:false,navFits:true,labelsFit:true,dockClear:true},`${width}px ${tab}: `+await page.evaluate(()=>JSON.stringify(['actionDock'].map(id=>{const e=document.getElementById(id),r=e.getBoundingClientRect(),s=getComputedStyle(e);return {rect:r.toJSON(),display:s.display,visibility:s.visibility,opacity:s.opacity,nav:document.querySelector('.bottomNav').getBoundingClientRect().toJSON()};}))));
      }
      assert.equal(await page.locator('#collectionExportBtn').isVisible(),true);
      assert.equal(await page.locator('#collectionImportBtn').isVisible(),true);
      assert.match(await page.locator('.aboutCard').innerText(),/v168 · Beta/);
      if(process.env.SHELL_SCREENSHOTS){
        fs.mkdirSync(process.env.SHELL_SCREENSHOTS,{recursive:true});
        await page.screenshot({path:path.join(process.env.SHELL_SCREENSHOTS,`more-${width}.png`),fullPage:true});
        await page.locator('#navSearch').click();
        await page.screenshot({path:path.join(process.env.SHELL_SCREENSHOTS,`search-${width}.png`),fullPage:true});
      }
      console.log(`PASS shell ${width}px: nav, dock, hidden legacy UI, About and backup`);
    }
    assert.deepEqual(errors,[]);
  }finally{await browser?.close();await new Promise(r=>server.close(r));}
});
