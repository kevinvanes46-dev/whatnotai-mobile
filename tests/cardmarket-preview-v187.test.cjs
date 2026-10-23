'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('../scripts/node_modules/playwright');
const {build,serialize}=require('../scripts/cardmarket-public-v186.cjs');
const {server}=require('../scripts/serve-cardmarket-preview-v187.cjs');

const when=Date.parse('2026-10-23T09:00:00Z');
const card={id:'base1-4',name:'Charizard',localId:'4',set:{id:'base1'},
  variants:{normal:false,holo:true,reverse:false,firstEdition:true},
  pricing:{cardmarket:{idProduct:273699,trend:90000000,'trend-holo':90000000}}};
function files(day='2026-10-22T02:45:11+0200',trend=7){
  return serialize(build({version:1,createdAt:'2026-10-21T13:49:03+0200',products:[
    {idProduct:273699,name:'Charizard [Energy Burn | Fire Spin]',categoryName:'Pokémon Single',idExpansion:1523}]},
    {version:1,createdAt:day,priceGuides:[{idProduct:273699,trend,'trend-holo':99999}]},{now:when}));
}
let browser,http,origin;
before(async()=>{
  http=server();await new Promise(resolve=>http.listen(0,'127.0.0.1',resolve));
  origin='http://127.0.0.1:'+http.address().port;
  browser=await chromium.launch({headless:true});
});
after(async()=>{await browser?.close();if(http)await new Promise(resolve=>http.close(resolve));});
async function pageFor(t){
  const context=await browser.newContext({viewport:{width:320,height:780},hasTouch:true,isMobile:true});
  t.after(()=>context.close());
  await context.addInitScript(time=>{Date.now=()=>time;},when);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
  return page;
}
async function mockSource(page,bundle){
  await page.route('**/cardmarket-public-v186/**',route=>{
    const name=route.request().url().split('/').at(-1),raw=bundle.current?.get(name);
    if(raw===undefined)return route.fulfill({status:404,body:'missing'});
    return route.fulfill({status:200,contentType:'application/json',body:raw});
  });
  await page.route('https://api.tcgdex.net/v2/en/cards/**',route=>route.fulfill({status:200,
    headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:JSON.stringify(card)}));
}
test('Chromium 320px: no source gives no price, no history and no external Cardmarket request',async t=>{
  const page=await pageFor(t),bundle={current:null};await mockSource(page,bundle);
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.goto(origin+'/cardmarket-preview-v187.html');
  await page.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('GEEN KAART GEKOZEN'));
  await page.locator('#card-id').fill('base1-4');await page.locator('#edition-confirm').check();
  await page.locator('#lookup-button').click();
  await page.locator('#status').filter({hasText:'Geen geverifieerde Cardmarket-prijs'}).waitFor();
  assert.equal(await page.locator('#result').isHidden(),true);
  assert.equal(await page.locator('#capture').isDisabled(),true);
  assert.equal(await page.evaluate(()=>localStorage.getItem('holodex_cardmarket_history_v186')),null);
  assert.ok(requests.every(u=>!u.startsWith('https://www.cardmarket.com')&&!u.startsWith('https://downloads.s3.cardmarket.com')));
});
test('Chromium: verified price then two explicit real days produce keyboard-accessible graph',async t=>{
  const page=await pageFor(t),bundle={current:files('2026-10-21T02:45:11+0200',7)};
  await mockSource(page,bundle);await page.goto(origin+'/cardmarket-preview-v187.html');
  await page.waitForFunction(()=>document.getElementById('status')?.textContent?.includes('GEEN KAART GEKOZEN'));
  await page.locator('#card-id').fill('base1-4');await page.locator('#qty').fill('2');
  await page.locator('#edition-confirm').check();
  await page.locator('#lookup-button').click();await page.locator('#result').waitFor({state:'visible'});
  assert.match(await page.locator('#price').innerText(),/7,00/);
  assert.match(await page.locator('#source').innerText(),/conditie en taal niet verwerkt/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('holodex_cardmarket_history_v186')),null);
  await page.locator('#capture').click();assert.match(await page.locator('#chart-status').innerText(),/Nog geen twee/);
  bundle.current=files('2026-10-22T02:45:11+0200',8);
  await page.locator('#lookup-button').click();await page.locator('#result').waitFor({state:'visible'});
  await page.locator('#capture').click();
  assert.match(await page.locator('#chart-status').innerText(),/2 echte meetpunten/);
  assert.equal(await page.locator('#chart circle[role="button"]').count(),2);
  await page.locator('#chart circle[role="button"]').last().focus();await page.keyboard.press('Home');
  assert.match(await page.locator('#chart-detail').innerText(),/14,00/);
  await page.keyboard.press('End');assert.match(await page.locator('#chart-detail').innerText(),/16,00/);
  await page.locator('#chart circle[role="button"]').first().tap();
  assert.match(await page.locator('#chart-detail').innerText(),/14,00/);
  await page.locator('[data-range="1W"]').click();assert.equal(await page.locator('[data-range="1W"]').getAttribute('aria-pressed'),'true');
  for(const width of [320,375,390,430]){
    await page.setViewportSize({width,height:780});
    const w=await page.evaluate(()=>document.documentElement.scrollWidth);
    assert.ok(w<=width,'no '+width+'px horizontal overflow');
  }
});
