'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('../scripts/node_modules/playwright');
let browser,server,origin;
const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=','base64');
before(async()=>{
  server=http.createServer((req,res)=>{try{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png'})[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(file)));}catch{res.writeHead(404).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true,args:['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1']});
});
after(async()=>{await browser?.close();if(server)await new Promise(r=>server.close(r));});
async function fixture(t,{storage={},width=390,offline=false,session=false,sdkPending=false}={}){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});t.after(()=>context.close());
  const requests=[],errors=[];
  await context.route('**/*',r=>{
    const u=new URL(r.request().url());requests.push(u.href);
    if(u.origin===origin)return r.continue();
    if(r.request().resourceType()==='image')return r.fulfill({contentType:'image/png',body:pixel});
    if(u.hostname==='api.tcgdex.net'){
      const p=u.pathname.split('/'),id=p.at(-1),f=`tests/fixtures/jp-sets-v160/${id}.json`;
      if(p[2]==='ja'&&p[3]==='sets'&&fs.existsSync(f))return r.fulfill({json:JSON.parse(fs.readFileSync(f))});
      if(p[2]==='en'&&p[3]==='cards'&&id==='ex15-43')return r.fulfill({json:{id,name:'Bagon',localId:'43',image:'https://assets.tcgdex.net/en/ex/ex15/43'}});
      return r.fulfill({json:p[3]==='sets'?{cards:[]}:{}});
    }
    return r.abort();
  });
  await context.addInitScript(({storage,offline,session,sdkPending})=>{
    for(const [key,value] of Object.entries(storage))if(localStorage.getItem(key)===null)localStorage.setItem(key,value);
    if(offline)Object.defineProperty(Navigator.prototype,'onLine',{get:()=>false});
    let current=session?{user:{id:'test-A',email:'user@example.test'},access_token:'fixture-token'}:null,notify;
    window.authCalls=[];
    const auth={getSession:async()=>({data:{session:current}}),onAuthStateChange:fn=>(notify=fn,{data:{subscription:{unsubscribe(){}}}}),
      signInWithOtp:async args=>{window.authCalls.push({type:'otp',args});current={user:{id:'test-A',email:args.email},access_token:'fixture-token'};notify('SIGNED_IN',current);return {};},
      signOut:async()=>{current=null;notify('SIGNED_OUT',null);return {};}};
    const append=HTMLHeadElement.prototype.appendChild;
    HTMLHeadElement.prototype.appendChild=function(node){
      if(node.tagName==='SCRIPT'&&node.src.includes('@supabase/supabase-js@')){
        if(sdkPending){window.failSdk=()=>node.onerror();return node;}
        window.authCalls.push({type:'sdk'});window.supabase={createClient:()=>({auth,rpc:name=>({setHeader:async()=>{window.authCalls.push({type:'rpc',name});return {data:null};}})})};queueMicrotask(()=>node.onload());return node;
      }return append.call(this,node);
    };
  },{storage,offline,session,sdkPending});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));
  await page.goto(origin);await page.waitForFunction(()=>!!window.RareWorthAccount);
  return {context,page,requests,errors};
}
const collection=JSON.stringify([{uid:'existing',name:'ピカチュウ',sourceId:'neo1-036',sourceSetId:'neo1',set:'NEO GENESIS',setName:'Neo Genesis',language:'JP',condition:'EX',qty:2,listType:'OWNED',variant:'NORMAL',paidEach:null,addedAt:1700000000000,future:{value:'保管 🃏'}}]);
test('new visitor sees onboarding; guest alone persists a preference and opens unchanged local app',async t=>{
  const {page}=await fixture(t,{storage:{cardscout_collection_v133:collection,whatnotai_mobile_favorites_v37:'[]'}});
  assert.equal(await page.locator('#onboarding').isVisible(),true);assert.equal(await page.locator('.appShell').evaluate(el=>el.inert),true);
  await page.locator('#onboardingGuest').click();assert.equal(await page.locator('#onboarding').isVisible(),false);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('rareworth_guest_session_v171_1')),'1');
  assert.equal(await page.evaluate(()=>localStorage.getItem('rareworth_onboarding_v171')),null);
  for(const key of ['rareworth_cloud_sync_v170','rareworth_account_enabled_v170','rareworth_device_id_v170'])assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),null);
  assert.equal(await page.evaluate(()=>localStorage.getItem('cardscout_collection_v133')),collection);assert.deepEqual(await page.evaluate(()=>authCalls),[]);
  await page.reload();assert.equal(await page.locator('#onboarding').isVisible(),false);
  await page.locator('#navCollection').click();assert.match(await page.locator('#collectionList').innerText(),/Neo Genesis/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('cardscout_collection_v133')),collection);
  assert.equal(await page.locator('#favoriteBtn').isVisible(),false);assert.equal(await page.locator('[data-view="scan"]').isVisible(),false);
  assert.equal(await page.evaluate(()=>localStorage.getItem('whatnotai_mobile_favorites_v37')),'[]');
});
test('login choice moves the existing form, back restores it, and existing Auth success closes onboarding',async t=>{
  const {page}=await fixture(t,{storage:{cardscout_collection_v133:collection}});
  await page.locator('#onboardingLogin').click();assert.equal(await page.locator('#onboardingAuth #accountForm').count(),1);
  assert.equal(await page.locator('#accountForm').count(),1);await page.locator('#onboardingBack').click();assert.equal(await page.locator('#accountCard #accountForm').count(),1);
  await page.locator('#onboardingLogin').click();await page.locator('#accountEmailInput').fill('user@example.test');await page.locator('#accountSend').click();
  await page.waitForFunction(()=>document.querySelector('#onboarding').hidden);
  assert.equal(await page.locator('#accountCard #accountForm').count(),1);assert.equal(await page.evaluate(()=>RareWorthAccount.getSession().user.email),'user@example.test');
  assert.equal(await page.evaluate(()=>authCalls.filter(x=>x.type==='otp').length),1);
  assert.equal(await page.evaluate(()=>authCalls.find(x=>x.type==='otp').args.options.emailRedirectTo),origin+'/');
  assert.equal(await page.evaluate(()=>localStorage.getItem('cardscout_collection_v133')),collection);
  assert.equal(await page.evaluate(()=>localStorage.getItem('rareworth_cloud_sync_v170')),null);
});
test('valid existing SDK session skips onboarding; reopening does not sign out or erase data',async t=>{
  const {page}=await fixture(t,{session:true,storage:{rareworth_account_enabled_v170:'1',cardscout_collection_v133:collection}});
  await page.waitForFunction(()=>document.querySelector('#onboarding').hidden);
  await page.locator('#navSettings').click();await page.locator('#onboardingReopen').click();assert.equal(await page.locator('#onboarding').isVisible(),true);
  assert.equal(await page.evaluate(()=>RareWorthAccount.getSession().user.id),'test-A');
  await page.locator('#onboardingGuest').click();assert.equal(await page.evaluate(()=>RareWorthAccount.getSession().user.id),'test-A');
  assert.equal(await page.evaluate(()=>localStorage.getItem('cardscout_collection_v133')),collection);
});
test('reopen guest onboarding preserves confirmed sync metadata, favorites and collection',async t=>{
  const state={rareworth_onboarding_v171:'guest',cardscout_collection_v133:collection,rareworth_cloud_sync_v170:'{"boundUserId":"test-A","users":{}}',whatnotai_mobile_favorites_v37:'[{"name":"Bagon"}]'};
  const {page}=await fixture(t,{storage:state});await page.locator('#onboardingGuest').click();await page.locator('#navSettings').click();await page.locator('#onboardingReopen').click();await page.locator('#onboardingGuest').click();
  assert.deepEqual(await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(state)),state);
});
test('guest can leave a pending SDK session check; a late SDK failure never reopens onboarding',async t=>{
  const {page}=await fixture(t,{sdkPending:true,storage:{rareworth_account_enabled_v170:'1',cardscout_collection_v133:collection}});
  await page.locator('#onboardingSkip').click();assert.equal(await page.locator('#onboarding').isVisible(),false);
  await page.evaluate(()=>window.failSdk());await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,0)));
  assert.equal(await page.locator('#onboarding').isVisible(),false);assert.equal(await page.evaluate(()=>localStorage.getItem('cardscout_collection_v133')),collection);
});
for(const width of [320,375,390,430])test(`onboarding ${width}px: fits viewport, thumb targets, focus trap and compact login`,async t=>{
  const {page}=await fixture(t,{width});
  for(const login of [false,true]){
    if(login)await page.locator('#onboardingLogin').click();
    const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('#onboarding button')].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.left>=0&&r.right<=innerWidth;})}));
    assert.equal(layout.overflow,false);assert.ok(layout.buttons.length);assert.ok(layout.buttons.every(Boolean));
  }
  await page.locator('#onboardingBack').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('#accountEmailInput').evaluate(e=>e===document.activeElement),true);
});
test('offline first run from cached v171 shell allows guest and preserves all four local tabs',async t=>{
  const {page,context}=await fixture(t,{storage:{cardscout_collection_v133:collection}});
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await context.addInitScript(()=>Object.defineProperty(Navigator.prototype,'onLine',{get:()=>false}));await context.setOffline(true);await page.reload();
  assert.equal(await page.locator('#onboarding').isVisible(),true);assert.equal(await page.locator('#onboardingLogin').isDisabled(),true);
  assert.match(await page.locator('#onboardingOffline').textContent(),/Internetverbinding nodig om in te loggen/);
  await page.locator('#onboardingGuest').click();
  for(const tab of ['search','collection','recent','settings']){await page.locator(`[data-tab="${tab}"]`).click();assert.equal(await page.locator(`[data-view="${tab}"]`).isVisible(),true);}
  assert.equal(await page.evaluate(()=>localStorage.getItem('cardscout_collection_v133')),collection);
  const cached=await page.evaluate(async()=>({keys:await caches.keys(),urls:(await (await caches.open('rareworth-shell-v171-1')).keys()).map(r=>r.url)}));
  assert.ok(cached.keys.includes('rareworth-shell-v171-1'));assert.ok(cached.urls.every(u=>u.startsWith(origin)));assert.ok(cached.urls.some(u=>u.includes('onboarding-v171.js')));
});
test('product labels, functional search hero, idle-only hiding and settings groups',async t=>{
  const {page}=await fixture(t);await page.locator('#onboardingGuest').click();
  assert.deepEqual(await page.locator('.bottomNav button span').allTextContents(),['Zoeken','Collectie','Recent','Instellingen']);
  assert.equal(await page.locator('[data-view="search"] > .screenIntro h2').textContent(),'Vind je kaart.');
  assert.equal(await page.getByText('Jouw volgende vondst.',{exact:true}).count(),0);
  await page.evaluate(()=>document.querySelector('#status').textContent='Klaar');await page.waitForFunction(()=>getComputedStyle(document.querySelector('#status')).visibility==='hidden');
  for(const text of ['Laden…','Fout bij laden','Opgeslagen']){await page.evaluate(text=>document.querySelector('#status').textContent=text,text);await page.waitForFunction(()=>getComputedStyle(document.querySelector('#status')).visibility!=='hidden');assert.equal(await page.locator('#status').textContent(),text);}
  await page.locator('#navSettings').click();assert.equal(await page.locator('[data-view="settings"] h2').textContent(),'Instellingen');
  assert.equal(await page.locator('#accountCard').isVisible(),true);assert.equal(await page.locator('#collectionExportBtn').isVisible(),true);
});
test('home Recent alone deduplicates to four, query tiles stay compact, external JP art is replaced but selected art works',async t=>{
  const query={kind:'query',name:'Flareon',quick:'Flareon',language:'EN',set:'AUTO'};
  const jp={kind:'card',name:'Swinub',source_id:'neo3-038',source_set_id:'neo3',set:'NEO REVELATION',set_name:'Awakening Legends',language:'JP',number:'038'};
  const en={kind:'card',name:'Bagon',source_id:'ex15-43',set:'EX DRAGON FRONTIERS',number:'43',language:'EN',image:'https://assets.tcgdex.net/en/ex/ex15/43'};
  const rows=[query,{...query,name:'flareon',quick:'flareon'},jp,en,{...query,name:'Eevee',quick:'Eevee'},{...query,name:'Pikachu',quick:'Pikachu'}],raw=JSON.stringify(rows);
  const {page}=await fixture(t,{storage:{whatnotai_mobile_recent_v37:raw}});await page.locator('#onboardingGuest').click();
  await page.waitForFunction(()=>document.querySelectorAll('#homeRecentCards .recentCard').length===4);
  assert.equal(await page.locator('#homeRecentCards .recentQuery').count(),2);
  assert.ok(await page.locator('#homeRecentCards .recentQuery .recentArt').first().evaluate(e=>e.getBoundingClientRect().height<=40));
  assert.ok(await page.locator('#homeRecentCards .recentQuery').first().evaluate(e=>e.getBoundingClientRect().height<100));
  await page.waitForFunction(()=>document.querySelector('#homeRecentCards .homeJpPlaceholder')?.textContent.includes('JP'));
  assert.equal(await page.locator('#homeRecentCards img[src*="artofpkm"]').count(),0);
  await page.waitForFunction(()=>{const img=document.querySelector('#homeRecentCards img[src*="tcgdex"]');return img?.complete&&img.naturalWidth>0;});
  assert.equal(await page.evaluate(()=>localStorage.getItem('whatnotai_mobile_recent_v37')),raw);
  await page.locator('#homeRecentCards .recentCard').filter({hasText:'Swinub'}).click();
  await page.waitForFunction(()=>{const img=document.querySelector('#selectedCardArt img');return img?.src.includes('artofpkm')&&img.complete&&img.naturalWidth>0;});
  assert.equal(await page.locator('#selectedCardArt').getAttribute('data-image-status'),'EXTERNAL_BETA');
});
