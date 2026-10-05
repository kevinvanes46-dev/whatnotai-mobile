'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('../scripts/node_modules/playwright');
require('./guest-context-v171.cjs')(chromium);
test('v170B mobile: optional mocked OTP, explicit CAS sync, conflict, signout and offline reload',{timeout:120000},async()=>{
  const server=http.createServer((req,res)=>{
    try{
      const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
      if(file==='seed'){res.setHeader('Content-Type','text/html');return res.end('<title>Fixture seed</title>');}
      res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',png:'image/png',svg:'image/svg+xml'})[file.split('.').pop()]||'application/octet-stream');
      res.end(fs.readFileSync(path.resolve(file)));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin='http://127.0.0.1:'+server.address().port;let browser;
  try{
    browser=await chromium.launch({headless:true,args:['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1']});
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    const external=[];
    await context.route('**/*',route=>{
      const u=new URL(route.request().url());if(u.origin===origin)return route.continue();external.push(u.href);
      if(u.hostname==='api.tcgdex.net'){
        const p=u.pathname.split('/'),f=`tests/fixtures/jp-sets-v160/${p.at(-1)}.json`;
        return route.fulfill({json:p[2]==='ja'&&p[3]==='sets'&&fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):p[3]==='sets'?{cards:[]}: {}});
      }
      return route.abort();
    });
    // Mock the SDK boundary only. Production modules, DOM, storage and worker run unchanged.
    // No real auth email, project API or test user is ever contacted.
    await context.addInitScript(()=>{
      window.mockCalls=[];window.mockRemote=null;let listener;
      const session=()=>JSON.parse(localStorage.getItem('fixture-session')||'null');
      const client={auth:{
        onAuthStateChange:fn=>(listener=fn,{data:{subscription:{unsubscribe(){}}}}),
        getSession:async()=>({data:{session:session()}}),
        signInWithOtp:async args=>{
          window.mockCalls.push({type:'otp',args});
          const value={user:{id:'fixture-A',email:args.email},access_token:'fixture-token'};
          localStorage.setItem('fixture-session',JSON.stringify(value));listener('SIGNED_IN',value);return {};
        },
        signOut:async()=>{localStorage.removeItem('fixture-session');listener('SIGNED_OUT',null);return {};}
      },rpc(name,args){return {setHeader:async(key,value)=>{
        window.mockCalls.push({type:'rpc',name,args,key,value});
        if(name==='rareworth_get_collection_snapshot')return {data:structuredClone(window.mockRemote)};
        if(args.expected_revision!==(window.mockRemote?.revision||'0'))return {data:{status:'CONFLICT'}};
        window.mockRemote={payload:structuredClone(args.new_payload),revision:String(BigInt(args.expected_revision)+1n),schema_version:'v133'};
        return {data:{status:'SAVED',snapshot:structuredClone(window.mockRemote)}};
      }};}};
      const append=HTMLHeadElement.prototype.appendChild;
      HTMLHeadElement.prototype.appendChild=function(node){
        if(node.tagName==='SCRIPT'&&node.src.includes('@supabase/supabase-js@')){
          window.mockCalls.push({type:'sdk',url:node.src,integrity:node.integrity});
          window.supabase={createClient:()=>client};queueMicrotask(()=>node.onload());return node;
        }
        return append.call(this,node);
      };
    });
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/seed');
    const localCard={uid:'fixture-card',name:'Pikachu',sourceId:'neo1-036',sourceSetId:'neo1',set:'NEO GENESIS',setName:'Neo Genesis',number:'036',language:'JP',condition:'EX',edition:'AUTO',variant:'NORMAL',qty:1,listType:'collection',future:{label:'ピカチュウ 🃏'}};
    await page.evaluate(card=>{
      localStorage.setItem('cardscout_collection_v133',JSON.stringify([card]));
      localStorage.setItem('fixture-backup','bewaren');localStorage.setItem('whatnotai_mobile_favorites_v37','[]');
    },localCard);
    await page.goto(origin);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
    await page.locator('#navCollection').click();await page.locator('#collectionList .collectionCard').first().waitFor();
    await page.locator('#navSettings').click();assert.equal(await page.locator('#accountForm').isVisible(),true);
    assert.equal(await page.evaluate(()=>window.mockCalls.length),0,'SDK remains lazy in local-only mode');
    await page.locator('#accountEmailInput').fill('tester@example.test');await page.locator('#accountSend').click();
    const state=async expected=>page.waitForFunction(value=>document.querySelector('#accountCard').dataset.state===value&& !document.querySelector('#accountSync').disabled,expected);
    await state('LOCAL_ONLY');assert.equal(await page.locator('#accountEmail').textContent(),'tester@example.test');
    assert.equal(await page.evaluate(()=>window.mockCalls.filter(x=>x.args?.new_payload).length),0);
    assert.equal(await page.evaluate(()=>window.mockCalls.find(x=>x.type==='otp').args.options.emailRedirectTo),origin+'/');
    await page.locator('#accountSync').click();await state('IN_SYNC');
    assert.equal(await page.evaluate(()=>window.mockRemote.revision),'1');
    // A real collection editor save triggers the isolated account observer.
    await page.locator('#navCollection').click();await page.locator('#collectionList .collectionCardMain').first().click();
    await page.locator('#collectionEditorQty').fill('2');await page.locator('#collectionEditorSave').click();
    await page.locator('#navSettings').click();await state('LOCAL_NEWER');await page.locator('#accountSync').click();await state('IN_SYNC');
    assert.equal(await page.evaluate(()=>window.mockRemote.revision),'2');
    await page.evaluate(()=>{window.mockRemote.payload[0].qty=3;window.mockRemote.revision='3';});
    await page.locator('#accountRefresh').click();await state('CLOUD_NEWER');await page.locator('#accountSync').click();await state('IN_SYNC');
    await page.locator('#navCollection').click();await page.locator('#collectionList .collectionCardMain').first().click();
    assert.equal(await page.locator('#collectionEditorQty').inputValue(),'3');await page.locator('#collectionEditorClose').click();
    // Remote and local diverge from the confirmed revision 3.
    await page.evaluate(()=>{
      const cards=JSON.parse(localStorage.getItem('cardscout_collection_v133'));cards[0].qty=4;
      localStorage.setItem('cardscout_collection_v133',JSON.stringify(cards));window.cardscoutCollectionUI.render();
      window.mockRemote.payload[0].qty=5;window.mockRemote.revision='4';
    });
    await page.locator('#navSettings').click();await state('CONFLICT');assert.equal(await page.locator('#accountSync').isVisible(),false);
    assert.match(await page.locator('#accountStatus').textContent(),/Backup & herstel/);
    const before=await page.evaluate(()=>Object.fromEntries(['cardscout_collection_v133','whatnotai_mobile_recent_v37','whatnotai_mobile_favorites_v37','fixture-backup'].map(k=>[k,localStorage.getItem(k)])));
    await page.locator('#accountSignOut').click();await page.waitForFunction(()=>document.querySelector('#accountCard').dataset.state==='SIGNED_OUT');
    assert.equal(await page.locator('#accountForm').isVisible(),true);
    await page.locator('#navCollection').click();await page.locator('#collectionList .collectionCard').first().waitFor();
    // Chromium's routed localhost offline emulation can retain navigator.onLine=true.
    // Emulate the browser connectivity flag as well as the actual offline network.
    await context.addInitScript(()=>Object.defineProperty(Navigator.prototype,'onLine',{get:()=>false}));
    await context.setOffline(true);await page.reload();await page.locator('#navCollection').click();assert.match(await page.locator('#collectionList').innerText(),/Neo Genesis/);
    await page.locator('#navSettings').click();await page.waitForFunction(()=>document.querySelector('#accountCard').dataset.state==='OFFLINE');
    assert.match(await page.locator('#accountStatus').textContent(),/Offline — lokale collectie blijft beschikbaar/);
    assert.deepEqual(await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(before)),before);
    assert.deepEqual(await page.locator('.bottomNav button span').allTextContents(),['Zoeken','Collectie','Recent','Instellingen']);
    assert.equal(await page.locator('#favoriteBtn').isVisible(),false);assert.equal(await page.locator('[data-view="scan"]').isVisible(),false);
    const cached=await page.evaluate(async()=> (await (await caches.open('rareworth-shell-v174')).keys()).map(r=>r.url));
    assert.ok(cached.length>=33);assert.ok(cached.every(u=>new URL(u).origin===origin));
    assert.ok(!external.some(u=>/supabase|jsdelivr/.test(u)),'no live auth/API/CDN requests');assert.deepEqual(errors,[]);
    console.log('PASS account mobile: SDK mocked, revisions 1/2/3, local editor, conflict, signout, offline, external cache=0');
  }finally{await browser?.close();await new Promise(r=>server.close(r));}
});
