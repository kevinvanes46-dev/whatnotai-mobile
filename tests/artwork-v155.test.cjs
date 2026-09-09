'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir='tests/fixtures/artwork-v155',out=process.env.UI_SCREENSHOT_DIR||'artifacts/artwork-v155';fs.mkdirSync(out,{recursive:true});
const sets=fs.readdirSync(dir).filter(f=>f.endsWith('-set.json')).map(f=>({lang:f.slice(0,2),...JSON.parse(fs.readFileSync(dir+'/'+f))}));
const keys=['EX TEAM ROCKET RETURNS','EX DEOXYS','EX EMERALD','EX UNSEEN FORCES','EX DELTA SPECIES','EX LEGEND MAKER','EX HOLON PHANTOMS','EX CRYSTAL GUARDIANS','EX DRAGON FRONTIERS','EX POWER KEEPERS'];
const result={stamped:[],jp:[],contracts:[]};
(async()=>{
 for(const file of ['app-v137.js','card-identity-v154.js','ui-v137-collection.js','cardmarket-products-v152.js','cards.json','ui-v154-keyboard.js'])assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),execFileSync('git',['show','6140aad6939311f4fa99928d4fa109d10c55bc6b:'+file],{encoding:'utf8',maxBuffer:20e6}).replace(/\r\n/g,'\n'),file+' unchanged');
 const server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',css:'text/css',html:'text/html',json:'application/json',svg:'image/svg+xml'})[f.split('.').pop()]||'application/octet-stream');if(f==='cards.json'){const c=JSON.parse(fs.readFileSync(f));c.knownCards=[];res.end(JSON.stringify(c));}else res.end(fs.readFileSync(path.resolve(f)));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='api.tcgdex.net'){const p=u.pathname.split('/'),lang=p[2],id=p.at(-1),f=p[3]==='sets'?`${dir}/${lang}-${id}-set.json`:`${dir}/${lang}-${id}.json`;if(!fs.existsSync(f))return r.fulfill({json:{cards:[]}});const data=JSON.parse(fs.readFileSync(f));if(data.cards)data.cards=data.cards.slice(0,3);return r.fulfill({json:data});}if(u.hostname==='assets.tcgdex.net'){if(u.pathname.startsWith('/univ/test/'))return r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=','base64')});const p=u.pathname.split('/'),file=`${dir}/${p[1]}-${p[3]}-${p[4]}.webp`;return fs.existsSync(file)?r.fulfill({contentType:'image/webp',body:fs.readFileSync(file)}):r.abort();}return r.abort();});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.CardCatalog?.byId('ex16-1','EN'));await page.locator('#stampedToggle').click();
 for(let i=0;i<keys.length;i++){
  const id='ex'+(i+7),set=sets.find(s=>s.id===id&&s.lang==='en');await page.locator(`[data-stamped-set="${keys[i]}"]`).click();assert.equal(await page.locator('#smartSuggestions').isVisible(),true,'Preset results remain visible without Enter');
  const checked=[];
  for(const card of set.cards.slice(0,3)){
   const expected=card.image+'/high.webp';const row=page.locator('.suggestion').filter({has:page.locator('.suggestionMeta',{hasText:new RegExp('^'+keys[i].replace(/^EX /,'EX '),'i')})}).filter({has:page.locator('.suggestionTitle',{hasText:'#'+card.localId})}).filter({hasText:card.name.replace(/ δ/g,'')}).first();
   await row.scrollIntoViewIfNeeded();await row.locator('img').waitFor();await page.waitForFunction(url=>[...document.querySelectorAll('.suggestion img')].some(img=>img.src===url&&img.naturalWidth>0),expected);
   assert.equal(await row.locator('img').getAttribute('src'),expected);checked.push(card.id);
  }
  if(i===8){await page.locator('#smartSuggestions').evaluate(e=>{e.scrollTop=0;e.scrollIntoView({block:'start'});});await page.waitForTimeout(200);await page.waitForFunction(()=>document.querySelector('#toast').hidden);await page.screenshot({path:out+'/stamped-images-390.png'});}
  result.stamped.push({set:keys[i],status:'PASS',cards:checked});console.log('PASS '+keys[i]+' 3 real card images, preset without Enter');
 }
 await page.locator('#stampedToggle').click();await page.locator('.visiblePreferences [data-value="JP"]').click();await page.waitForFunction(()=>window.CardCatalog?.byId('neo1-001','JP'));
 for(const set of sets.filter(s=>s.lang==='ja'))for(const card of set.cards.slice(0,3)){
  await page.locator('#quickInput').fill(card.name);const row=page.locator('.suggestion').filter({has:page.locator('.suggestionTitle',{hasText:card.name})}).first();await row.scrollIntoViewIfNeeded();await row.locator('.artUnavailable').waitFor();assert.equal(await row.locator('img').count(),0);
  await row.click();await page.waitForFunction(id=>JSON.parse(localStorage.getItem('whatnotai_mobile_recent_v37')||'[]')[0]?.source_id===id,card.id);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('whatnotai_mobile_recent_v37'))[0]);assert.equal(saved.language,'JP');assert.equal(saved.source_id,card.id);
  await page.locator('#navRecent').click();assert.equal(await page.locator('#recentList .item').first().locator('img').count(),0);await page.locator('#recentList .useBtn').first().click();await page.waitForFunction(id=>currentCardmarketCard().source_id===id,card.id);
  result.jp.push({set:set.id,id:card.id,name:card.name,status:'PASS honest unavailable',sourceImage:null});console.log('PASS JP '+card.id+' identity/Recent; live API has no image');
 }
 // Synthetic availability contract: real JP identities, language-neutral test URLs, not invented production artwork.
 for(const set of sets.filter(s=>s.lang==='ja')){
  const card=set.cards[0];await page.evaluate(({card})=>{window.realById=window.CardCatalog.byId;window.CardCatalog.byId=(id,language)=>id===card.id&&language==='JP'?{source_id:id,name:card.name,language:'JP',set:'AUTO',image:'https://assets.tcgdex.net/univ/test/'+id}:realById(id,language);const t=document.createElement('div');t.id='contract-art';t.style.minHeight='90px';document.body.append(t);window.CardArtwork.mount({source_id:card.id,name:card.name,language:'JP'},t);t.scrollIntoView();},{card});
  await page.waitForFunction(()=>document.querySelector('#contract-art img')?.naturalWidth>0);assert.match(await page.locator('#contract-art img').getAttribute('src'),/\/univ\/test\//);await page.evaluate(()=>{document.querySelector('#contract-art').remove();window.CardCatalog.byId=realById;});result.contracts.push({id:card.id,status:'PASS neutral URL with exact JP catalog provenance'});
 }
 // Saved EN image must not be borrowed for a JP source whose JA record offers none.
 await page.evaluate(()=>{const t=document.createElement('div');t.id='bad-art';document.body.append(t);window.CardArtwork.mount({source_id:'PMCG1-001',name:'フシギダネ',language:'JP',image:'https://assets.tcgdex.net/en/ex/ex7/1'},t);t.scrollIntoView();});await page.locator('#bad-art.artUnavailable').waitFor();assert.equal(await page.locator('#bad-art img').count(),0);console.log('PASS JP rejects unverified saved English artwork');
 await page.locator('#navRecent').click();await page.waitForFunction(()=>document.querySelector('#toast').hidden);await page.screenshot({path:out+'/jp-source-unavailable-390.png'});
 // Verified local display aliases still resolve by their exact set/collector identity.
 await page.evaluate(()=>{const t=document.createElement('div');t.id='alias-art';document.body.append(t);window.CardArtwork.mount({name:'Collector display alias',url:'https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=alias',number:'1',set:'EX TEAM ROCKET RETURNS',language:'EN',verified:true},t);t.scrollIntoView();});
 await page.waitForFunction(()=>document.querySelector('#alias-art img')?.naturalWidth>0);assert.equal(await page.locator('#alias-art img').getAttribute('src'),'https://assets.tcgdex.net/en/ex/ex7/1/high.webp');console.log('PASS verified local alias uses exact set/number source');
 // Exercise JA metadata recovery independently of catalog artwork. Synthetic URLs are test-only.
 await page.evaluate(()=>{window.originalLookup=window.cardscoutCollectionUI.lookupCard;window.cardscoutCollectionUI.lookupCard=async c=>({id:c.sourceId,name:'JP metadata fixture',image:'https://assets.tcgdex.net/univ/test/'+c.sourceId});});
 await page.locator('#bad-art .artRetry').click();await page.waitForFunction(()=>document.querySelector('#bad-art img')?.naturalWidth>0);assert.match(await page.locator('#bad-art img').getAttribute('src'),/univ\/test\/PMCG1-001/);
 await page.evaluate(()=>{window.cardscoutCollectionUI.lookupCard=originalLookup;});console.log('PASS exact JA metadata accepts a language-neutral URL without /ja/');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/matrix.json',JSON.stringify(result,null,2));console.log('PASS 10/10 Stamped sets (30 real artworks), 12 real JP missing-image cases, 4 synthetic JP availability contracts');await ctx.close();
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
