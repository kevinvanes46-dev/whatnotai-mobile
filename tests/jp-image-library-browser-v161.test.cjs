'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {loadCatalog}=require('../scripts/jp-image-tools-v161.cjs');
const {catalog,records}=loadCatalog();
const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=','base64');
const pikachu=['PMCG1-035','PMCG2-024','PMCG5-036','neo1-036'];
const ownIds=[...new Set([...pikachu,'neo3-038',...Object.values(catalog).map(row=>records.find(c=>c.source_set_id===row.sourceSet).source_id)])];
const images=Object.fromEntries(ownIds.map(id=>[id,{src:`assets/cards/jp/${id}.webp`,...catalog[id]}]));
const tcgIds=new Set(['PMCG1-002','PMCG1-003','PMCG1-035']);
(async()=>{
  const server=http.createServer((req,res)=>{try{
    const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
    res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(f)));
  }catch{res.writeHead(404).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],requests=[],broken=new Set();
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',r=>{
      const url=new URL(r.request().url());requests.push(url.href);
      if(url.pathname.endsWith('/jp-image-manifest-v161.js'))return r.fulfill({contentType:'text/javascript',body:'window.RareWorthJPImageManifest='+JSON.stringify({catalog,images})+';'});
      if(url.pathname.includes('/assets/cards/jp/'))return broken.has(path.basename(url.pathname,'.webp'))?r.fulfill({status:404,body:'missing'}):r.fulfill({contentType:'image/png',body:pixel});
      if(url.hostname==='127.0.0.1')return r.continue();
      if(['assets.tcgdex.net','cdn.artofpkm.com'].includes(url.hostname))return r.fulfill({contentType:'image/png',body:pixel});
      if(url.hostname==='api.tcgdex.net'){
        const p=url.pathname.split('/'),id=p.at(-1),file=`tests/fixtures/jp-sets-v160/${id}.json`;
        if(p[2]==='ja'&&p[3]==='sets'&&fs.existsSync(file))return r.fulfill({json:JSON.parse(fs.readFileSync(file))});
        if(p[2]==='ja'&&p[3]==='cards'&&tcgIds.has(id))return r.fulfill({json:{id,name:id,image:`https://assets.tcgdex.net/${id==='PMCG1-003'?'en':'ja'}/base/${catalog[id].sourceSet}/${id.split('-')[1]}`,pricing:{cardmarket:{avg:2.5}}}});
        return r.fulfill({json:p[3]==='sets'?{cards:[]}:{}});
      }
      return r.abort();
    });
    await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.CardArtwork&&window.RareWorthJPImageLibrary);
    async function mount(id,status,overrides={}){
      await page.evaluate(({id,meta,overrides})=>{
        document.querySelector('#v161-art')?.remove();const target=document.createElement('div');target.id='v161-art';target.style.minHeight='40px';document.body.append(target);
        CardArtwork.mount({source_id:id,source_set_id:meta.sourceSet,set:meta.set,name:id,language:'JP',...overrides},target);target.scrollIntoView();
      },{id,meta:catalog[id]||{sourceSet:'PMCG1',set:'BASE'},overrides});
      const target=page.locator('#v161-art');
      try{await page.waitForFunction(status=>{const el=document.querySelector('#v161-art');return el?.dataset.imageStatus===status&&(status==='MISSING'||el.querySelector('img')?.naturalWidth>0);},status,{timeout:8000});}catch(error){throw Error(id+' expected '+status+': '+await target.evaluate(el=>el.outerHTML)+'; '+error.message);}
      if(status==='MISSING'){assert.equal(await target.locator('img').count(),0);return null;}
      await target.locator('img').evaluate(img=>img.decode());return target.locator('img').getAttribute('src');
    }
    for(const id of ownIds)assert.equal(await mount(id,'OWN'),images[id].src);
    console.log('PASS own artwork exact IDs across all ten sets; four distinct Pikachu image paths');
    assert.equal(await mount('PMCG1-002','TCGDEX'),'https://assets.tcgdex.net/ja/base/PMCG1/002/high.webp');
    await mount('neo3-002','EXTERNAL_BETA');await mount('PMCG1-003','EXTERNAL_BETA');assert.equal(requests.some(url=>url.includes('assets.tcgdex.net/en/')),false);await mount('PMCG5-002','MISSING');
    await mount('PMCG1-999','MISSING');await mount('PMCG1-035','MISSING',{source_set_id:'PMCG2'});await mount('PMCG1-035','MISSING',{set:'JUNGLE'});await mount('PMCG5-036','MISSING',{source_set_id:'PMCG6'});await mount('PMCG5-036','MISSING',{set:'JP GYM 2'});
    broken.add('PMCG1-035');await page.reload();await page.waitForFunction(()=>window.CardArtwork);assert.equal(await mount('PMCG1-035','TCGDEX'),'https://assets.tcgdex.net/ja/base/PMCG1/035/high.webp');
    broken.add('PMCG2-024');await mount('PMCG2-024','EXTERNAL_BETA');
    await page.evaluate(()=>RareWorthJPImageLibrary.config.allowExternalBeta=false);
    const count=requests.filter(url=>url.includes('cdn.artofpkm.com')).length;
    await mount('neo3-002','MISSING');await mount('PMCG2-024','MISSING');
    assert.equal(requests.filter(url=>url.includes('cdn.artofpkm.com')).length,count);
    await mount('neo3-038','OWN');await mount('PMCG1-002','TCGDEX');
    await page.evaluate(()=>RareWorthJPImageLibrary.config.allowExternalBeta=true);broken.clear();
    console.log('PASS TCGDEX, EXTERNAL_BETA, MISSING; broken own fallback and beta disable without cached leakage');
    await page.locator('#v161-art').evaluate(el=>el.remove());
    await page.locator('.visiblePreferences [data-value="JP"]').click();await page.waitForFunction(()=>CardCatalog.byId('neo4-001','JP'));
    await page.locator('#quickInput').fill('Pikachu');
    for(const id of pikachu){const row=page.locator('.suggestion').filter({hasText:id});await row.waitFor();await row.scrollIntoViewIfNeeded();try{await row.locator('img').waitFor({state:'attached',timeout:8000});}catch(error){throw Error(JSON.stringify(await page.evaluate(id=>({card:CardCatalog.byId(id,'JP'),own:RareWorthJPImageLibrary.own(CardCatalog.byId(id,'JP'))}),id))+' '+await row.evaluate(el=>el.outerHTML));}assert.equal(await row.locator('img').getAttribute('src'),images[id].src);}
    await page.locator('.visiblePreferences [data-value="EX"]').click();await page.locator('#quickInput').fill('swinub');
    await page.locator('.suggestion').filter({hasText:'neo3-038'}).click();
    const selected=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));
    for(const [key,value] of Object.entries({source_id:'neo3-038',source_set_id:'neo3',language:'JP',set:'NEO REVELATION',condition:'EX',edition:'AUTO',variant:'NORMAL'}))assert.equal(selected[key],value,key);
    const route=new URL(await page.locator('#openBtn').getAttribute('href'));
    assert.equal(route.pathname,'/en/Pokemon/Products/Singles/Awakening-Legends/Swinub-AL');assert.equal(route.searchParams.get('language'),'7');assert.equal(route.searchParams.get('minCondition'),'3');
    await page.evaluate(()=>makeLink(false));await page.reload();await page.locator('#navRecent').click();
    await page.locator('#recentList .item img').first().waitFor();assert.equal(await page.locator('#recentList .item img').first().getAttribute('src'),images['neo3-038'].src);
    await page.locator('#recentList .useBtn').first().click();
    const restored=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));
    for(const key of ['source_id','source_set_id','language','set','condition','edition','variant'])assert.equal(restored[key],selected[key],key);
    await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('cardscout_collection_v133'))[0]);
    assert.equal(stored.sourceId,'neo3-038');assert.equal(stored.language,'JP');assert.equal(stored.set,'NEO REVELATION');assert.equal(stored.condition,'EX');
    await page.reload();await page.locator('#navCollection').click();await page.locator('#collectionList img').first().waitFor();
    assert.equal(await page.locator('#collectionList img').first().getAttribute('src'),images['neo3-038'].src);
    await page.locator('#collectionList img').first().evaluate(img=>img.decode());
    assert.deepEqual(errors,[]);console.log('PASS Pikachu search, Swinub OWN artwork, v157 route, Recent reload/restore, collection reload and saved identity');
  }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
