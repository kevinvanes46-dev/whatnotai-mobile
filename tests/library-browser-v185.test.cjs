'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('../scripts/node_modules/playwright'),Market=require('../market-v176.js'),F=require('./fixtures/market-v176.cjs');
let browser,server,origin;
before(async()=>{server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://local').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',css:'text/css',html:'text/html',json:'application/json',svg:'image/svg+xml',woff2:'font/woff2'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch();});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
async function setup(t){const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});t.after(()=>context.close());const requests=[];
await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin)return r.continue();requests.push(u.href);if(u.hostname==='api.tcgdex.net'){const parts=u.pathname.split('/'),lang=parts[2],id=decodeURIComponent(parts.at(-1));if(parts[3]==='sets'&&parts.length===5){const f='tests/fixtures/library-v185/'+lang+'-'+id+'.json';return r.fulfill({json:fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):{id,cards:[],cardCount:{total:0}}});}if(parts[3]==='cards'&&parts.length===4){const all=JSON.parse(fs.readFileSync('docs/v185-audit/en-cards.json')),n=Number(u.searchParams.get('pagination:page')||1);return r.fulfill({json:all.slice((n-1)*80,n*80)});}return r.fulfill({json:F.card});}if(u.hostname==='assets.tcgdex.net')return r.fulfill({contentType:'image/png',body:fs.readFileSync('icon-rareworth-192.png')});return r.abort();});
const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));await p.goto(origin);await p.locator('#onboardingGuest').click();await p.locator('#navSearch').click();await p.waitForFunction(()=>window.HoloDexLibraryUI);return {p,context,requests};}
test('unified search finds modern combined match, pages broad results and keeps exact identity when adding and reloading',async t=>{const {p}=await setup(t);await p.locator('#quickInput').fill('Charizard 199 151');await p.locator('.suggestion').filter({hasText:'Charizard ex #199'}).waitFor();assert.equal(await p.locator('.suggestion').count(),1);await p.locator('.suggestion').first().click();await p.locator('#selectedCardOpen').click();assert.match(await p.locator('#cardSheetNote').innerText(),/uitgeschakeld/);await p.locator('#cardSheetAction').click();await p.locator('#collectionEditorSave').click();let items=await p.evaluate(()=>JSON.parse(localStorage.getItem('cardscout_collection_v133')));assert.equal(items.length,1);assert.equal(items[0].sourceId,'sv03.5-199');assert.equal(items[0].source_set_id,'sv03.5');assert.equal(items[0].language,'EN');const original=JSON.stringify(items);await p.reload();assert.equal(await p.evaluate(()=>localStorage.getItem('cardscout_collection_v133')),original);await p.locator('#navSearch').click();await p.locator('#quickInput').fill('Charizard');await p.locator('#libraryMore').waitFor({state:'visible'});await p.locator('#libraryMore').click();await p.waitForFunction(()=>document.getElementById('libraryStatus').textContent.includes('pagina 2'));assert.ok(await p.locator('.suggestion').count()>=80);});
test('set browser filters coverage and ownership at all mobile widths and desktop without overflow',async t=>{const {p}=await setup(t);await p.locator('#libraryToggle').click();await p.getByLabel('Filter sets',{exact:true}).fill('151');await p.locator('[data-set-id="sv03.5"]').click();await p.waitForFunction(()=>document.getElementById('librarySetDetail').textContent.includes('207 beschikbare'));assert.equal(await p.locator('.libraryCard').count(),24);await p.getByRole('button',{name:'Volgende kaarten',exact:true}).click();await p.getByRole('button',{name:'In bezit',exact:true}).click();assert.equal(await p.locator('.libraryCard').count(),0);await p.getByRole('button',{name:'Alle kaarten',exact:true}).click();for(const width of [320,375,390,430,1365]){await p.setViewportSize({width,height:width===1365?900:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);fs.mkdirSync('docs/review-v185',{recursive:true});await p.screenshot({path:'docs/review-v185/library-'+width+'.png',fullPage:true});}await p.getByLabel('Bibliotheektaal').selectOption('JP');await p.locator('[data-set-id="SV2a"]').click();await p.waitForFunction(()=>document.getElementById('librarySetDetail').textContent.includes('210 beschikbare'));assert.equal(await p.locator('.libraryCard').count(),24);});
test('production policy suppresses legacy cache and raw prices without mutating collection, cache, costs or history',async t=>{const {p,requests}=await setup(t);const item={...F.item,uid:'preserve',edition:'UNLIMITED',price:999,priceSource:'legacy',costBasis:{version:177,status:'KNOWN',unitCost:12,currency:'EUR',updatedAt:'2026-10-20T10:00:00.000Z'}},entry=Market.observe(F.card,item,{requestedLanguage:'en'});const cache={version:176,entries:{[Market.key(item)]:entry}};await p.evaluate(({item,cache})=>{localStorage.setItem('cardscout_collection_v133',JSON.stringify([item]));localStorage.setItem('holokeep_market_cache_v176',JSON.stringify(cache));localStorage.setItem('holodex_history_v183','preserved-marker');},{item,cache});const before=await p.evaluate(()=>({...localStorage}));requests.length=0;await p.locator('#navCollection').click();await p.evaluate(()=>cardscoutCollectionUI.refreshPrices(true));await p.locator('#navHome').click();assert.equal(await p.locator('#homeMarket').innerText(),'—');assert.match(await p.locator('.homeChartNote').innerText(),/uitgeschakeld/);assert.equal(await p.locator('#homeComparisonPanel svg').count(),0);assert.equal(await p.evaluate(()=>HoloKeepMarket.display(null,{price:999}).value),null);assert.equal(requests.filter(u=>/\/cards\//.test(u)).length,0);const after=await p.evaluate(()=>({...localStorage}));for(const key of ['cardscout_collection_v133','holokeep_market_cache_v176','holodex_history_v183'])assert.equal(after[key],before[key]);});
test('verified Cardmarket page opens directly; missing JP logos show honest placeholders',async t=>{
  const {p}=await setup(t);
  await p.route('https://api.tcgdex.net/v2/en/sets/me02',r=>r.fulfill({json:{id:'me02',cards:[{id:'me02-001',localId:'001',name:'Oddish'}],cardCount:{total:1}}}));
  await p.locator('#libraryToggle').click();
  await p.getByLabel('Filter sets',{exact:true}).fill('Phantasmal Flames');
  await p.locator('[data-set-id="me02"]').click();
  await p.locator('.libraryCard').first().click();
  const link=p.locator('#cardSheetLink');
  await p.locator('#libraryCmChoices191').filter({hasText:'Bestaande productkoppeling; specifieke uitvoering controleren.'}).waitFor();
  assert.equal(await link.getAttribute('href'),'https://www.cardmarket.com/en/Pokemon/Products/Singles/Phantasmal-Flames/Oddish-PFL001');
  assert.match(await link.innerText(),/Bekijk exacte kaart op Cardmarket/);
  await p.locator('#cardSheetClose').click();
  await p.getByLabel('Filter sets',{exact:true}).fill('151');
  await p.locator('[data-set-id="sv03.5"]').click();
  await p.locator('.libraryCard').first().click();
  await p.locator('#libraryCmChoices191').filter({hasText:'Geen bevestigde product-ID'}).waitFor();
  assert.equal(new URL(await link.getAttribute('href')).searchParams.get('searchString'),await p.locator('#cardSheetName').innerText());
  assert.match(await link.innerText(),/controleer set en nummer/);
  await p.locator('#cardSheetClose').click();
  await p.getByLabel('Bibliotheektaal').selectOption('JP');
  await p.getByLabel('Filter sets',{exact:true}).fill('');
  const noLogo=p.locator('.librarySet').filter({has:p.locator('.librarySetArtFallback')}).first();
  assert.ok(await noLogo.isVisible());
  assert.match(await noLogo.locator('.librarySetArtFallback').innerText(),/Setlogo niet beschikbaar/);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
});
test('v191 Base Set ownership stays scoped and verified Cardmarket variants require a deliberate choice',async t=>{
  const {p}=await setup(t);
  await p.evaluate(()=>{localStorage.setItem('cardscout_collection_v133',JSON.stringify([
    {uid:'owned-base',sourceId:'base1-2',source_set_id:'base1',set:'BASE',name:'Blastoise',number:'2',language:'EN',listType:'OWNED',qty:1,condition:'NM',variant:'NORMAL'},
    {uid:'owned-jungle',sourceId:'base2-3',source_set_id:'base2',set:'JUNGLE',name:'Flareon',number:'3',language:'EN',listType:'OWNED',qty:1},
    {uid:'bad-set',sourceId:'base1-4',source_set_id:'base2',set:'JUNGLE',name:'Wrong set',number:'4',language:'EN',listType:'OWNED',qty:1}
  ]));});
  await p.route('https://api.tcgdex.net/v2/en/cards/base1-2',r=>r.fulfill({json:{id:'base1-2',localId:'2',name:'Blastoise',set:{id:'base1'},variants_detailed:[
    {type:'holo',subtype:'unlimited',thirdParty:{cardmarket:273697}},
    {type:'holo',subtype:'shadowless',stamp:['1st-edition'],thirdParty:{cardmarket:660226}}]}}));
  await p.locator('#libraryToggle').click();await p.getByLabel('Filter sets',{exact:true}).fill('Base Set');
  await p.locator('[data-set-id="base1"]').click();
  await p.getByRole('button',{name:'In bezit',exact:true}).click();
  assert.equal(await p.locator('.libraryCard').count(),1);
  assert.match(await p.locator('.libraryCard').first().innerText(),/Blastoise/);
  assert.match(await p.locator('#librarySetDetail').innerText(),/Base Set: 102 beschikbare kaarten · 1 in bezit/);
  await p.locator('.libraryCard').click();
  await p.locator('#libraryCmChoices191 button').first().waitFor();
  assert.equal(await p.locator('#libraryCmChoices191 button').count(),2);
  assert.equal(await p.locator('#cardSheetLink').isVisible(),false);
  await p.locator('#libraryCmChoices191 button').first().click();
  assert.equal(await p.locator('#cardSheetLink').getAttribute('href'),'https://www.cardmarket.com/en/Pokemon/Products?idProduct=273697');
  await p.locator('#libraryCmChoices191 button').nth(1).click();
  assert.equal(await p.locator('#cardSheetLink').getAttribute('href'),'https://www.cardmarket.com/en/Pokemon/Products?idProduct=660226');
  await p.locator('#cardSheetNote').filter({hasText:'uitgeschakeld'}).waitFor();
});
