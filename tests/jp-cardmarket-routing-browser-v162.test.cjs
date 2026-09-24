'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
// v162 identity/UI regression, with the corrected v163 Japanese product contract.
const cases=[['PMCG1-035','BASE','Expansion Pack','Expansion-Pack/Pikachu'],['PMCG2-024','JUNGLE','Pokémon Jungle','Pokemon-Jungle/Pikachu'],['neo1-036','NEO GENESIS','Neo Genesis','Gold-Silver-to-a-New-World/Pikachu-GSNW'],['PMCG5-036','JP GYM 1',"Leader's Stadium",'Leaders-Stadium/Lt-Surges-Pikachu-LST']];
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
    await page.locator('.visiblePreferences [data-value="JP"]').click();await page.waitForFunction(()=>window.CardCatalog?.byId?.('neo4-001','JP'));
    await page.locator('.visiblePreferences [data-value="EX"]').click();
    for(const [id,set,label,product] of cases){
      await page.locator('#navSearch').click();
      await page.locator('#quickInput').fill('Pikachu');const row=page.locator('.suggestion').filter({hasText:id});await row.waitFor();await row.click();
      const state=product?'EXACT':'SEARCH';await page.waitForFunction(state=>document.querySelector('#openBtn').dataset.cmRoute===state,state);
      assert.equal(await page.locator('#openBtn span').textContent(),product?'Open Cardmarket':'Bekijk zoekresultaten');
      assert.equal(await page.locator('#resultOpenBtn').getAttribute('data-cm-route'),state);
      const selected=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href)),url=new URL(selected.url);
      for(const [key,value] of Object.entries({source_id:id,source_set_id:id.split('-')[0],set,set_name:label,language:'JP',condition:'EX',edition:'AUTO',variant:'NORMAL'}))assert.equal(selected[key],value,key);
      assert.equal(selected.name,id==='PMCG5-036'?'マチスのピカチュウ':'ピカチュウ');assert.equal(selected.number,'');
      assert.equal(url.pathname,'/en/Pokemon/Products/Singles/'+product);assert.equal(url.searchParams.has('idProduct'),false);assert.equal(url.searchParams.has('language'),false);assert.equal(url.searchParams.get('minCondition'),'3');
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
      // Persisted v162 links must also recover to native JP routes, without changing identity.
      await page.evaluate(id=>{
        const wrong='https://www.cardmarket.com/en/Pokemon/Products?idProduct=273753&language=7';
        for(const key of ['whatnotai_mobile_recent_v37','cardscout_collection_v133']){
          const items=JSON.parse(localStorage.getItem(key));for(const item of items)if((item.source_id||item.sourceId)===id){item.url=wrong;item.cardmarketUrl=wrong;item.exact=true;item.verified=true;item.direct=true;}localStorage.setItem(key,JSON.stringify(items));
        }
      },id);
      await page.reload();await page.locator('#navCollection').click();
      assert.ok((await page.locator('#collectionList a').evaluateAll(els=>els.map(el=>el.href))).includes(selected.url));
      assert.equal((await page.locator('#collectionList a').evaluateAll(els=>els.map(el=>el.href))).some(url=>url.includes('idProduct=')),false);
      await page.locator('#navRecent').click();
      await page.waitForFunction(expected=>document.querySelector('#recentList .item .openMini')?.href===expected,selected.url);
      await page.locator('#recentList .item .useBtn').first().click();
      await page.waitForFunction(expected=>document.querySelector('#openBtn')?.href===expected,selected.url);
      await page.locator('.visiblePreferences [data-value="NM"]').click();
      await page.waitForFunction(()=>new URL(document.querySelector('#openBtn').href).searchParams.get('minCondition')==='2');
      assert.equal(new URL(await page.locator('#openBtn').getAttribute('href')).searchParams.has('language'),false);
      await page.locator('.visiblePreferences [data-value="EX"]').click();
      console.log(`PASS ${id} ${state} ${selected.url}; JP identity, Recent and collection reload`);
    }
    // v165 now proves Bulbasaur. Keep the fallback assertion on an audited SEARCH record.
    await page.locator('#quickInput').fill('基本草エネルギー');await page.locator('.suggestion').filter({hasText:'PMCG1-097'}).click();
    await page.waitForFunction(()=>document.querySelector('#openBtn').dataset.cmRoute==='SEARCH');
    assert.equal(await page.locator('#openBtn span').textContent(),'Bekijk zoekresultaten');
    assert.equal(new URL(await page.locator('#openBtn').getAttribute('href')).pathname,'/en/Pokemon/Products/Search');
    assert.deepEqual(errors,[]);
  }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
