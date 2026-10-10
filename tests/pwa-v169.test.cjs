'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {chromium}=require('../scripts/node_modules/playwright');
require('./guest-context-v171.cjs')(chromium);
const html=fs.readFileSync('index.html','utf8'),worker=fs.readFileSync('sw.js','utf8');
const registration=fs.readFileSync('pwa-v169.js','utf8');
const base='e4369f65646c6f547a21bc304891313916a83f8e';
const scope='https://example.test/whatnotai-mobile/';
function workerContext(extra={}) {
  const handlers={};
  const context={URL,Request,Set,self:{registration:{scope},addEventListener:(name,fn)=>handlers[name]=fn},...extra};
  vm.runInNewContext(worker,context);
  return {handlers,self:context.self,assets:vm.runInNewContext('ASSETS',context)};
}

test('v169 manifest, real icon dimensions, shell coverage and unchanged engine/order',()=>{
  const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));
  assert.equal(manifest.name,'HoloKeep — Pokémon TCG');assert.equal(manifest.short_name,'HoloKeep');
  for(const [k,v] of Object.entries({start_url:'./#search',scope:'./',display:'standalone',orientation:'portrait-primary',lang:'nl'}))assert.equal(manifest[k],v);
  for(const size of [180,192,512]){
    const png=fs.readFileSync(`icon-rareworth-${size}.png`);
    assert.equal(png.subarray(1,4).toString(),'PNG');
    assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[size,size]);
    if(size!==180)assert.ok(manifest.icons.some(icon=>icon.src===`icon-rareworth-${size}.png`&&icon.sizes===`${size}x${size}`&&!icon.purpose));
  }
  const old=execFileSync('git',['show',base+':index.html'],{encoding:'utf8'});
  const scripts=text=>[...text.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(scripts(html),['brand-v172.js?build=176-market-value-trust',...scripts(old).flatMap(src=>src.startsWith('ui-v137-collection.js?')?['market-v176.js?build=176-market-value-trust','ui-v137-collection.js?build=176-market-value-trust']:/^cardmarket-ui-v156\.js\?/.test(src)?src.split('?')[0]+'?build=174-1-cardmarket-host-hotfix':/^(app-v137|ui-v137-focus|ui-v137-collection)\.js\?/.test(src)?src.split('?')[0]+'?build=175-en-platinum-hgss-coverage':src.startsWith('app-v137.js?')?'app-v137.js?build=169-pwa-foundation':src.startsWith('ui-v150-experience.js?')?'ui-v150-experience.js?build=173-holokeep-rebrand':src),'cloud-sync-v170.js?build=170b-account-cloud-sync','supabase-config-v170.js?build=170b-account-cloud-sync','supabase-client-v170.js?build=170b-account-cloud-sync','cloud-adapter-v170.js?build=170b-account-cloud-sync','account-ui-v170.js?build=170b-account-cloud-sync','onboarding-v171.js?build=171-1-launch-gate','pwa-v169.js?build=169-pwa-foundation']);
  const assets=new Set(workerContext().assets);
  for(const asset of [...scripts(html),...[...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map(m=>m[1]),...manifest.icons.map(i=>i.src)]){
    assert.ok(assets.has(asset),`Missing precache: ${asset}`);
    assert.ok(fs.existsSync(asset.split('?')[0]),asset);
  }
  assert.deepEqual([...html.matchAll(/data-tab="([^"]+)"/g)].map(m=>m[1]),['search','collection','recent','settings']);
  for(const name of ['apple-mobile-web-app-capable','apple-mobile-web-app-status-bar-style','apple-mobile-web-app-title']){
    const pattern=new RegExp(`<meta name="${name}"[^>]+>`);
    assert.equal(html.match(pattern)?.[0],old.match(pattern)?.[0].replace('RareWorth','HoloKeep'));
  }
  assert.doesNotMatch(worker,/unregister\s*\(/);
  assert.match(worker,/rareworth-shell-v176/);
  assert.doesNotMatch(worker+registration,/localStorage|sessionStorage/);
  // Byte comparison, except checkout line endings; protect every existing production script.
  for(const src of scripts(old)){
    const file=src.split('?')[0];
    let before=execFileSync('git',['show',base+':'+file],{encoding:'utf8',maxBuffer:16*1024*1024}).replace(/\r\n?/g,'\n');
    // The only permitted engine-file change removes the obsolete SW cleanup helper/call.
    if(file==='app-v137.js')before=before.replace(/async function unregisterOldServiceWorkers\(\)\{[\s\S]*?\n\}\n/,'').replace('unregisterOldServiceWorkers();\n','');
    let current=require('./rebrand-scope-v173.cjs')(file,fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n'));
    if(file==='ui-v150-experience.js')current=require('./experience-scope-v171.cjs')(current);
    assert.equal(current,before,file);
  }
  assert.match(fs.readFileSync('ui-v137-collection.js','utf8'),/cardscout_collection_v133/);
});

test('v169 registration is feature detected, relative and never reloads',async()=>{
  vm.runInNewContext(registration,{navigator:{}});
  const calls=[],events=[];
  const context={navigator:{serviceWorker:{register:(...args)=>{calls.push(args);return Promise.resolve({});}}},document:{readyState:'loading'},window:{addEventListener:(...args)=>events.push(args)}};
  vm.runInNewContext(registration,context);assert.equal(calls.length,0);assert.equal(events[0][0],'load');
  events[0][1]();assert.equal(calls[0][0],'./sw.js');assert.equal(calls[0][1].updateViaCache,'none');assert.equal(calls[0][1].scope,undefined);
  assert.equal(events[0][2].once,true);
  vm.runInNewContext(registration,{...context,document:{readyState:'complete'},navigator:{serviceWorker:{register:()=>Promise.reject(Error('unavailable'))}}});
  await new Promise(resolve=>setImmediate(resolve));
});

test('v169 fetch boundaries and network-first fallback do not reuse another build',async()=>{
  const entries=new Map(),calls=[];let offline=false;
  const key=r=>typeof r==='string'?r:r.url;
  const cache={match:async r=>entries.get(key(r)),put:async(r,response)=>entries.set(key(r),response)};
  const {handlers}=workerContext({caches:{open:async()=>cache},fetch:async r=>{
    calls.push(key(r));if(offline)throw Error('offline');
    const response=new Response('fresh '+key(r));Object.defineProperty(response,'type',{value:'basic'});return response;
  }});
  const dispatch=(url,mode='cors',method='GET')=>{
    let result;handlers.fetch({request:{url,mode,method},respondWith:p=>result=p});return result;
  };
  for(const url of ['https://www.cardmarket.com/en/Pokemon/Products','https://api.tcgdex.net/v2/ja/cards','https://assets.tcgdex.net/ja/image.png','https://other-cdn.test/art.png',scope+'assets/cards/jp/card.png','https://example.test/other-app/app.js'])assert.equal(dispatch(url),undefined);
  assert.equal(dispatch(scope+'pwa-v169.js','cors','POST'),undefined);
  entries.set(scope+'index.html',new Response('stale'));
  assert.match(await (await dispatch(scope,'navigate')).text(),/^fresh/);assert.equal(calls.length,1);
  offline=true;assert.match(await (await dispatch(scope,'navigate')).text(),/^fresh/);
  entries.set(scope+'pwa-v169.js?build=old',new Response('old'));
  await assert.rejects(dispatch(scope+'pwa-v169.js?build=new'),/offline/);
  offline=false;assert.match(await (await dispatch(scope+'pwa-v169.js?build=new')).text(),/build=new/);
});

test('v169 failed precache never activates an incomplete worker',async()=>{
  let skipped=false,pending;
  const {handlers,self}=workerContext({caches:{open:async()=>({addAll:async()=>{throw Error('asset unavailable');}})}});
  self.skipWaiting=()=>{skipped=true;};
  handlers.install({waitUntil:promise=>pending=promise});
  await assert.rejects(pending,/asset unavailable/);assert.equal(skipped,false);
});

test('v169 Chromium: scoped worker, offline collection, engine smoke and safe update', {timeout:180000}, async()=>{
  let revision='v176',marker='initial';
  const server=http.createServer((req,res)=>{
    try{
      const pathname=new URL(req.url,'http://localhost').pathname;
      if(pathname==='/whatnotai-mobile/seed'){res.setHeader('Content-Type','text/html');return res.end('<title>Seed</title>');}
      if(!pathname.startsWith('/whatnotai-mobile/'))return res.writeHead(404).end();
      const file=pathname.slice('/whatnotai-mobile/'.length)||'index.html';
      res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png'})[file.split('.').pop()]||'application/octet-stream');
      res.setHeader('Cache-Control','no-store');
      if(file==='sw.js')return res.end(worker.replaceAll('rareworth-shell-v176','rareworth-shell-'+revision));
      if(file==='index.html')return res.end(html.replace('</head>',`<meta name="pwa-test-revision" content="${marker}"></head>`));
      res.end(fs.readFileSync(path.resolve(file)));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port,url=origin+'/whatnotai-mobile/';
  let browser;
  try{
    browser=await chromium.launch({headless:true,args:['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1']});
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await context.route('**/*',route=>{
      const request=route.request(),u=new URL(request.url());
      if(u.origin===origin)return route.continue();
      if(u.hostname==='api.tcgdex.net'){
        const p=u.pathname.split('/'),fixture=`tests/fixtures/jp-sets-v160/${p.at(-1)}.json`;
        if(p[2]==='ja'&&p[3]==='sets'&&fs.existsSync(fixture))return route.fulfill({json:JSON.parse(fs.readFileSync(fixture))});
        return route.fulfill({json:p[3]==='sets'?{cards:[]}:{}});
      }
      if(u.hostname==='www.cardmarket.com')return route.fulfill({contentType:'text/html',body:'Frozen marketplace'});
      return route.abort();
    });
    await page.goto(url+'seed');
    await page.evaluate(async()=>{
      for(const name of ['rareworth-shell-v168-test','whatnotai-mobile-v36','cardscout-v133','unrelated-cache','cardscout-other-app'])await caches.open(name);
      localStorage.setItem('whatnotai_mobile_favorites_v37',JSON.stringify([{name:'Bagon',number:'43',set:'EX DRAGON FRONTIERS',lang:'EN',cond:'EX',source_id:'ex15-43',url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Bagon-Delta-Species-DF43?minCondition=3&language=1'}]));
      localStorage.setItem('pwa-test-preserved','unchanged');
    });
    await page.goto(url);
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    assert.deepEqual(await page.evaluate(async()=> (await navigator.serviceWorker.getRegistrations()).map(r=>({scope:r.scope,state:r.active.state}))),[{scope:url,state:'activated'}]);
    const cacheNames=await page.evaluate(()=>caches.keys());
    assert.ok(cacheNames.includes('rareworth-shell-v176'));assert.ok(cacheNames.includes('unrelated-cache'));assert.ok(cacheNames.includes('cardscout-other-app'));
    for(const name of ['rareworth-shell-v168-test','whatnotai-mobile-v36','cardscout-v133'])assert.ok(!cacheNames.includes(name));
    await page.reload();
    console.log('PASS initial worker, legacy cleanup and online reload');
    await page.locator('.visiblePreferences [data-value="JP"]').click();
    await page.waitForFunction(()=>window.CardCatalog?.byId?.('neo4-001','JP'));
    const expected='https://www.cardmarket.com/en/Pokemon/Products/Singles/Expansion-Pack/Machamp-EXP';
    for(const [condition,value] of [['EX','3'],['NM','2']]){
      await page.locator('.visiblePreferences [data-value="'+condition+'"]').click();
      await page.locator('#quickInput').fill('Machamp');
      await page.locator('.suggestion').filter({hasText:'PMCG1-057'}).click();
      await page.waitForFunction(u=>document.querySelector('#openBtn').href===u,expected+'?minCondition='+value);
      assert.match(await page.locator('#selectedCardPanel').innerText(),/Expansion Pack.*JP/s);
    }
    await page.locator('#navRecent').click();await page.locator('#recentList .useBtn').first().click();
    await page.waitForFunction(u=>document.querySelector('#openBtn').href===u,expected+'?minCondition=2');
    await page.locator('#collectionAddBtn').click();await page.locator('#collectionEditorSave').click();
    await page.reload();await page.locator('#navCollection').click();
    await page.locator('#collectionList .collectionCard').first().waitFor();
    const before=await page.evaluate(()=>Object.fromEntries(['cardscout_collection_v133','whatnotai_mobile_recent_v37','whatnotai_mobile_favorites_v37','pwa-test-preserved'].map(k=>[k,localStorage.getItem(k)])));
    assert.equal(JSON.parse(before.cardscout_collection_v133)[0].sourceId,'PMCG1-057');
    assert.equal(JSON.parse(before.whatnotai_mobile_favorites_v37)[0].source_id,'ex15-43');
    await context.setOffline(true);await page.reload();
    assert.match(await page.locator('#brandHomeBtn').innerText(),/HoloKeep/);
    assert.deepEqual(await page.locator('.bottomNav button span').allTextContents(),['Zoeken','Collectie','Recent','Instellingen']);
    await page.locator('#navCollection').click();assert.match(await page.locator('#collectionList').innerText(),/Expansion Pack/);
    assert.equal(await page.locator('[data-view="scan"]').isVisible(),false);
    assert.equal(await page.locator('#favoriteBtn').isVisible(),false);
    assert.equal(await page.locator('[data-view="favorites"]').isVisible(),false);
    assert.deepEqual(await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(before)),before);
    console.log('PASS Machamp EX/NM, Recent and offline collection persistence');
    await context.setOffline(false);marker='fresh-online';await page.reload();
    assert.equal(await page.locator('meta[name="pwa-test-revision"]').getAttribute('content'),'fresh-online');
    await page.locator('#navSearch').click();await page.locator('.visiblePreferences [data-value="EN"]').click();
    await page.locator('#quickInput').fill('Bagon 43 Dragon Frontiers');
    await page.locator('.suggestion').first().click();
    await page.waitForFunction(()=>new URL(document.querySelector('#openBtn').href).pathname==='/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Bagon-Delta-Species-DF43');
    assert.equal(new URL(await page.locator('#openBtn').getAttribute('href')).searchParams.get('language'),'1');
    console.log('PASS online recovery and EN route');
    // Real external fetches through the controlled page remain absent from Cache Storage.
    await page.evaluate(()=>Promise.all(['https://www.cardmarket.com/en/Pokemon/Products','https://api.tcgdex.net/v2/ja/cards'].map(url=>fetch(url,{signal:AbortSignal.timeout(3000)}).catch(()=>{}))));
    const cached=await page.evaluate(async()=> (await (await caches.open('rareworth-shell-v176')).keys()).map(request=>request.url));
    assert.ok(cached.length>=27);assert.ok(cached.every(u=>new URL(u).origin===origin),'same origin only');
    assert.ok(cached.every(u=>new URL(u).pathname.startsWith('/whatnotai-mobile/')));
    console.log('PASS same-origin cache inventory');
    // Real worker update, without changing repository assets or reloading in a loop.
    revision='v176-test';
    await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});
    await page.waitForFunction(async()=>{
      const keys=await caches.keys(),r=await navigator.serviceWorker.getRegistration();
      return keys.includes('rareworth-shell-v176-test')&&!keys.includes('rareworth-shell-v176')&&r.active?.state==='activated'&&!r.installing&&!r.waiting;
    });
    assert.equal(await page.evaluate(()=>localStorage.getItem('cardscout_collection_v133')),before.cardscout_collection_v133);
    assert.equal(await page.evaluate(()=>localStorage.getItem('whatnotai_mobile_favorites_v37')),before.whatnotai_mobile_favorites_v37);
    assert.ok((await page.evaluate(()=>caches.keys())).includes('unrelated-cache'));
    console.log('PASS real worker update and cache cleanup');
    // The newly activated shell also works offline, with the same collection.
    assert.ok((await page.evaluate(()=>caches.keys())).includes('rareworth-shell-v176-test'));
    await context.setOffline(true);await page.reload();
    await page.locator('#navCollection').click();assert.match(await page.locator('#collectionList').innerText(),/Expansion Pack/);
    assert.deepEqual(errors,[]);
    console.log('PASS scoped SW, offline shell/collection, JP Machamp EX/NM, EN, Recent, external cache=0 and update cleanup');
  } finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
});
