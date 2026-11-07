'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('../scripts/node_modules/playwright'),Market=require('../market-v176.js'),F=require('./fixtures/market-v176.cjs');
let browser,server,origin;
before(async()=>{server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://local').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',css:'text/css',html:'text/html',json:'application/json',svg:'image/svg+xml',woff2:'font/woff2'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch();});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
async function setup(t){const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});t.after(()=>context.close());const requests=[];
await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin)return r.continue();requests.push(u.href);if(u.hostname==='api.tcgdex.net'){const parts=u.pathname.split('/'),lang=parts[2],id=decodeURIComponent(parts.at(-1));if(parts[3]==='sets'&&parts.length===5){const f='tests/fixtures/library-v185/'+lang+'-'+id+'.json';return r.fulfill({json:fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):{id,cards:[],cardCount:{total:0}}});}if(parts[3]==='cards'&&parts.length===4){const all=JSON.parse(fs.readFileSync('docs/v185-audit/en-cards.json')),n=Number(u.searchParams.get('pagination:page')||1);return r.fulfill({json:all.slice((n-1)*80,n*80)});}return r.fulfill({json:F.card});}if(u.hostname==='assets.tcgdex.net')return r.fulfill({contentType:'image/png',body:fs.readFileSync('icon-rareworth-192.png')});return r.abort();});
const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));await p.goto(origin);await p.locator('#onboardingGuest').click();await p.locator('#navSearch').click();await p.waitForFunction(()=>window.HoloDexLibraryUI);return {p,context,requests};}
test('v199 public search stays English while preserving stored Japanese preferences',async t=>{
  const {p}=await setup(t);
  assert.equal(await p.locator('#langSelect').inputValue(),'EN');
  assert.equal(await p.locator('.visiblePreferences [data-value="JP"]').isVisible(),false);
  assert.equal(await p.locator('.visiblePreferences [data-value="JP"]').isDisabled(),true);
  await p.evaluate(()=>localStorage.setItem('cardscout_pref_lang_v130','JP'));
  await p.reload();
  await p.locator('#navSearch').click();
  assert.equal(await p.locator('#langSelect').inputValue(),'EN');
  assert.equal(await p.evaluate(()=>localStorage.getItem('cardscout_pref_lang_v130')),'JP');
  assert.equal(await p.locator('#resultLangChip').isDisabled(),true);
  assert.equal(await p.getByLabel('Bibliotheektaal').locator('option[value="JP"]').evaluate(o=>o.hidden),true);
  await p.locator('.visiblePreferences [data-value="EN"]').click();
  await p.reload();
  await p.locator('#navSearch').click();
  assert.equal(await p.locator('#langSelect').inputValue(),'EN');
});
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
  assert.equal(await link.getAttribute('href'),'https://www.cardmarket.com/en/Pokemon/Products/Singles/Phantasmal-Flames/Oddish-PFL001?language=1&minCondition=2');
  assert.match(await link.innerText(),/Bekijk exacte kaart op Cardmarket/);
  await p.locator('#cardSheetClose').click();
  await p.getByLabel('Filter sets',{exact:true}).fill('151');
  await p.locator('[data-set-id="sv03.5"]').click();
  await p.locator('.libraryCard').first().click();
  await p.locator('#libraryCmChoices191').filter({hasText:'Geen bevestigde product-ID'}).waitFor();
  assert.equal(await p.locator('#cardSheetName').innerText(),'Bulbasaur');
  const bulbasaurUrl=new URL(await link.getAttribute('href'));
  assert.equal(bulbasaurUrl.origin,'https://www.cardmarket.com');
  assert.equal(bulbasaurUrl.pathname,'/en/Pokemon/Products/Search');
  assert.deepEqual(Object.fromEntries(bulbasaurUrl.searchParams),{searchString:'Bulbasaur 001',language:'1',minCondition:'2'});
  assert.equal(await p.locator('#librarySetDetail').innerText().then(text=>text.includes('151')),true);
  assert.equal(new URL(await link.getAttribute('href')).searchParams.get('language'),'1');
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
  assert.equal(await p.locator('#libraryCmChoices191 button[aria-pressed]').count(),2);
  assert.equal(await p.locator('#cardSheetLink').isVisible(),false);
  await p.locator('#libraryCmChoices191 button').first().click();
  assert.equal(await p.locator('#cardSheetLink').getAttribute('href'),'https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Blastoise-V1-BS2?minCondition=2&language=1&isFirstEd=N');
  await p.locator('#libraryCmChoices191 button').nth(1).click();
  assert.equal(await p.locator('#cardSheetName').innerText(),'Blastoise');
  const firstEditionUrl=new URL(await p.locator('#cardSheetLink').getAttribute('href'));
  assert.equal(firstEditionUrl.origin,'https://www.cardmarket.com');
  assert.equal(firstEditionUrl.pathname,'/en/Pokemon/Products/Search');
  assert.deepEqual(Object.fromEntries(firstEditionUrl.searchParams),{searchString:'Blastoise bs2',language:'1',minCondition:'2',isFirstEd:'Y'});
  await p.locator('#cardSheetNote').filter({hasText:'Deze editie of uitvoering heeft nog geen geverifieerde prijsdekking.'}).waitFor();
});

test('v194 adapter preserves confirmed search, collection anchors and detail links in the browser',async t=>{
  const {p}=await setup(t);
  const result=await p.evaluate(async()=>{
    const card={source_id:'ecard2-15',source_set_id:'ecard2',number:'15',name:'Houndoom',set:'AQUAPOLIS',set_name:'Aquapolis',language:'EN'};
    const wrong='https://www.cardmarket.com/en/Pokemon/Products?idProduct=275086';
    const item={uid:'v194-link-check',listType:'OWNED',sourceId:card.source_id,source_set_id:'ecard2',number:'15',name:'Houndoom',set:'AQUAPOLIS',setName:'Aquapolis',language:'EN',condition:'NM',edition:'UNLIMITED',variant:'NORMAL',qty:1,cardmarketUrl:wrong};
    localStorage.setItem('cardscout_collection_v133',JSON.stringify([item]));
    cardscoutCollectionUI.render();
    await new Promise(resolve=>setTimeout(resolve,0));
    const anchor=document.querySelector('.collectionCard[data-id="v194-link-check"] a[target="_blank"]')?.href;
    const route=await resolveFinalCardmarketRoute({...card,verified:true,direct:true,url:wrong,condition:'NM'});
    HoloDexRedesign.open({card,condition:'NM',edition:'UNLIMITED',stamped:false,cardmarketUrl:route.url});
    return {search:route.url,collection:cardscoutCollectionUI.cardmarketLink(item),anchor,detail:document.getElementById('cardSheetLink').href};
  });
  for(const [surface,url] of Object.entries(result)){
    assert.equal(new URL(url).pathname,'/en/Pokemon/Products/Singles/Aquapolis/Houndoom-V3-AQ15',surface);
    assert.equal(new URL(url).searchParams.get('language'),'1',surface);
    assert.equal(new URL(url).searchParams.get('minCondition'),'2',surface);
  }
});

test('v201 browser labels candidate links honestly and preserves collection bytes',async t=>{
 const {p}=await setup(t);
 const result=await p.evaluate(()=>{
  const c={source_id:'xy5-1',source_set_id:'xy5',name:'Weedle',number:'1',set_name:'Primal Clash',language:'EN',condition:'NM'},r=HoloDexLibrary.safeRoute(c);
  const item={uid:'v201-candidate',sourceId:c.source_id,source_set_id:'xy5',name:c.name,number:c.number,set:'PRIMAL CLASH',setName:'Primal Clash',language:'EN',condition:'NM',edition:'UNLIMITED',variant:'NORMAL',listType:'OWNED',qty:2,paidEach:4.25,cardmarketUrl:r.url};
  const bytes=JSON.stringify([item]);localStorage.setItem('cardscout_collection_v133',bytes);cardscoutCollectionUI.render();
  const open=document.getElementById('openBtn');open.href=r.url;open.classList.remove('disabled');open.dataset.cmState='ready';
  window.dispatchEvent(new CustomEvent('cardscout:cm-route-ready',{detail:{card:c,cardmarketUrl:r.url}}));
  HoloDexRedesign.open({card:c,condition:'NM',edition:'AUTO',stamped:false,cardmarketUrl:r.url});return {bytes,url:r.url};
 });
 await p.waitForFunction(()=>document.getElementById('openBtn').dataset.cmRoute==='V201_CANDIDATE'&&document.getElementById('cardSheetLink').dataset.cmRoute==='V201_CANDIDATE');
 for(const id of ['openBtn','cardSheetLink']){assert.match(await p.locator('#'+id).innerText(),/historische kandidaat/);assert.match(await p.locator('#'+id).getAttribute('title'),/niet onafhankelijk geverifieerd/);}
 assert.equal(await p.evaluate(()=>localStorage.getItem('cardscout_collection_v133')),result.bytes);
 const a=p.locator('.collectionCard[data-id="v201-candidate"] a[target="_blank"]');assert.equal(await a.getAttribute('data-cm-route'),'V201_CANDIDATE');assert.match(await a.getAttribute('title'),/minimum/);
});

test('v201 browser sample covers thirteen identities, five conditions and unsupported prints',async t=>{
 const {p}=await setup(t),audit=require('../artifacts/en-cardmarket-audit/v201-primal-clash-candidates.json');
 const samples=['1','2','3','54','93','148','149','151','153','160'].map((number,i)=>({number,condition:['NM','EX','GD','PL','PO'][i%5],variant:'NORMAL',edition:'UNLIMITED',candidate:true}));
 samples.push(...['20','55','86'].map(number=>({number,condition:'NM',candidate:false})),...['REVERSE','HOLO','STAMPED'].map(variant=>({number:'54',variant,condition:'NM',candidate:false})),{number:'148',edition:'1ST',condition:'NM',candidate:false});
 for(const sample of samples){
  const row=audit.cards.find(c=>String(c.number)===sample.number);
  const card={source_id:row.cardId,source_set_id:'xy5',set_name:'Primal Clash',name:row.name,number:row.number,language:'EN',...sample};delete card.candidate;
  const result=await p.evaluate(async card=>{
   const route=await resolveFinalCardmarketRoute(card);
   HoloDexRedesign.open({card,condition:card.condition,edition:card.edition||'AUTO',stamped:card.variant==='STAMPED',cardmarketUrl:route.url});
   return {route,collection:cardscoutCollectionUI.cardmarketLink({...card,sourceId:card.source_id,setName:'Primal Clash'})};
  },card);
  const u=new URL(result.route.url);assert.equal(u.origin,'https://www.cardmarket.com');assert.equal(u.searchParams.get('language'),'1');assert.equal(u.searchParams.get('minCondition'),({NM:'2',EX:'3',GD:'4',PL:'6',PO:'7'})[sample.condition]);assert.equal(u.searchParams.has('idProduct'),false);
  assert.equal(result.collection,result.route.url);assert.equal(result.route.exact,false);
  if(sample.candidate){assert.equal(result.route.kind,'V201_CANDIDATE');assert.equal(u.origin+u.pathname,row.links[0].url);await p.waitForFunction(()=>document.getElementById('cardSheetLink').textContent.includes('historische kandidaat'));assert.match(await p.locator('#cardSheetLink').getAttribute('title'),/niet onafhankelijk geverifieerd/);}
  else {assert.notEqual(result.route.kind,'V201_CANDIDATE');assert.equal(u.pathname,'/en/Pokemon/Products/Search');assert.equal(u.searchParams.get('searchString'),row.name+' '+row.number);}
  assert.equal(await p.locator('#cardSheetLink').getAttribute('href'),result.route.url);
  if(sample.edition==='1ST')assert.equal(u.searchParams.get('isFirstEd'),'Y');
  if(['REVERSE','STAMPED'].includes(sample.variant))assert.equal(u.searchParams.get('isReverseHolo'),'Y');
  await p.locator('#cardSheetClose').click();
 }
});

test('v201 condition changes and Cardmarket clicks retain explicit normal/reverse selection',async t=>{
 const {p,context}=await setup(t);
 // Destination is intercepted: this verifies the outgoing URL, not Cardmarket content.
 await context.route('https://www.cardmarket.com/**',r=>r.fulfill({contentType:'text/html',body:'Local navigation fixture'}));
 for(const variant of ['NORMAL','REVERSE'])for(const [condition,min] of [['NM','2'],['EX','3'],['GD','4'],['PL','6'],['PO','7']]){
  if(condition!=='PO'){await p.locator('[data-choice-target="condSelect"] [data-value="'+condition+'"]:visible').first().click();assert.equal(await p.locator('#condSelect').inputValue(),condition);}else assert.equal(await p.locator('#condSelect option[value="PO"]').count(),0);
  await p.evaluate(({variant,condition})=>{const c={source_id:'xy5-1',source_set_id:'xy5',set_name:'Primal Clash',name:'Weedle',number:'1',language:'EN',variant};HoloDexRedesign.open({card:c,condition:condition==='PO'?condition:document.getElementById('condSelect').value,edition:'UNLIMITED',stamped:false});},{variant,condition});
  await p.waitForFunction(want=>new URL(document.getElementById('cardSheetLink').href).searchParams.get('isReverseHolo')===want,variant==='NORMAL'?'N':'Y');
  const popupPromise=p.waitForEvent('popup');await p.locator('#cardSheetLink').click();const popup=await popupPromise;await popup.waitForLoadState('domcontentloaded');
  const u=new URL(popup.url());assert.equal(u.origin,'https://www.cardmarket.com');assert.equal(u.searchParams.get('minCondition'),min);assert.equal(u.searchParams.get('isReverseHolo'),variant==='NORMAL'?'N':'Y');assert.equal(u.searchParams.get('language'),'1');assert.equal(u.searchParams.get('isFirstEd'),'N');
  assert.equal(u.pathname,variant==='NORMAL'?'/en/Pokemon/Products/Singles/Primal-Clash/Weedle-PRC1':'/en/Pokemon/Products/Search');
  await popup.close();await p.locator('#cardSheetClose').click();
 }
});
