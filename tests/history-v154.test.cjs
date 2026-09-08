'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.UI_SCREENSHOT_DIR||'artifacts/history-v154/identity';fs.mkdirSync(out,{recursive:true});
const fixtures=Object.fromEntries(['ex15-43','base2-25'].map(id=>[id,JSON.parse(fs.readFileSync('tests/fixtures/artwork/'+id+'.json'))]));
const key='whatnotai_mobile_recent_v37',collectionKey='cardscout_collection_v133';
let checks=0;function pass(s){checks++;console.log('PASS '+s);}
(async()=>{
 require('./helpers/history-protected.cjs')();
 const server=http.createServer((req,res)=>{try{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',svg:'image/svg+xml'})[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(file)));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await ctx.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname==='api.tcgdex.net'){const id=u.pathname.split('/').pop();requests.push(u.pathname);if(u.pathname.includes('/cards/'))return r.fulfill({json:fixtures[id]||{}});const cards=Object.values(fixtures).filter(c=>c.set.id===id);return r.fulfill({json:{name:cards[0]?.set.name||id,cards:cards.map(c=>({id:c.id,name:c.name,localId:c.localId,image:c.image}))}});}if(u.hostname==='assets.tcgdex.net'){const id=u.pathname.includes('/base2/')?'base2-25':'ex15-43';return r.fulfill({contentType:'image/webp',body:fs.readFileSync('tests/fixtures/artwork/'+id+'.webp')});}return r.abort();});
 await page.goto('http://127.0.0.1:'+server.address().port);
 const sentinel=JSON.stringify([{uid:'untouched',name:'Sentinel',qty:7,price:3,language:'EN',listType:'OWNED',condition:'NM',variant:'NORMAL',paidEach:null,addedAt:1}]);
 await page.evaluate(({collectionKey,sentinel})=>localStorage.setItem(collectionKey,sentinel),{collectionKey,sentinel});
 await page.locator('.visiblePreferences [data-value="EN"]').click();
 await page.waitForFunction(()=>window.CardCatalog?.byId('ex15-43','EN')?.image);
 for(const [id,query] of [['ex15-43','Bagon 43 Dragon Frontiers'],['base2-25','Pinsir 25 Jungle']]){
  await page.locator('#quickInput').fill(query);
  const suggestion=page.locator('.suggestion').filter({hasText:id==='ex15-43'?'Bagon':'Pinsir'}).filter({hasText:'volledige catalogus'}).first();await suggestion.click();
  await page.waitForFunction(({key,id})=>JSON.parse(localStorage.getItem(key)||'[]')[0]?.source_id===id,{key,id});
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key))[0],key);
  assert.equal(saved.kind,'card');assert.equal(saved.number,fixtures[id].localId);assert.ok(saved.set!=='AUTO');assert.equal(saved.image,fixtures[id].image);assert.equal(saved.language,'EN');assert.ok(saved.url.includes('idProduct=')||saved.url.includes('/Singles/'));assert.equal(saved.cardmarketUrl,saved.url);
  await page.reload();await page.locator('#navRecent').click();await page.waitForFunction(()=>document.querySelector('#recentList .recentThumb img')?.naturalWidth>0);
  const stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key))[0],key);assert.deepEqual(stored,saved);
  assert.equal(await page.locator('#recentList .openMini').first().getAttribute('href'),saved.url);
  await page.locator('#recentList .useBtn').first().click();await page.waitForFunction(id=>currentCardmarketCard().source_id===id&&document.querySelector('#openBtn').dataset.cmState==='ready',id);
  assert.equal(await page.locator('#openBtn').getAttribute('href'),saved.url);assert.equal(await page.locator('#numberInput').inputValue(),saved.number);assert.equal(await page.locator('#setSelect').inputValue(),saved.set);
  if(id==='ex15-43'){await page.waitForFunction(()=>document.querySelector('#selectedCardArt img')?.naturalWidth>0);await page.screenshot({path:out+'/restored-card-390.png',fullPage:true});}
  pass(id+' real result selection, exact persisted image/identity, reload, Recent Use and direct Open');
 }
 await page.locator('#stampedToggle').click();await page.locator('.visiblePreferences [data-value="EX"]').click();await page.locator('.visiblePreferences [data-value="1ST"]').click();
 await page.evaluate(()=>makeLink(false));const pref=await page.evaluate(key=>JSON.parse(localStorage.getItem(key))[0],key);assert.equal(pref.variant,'STAMPED');assert.equal(pref.cond,'EX');assert.equal(pref.edition,'1ST');
 await page.evaluate(item=>{clearAll();applyItem(item,false);},pref);assert.equal(await page.locator('#stampedToggle').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#condSelect').inputValue(),'EX');assert.equal(await page.locator('#editionSelect').inputValue(),'1ST');pass('Condition, edition and stamped variant restore');
 await page.locator('#quickInput').fill('Bagon');await page.evaluate(async()=>{nameInput.value='Bagon';numberInput.value='';setSelect.value='AUTO';invalidateCardmarketSelection();await makeLink(false);});
 let rows=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.equal(rows[0].kind,'query');assert.equal(rows[0].image,'');assert.equal(rows[0].source_id,'');assert.ok(rows.some(c=>c.source_id==='ex15-43'));assert.ok(rows[0].url.includes('/Search?searchString=Bagon'));pass('Generic Bagon stays query and never overwrites exact Bagon');
 const stale=await page.evaluate(async key=>{
  const original=resolveFinalCardmarketRoute;let release;
  nameInput.value='Bagon';numberInput.value='43';setSelect.value='EX DRAGON FRONTIERS';langSelect.value='EN';
  selectCardmarketCard(window.CardCatalog.byId('ex15-43','EN'));
  const persisted=JSON.parse(localStorage.getItem(key)).some(c=>c.source_id==='ex15-43');
  const gate=new Promise(r=>release=r);
  resolveFinalCardmarketRoute=c=>c.source_id==='ex15-43'?gate.then(()=>original(c)):original(c);
  const pending=makeLink(false);
  quickInput.value='Fresh query';nameInput.value='Fresh query';numberInput.value='';setSelect.value='AUTO';invalidateCardmarketSelection();await makeLink(false);
  release();await pending;resolveFinalCardmarketRoute=original;
  return {persisted,rows:JSON.parse(localStorage.getItem(key)),url:openBtn.href};
 },key);
 assert.equal(stale.persisted,true);assert.equal(stale.rows[0].kind,'query');assert.ok(stale.rows.some(c=>c.source_id==='ex15-43'));assert.ok(stale.url.includes('Fresh%20query'));pass('Selection persists before route resolution; stale response cannot overwrite a newer query');
 const restored=await page.evaluate(async()=>{
  const original=window.CardArtwork.lookup;let release;
  window.CardArtwork.lookup=()=>new Promise(r=>release=r);
  const pending=applyItem({name:'Old',set:'AUTO',source_id:'future-1',language:'EN'},false);
  nameInput.value='New selection';invalidateCardmarketSelection();
  release({id:'future-1',name:'Old',localId:'1',set:{id:'ex15'},image:'https://assets.tcgdex.net/en/ex/ex15/1'});
  const applied=await pending;window.CardArtwork.lookup=original;return {applied,name:nameInput.value};
 });assert.equal(restored.applied,false);assert.equal(restored.name,'New selection');pass('Late legacy metadata cannot replace a newer active selection');
 const legacy=[{id:'ambiguous',name:'Pinsir',set:'AUTO',lang:'EN',exact:true,image:fixtures['ex15-43'].image},{id:'source',name:'Pinsir',set:'AUTO',lang:'EN',source_id:'base2-25'},{id:'tuple',name:'Bagon',number:'43',set:'EX DRAGON FRONTIERS',lang:'EN'}];
 await page.evaluate(({key,legacy})=>{localStorage.setItem(key,JSON.stringify(legacy));renderSaved();},{key,legacy});await page.locator('#navRecent').click();
 await page.waitForFunction(()=>document.querySelectorAll('#recentList .recentThumb img').length===2);
 assert.equal(await page.locator('#recentList .item').first().locator('img').count(),0);assert.match(await page.locator('#recentList .item').first().innerText(),/Zoekopdracht/);
 assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key),legacy);pass('Legacy source and unique tuple hydrate in memory; ambiguous AUTO has no guessed art and storage is unchanged');
 const recovered=await page.evaluate(legacy=>legacy.map(c=>window.CardIdentity.normalize(c)),legacy);assert.equal(recovered[1].number,'25');assert.equal(recovered[1].set,'JUNGLE');assert.equal(recovered[2].source_id,'ex15-43');
 assert.match(await page.locator('#recentList .openMini').nth(1).getAttribute('href'),/idProduct=|Products\/Singles\//);
 assert.match(await page.locator('#recentList .openMini').first().getAttribute('href'),/Search\?searchString=Pinsir/);
 assert.equal(await page.evaluate(({id,image})=>window.CardIdentity.normalize({kind:'card',source_id:id,image,language:'EN'}).image,{id:'base2-25',image:fixtures['ex15-43'].image}),fixtures['base2-25'].image);pass('Image recovery prefers source/catalog identity over inconsistent saved image');
 await page.screenshot({path:out+'/recent-390.png',fullPage:true});await page.setViewportSize({width:1280,height:900});await page.screenshot({path:out+'/recent-1280.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),collectionKey),sentinel);assert.deepEqual(errors,[]);pass('Collection storage byte-identical; mobile/desktop states without runtime errors');await ctx.close();
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
 console.log(checks+' history identity checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
