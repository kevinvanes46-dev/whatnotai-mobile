'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const audit=JSON.parse(fs.readFileSync('data/jp-cardmarket-audit-v165.json','utf8'));
const cases=(process.env.JP_TEST_IDS?.split(',')||['PMCG1-035','PMCG2-024','neo1-036','PMCG5-036','neo3-038','PMCG1-057','PMCG1-097']).map(id=>audit.records.find(r=>r.source_id===id));
(async()=>{
 const server=http.createServer((req,res)=>{try{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json'})[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(file)));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='api.tcgdex.net'){const p=u.pathname.split('/'),file=`tests/fixtures/jp-sets-v160/${p.at(-1)}.json`;if(p[2]==='ja'&&p[3]==='sets'&&fs.existsSync(file))return r.fulfill({json:JSON.parse(fs.readFileSync(file))});return r.fulfill({json:p[3]==='sets'?{cards:[]}:{}});}return r.abort();});
  await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('.visiblePreferences [data-value="JP"]').click();await page.waitForFunction(()=>window.CardCatalog?.byId?.('neo4-001','JP'));
  for(const row of cases)for(const [condition,filter] of [['EX','3'],['NM','2']]){
   await page.locator('#navSearch').click();await page.locator(`.visiblePreferences [data-value="${condition}"]`).click();await page.locator('#quickInput').fill(row.jp_name);await page.locator('.suggestion').filter({hasText:row.source_id}).click();
   await page.waitForFunction(state=>document.querySelector('#openBtn').dataset.cmRoute===state,row.route);
   const selected=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));
   const expected=row.route==='EXACT'?row.url+'?minCondition='+filter:selected.url;
   assert.equal(selected.url,expected);assert.equal(await page.locator('#resultOpenBtn').getAttribute('data-cm-route'),row.route);assert.equal(await page.locator('#openBtn span').textContent(),row.route==='EXACT'?'Open Cardmarket':'Bekijk zoekresultaten');
   for(const [k,v] of Object.entries({source_id:row.source_id,source_set_id:row.source_set_id,language:'JP',name:row.jp_name,set:row.set,set_name:row.set_name,condition,edition:'AUTO',variant:'NORMAL'}))assert.equal(selected[k],v,k);
   if(row.route==='EXACT'){assert.equal(new URL(expected).searchParams.get('minCondition'),filter);assert.equal(new URL(expected).searchParams.has('language'),false);}else assert.equal(new URL(expected).pathname,'/en/Pokemon/Products/Search');
   await page.evaluate(()=>makeLink(false));await page.reload();await page.locator('#navRecent').click();const recent=page.locator('#recentList .item').first();await recent.locator('.useBtn').waitFor();assert.equal(await recent.locator('.openMini').getAttribute('href'),expected);await recent.locator('.useBtn').click();await page.waitForFunction(u=>document.querySelector('#openBtn').href===u,expected);
   const restored=await page.evaluate(()=>selectedCardIdentity(document.querySelector('#openBtn').href));for(const k of ['source_id','source_set_id','language','name','set','set_name','condition','edition','variant'])assert.equal(restored[k],selected[k],k);
   await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();await page.reload();await page.locator('#navCollection').click();
   const stored=await page.evaluate(({id,condition})=>JSON.parse(localStorage.getItem('cardscout_collection_v133')).find(x=>x.sourceId===id&&x.condition===condition),{id:row.source_id,condition});assert.ok(stored,JSON.stringify(await page.evaluate(()=>({pending:document.querySelector("#collectionEditor").dataset.pending,collection:JSON.parse(localStorage.getItem("cardscout_collection_v133")||"[]")}))));assert.equal(stored.cardmarketUrl,expected);assert.equal(stored.language,'JP');assert.equal(stored.set,row.set);assert.equal(stored.setName,row.set_name);assert.equal(stored.variant,selected.variant);assert.equal(stored.edition,selected.edition);
   const entry=page.locator('#collectionList .collectionCard').filter({has:page.locator('a[href="'+expected+'"]')}).first();await entry.waitFor();await entry.locator('.collectionCardMain').click();assert.ok((await page.locator('#collectionEditorMeta').textContent()).includes(row.set_name));await page.locator('#collectionEditorClose').click();
   await page.evaluate(({id,condition})=>{for(const key of ['whatnotai_mobile_recent_v37','cardscout_collection_v133']){const rows=JSON.parse(localStorage.getItem(key));for(const x of rows)if((x.source_id||x.sourceId)===id&&x.condition===condition){x.url=x.cardmarketUrl='https://www.cardmarket.com/en/Pokemon/Products?idProduct=273753&language=7';x.verified=x.direct=x.exact=true;}localStorage.setItem(key,JSON.stringify(rows));}},{id:row.source_id,condition});
   await page.reload();await page.locator('#navCollection').click();assert.ok((await page.locator('#collectionList a').evaluateAll(es=>es.map(e=>e.href))).includes(expected));assert.equal((await page.locator('#collectionList a').evaluateAll(es=>es.map(e=>e.href))).some(u=>u.includes('idProduct=273753')),false);
   await page.locator('#navRecent').click();await page.waitForFunction(u=>document.querySelector('#recentList .item .openMini')?.href===u,expected);await page.locator('#recentList .item .useBtn').first().click();await page.waitForFunction(u=>document.querySelector('#openBtn').href===u,expected);
   console.log(`PASS ${row.source_id} ${condition} ${row.route}: identity, Recent, Collection, reload, stale Western recovery; ${expected}`);
  }
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
