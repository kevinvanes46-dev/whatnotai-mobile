'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const onePixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=','base64');
const samples={BASE:['PMCG1-001','PMCG1-002','PMCG1-003'],JUNGLE:['PMCG2-001','PMCG2-002','PMCG2-003'],FOSSIL:['PMCG3-001','PMCG3-002','PMCG3-003'],'NEO GENESIS':['neo1-001','neo1-002','neo1-003'],'NEO DISCOVERY':['neo2-001','neo2-002','neo2-003'],'NEO REVELATION':['neo3-001','neo3-002','neo3-038'],'NEO DESTINY':['neo4-001','neo4-002','neo4-003']};
const recent='whatnotai_mobile_recent_v37',collection='cardscout_collection_v133';
(async()=>{
 const server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(f)));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],images=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='cdn.artofpkm.com'){images.push(u.href);return r.fulfill({contentType:'image/png',body:onePixel});}if(u.hostname==='api.tcgdex.net'){const p=u.pathname.split('/');if(p[3]==='sets'&&p.at(-1)==='neo3')return r.fulfill({json:JSON.parse(fs.readFileSync('tests/fixtures/jp-twin-v157/ja-neo3-set.json'))});return r.fulfill({json:p[3]==='sets'?{cards:[]}:{}});}return r.abort();});
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.CardArtwork&&window.JPArtwork);
  await page.evaluate(samples=>{for(const [set,ids] of Object.entries(samples))for(const id of ids){const target=document.createElement('span');target.id='jp-art-'+id;target.style.display='block';target.style.minHeight='24px';document.body.append(target);window.CardArtwork.mount({source_id:id,source_set_id:id.slice(0,id.lastIndexOf('-')),name:id,language:'JP',set},target);target.scrollIntoView();}},samples);
  for(const ids of Object.values(samples))for(const id of ids)await page.waitForFunction(id=>document.querySelector('#jp-art-'+id+' img')?.naturalWidth>0,id);
  assert.equal(new Set(images).size,21);assert.ok(images.every(url=>new URL(url).hostname==='cdn.artofpkm.com'));
  await page.evaluate(()=>{for(const [id,card] of [['wrong-language',{source_id:'neo3-038',language:'EN',set:'NEO REVELATION'}],['wrong-set',{source_id:'neo3-038',source_set_id:'neo1',language:'JP',set:'NEO REVELATION'}],['unknown',{source_id:'neo3-999',language:'JP',set:'NEO REVELATION'}]]){const target=document.createElement('span');target.id=id;document.body.append(target);CardArtwork.mount(card,target);target.scrollIntoView();}});
  for(const id of ['wrong-language','wrong-set','unknown']){await page.locator('#'+id+'.artUnavailable').waitFor();assert.equal(await page.locator('#'+id+' img').count(),0);}
  await page.locator('.visiblePreferences [data-value="JP"]').click();await page.waitForFunction(()=>window.CardCatalog?.byId('neo3-038','JP'));await page.locator('#quickInput').fill('swinub');
  const row=page.locator('.suggestion').filter({hasText:'Swinub'}).filter({hasText:'Neo Revelation'});assert.equal(await row.count(),1);await row.click();
  await page.waitForFunction(()=>document.querySelector('#selectedCardArt img')?.naturalWidth>0);const art=await page.locator('#selectedCardArt img').getAttribute('src');assert.equal(art,'https://cdn.artofpkm.com/ki7p3hj3p3phx6tjwmi4av5x0tm6');
  const route=await page.locator('#openBtn').getAttribute('href'),url=new URL(route);assert.equal(url.pathname,'/en/Pokemon/Products/Singles/Awakening-Legends/Swinub-AL');assert.equal(url.searchParams.get('language'),'7');assert.equal(url.searchParams.get('minCondition'),'3');
  await page.evaluate(()=>makeLink(false));let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k))[0],recent);assert.equal(saved.source_id,'neo3-038');assert.equal(saved.language,'JP');
  await page.reload();await page.locator('#navRecent').click();await page.waitForFunction(()=>document.querySelector('#recentList .item img')?.naturalWidth>0);await page.locator('#recentList .useBtn').first().click();await page.waitForFunction(()=>document.querySelector('#selectedCardArt img')?.naturalWidth>0);assert.equal(await page.locator('#selectedCardArt img').getAttribute('src'),art);
  await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();const stored=await page.evaluate(k=>JSON.parse(localStorage.getItem(k))[0],collection);assert.equal(stored.sourceId,'neo3-038');assert.equal(stored.language,'JP');assert.equal(stored.set,'NEO REVELATION');
  await page.locator('#navCollection').click();await page.waitForFunction(()=>document.querySelector('#collectionList img')?.naturalWidth>0);assert.equal(await page.locator('#collectionList img').first().getAttribute('src'),art);
  assert.deepEqual(errors,[]);console.log('PASS 21 JP artwork mounts; Swinub selection, Recent/refresh, collection identity and v157 route');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
