'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const onePixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=','base64');
const samples={BASE:['PMCG1-001','PMCG1-002','PMCG1-003'],JUNGLE:['PMCG2-001','PMCG2-002','PMCG2-003'],FOSSIL:['PMCG3-001','PMCG3-002','PMCG3-003'],'NEO GENESIS':['neo1-001','neo1-002','neo1-003'],'NEO DISCOVERY':['neo2-001','neo2-002','neo2-003'],'NEO REVELATION':['neo3-001','neo3-002','neo3-038'],'NEO DESTINY':['neo4-001','neo4-002','neo4-003']};
const recent='whatnotai_mobile_recent_v37',collection='cardscout_collection_v133';
async function loadedArtwork(target,source_id){
 try{
  await target.scrollIntoViewIfNeeded();
  await target.locator('img').waitFor({state:'attached',timeout:5000});
  await target.locator('img').evaluate(img=>Promise.race([img.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Image decode timeout')),5000))]));
  assert.ok(await target.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0));
 }catch(error){
  const details=await target.evaluate(el=>{const img=el.querySelector('img');return {foundImg:!!img,src:img?.src||null,complete:img?.complete??null,naturalWidth:img?.naturalWidth??null,targetClass:el.className,textContent:el.textContent};});
  throw new Error(`${source_id}: ${JSON.stringify(details)}; ${error.message}`);
 }
}
(async()=>{
 const server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(f)));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],images=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='cdn.artofpkm.com'){images.push(u.href);return r.fulfill({contentType:'image/png',body:onePixel});}if(u.hostname==='api.tcgdex.net'){const p=u.pathname.split('/');if(p[2]==='ja'&&p[3]==='sets'&&p.at(-1)==='neo3')return r.fulfill({json:JSON.parse(fs.readFileSync('tests/fixtures/jp-twin-v157/ja-neo3-set.json'))});return r.fulfill({json:p[3]==='sets'?{cards:[]}:{}});}return r.abort();});
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.CardArtwork&&window.JPArtwork);
  const mockCheck=await page.evaluate(async data=>{const img=new Image();img.src=data;try{await img.decode();return {complete:img.complete,naturalWidth:img.naturalWidth};}catch(error){return {complete:img.complete,naturalWidth:img.naturalWidth,error:error.message};}},'data:image/png;base64,'+onePixel.toString('base64'));
  assert.ok(mockCheck.complete&&mockCheck.naturalWidth>0,`PNG mock failed: ${JSON.stringify(mockCheck)}`);
  await page.evaluate(samples=>{for(const [set,ids] of Object.entries(samples))for(const id of ids){const target=document.createElement('span');target.id='jp-art-'+id;target.style.display='block';target.style.minHeight='24px';document.body.append(target);window.CardArtwork.mount({source_id:id,source_set_id:id.slice(0,id.lastIndexOf('-')),name:id,language:'JP',set},target);target.scrollIntoView();}},samples);
  for(const ids of Object.values(samples))for(const id of ids)await loadedArtwork(page.locator('#jp-art-'+id),id);
  assert.equal(new Set(images).size,21);assert.ok(images.every(url=>new URL(url).hostname==='cdn.artofpkm.com'));
  console.log('PASS 21 artwork mounts; PNG mock decoded');
  await page.evaluate(()=>{for(const [id,card] of [['wrong-language',{source_id:'neo3-038',language:'EN',set:'NEO REVELATION'}],['wrong-set',{source_id:'neo3-038',source_set_id:'neo1',language:'JP',set:'NEO REVELATION'}],['unknown',{source_id:'neo3-999',language:'JP',set:'NEO REVELATION'}]]){const target=document.createElement('span');target.id=id;document.body.append(target);CardArtwork.mount(card,target);target.scrollIntoView();}});
  for(const id of ['wrong-language','wrong-set','unknown']){const target=page.locator('#'+id);await target.evaluate(el=>{el.style.display='block';el.style.minHeight='24px';});await target.scrollIntoViewIfNeeded();await page.locator('#'+id+'.artUnavailable').waitFor({timeout:5000});assert.equal(await target.locator('img').count(),0);}
  await page.locator('[id^="jp-art-"], #wrong-language, #wrong-set, #unknown').evaluateAll(els=>els.forEach(el=>el.remove()));
  await page.locator('.visiblePreferences [data-value="JP"]').click();await page.waitForFunction(()=>window.CardCatalog?.byId('neo3-038','JP'));
  // Existing routing maps EX to 3 (NM maps to 2).
  await page.locator('.visiblePreferences [data-value="EX"]').click();await page.locator('#quickInput').fill('swinub');
  const row=page.locator('.suggestion').filter({hasText:/Swinub/i}).filter({hasText:'Awakening Legends'});await row.waitFor();assert.equal(await row.count(),1);await loadedArtwork(row.locator('.suggestionArt'),'neo3-038 search');await row.click();
  const selected=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));
  for(const [key,value] of Object.entries({source_id:'neo3-038',source_set_id:'neo3',language:'JP',set:'NEO REVELATION',condition:'EX',edition:'AUTO',variant:'NORMAL'}))assert.equal(selected[key],value,key);
  await loadedArtwork(page.locator('#selectedCardArt'),'neo3-038 selected');const art=await page.locator('#selectedCardArt img').getAttribute('src');assert.equal(art,'https://cdn.artofpkm.com/ki7p3hj3p3phx6tjwmi4av5x0tm6');
  const route=await page.locator('#openBtn').getAttribute('href'),url=new URL(route);assert.equal(url.pathname,'/en/Pokemon/Products/Singles/Awakening-Legends/Swinub-AL');assert.equal(url.searchParams.get('language'),'7');assert.equal(url.searchParams.get('minCondition'),'3');
  await page.evaluate(()=>makeLink(false));let saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k))[0],recent);assert.equal(saved.source_id,'neo3-038');assert.equal(saved.language,'JP');
  await page.reload();await page.locator('#navRecent').click();await loadedArtwork(page.locator('#recentList .item').first(),'neo3-038 Recent');assert.equal(await page.locator('#recentList .item img').first().getAttribute('src'),art);
  await page.locator('#recentList .useBtn').first().click();await loadedArtwork(page.locator('#selectedCardArt'),'neo3-038 restored');assert.equal(await page.locator('#selectedCardArt img').getAttribute('src'),art);
  const restored=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));
  for(const key of ['source_id','source_set_id','language','set','name','condition','edition','variant'])assert.equal(restored[key],selected[key],key);
  await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();const stored=await page.evaluate(k=>JSON.parse(localStorage.getItem(k))[0],collection);assert.equal(stored.sourceId,'neo3-038');assert.equal(stored.language,'JP');assert.equal(stored.set,'NEO REVELATION');
  await page.locator('#navCollection').click();await loadedArtwork(page.locator('#collectionList'),'neo3-038 collection');assert.equal(await page.locator('#collectionList img').first().getAttribute('src'),art);
  assert.deepEqual(errors,[]);console.log('PASS 21 JP artwork mounts; Swinub selection, Recent/refresh, collection identity and v157 route');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
