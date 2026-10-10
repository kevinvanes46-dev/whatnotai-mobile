'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),http=require('node:http'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {chromium}=require('../scripts/node_modules/playwright');
const {productionSnapshot,inventory}=require('./brand-support-v172.cjs');
const code=fs.readFileSync('brand-v172.js','utf8'),baseline='cc5517e97caae8e7ce8bcb04133d54ea73b982af';
function sandbox(existing){
  const nodes={},document={readyState:'complete',querySelectorAll:s=>[nodes[s]??=( {textContent:''})],querySelector:()=>({setAttribute(){}})};
  const context={document};context.window=context;if(existing)context.RareWorthBrand=existing;
  vm.runInNewContext(code,context);return {context,nodes,document};
}
test('brand API exposes exact immutable values and read-only global',()=>{
  const {context}=sandbox(),b=context.RareWorthBrand;
  assert.deepEqual(JSON.parse(JSON.stringify(b)),{name:'HoloKeep',shortName:'HoloKeep',tagline:'Je kaarten. Goed bewaard.',appTitle:'HoloKeep · Zoek. Bewaar. Check.',version:'v176',status:'Beta'});
  assert.ok(Object.isFrozen(b));assert.throws(()=>{b.name='changed';},TypeError);
  assert.equal(Object.getOwnPropertyDescriptor(context,'RareWorthBrand').writable,false);
  assert.equal(Object.getOwnPropertyDescriptor(context,'RareWorthBrand').configurable,false);
});
test('existing brand API is never overwritten',()=>{const existing={sentinel:true};assert.equal(sandbox(existing).context.RareWorthBrand,existing);});
test('dependency-free brand makes no storage/network calls or unrelated global APIs',()=>{
  const {context}=sandbox();assert.deepEqual(Object.keys(context).sort(),['RareWorthBrand','document','window']);
  assert.doesNotMatch(code,/localStorage|sessionStorage|fetch\s*\(|XMLHttpRequest|supabase/i);
});
test('title, topbar, onboarding and About are derived from the config',()=>{
  const {context,nodes,document}=sandbox(),b=context.RareWorthBrand;
  assert.equal(document.title,b.appTitle);assert.equal(nodes['.brandText strong'].textContent,b.name);
  assert.equal(nodes['.brandText small'].textContent,b.tagline);assert.equal(nodes['.onboardingBrand strong'].textContent,b.name);
  assert.equal(nodes['#onboardingTitle'].textContent,`Welkom bij ${b.name}`);assert.equal(nodes['.aboutCard b'].textContent,`Over ${b.name}`);
  assert.equal(nodes['.aboutMeta span'].textContent,`${b.version} · ${b.status}`);
});
test('brand loads first without changing existing script order',()=>{
  const scripts=s=>[...s.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
  const old=execFileSync('git',['show',baseline+':index.html'],{encoding:'utf8'});
  assert.deepEqual(scripts(fs.readFileSync('index.html','utf8')),['brand-v172.js?build=176-market-value-trust',...scripts(old).flatMap(src=>src.startsWith('ui-v137-collection.js?')?['market-v176.js?build=176-market-value-trust','ui-v137-collection.js?build=176-market-value-trust']:/^cardmarket-ui-v156\.js\?/.test(src)?src.split('?')[0]+'?build=174-1-cardmarket-host-hotfix':/^(app-v137|ui-v137-focus|ui-v137-collection)\.js\?/.test(src)?src.split('?')[0]+'?build=175-en-platinum-hgss-coverage':src.startsWith('ui-v150-experience.js?')?'ui-v150-experience.js?build=173-holokeep-rebrand':src)]);
});
test('manifest, storage, auth/backend, artwork and all existing engines are unchanged',()=>{
  const files=execFileSync('git',['ls-tree','-r','--name-only',baseline],{encoding:'utf8'}).trim().split('\n').filter(f=>/\.js$/.test(f)||f==='manifest.json'||f.startsWith('supabase/')).filter(f=>f!=='sw.js'&&! /^(tests|scripts)\//.test(f));
  for(const f of files){const old=execFileSync('git',['show',baseline+':'+f],{encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(require('./rebrand-scope-v173.cjs')(f,fs.readFileSync(f,'utf8').replace(/\r\n?/g,'\n')),old.replace(/\r\n?/g,'\n'),f);}
  const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));assert.equal(manifest.short_name,'HoloKeep');assert.equal(manifest.start_url,'./#search');
});
test('global hardcoded branding matches exact explicit production allowlist',()=>{assert.deepEqual(productionSnapshot(),JSON.parse(fs.readFileSync('tests/brand-allowlist-v172.json','utf8')));});
test('branding inventory covers every matching tracked file and line',()=>{
  const doc=fs.readFileSync('docs/BRAND-V172.md','utf8').replace(/\r\n?/g,'\n');assert.equal(doc.split('|---|---|---|---|\n')[1],inventory()+'\n');
});
let browser,server,origin;
before(async()=>{
  server=http.createServer((req,res)=>{try{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png'})[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(path.resolve(file)));}catch{res.writeHead(404).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true});
});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
async function pageFor(t){
  const context=await browser.newContext({viewport:{width:390,height:844}});t.after(()=>context.close());
  await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({json:r.request().url().includes('/sets/')?{cards:[]}:{}}));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));return {page,context};
}
test('Chromium: visible branding, version and all copy use config without layout changes',async t=>{
  const {page}=await pageFor(t);await page.goto(origin);
  assert.equal(await page.title(),'HoloKeep · Zoek. Bewaar. Check.');assert.equal(await page.locator('.onboardingBrand strong').innerText(),'HoloKeep');assert.equal(await page.locator('#onboardingTitle').innerText(),'Welkom bij HoloKeep');
  await page.locator('#onboardingGuest').click();assert.equal(await page.locator('.brandText strong').innerText(),'HoloKeep');assert.equal(await page.locator('.brandText small').innerText(),'Je kaarten. Goed bewaard.');
  await page.locator('#navSettings').click();assert.match(await page.locator('.aboutCard').innerText(),/Over HoloKeep.*Je kaarten\. Goed bewaard\..*v176 · Beta/s);
});
test('Chromium: changing only config values drives title/topbar/onboarding/About',async t=>{
  const {page,context}=await pageFor(t);
  const fixture=code.replaceAll("'HoloKeep'","'HoloKeep [test]' ").replace("'Je kaarten. Goed bewaard.'","'Fixture tagline'").replace("'HoloKeep · Zoek. Bewaar. Check.'","'Fixture title'").replace("'v176'","'fixture-version'");
  await context.route('**/brand-v172.js?*',r=>r.fulfill({contentType:'text/javascript',body:fixture}));await page.goto(origin);
  assert.equal(await page.title(),'Fixture title');assert.equal(await page.locator('#onboardingTitle').innerText(),'Welkom bij HoloKeep [test]');assert.equal(await page.locator('.onboardingBrand strong').innerText(),'HoloKeep [test]');
  await page.locator('#onboardingGuest').click();assert.equal(await page.locator('.brandText strong').innerText(),'HoloKeep [test]');assert.equal(await page.locator('.brandText small').innerText(),'Fixture tagline');await page.locator('#navSettings').click();assert.match(await page.locator('.aboutCard').innerText(),/Over HoloKeep \[test\].*Fixture tagline.*fixture-version · Beta/s);
});
test('Chromium: fresh guest gate, same-session reload and offline v172 brand precache',async t=>{
  const {page,context}=await pageFor(t);await page.goto(origin);assert.equal(await page.locator('#onboarding').isVisible(),true);
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.locator('#onboardingGuest').click();await page.reload();assert.equal(await page.locator('#onboarding').isVisible(),false);
  await page.evaluate(()=>sessionStorage.clear());
  // Chromium's localhost transport emulation does not reliably change navigator.onLine.
  await context.addInitScript(()=>Object.defineProperty(Navigator.prototype,'onLine',{get:()=>false}));
  await context.setOffline(true);await page.reload();assert.equal(await page.locator('#onboarding').isVisible(),true);assert.equal(await page.locator('#onboardingLogin').isDisabled(),true);
  await page.locator('#onboardingGuest').click();for(const tab of ['search','collection','recent','settings']){await page.locator(`[data-tab="${tab}"]`).click();assert.equal(await page.locator(`[data-view="${tab}"]`).isVisible(),true);}
  assert.match(await page.locator('.aboutMeta').innerText(),/v176 · Beta/);
  const urls=await page.evaluate(async()=> (await (await caches.open('rareworth-shell-v176')).keys()).map(r=>r.url));assert.ok(urls.some(u=>u.endsWith('/brand-v172.js?build=176-market-value-trust')));assert.ok(urls.every(u=>new URL(u).origin===origin));
});
