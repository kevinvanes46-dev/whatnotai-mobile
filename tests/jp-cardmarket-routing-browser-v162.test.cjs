'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const cases=[['PMCG1-035','BASE','Expansion Pack',273753],['PMCG2-024','JUNGLE','Pokémon Jungle',273857],['neo1-036','NEO GENESIS','Neo Genesis',274470],['PMCG5-036','JP GYM 1',"Leader's Stadium",null]];
(async()=>{
  const server=http.createServer((req,res)=>{try{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json'})[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(file)));}catch{res.writeHead(404).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',r=>{
      const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();
      if(u.hostname==='api.tcgdex.net'){
        const p=u.pathname.split('/'),file=`tests/fixtures/jp-sets-v160/${p.at(-1)}.json`;
        if(p[2]==='ja'&&p[3]==='sets'&&fs.existsSync(file))return r.fulfill({json:JSON.parse(fs.readFileSync(file))});
        return r.fulfill({json:p[3]==='sets'?{cards:[]}:{}});
      }
      return r.abort();
    });
    await page.goto('http://127.0.0.1:'+server.address().port);
    await page.locator('.visiblePreferences [data-value="JP"]').click();await page.waitForFunction(()=>CardCatalog.byId('neo4-001','JP'));
    await page.locator('.visiblePreferences [data-value="EX"]').click();
    for(const [id,set,label,product] of cases){
      await page.locator('#navSearch').click();
      await page.locator('#quickInput').fill('Pikachu');const row=page.locator('.suggestion').filter({hasText:id});await row.waitFor();await row.click();
      const state=product?'EXACT':'SEARCH';await page.waitForFunction(state=>document.querySelector('#openBtn').dataset.cmRoute===state,state);
      assert.equal(await page.locator('#openBtn span').textContent(),product?'Open Cardmarket':'Bekijk zoekresultaten');
      assert.equal(await page.locator('#resultOpenBtn').getAttribute('data-cm-route'),state);
      const selected=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href)),url=new URL(selected.url);
      for(const [key,value] of Object.entries({source_id:id,source_set_id:id.split('-')[0],set,set_name:label,language:'JP',condition:'EX',edition:'AUTO',variant:'NORMAL'}))assert.equal(selected[key],value,key);
      assert.equal(selected.name,product?'ピカチュウ':'マチスのピカチュウ');assert.equal(selected.number,'');
      if(product){assert.equal(url.pathname,'/en/Pokemon/Products');assert.equal(url.searchParams.get('idProduct'),String(product));assert.equal(url.searchParams.get('language'),'7');assert.equal(url.searchParams.get('minCondition'),'3');}
      else{assert.equal(url.pathname,'/en/Pokemon/Products/Search');assert.equal(url.searchParams.get('idProduct'),null);}
      await page.evaluate(()=>makeLink(false));await page.reload();await page.locator('#navRecent').click();
      const recent=page.locator('#recentList .item').first();await recent.locator('.useBtn').waitFor();
      assert.equal(await recent.locator('.openMini').getAttribute('href'),selected.url);await recent.locator('.useBtn').click();
      await page.waitForFunction(state=>document.querySelector('#openBtn').dataset.cmRoute===state,state);
      const restored=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));
      for(const key of ['source_id','source_set_id','name','set','set_name','language','number','condition','edition','variant','url'])assert.equal(restored[key],selected[key],key);
      await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();
      await page.reload();await page.locator('#navCollection').click();
      const stored=await page.evaluate(id=>JSON.parse(localStorage.getItem('cardscout_collection_v133')).find(c=>c.sourceId===id),id);
      assert.equal(stored.sourceId,id);assert.equal(stored.language,'JP');assert.equal(stored.set,set);assert.equal(stored.condition,'EX');assert.equal(stored.cardmarketUrl,selected.url);
      assert.ok((await page.locator('#collectionList a').evaluateAll(els=>els.map(el=>el.href))).includes(selected.url));
      console.log(`PASS ${id} ${state} ${selected.url}; JP identity, Recent and collection reload`);
    }
    assert.deepEqual(errors,[]);
  }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
