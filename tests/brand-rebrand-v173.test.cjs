'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const {chromium}=require('../scripts/node_modules/playwright'),sharp=require('../scripts/node_modules/sharp');
const baseline='48be5f3c97865fe553800734f1d1279217bf4488',text=f=>fs.readFileSync(f,'utf8'),old=f=>execFileSync('git',['show',baseline+':'+f],{maxBuffer:16*1024*1024});
const collection=JSON.stringify([{uid:'preserved',name:'ピカチュウ',sourceId:'neo1-036',sourceSetId:'neo1',set:'NEO GENESIS',setName:'Neo Genesis',language:'JP',condition:'EX',qty:2,paidEach:null,listType:'OWNED',variant:'NORMAL',addedAt:1700000000000,custom:'保管 🃏'}]);
const data={cardscout_collection_v133:collection,rareworth_cloud_sync_v170:'{"boundUserId":"A","users":{}}',rareworth_device_id_v170:'existing',rareworth_account_enabled_v170:'0',rareworth_guest_session_v171_1:'1',rareworth_onboarding_v171:'guest',whatnotai_mobile_recent_v37:'[]',whatnotai_mobile_favorites_v37:'[{"name":"Bagon"}]'};
test('HoloKeep values, legacy frozen global and no visible brand literals in config',()=>{
  const c={document:{readyState:'loading',addEventListener(){}}};c.window=c;vm.runInNewContext(text('brand-v172.js'),c);
  assert.deepEqual(JSON.parse(JSON.stringify(c.RareWorthBrand)),{name:'HoloKeep',shortName:'HoloKeep',tagline:'Je kaarten. Goed bewaard.',appTitle:'HoloKeep · Zoek. Bewaar. Check.',version:'v176',status:'Beta'});
  assert.ok(Object.isFrozen(c.RareWorthBrand));assert.equal(Object.getOwnPropertyDescriptor(c,'RareWorthBrand').writable,false);
});
test('manifest changes only user-facing names; Apple title and static copy are HoloKeep',()=>{
  const m=JSON.parse(text('manifest.json')),previous=JSON.parse(old('manifest.json'));
  assert.deepEqual(m,{...previous,name:'HoloKeep — Pokémon TCG',short_name:'HoloKeep'});
  assert.match(text('index.html'),/<meta name="apple-mobile-web-app-title" content="HoloKeep"/);
  assert.match(text('index.html'),/<title>HoloKeep · Zoek\. Bewaar\. Check\.<\/title>/);
  assert.doesNotMatch(text('index.html').replace(/icon-rareworth[^" ]*/g,''),/rare\s?worth/i);
});
test('existing production scripts and backend remain exact except reviewed brand presentation',()=>{
  const files=execFileSync('git',['ls-tree','-r','--name-only',baseline],{encoding:'utf8'}).trim().split('\n').filter(f=>/\.js$/.test(f)||f.startsWith('supabase/')).filter(f=>! /^(tests|scripts)\//.test(f)&&!['brand-v172.js','sw.js'].includes(f));
  for(const f of files)assert.equal(require('./rebrand-scope-v173.cjs')(f,text(f).replace(/\r\n?/g,'\n')),old(f).toString().replace(/\r\n?/g,'\n'),f);
});
test('remaining production brand occurrences match technical-only allowlist',()=>{
  const snapshot=require('./brand-support-v172.cjs').productionSnapshot();assert.deepEqual(snapshot,JSON.parse(text('tests/brand-allowlist-v172.json')));
  for(const [file,lines] of Object.entries(snapshot))for(const line of lines){if(file==='pwa-v169.js'&&line.startsWith('/*'))continue;assert.doesNotMatch(line,/\bRareWorth(?![A-Z])/g,file);}
});
test('new SVG contains geometric H, no old R path, no text or external artwork',()=>{
  const svg=text('icon-rareworth.svg'),previous=old('icon-rareworth.svg').toString();assert.match(svg,/id="h-monogram"/);assert.match(svg,/M201 164V324M321 164V324M201 244H321/);
  const r=previous.match(/<path d="([^"]+)"/)[1];assert.ok(!svg.includes(r));assert.doesNotMatch(svg,/<text|<image|<script|href=/i);
});
for(const size of [180,192,512])test(`icon ${size}: correct dimensions, opaque, nonempty and changed from old R`,async()=>{
  const file=`icon-rareworth-${size}.png`,image=sharp(file),meta=await image.metadata(),stats=await image.stats();assert.equal(meta.width,size);assert.equal(meta.height,size);assert.ok(stats.isOpaque);assert.ok(stats.channels.slice(0,3).every(c=>c.stdev>10));assert.ok(!fs.readFileSync(file).equals(old(file)));
});
let browser,server,origin,previous=false;
before(async()=>{
  server=http.createServer((req,res)=>{try{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png'})[file.split('.').pop()]||'application/octet-stream');res.end(previous?old(file):fs.readFileSync(path.resolve(file)));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true});
});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
async function fixture(t,options={}){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',...options});t.after(()=>context.close());
  await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({json:r.request().url().includes('/sets/')?{cards:[]}:{}}));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));return {page,context};
}
async function noOldBrand(page){
  const copy=await page.evaluate(()=>document.body.innerText+'\n'+[...document.querySelectorAll('[aria-label],[alt],[title]')].map(e=>[e.getAttribute('aria-label'),e.getAttribute('alt'),e.getAttribute('title')].filter(Boolean).join(' ')).join('\n'));
  assert.doesNotMatch(copy,/rare\s?worth/i);
}
test('no-JS static fallback cannot flash the old visible name',async t=>{const {page}=await fixture(t,{javaScriptEnabled:false});await page.goto(origin);await noOldBrand(page);assert.equal(await page.locator('#onboardingTitle').innerText(),'Welkom bij HoloKeep');assert.equal(await page.title(),'HoloKeep · Zoek. Bewaar. Check.');});
test('HoloKeep guest session survives reload; fresh context with legacy local state shows gate',async t=>{
  const first=await fixture(t);await first.context.addInitScript(()=>localStorage.setItem('rareworth_onboarding_v171','guest'));await first.page.goto(origin);
  assert.equal(await first.page.locator('#onboardingTitle').innerText(),'Welkom bij HoloKeep');await first.page.locator('#onboardingGuest').click();await first.page.reload();assert.equal(await first.page.locator('#onboarding').isVisible(),false);
  const storage=await first.page.evaluate(()=>({...localStorage})),next=await fixture(t);await next.context.addInitScript(storage=>{for(const [k,v] of Object.entries(storage))localStorage.setItem(k,v);},storage);await next.page.goto(origin);
  assert.equal(await next.page.evaluate(()=>sessionStorage.getItem('rareworth_guest_session_v171_1')),null);assert.equal(await next.page.locator('#onboarding').isVisible(),true);await noOldBrand(next.page);
});
test('valid mocked SDK session skips HoloKeep gate without sending authmail',async t=>{
  const {page,context}=await fixture(t);await context.addInitScript(()=>{
    localStorage.setItem('rareworth_account_enabled_v170','1');const session={user:{id:'fixture-A',email:'fixture@example.test'},access_token:'fixture-token'};
    const client={auth:{getSession:async()=>({data:{session}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signInWithOtp(){throw Error('No authmail allowed');}},rpc:()=>({setHeader:async()=>({data:null})})};
    const append=HTMLHeadElement.prototype.appendChild;HTMLHeadElement.prototype.appendChild=function(node){if(node.tagName==='SCRIPT'&&node.src.includes('@supabase/supabase-js@')){window.supabase={createClient:()=>client};queueMicrotask(()=>node.onload());return node;}return append.call(this,node);};
  });await page.goto(origin);await page.waitForFunction(()=>document.querySelector('#onboarding').hidden);assert.equal(await page.evaluate(()=>RareWorthAccount.getSession().user.id),'fixture-A');assert.equal(await page.locator('.brandText strong').innerText(),'HoloKeep');await noOldBrand(page);
});
test('five screens at 320/375/390/430: consistent HoloKeep, valid icons and screenshots',async t=>{
  const {page}=await fixture(t);await page.goto(origin);
  const parsed=await page.evaluate(async()=>{const source=await (await fetch('icon-rareworth.svg')).text();return new DOMParser().parseFromString(source,'image/svg+xml').querySelector('parsererror')===null;});assert.ok(parsed);
  for(const file of ['icon-rareworth.svg','icon-rareworth-180.png',...JSON.parse(text('manifest.json')).icons.map(i=>i.src)])assert.ok(await page.evaluate(async file=>{const img=new Image();img.src=file;await img.decode();return img.naturalWidth>0;},file));
  const capture=async name=>{if(process.env.HOLOKEEP_SCREENSHOTS){const dir=path.join(os.tmpdir(),'holokeep-v173-smoke');fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,name+'.png'),fullPage:name!=='launch'});}};
  for(const width of [320,375,390,430]){
    await page.setViewportSize({width,height:844});if(await page.locator('#onboarding').isHidden()){await page.locator('#navSettings').click();await page.locator('#onboardingReopen').click();}
    assert.equal(await page.locator('#onboardingTitle').innerText(),'Welkom bij HoloKeep');await noOldBrand(page);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);if(width===390)await capture('launch');await page.locator('#onboardingGuest').click();
    for(const tab of ['search','collection','recent','settings']){await page.locator(`[data-tab="${tab}"]`).click();await noOldBrand(page);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);if(width===390)await capture(tab);}
    assert.match(await page.locator('.aboutCard').innerText(),/Over HoloKeep.*v176 · Beta/s);assert.equal(await page.locator('.brandText strong').innerText(),'HoloKeep');
  }
});
test('actual v172→v174 service-worker update preserves data/session, removes only old app cache and works offline',async t=>{
  previous=true;const {page,context}=await fixture(t);try{
    await page.goto(origin);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await page.locator('#onboardingGuest').click();await page.waitForLoadState('networkidle');
    await page.evaluate(async data=>{for(const [k,v] of Object.entries(data))if(k==='rareworth_guest_session_v171_1')sessionStorage.setItem(k,v);else localStorage.setItem(k,v);await caches.open('unrelated-cache');},data);
    const values=()=>page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,k==='rareworth_guest_session_v171_1'?sessionStorage.getItem(k):localStorage.getItem(k)])),Object.keys(data));assert.deepEqual(await values(),data);
    previous=false;await page.evaluate(async()=>{const changed=new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));await (await navigator.serviceWorker.getRegistration()).update();await changed;});await page.waitForFunction(async()=>{const keys=await caches.keys();return keys.includes('rareworth-shell-v176')&&!keys.includes('rareworth-shell-v172');});
    await page.reload();assert.equal(await page.title(),'HoloKeep · Zoek. Bewaar. Check.');assert.equal(await page.locator('#onboarding').isVisible(),false);assert.deepEqual(await values(),data);
    await context.setOffline(true);await page.reload();await page.locator('#navCollection').click();assert.match(await page.locator('#collectionList').innerText(),/Neo Genesis/);await noOldBrand(page);assert.deepEqual(await values(),data);
    const cache=await page.evaluate(async()=>({keys:await caches.keys(),urls:(await (await caches.open('rareworth-shell-v176')).keys()).map(r=>r.url)}));assert.ok(cache.keys.includes('unrelated-cache'));assert.ok(!cache.keys.includes('rareworth-shell-v172'));assert.ok(cache.urls.every(u=>new URL(u).origin===origin));assert.ok(cache.urls.some(u=>u.includes('brand-v172.js?build=176-market-value-trust')),JSON.stringify(cache));
  }finally{previous=false;}
});
