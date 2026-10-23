'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const {chromium}=require('../scripts/node_modules/playwright');
const {build,serialize}=require('../scripts/cardmarket-public-v186.cjs');
const {serve}=require('../scripts/serve-holodex-official-v188.cjs');
const when=Date.parse('2026-10-23T09:00:00Z');
const card={id:'base1-4',name:'Charizard',localId:'4',set:{id:'base1'},
  variants:{normal:false,holo:true,reverse:false,firstEdition:true},
  pricing:{cardmarket:{idProduct:273699,trend:9000000}}};
function files(day,trend){return serialize(build({version:1,createdAt:'2026-10-21T13:49:03+0200',products:[
  {idProduct:273699,name:'Charizard [Energy Burn | Fire Spin]',categoryName:'Pokémon Single',idExpansion:1523}]},
  {version:1,createdAt:day,priceGuides:[{idProduct:273699,trend}]},{now:when}));}
let browser,http,origin;
before(async()=>{
  http=serve();await new Promise(done=>http.listen(0,'127.0.0.1',done));
  origin='http://127.0.0.1:'+http.address().port;
  browser=await chromium.launch({headless:true});
});
after(async()=>{await browser?.close();if(http)await new Promise(done=>http.close(done));});
async function setup(t,bundle){
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  t.after(()=>context.close());await context.addInitScript(time=>{Date.now=()=>time;},when);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));t.after(()=>assert.deepEqual(errors,[]));
  await page.route('**/cardmarket-public-v186/**',route=>{
    const name=route.request().url().split('/').at(-1),content=bundle.current?.get(name);
    return content?route.fulfill({status:200,contentType:'application/json',body:content}):route.fulfill({status:404,body:'no verified source'});
  });
  await page.route('https://api.tcgdex.net/v2/en/cards/base1-4',route=>route.fulfill({status:200,
    headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:JSON.stringify(card)}));
  // Other external requests are unrelated to this isolated price test.
  await page.route('**/*',route=>new URL(route.request().url()).origin===origin||
    route.request().url().includes('/v2/en/cards/base1-4')?route.fallback():route.abort());
  await page.goto(origin+'/?cardmarketPreview=v188');
  await page.locator('#onboardingGuest').click();
  await page.evaluate(()=>HoloDexRedesign.open({card:{source_id:'base1-4',source_set_id:'base1',
    name:'Charizard',number:'4',set:'Base',language:'EN'},condition:'NM',edition:'AUTO',
    stamped:false,cardmarketUrl:'https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=Charizard'}));
  await page.locator('#cm188').waitFor();
  return page;
}
test('in actual app: no fetch/price/storage before user confirms; missing source fails closed',async t=>{
  const data={current:null},page=await setup(t,data),requests=[];
  page.on('request',r=>requests.push(r.url()));
  assert.equal(await page.locator('#cm188-result').isVisible(),false);
  const old=await page.locator('#cardSheetLink').getAttribute('href');
  await page.locator('#cm188-open').click();
  assert.equal(await page.locator('#cm188-body').isVisible(),true);
  assert.equal(await page.evaluate(()=>localStorage.getItem('holodex_cardmarket_history_v186')),null);
  assert.equal(requests.some(x=>x.includes('cardmarket-public-v186/manifest.json')),false);
  await page.locator('#cm188-edition-confirm').check();await page.locator('#cm188-check').click();
  await page.locator('#cm188-status').filter({hasText:'Geen geverifieerde Cardmarket-prijs'}).waitFor();
  assert.equal(await page.locator('#cm188-result').isVisible(),false);
  assert.equal(await page.locator('#cardSheetLink').getAttribute('href'),old);
  assert.equal(await page.evaluate(()=>localStorage.getItem('holodex_cardmarket_history_v186')),null);
  assert.ok(requests.every(u=>!u.startsWith('https://www.cardmarket.com')&&!u.includes('downloads.s3.cardmarket.com')));
});
test('in actual app: two real guide days give chart, never arbitrary fake history',async t=>{
  const data={current:files('2026-10-21T02:45:11+0200',7)},page=await setup(t,data);
  await page.locator('#cm188-open').click();await page.locator('#cm188-edition-confirm').check();
  await page.locator('#cm188-check').click();await page.locator('#cm188-result').waitFor({state:'visible'});
  assert.match(await page.locator('#cm188-price').innerText(),/7,00/);
  assert.match(await page.locator('#cm188-source').innerText(),/conditie en taal niet verwerkt/);
  assert.match(await page.locator('#cm188-chart-status').innerText(),/Nog geen twee/);
  await page.locator('#cm188-capture').click();
  data.current=files('2026-10-22T02:45:11+0200',8);
  await page.locator('#cm188-check').click();await page.locator('#cm188-price').filter({hasText:'8,00'}).waitFor();
  await page.locator('#cm188-capture').click();
  assert.match(await page.locator('#cm188-chart-status').innerText(),/2 echte meetpunten/);
  assert.equal(await page.locator('#cm188-chart circle[role="button"]').count(),2);
  for(const width of [320,375,390,430]){
    await page.setViewportSize({width,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth)<=width,'overflow '+width);
  }
  const keys=await page.evaluate(()=>Object.keys(localStorage));
  assert.ok(keys.includes('holodex_cardmarket_history_v186'));
});
test('known stamped and first edition selections cannot start verification',async t=>{
  const page=await setup(t,{current:null});
  await page.evaluate(()=>HoloDexRedesign.open({card:{source_id:'base1-4',source_set_id:'base1',
    name:'Charizard',number:'4',set:'Base',language:'EN'},condition:'NM',edition:'1ST',stamped:true}));
  await page.locator('#cm188-open').waitFor();
  assert.equal(await page.locator('#cm188-open').isDisabled(),true);
  assert.equal(await page.locator('#cm188-body').isVisible(),false);
});
