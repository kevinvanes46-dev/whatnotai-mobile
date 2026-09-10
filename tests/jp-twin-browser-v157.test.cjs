'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const recent='whatnotai_mobile_recent_v37',collection='cardscout_collection_v133';
(async()=>{
 const server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(f)));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='api.tcgdex.net'){const p=u.pathname.split('/'),name=`${p[2]}-${p.at(-1)}${p[3]==='sets'?'-set':''}.json`,f=['tests/fixtures/jp-twin-v157/','tests/fixtures/artwork-v155/'].map(d=>d+name).find(f=>fs.existsSync(f));return r.fulfill({json:f?JSON.parse(fs.readFileSync(f)):{cards:[]}});}return r.abort();});
  await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('.visiblePreferences [data-value="JP"]').click();
  await page.waitForFunction(()=>window.CardCatalog?.byId('neo3-048','JP')&&window.CardCatalog?.byId('neo1-061','JP'));
  const urls=[];
  for(const [label,id,number,product] of [['Neo Revelation','neo3-048','55','274641'],['Neo Genesis','neo1-061','74','274474']]){
   await page.locator('#quickInput').fill('snu');
   const row=page.locator('.suggestion').filter({hasText:'Snubbull'}).filter({hasText:label});assert.equal(await row.count(),1);await row.click();
   await page.waitForFunction(()=>document.querySelector('#openBtn').dataset.cmRoute==='EXACT');
   const url=await page.locator('#openBtn').getAttribute('href');urls.push(url);assert.equal(new URL(url).searchParams.get('idProduct'),product);assert.deepEqual(new URL(url).searchParams.getAll('language'),['7']);
   const twin=await page.evaluate(()=>JPCardmarketTwin.counterpart(currentCardmarketCard()));assert.equal(twin.number,number);
   assert.equal(await page.locator('#openBtn span').textContent(),'Open Cardmarket');assert.equal(await page.locator('#openBtn small').textContent(),'Direct naar kaart');assert.equal(await page.locator('#selectedCardRoute').textContent(),'Directe Cardmarket-pagina beschikbaar');assert.equal(await page.locator('#resultOpenBtn span').textContent(),'Open Cardmarket');
   await page.locator('#selectedCardArt.artUnavailable').waitFor();assert.equal(await page.locator('#selectedCardArt img').count(),0);
   await page.locator('.visiblePreferences [data-value="EX"]').click();await page.evaluate(()=>makeLink(false));
   const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k))[0],recent);assert.equal(saved.source_id,id);assert.equal(saved.language,'JP');assert.equal(saved.number,'');assert.equal(saved.kind,'card');
   await page.reload();await page.locator('#navRecent').click();await page.locator('#recentList .useBtn').first().click();
   await page.waitForFunction(()=>document.querySelector('#openBtn').dataset.cmRoute==='EXACT');
   const restored=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));
   for(const key of ['source_id','language','number','set','source_set_name','name','condition','edition','variant'])assert.equal(restored[key],saved[key],key);
   assert.equal(restored.url,saved.url);
   await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();
   const stored=await page.evaluate(k=>JSON.parse(localStorage.getItem(k))[0],collection);assert.equal(stored.sourceId,id);assert.equal(stored.language,'JP');assert.equal(stored.number,'');assert.equal(stored.set,saved.set);assert.equal(stored.condition,'EX');assert.equal(stored.edition,saved.edition);assert.equal(stored.variant,saved.variant);assert.equal(stored.cardmarketUrl,saved.url);
   console.log('PASS '+label+' #'+number+': exact mapped product, v156 UI, JP identity/number, Recent, collection, no EN art');
  }
  assert.notEqual(...urls);assert.deepEqual(errors,[]);console.log('PASS distinct routes and no browser errors');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
