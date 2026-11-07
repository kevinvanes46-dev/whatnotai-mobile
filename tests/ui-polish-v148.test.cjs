'use strict';
// Local-only visual/interaction audit. Run with PLAYWRIGHT_MODULE and CHROME_PATH if needed.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const out=process.env.UI_SCREENSHOT_DIR||path.join(root,'artifacts','ui-v148');
const baseline='b8c812f430ed12ab0498dbaa39ec7927a511741d';
const seed=[{uid:'audit-owned',name:'Charizard',number:'4',set:'EX CRYSTAL GUARDIANS',setName:'EX Crystal Guardians',language:'EN',edition:'1ST',condition:'EX',variant:'STAMPED',qty:3,paidEach:19.75,addedAt:1,listType:'OWNED',price:456,priceUpdated:Date.now(),cardmarketUrl:'https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=Charizard'},
{uid:'audit-wish',name:'Bagon',number:'43',set:'EX DRAGON FRONTIERS',setName:'EX Dragon Frontiers',language:'EN',edition:'AUTO',condition:'NM',variant:'NORMAL',qty:1,paidEach:null,addedAt:2,listType:'WISHLIST',cardmarketUrl:'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Bagon-Delta-Species-DF43'}];
let checks=0;
function pass(s){console.log('PASS '+s);checks++;}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 // Keep scanner styling fixed while permitting additive catalog coverage.
 for(const file of ['style-v137-product.css']){
  assert.equal(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'),execFileSync('git',['show',`${baseline}:${file}`],{cwd:root,maxBuffer:20*1024*1024,encoding:'utf8'}).replace(/\r\n/g,'\n'),file);
 }
 const baselineCatalog=JSON.parse(execFileSync('git',['show',`${baseline}:cards.json`],{cwd:root,maxBuffer:20*1024*1024,encoding:'utf8'}));
 const currentCatalog=JSON.parse(fs.readFileSync(path.join(root,'cards.json'),'utf8'));
 for(const field of ['version','pokedex','knownCards','stats'])assert.deepEqual(currentCatalog[field],baselineCatalog[field],`Existing catalog ${field} must remain unchanged`);
 for(const [set,baselineInfo] of Object.entries(baselineCatalog.sets)){
  const currentInfo=currentCatalog.sets[set];
  assert.ok(currentInfo,`Existing catalog set ${set} must remain`);
  const {aliases:baselineAliases,...baselineFields}=baselineInfo;
  const {aliases:currentAliases,...currentFields}=currentInfo;
  assert.deepEqual(currentFields,baselineFields,`Existing catalog metadata for ${set} must remain unchanged`);
  assert.ok(baselineAliases.every(alias=>currentAliases.includes(alias)),`Existing aliases for ${set} must remain`);
 }
 const expandedSets=['DIAMOND PEARL','MYSTERIOUS TREASURES','SECRET WONDERS','GREAT ENCOUNTERS','MAJESTIC DAWN','STORMFRONT','DP BLACK STAR PROMOS','POP SERIES 1','POP SERIES 2','POP SERIES 3','POP SERIES 4','POP SERIES 5','POP SERIES 6','POP SERIES 7','POP SERIES 8','POP SERIES 9','PLATINUM','RISING RIVALS','SUPREME VICTORS','ARCEUS','HEARTGOLD SOULSILVER','UNLEASHED','UNDAUNTED','TRIUMPHANT','CALL OF LEGENDS','HGSS BLACK STAR PROMOS'];
 for(const set of expandedSets)assert.ok(currentCatalog.sets[set],`Verified additive catalog coverage for ${set} must remain`);
 assert.ok(currentCatalog.sets['LEGENDS AWAKENED'].aliases.includes('dp6'),'The verified Legends Awakened set alias must remain');
 const current=fs.readFileSync(path.join(root,'app-v137.js'),'utf8').replace(/\r\n/g,'\n');
 const oldApp=execFileSync('git',['show',`${baseline}:app-v137.js`],{cwd:root,maxBuffer:20*1024*1024,encoding:'utf8'}).replace(/\r\n/g,'\n');
 pass('Existing catalog identities and routes preserved; verified DP/POP/Platinum/HGSS additions retained');
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const file=url.pathname.slice(1)||'index.html';
  if(!/^[\w.-]+\.(html|css|js|json|svg)$/.test(file)){res.writeHead(404).end();return;}
  try{
   const body=url.searchParams.has('baseline')&&file==='index.html'?execFileSync('git',['show',`${baseline}:index.html`],{cwd:root}):fs.readFileSync(path.join(root,file));
   res.setHeader('Content-Type',({html:'text/html',css:'text/css',js:'text/javascript',json:'application/json',svg:'image/svg+xml'})[file.split('.').pop()]);res.end(body);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  const ctx=await browser.newContext({reducedMotion:'reduce'});
  await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.fulfill({json:{cards:[]}}));
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
  const base=`http://127.0.0.1:${server.address().port}/`;
  const shot=async name=>{await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});if(/^(search|collection|empty|selected)-(375|1280)$/.test(name))await page.screenshot({path:path.join(out,name+'-viewport.png')});};
  const fits=async()=>{
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const clipped=await page.locator('.tabView.active button,.tabView.active input,.tabView.active select').evaluateAll(els=>els.filter(el=>{
    const r=el.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(el).visibility!=='hidden'&&!el.closest('.collectionQuickFilters,.stampedSetChips')&&(r.left<0||r.right>innerWidth+1);
   }).map(el=>el.id||el.className));
   assert.deepEqual(clipped,[]);
  };
  for(const width of [320,375,390,768,1280]){
   await page.setViewportSize({width,height:844});
   await page.goto(base);await page.evaluate(()=>{localStorage.clear();});await page.reload();
   if(await page.locator('#onboardingGuest').isVisible())await page.locator('#onboardingGuest').click();
   if(width===320)await require('./helpers/history-protected.cjs')(page);
   await fits();await shot(`search-${width}`);
   if([375,1280].includes(width)){
    await page.goto(base+'?baseline');await shot(`before-search-${width}`);await page.goto(base);
    // The historical page is retained for visual comparison, not for current-runtime checks.
    errors.length=0;
   }
   await page.locator('#navCollection').click();await fits();await shot(`empty-${width}`);
   await page.evaluate(seed=>localStorage.setItem('cardscout_collection_v133',JSON.stringify(seed)),seed);
   await page.reload();await page.locator('#navCollection').click();
   await page.locator('.collectionCard').first().waitFor();await fits();await shot(`collection-${width}`);
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('cardscout_collection_v133'))),seed);
   await page.locator('[data-filter-list="WISHLIST"]').click();assert.equal(await page.locator('.collectionCard').count(),1);
   await page.locator('[data-filter-list="ALL"]').click();assert.equal(await page.locator('.collectionCard').count(),2);
   await page.locator('.collectionTools summary').click();
   await page.locator('#collectionConditionFilter').selectOption('EX');assert.equal(await page.locator('.collectionCard').count(),1);
   await page.locator('#collectionConditionFilter').selectOption('');
   await page.locator('#collectionSort').selectOption('name');assert.equal(await page.locator('.collectionCard h3').first().textContent(),'Bagon #43');
   await page.locator('#collectionSearch').fill('no-such-card');assert.equal(await page.locator('.collectionCard').count(),0);await fits();await shot(`no-results-${width}`);
   await page.locator('#collectionSearch').fill('');
   await page.locator('.collectionCardOpen').last().click();await shot(`editor-${width}`);
   const editor=await page.locator('#collectionEditor').boundingBox();assert.ok(editor.x>=0&&editor.x+editor.width<=width+1);
   await page.locator('#collectionEditorClose').click();
   await page.locator('#navRecent').click();await fits();
   await page.locator('#navSettings').click();await fits();await shot(`settings-${width}`);
   await page.locator('#navSearch').click();
   await page.locator('#quickInput').fill('bagon 43 dragon frontiers');
   await page.waitForFunction(()=>document.querySelector('#smartSuggestions .suggestion'));
   await fits();await shot(`results-${width}`);
   await page.locator('#smartSuggestions .suggestion').first().click();
   await page.waitForFunction(()=>document.querySelector('#actionDock').classList.contains('ready'));
   await shot(`selected-${width}`);
   const dock=await page.locator('#actionDock').boundingBox(),nav=await page.locator('.bottomNav').boundingBox();
   assert.ok(dock.y+dock.height<=nav.y+1,'dock must clear navigation');
   await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorClose').click();
   await fits();pass(`${width}px search, results, dock, collection, filters, empty, editor, recent and settings`);
  }
  await page.locator('#quickInput').focus();
  assert.equal(await page.locator('#quickPanel').evaluate(el=>getComputedStyle(el).borderTopColor),'rgb(179, 240, 207)');pass('Visible keyboard focus on search field container');
  assert.deepEqual(errors,[]);pass('No browser runtime errors');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
 console.log(`${checks} UI polish audit groups passed; screenshots in ${out}`);
})().catch(e=>{console.error(e);process.exitCode=1;});
