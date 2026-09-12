'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const expected=[['PMCG1','BASE','Expansion Pack'],['PMCG2','JUNGLE','Pokémon Jungle'],['PMCG3','FOSSIL','Mystery of the Fossils'],['PMCG4','ROCKET','Rocket Gang'],['PMCG5','JP GYM 1',"Leader's Stadium"],['PMCG6','JP GYM 2','Challenge from the Darkness'],['neo1','NEO GENESIS','Neo Genesis'],['neo2','NEO DISCOVERY','Neo Discovery'],['neo3','NEO REVELATION','Awakening Legends'],['neo4','NEO DESTINY','Neo Destiny']];
(async()=>{
 const server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(f)));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{
   const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();
   if(u.hostname==='api.tcgdex.net'){
    const p=u.pathname.split('/'),file=`tests/fixtures/jp-sets-v160/${p.at(-1)}.json`;
    if(p[2]==='ja'&&p[3]==='sets'&&fs.existsSync(file))return r.fulfill({json:JSON.parse(fs.readFileSync(file))});
    if(p[2]==='en'&&p[3]==='sets'&&p.at(-1)==='base1')return r.fulfill({json:{cards:[{id:'base1-58',localId:'58',name:'Pikachu'}]}});
    return r.fulfill({json:p[3]==='sets'?{cards:[]}:{}});
   }
   return r.abort();
  });
  // A still-valid pre-v160 cache must not keep the old western Gym partition alive.
  await page.addInitScript(()=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('cardscout_search_catalog_v152_JP',JSON.stringify({savedAt:Date.now(),cards:[{source_id:'PMCG5-036',name:'Old Gym',set:'GYM HEROES',language:'JP'}]}));sessionStorage.setItem('seeded','1');}});
  await page.goto('http://127.0.0.1:'+server.address().port);
  await page.locator('.visiblePreferences [data-value="JP"]').click();
  await page.waitForFunction(()=>window.CardCatalog?.byId('neo4-001','JP'));
  let total=0;
  for(const [source,set,label] of expected){
   const data=JSON.parse(fs.readFileSync(`tests/fixtures/jp-sets-v160/${source}.json`));
   const cards=await page.evaluate(ids=>ids.map(id=>window.CardCatalog.byId(id,'JP')),data.cards.map(c=>c.id));
   for(let i=0;i<cards.length;i++){assert.ok(cards[i],data.cards[i].id);assert.equal(cards[i].source_id,data.cards[i].id);assert.equal(cards[i].source_set_id,source);assert.equal(cards[i].language,'JP');assert.equal(cards[i].set,set);assert.equal(cards[i].set_name,label);}
   total+=cards.length;
  }
  console.log(`PASS ${total} real JP source records across all 10 sets`);
  const input=page.locator('#quickInput');
  await input.fill('Pikachu');
  const pikachuIds=['PMCG1-035','PMCG2-024','PMCG5-036','neo1-036'];
  for(const id of pikachuIds)await page.locator('.suggestion').filter({hasText:id}).waitFor();
  const found=await page.locator('.suggestion').allTextContents();
  assert.deepEqual(found.flatMap(text=>text.match(/(?:PMCG\d|neo\d)-\d+/g)||[]).sort(),[...pikachuIds].sort());
  console.log('PASS Pikachu search: '+pikachuIds.join(', '));
  const checks=[['Bulbasaur','PMCG1-001'],['Eevee','PMCG2-037'],['Grimer','PMCG3-003'],['Dark Charmeleon','PMCG4-015'],['Pikachu','PMCG5-036'],['Weedle','PMCG6-001'],['swinub','neo3-038']];
  for(const [query,id] of checks){
   await input.fill(query);const row=page.locator('.suggestion').filter({hasText:id});await row.waitFor();await row.click();
   await page.waitForFunction(()=>document.querySelector('#openBtn').dataset.cmRoute!=='PENDING');
   const selected=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));
   const source=id.slice(0,id.lastIndexOf('-')),[,set,label]=expected.find(r=>r[0]===source);
   assert.equal(selected.source_id,id);assert.equal(selected.source_set_id,source);assert.equal(selected.language,'JP');assert.equal(selected.set,set);assert.equal(selected.set_name,label);
   if(source==='PMCG5'||source==='PMCG6')assert.notEqual(await page.locator('#openBtn').getAttribute('data-cm-route'),'EXACT');
   console.log(`PASS select ${query}: ${id} / ${label}`);
  }
  await input.fill('Snubbull');for(const id of ['neo1-061','neo3-048'])await page.locator('.suggestion').filter({hasText:id}).waitFor();
  console.log('PASS Snubbull remains distinct across Neo Genesis and Awakening Legends');
  await input.fill('Weedle');await page.locator('.suggestion').filter({hasText:'PMCG6-001'}).click();await page.evaluate(()=>makeLink(false));
  await page.reload();await page.locator('#navRecent').click();await page.locator('#recentList .useBtn').first().click();
  const restored=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));
  assert.equal(restored.source_id,'PMCG6-001');assert.equal(restored.source_set_id,'PMCG6');assert.equal(restored.set,'JP GYM 2');assert.equal(restored.language,'JP');assert.equal(restored.set_name,'Challenge from the Darkness');
  console.log('PASS Gym 2 survives reload and Recent > Gebruik');
  await page.locator('.visiblePreferences [data-value="EN"]').click();await input.fill('Pikachu');
  await page.locator('.suggestion').filter({hasText:'EN'}).filter({hasText:'Pikachu'}).first().waitFor();
  const english=await page.evaluate(()=>CardCatalog.byId('base1-58','EN'));assert.equal(english.set,'BASE');assert.equal(english.language,'EN');assert.equal(english.number,'58');
  assert.deepEqual(errors,[]);console.log('PASS EN catalog unchanged; no browser errors');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
