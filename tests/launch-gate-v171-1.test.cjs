'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('../scripts/node_modules/playwright');
let browser,server,origin;
const guestKey='rareworth_guest_session_v171_1';
const collection=JSON.stringify([{uid:'existing',name:'ピカチュウ',sourceId:'neo1-036',sourceSetId:'neo1',set:'NEO GENESIS',setName:'Neo Genesis',language:'JP',condition:'EX',qty:3,listType:'OWNED',variant:'NORMAL',paidEach:12.5,paidPrice:37.5,addedAt:1700000000000,future:{value:'保管 🃏'}}]);
const data={cardscout_collection_v133:collection,rareworth_cloud_sync_v170:'{"boundUserId":"A","users":{}}',rareworth_device_id_v170:'existing-device',whatnotai_mobile_recent_v37:'[{"kind":"query","name":"Pikachu","quick":"Pikachu"}]',whatnotai_mobile_favorites_v37:'[{"name":"Bagon"}]',rareworth_onboarding_v171:'guest'};
before(async()=>{
  server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(f)));}catch{res.writeHead(404).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,args:['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1']});
});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
async function fixture(t,{storage=data,guest=false,auth='none',pending=false,callback=false,offline=false}={}){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});t.after(()=>context.close());
  await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({json:r.request().url().includes('/sets/')?{cards:[]}:{}}));
  await context.addInitScript(({storage,guest,auth,pending,offline,guestKey})=>{
    for(const [k,v] of Object.entries(storage))if(localStorage.getItem(k)===null)localStorage.setItem(k,v);
    if(guest)sessionStorage.setItem(guestKey,'1');
    if(offline)Object.defineProperty(Navigator.prototype,'onLine',{get:()=>false});
    let session=auth==='valid'&&localStorage.getItem('fixture-auth-state')!=='out'?{user:{id:'A',email:'a@example.test'},access_token:'fixture-token'}:null,listener;
    window.sdkLoads=0;window.rpcNames=[];
    const client={auth:{getSession:async()=>({data:{session}}),onAuthStateChange:fn=>(listener=fn,{data:{subscription:{unsubscribe(){}}}}),signInWithOtp:()=>{throw Error('No mail');},signOut:async()=>{session=null;localStorage.setItem('fixture-auth-state','out');listener('SIGNED_OUT',null);return {};}},rpc:name=>({setHeader:async()=>{window.rpcNames.push(name);return {data:null};}})};
    const append=HTMLHeadElement.prototype.appendChild;
    HTMLHeadElement.prototype.appendChild=function(node){if(node.tagName==='SCRIPT'&&node.src.includes('@supabase/supabase-js@')){
      window.sdkLoads++;window.releaseSDK=()=>{window.supabase={createClient:()=>client};node.onload();};window.rejectSDK=()=>node.onerror();
      if(!pending)queueMicrotask(window.releaseSDK);return node;
    }return append.call(this,node);};
  },{storage,guest,auth,pending,offline,guestKey});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
  await page.goto(origin+(callback?'/?code=fixture-code':''));return {page,context};
}
const preserved=page=>page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(data));
test('A: legacy permanent guest no longer suppresses launch gate and is not deleted',async t=>{
  const {page}=await fixture(t);assert.equal(await page.locator('#onboarding').isVisible(),true);assert.equal(await page.evaluate(k=>sessionStorage.getItem(k),guestKey),null);
  assert.equal(await page.evaluate(()=>sdkLoads),0);assert.deepEqual(await preserved(page),data);
});
test('B/C: guest writes only session flag, preserves all local data and survives same-tab reload',async t=>{
  const {page}=await fixture(t);
  // Keep snapshots in the same event turn so unrelated catalog fetches cannot intervene.
  const {before,after}=await page.evaluate(()=>{const before={...localStorage};document.querySelector('#onboardingGuest').click();return {before,after:{...localStorage}};});
  assert.equal(await page.locator('#onboarding').isVisible(),false);assert.equal(await page.evaluate(k=>sessionStorage.getItem(k),guestKey),'1');assert.deepEqual(after,before);
  await page.reload();assert.equal(await page.locator('#onboarding').isVisible(),false);assert.deepEqual(await preserved(page),data);assert.equal(await page.evaluate(()=>sdkLoads),0);
});
test('D: new browser context restores identical localStorage but has no guest session and shows gate',async t=>{
  const first=await fixture(t);await first.page.locator('#onboardingGuest').click();const storage=await first.page.evaluate(()=>({...localStorage}));await first.context.close();
  const next=await fixture(t,{storage});assert.equal(await next.page.evaluate(k=>sessionStorage.getItem(k),guestKey),null);assert.equal(await next.page.locator('#onboarding').isVisible(),true);assert.deepEqual(await preserved(next.page),data);
});
test('E: valid SDK session skips launch gate without needing a guest flag',async t=>{
  const {page}=await fixture(t,{auth:'valid',storage:{...data,rareworth_account_enabled_v170:'1'}});await page.waitForFunction(()=>document.querySelector('#onboarding').hidden);
  assert.equal(await page.evaluate(()=>RareWorthAccount.getSession().user.id),'A');assert.equal(await page.evaluate(k=>sessionStorage.getItem(k),guestKey),null);assert.deepEqual(await preserved(page),data);
});
test('F: callback/session validation takes priority over guest flag; existing SDK completes callback',async t=>{
  const {page}=await fixture(t,{guest:true,auth:'valid',pending:true,callback:true});
  assert.equal(await page.locator('#onboardingLoading').isVisible(),true);assert.equal(await page.locator('.appShell').evaluate(e=>e.inert),true);
  await page.evaluate(()=>releaseSDK());await page.waitForFunction(()=>document.querySelector('#onboarding').hidden);
  assert.equal(await page.evaluate(()=>RareWorthAccount.getSession().user.id),'A');assert.equal(await page.evaluate(()=>sdkLoads),1);assert.deepEqual(await preserved(page),data);
});
test('validated signed-out session falls back to the current guest flag, not the legacy preference',async t=>{
  for(const guest of [false,true]){
    const {page}=await fixture(t,{guest,pending:true,storage:{...data,rareworth_account_enabled_v170:'1'}});assert.equal(await page.locator('#onboardingLoading').isVisible(),true);
    await page.evaluate(()=>releaseSDK());await page.waitForFunction(()=>document.querySelector('#onboardingLoading').hidden||document.querySelector('#onboarding').hidden);
    assert.equal(await page.locator('#onboarding').isVisible(),!guest);assert.deepEqual(await preserved(page),data);
  }
});
test('failed SDK resume honors session guest without manufacturing permanent guest state',async t=>{
  const {page}=await fixture(t,{guest:true,pending:true,storage:{...data,rareworth_account_enabled_v170:'1'}});await page.evaluate(()=>rejectSDK());await page.waitForFunction(()=>document.querySelector('#onboarding').hidden);assert.deepEqual(await preserved(page),data);
});
test('G/H: cached offline new session ignores legacy guest, permits offline guest and keeps data exact',async t=>{
  const {page,context}=await fixture(t);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await context.addInitScript(()=>Object.defineProperty(Navigator.prototype,'onLine',{get:()=>false}));await context.setOffline(true);await page.reload();
  assert.equal(await page.locator('#onboarding').isVisible(),true);assert.equal(await page.locator('#onboardingLogin').isDisabled(),true);assert.match(await page.locator('#onboardingOffline').innerText(),/Internetverbinding nodig/);
  await page.locator('#onboardingGuest').click();await page.reload();assert.equal(await page.locator('#onboarding').isVisible(),false);
  for(const tab of ['search','collection','recent','settings']){await page.locator(`[data-tab="${tab}"]`).click();assert.equal(await page.locator(`[data-view="${tab}"]`).isVisible(),true);}
  assert.deepEqual(await preserved(page),data);const urls=await page.evaluate(async()=> (await (await caches.open('rareworth-shell-v173')).keys()).map(r=>r.url));assert.ok(urls.some(u=>u.includes('onboarding-v171.js?build=171-1-launch-gate')));assert.ok(urls.every(u=>u.startsWith(origin)));assert.equal(await page.evaluate(()=>sdkLoads),0);
});
test('I: logout never pops gate over current action, keeps collection and grants only current-session guest',async t=>{
  const {page,context}=await fixture(t,{auth:'valid',storage:{...data,rareworth_account_enabled_v170:'1'}});await page.waitForFunction(()=>document.querySelector('#onboarding').hidden);await page.locator('#navSettings').click();await page.locator('#accountSignOut').click();
  await page.waitForFunction(()=>document.querySelector('#accountCard').dataset.state==='SIGNED_OUT');assert.equal(await page.locator('#onboarding').isVisible(),false);assert.equal(await page.evaluate(k=>sessionStorage.getItem(k),guestKey),'1');assert.deepEqual(await preserved(page),data);
  await page.reload();await page.waitForFunction(()=>document.querySelector('#onboarding').hidden);const storage=await page.evaluate(()=>({...localStorage}));await context.close();
  const next=await fixture(t,{storage});await next.page.locator('#onboardingGuest').waitFor();assert.equal(await next.page.locator('#onboarding').isVisible(),true);assert.deepEqual(await preserved(next.page),data);
});
test('J: settings reopen ignores active guest flag without deleting it or local/cloud data',async t=>{
  const {page}=await fixture(t,{guest:true});await page.locator('#navSettings').click();await page.locator('#onboardingReopen').click();assert.equal(await page.locator('#onboarding').isVisible(),true);assert.equal(await page.evaluate(k=>sessionStorage.getItem(k),guestKey),'1');await page.locator('#onboardingGuest').click();assert.deepEqual(await preserved(page),data);
});
test('launch copy and mobile safe-area/44px controls at 320/375/390/430',async t=>{
  const {page}=await fixture(t);assert.equal(await page.locator('#onboardingTitle').innerText(),'Welkom bij HoloKeep');assert.equal(await page.locator('.onboardingEyebrow').innerText(),'POKÉMON TCG COLLECTIE');assert.equal(await page.locator('#onboardingLogin').innerText(),'Inloggen / account maken');
  for(const width of [320,375,390,430]){await page.setViewportSize({width,height:844});const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('#onboardingChoices button')].map(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;})}));assert.equal(layout.overflow,false);assert.ok(layout.buttons.every(Boolean));}
});
