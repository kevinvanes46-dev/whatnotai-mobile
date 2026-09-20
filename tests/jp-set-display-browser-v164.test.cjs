'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const cases=[['neo1-036','NEO GENESIS','Neo Genesis','金、銀、新世界へ...','Gold-Silver-to-a-New-World/Pikachu-GSNW'],['PMCG1-035','BASE','Expansion Pack','拡張パック','Expansion-Pack/Pikachu'],['PMCG2-024','JUNGLE','Pokémon Jungle','ポケモンジャングル','Pokemon-Jungle/Pikachu'],['PMCG5-036','JP GYM 1',"Leader's Stadium",'リーダーズスタジアム','Leaders-Stadium/Lt-Surges-Pikachu-LST'],['neo3-038','NEO REVELATION','Awakening Legends','めざめる伝説','Awakening-Legends/Swinub-AL']];
(async()=>{
 const server=http.createServer((req,res)=>{try{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json'})[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(file)));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const metadataRequests=new Set();
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{
   const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();
   if(u.hostname==='api.tcgdex.net'){
    const p=u.pathname.split('/'),id=p.at(-1),file=`tests/fixtures/jp-sets-v160/${id}.json`;
    if(p[2]==='ja'&&p[3]==='sets'&&fs.existsSync(file))return r.fulfill({json:JSON.parse(fs.readFileSync(file))});
    const row=cases.find(row=>row[0]===id);
    if(p[2]==='ja'&&p[3]==='cards'&&row){metadataRequests.add(id);return r.fulfill({json:{id,name:id==='neo3-038'?'Swinub':'ピカチュウ',localId:id.split('-')[1],set:{id:id.split('-')[0],name:row[3]}}});}
    return r.fulfill({json:p[3]==='sets'?{cards:[]}:{}});
   }
   return r.abort();
  });
  await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('.visiblePreferences [data-value="JP"]').click();await page.waitForFunction(()=>window.CardCatalog?.byId?.('neo4-001','JP'));await page.locator('.visiblePreferences [data-value="EX"]').click();
  for(const [id,set,label,foreign,product] of cases){
   await page.locator('#navSearch').click();await page.locator('#quickInput').fill(id==='neo3-038'?'Swinub':'Pikachu');await page.locator('.suggestion').filter({hasText:id}).click();
   const expected='https://www.cardmarket.com/en/Pokemon/Products/Singles/'+product+'?minCondition=3';
   await page.waitForFunction(expected=>document.querySelector('#openBtn').href===expected,expected);
   const selected=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));assert.equal(selected.set_name,label);
   await page.evaluate(()=>makeLink(false));
   // Also recover records already saved with the foreign metadata title in v163.
   await page.evaluate(({id,foreign})=>{const key='whatnotai_mobile_recent_v37',rows=JSON.parse(localStorage.getItem(key));for(const row of rows)if(row.source_id===id){row.set_name=foreign;row.setName=foreign;}localStorage.setItem(key,JSON.stringify(rows));},{id,foreign});
   await page.reload();await page.locator('#navRecent').click();const recent=page.locator('#recentList .item').first();await recent.locator('.useBtn').waitFor();
   assert.ok((await recent.textContent()).includes(label));assert.equal((await recent.textContent()).includes(foreign),false);assert.equal(await recent.locator('.openMini').getAttribute('href'),expected);
   await recent.locator('.useBtn').click();await page.waitForFunction(expected=>document.querySelector('#openBtn').href===expected,expected);
   const restored=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));
   for(const [key,value] of Object.entries({source_id:id,source_set_id:id.split('-')[0],set,set_name:label,language:'JP',condition:'EX',edition:selected.edition,variant:selected.variant}))assert.equal(restored[key],value,key);
   await page.locator('#collectionAddBtn').click();assert.ok((await page.locator('#collectionEditorMeta').textContent()).includes(label));await page.locator('#collectionEditorSave').click();
   const saved=await page.evaluate(id=>JSON.parse(localStorage.getItem('cardscout_collection_v133')).find(row=>row.sourceId===id),id);assert.equal(saved.setName,label);assert.equal(saved.cardmarketUrl,expected);
   await page.evaluate(({id,foreign})=>{const key='cardscout_collection_v133',rows=JSON.parse(localStorage.getItem(key));rows.find(row=>row.sourceId===id).setName=foreign;localStorage.setItem(key,JSON.stringify(rows));},{id,foreign});
   await page.reload();await page.locator('#navCollection').click();const entry=page.locator('#collectionList .collectionCard').filter({has:page.locator('a[href="'+expected+'"]')});await entry.waitFor();
   assert.ok((await entry.textContent()).includes(label));assert.equal((await entry.textContent()).includes(foreign),false);
   await entry.locator('.collectionCardMain').click();assert.ok((await page.locator('#collectionEditorMeta').textContent()).includes(label));
   await page.locator('#collectionEditorClose').click();
   assert.equal(new URL(expected).searchParams.has('language'),false);
   console.log(`PASS ${id}: selected=${selected.set_name}; Recent=${restored.set_name}; Collection=${label}; ${expected}`);
  }
  assert.ok(metadataRequests.has('neo1-036'),'Japanese live-style card metadata was exercised');assert.deepEqual(errors,[]);
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
