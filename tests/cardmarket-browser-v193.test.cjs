'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),vm=require('node:vm');
const {chromium}=require('../scripts/node_modules/playwright'),F=require('./fixtures/chansey-v193.json');
let server,browser,origin;
before(async()=>{
  server=http.createServer((req,res)=>{try{const file=new URL(req.url,'http://local').pathname.slice(1)||'index.html';
    res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',json:'application/json',css:'text/css',svg:'image/svg+xml'})[file.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch();
});
after(async()=>{await browser?.close();await new Promise(r=>server?.close(r));});
test('Home → Base Set → Chansey → Unlimited: filtered outgoing link, official quote, refresh, offline and local coverage',async t=>{
  const context=await browser.newContext({viewport:{width:390,height:844}});t.after(()=>context.close());
  const p=await context.newPage(),errors=[],outbound=[];p.on('pageerror',e=>errors.push(e.message));
  const manifest=require('../cardmarket-public-v193/manifest.json');
  await p.clock.install({time:new Date(Date.parse(manifest.priceGuideCreatedAt)+3600000)});
  await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin)return r.continue();outbound.push(u.href);
    if(u.href==='https://api.tcgdex.net/v2/en/cards/base1-3')return r.fulfill({json:F});
    if(u.href==='https://api.tcgdex.net/v2/en/sets/base1')return r.fulfill({json:{id:'base1',cardCount:{total:1},cards:[{id:'base1-3',localId:'3',name:'Chansey'}]}});
    return r.abort();
  });
  await p.goto(origin);await p.locator('#onboardingGuest').click();
  await p.getByRole('button',{name:/Sets ontdekken/}).click();
  await p.getByLabel('Filter sets',{exact:true}).fill('Base Set');await p.locator('[data-set-id="base1"]').click();
  await p.locator('.libraryCard').filter({hasText:'Chansey'}).click();
  await p.getByRole('button',{name:'Holo · unlimited',exact:true}).click();
  await p.locator('#cardSheetNote').filter({hasText:'Algemene Cardmarket-marktindicatie'}).waitFor();
  const u=new URL(await p.locator('#cardSheetLink').getAttribute('href'));
  assert.equal(u.searchParams.get('idProduct'),'273698');assert.equal(u.searchParams.get('minCondition'),'2');assert.equal(u.searchParams.get('language'),'1');
  assert.match(await p.locator('#cardSheetPrice').innerText(),/€/);assert.match(await p.locator('#cardSheetNote').innerText(),/conditie, taal en editie niet verwerkt/);
  assert.match(await p.locator('#cardSheetNote').innerText(),new RegExp(manifest.priceGuideCreatedAt.replaceAll('.','\\.')));
  assert.equal(u.searchParams.get('isFirstEd'),'N');
  fs.mkdirSync('docs/v193',{recursive:true});await p.screenshot({path:'docs/v193/chansey-chromium.png',fullPage:true});
  // A local coverage summary never sends the user's collection to a provider.
  await p.evaluate(()=>localStorage.setItem('cardscout_collection_v133',JSON.stringify([
    {uid:'checked',listType:'OWNED',sourceId:'base1-3',source_set_id:'base1',name:'Chansey',number:'3',set:'BASE',language:'EN',variant:'NORMAL',edition:'UNLIMITED',condition:'NM',qty:2,paidEach:12},
    {uid:'unknown',listType:'OWNED',sourceId:'base1-4',source_set_id:'base1',name:'Charizard',number:'4',set:'BASE',language:'EN',variant:'NORMAL',edition:'1ST',condition:'NM',qty:1,paidEach:99}
  ])));
  // Whole-page requests are not a safe proxy for what this button triggers:
  // catalog/card-art background requests also occur without clicking it.
  await p.locator('#cardSheetClose').click();await p.locator('#navCollection').click();await p.waitForLoadState('networkidle');
  await p.getByRole('button',{name:'Toon gecontroleerde prijsdekking'}).click();
  assert.match(await p.locator('#officialPortfolio193').innerText(),/Gedekt subtotaal:.*1\/2.*1 zonder waarde/);
  await p.locator('#navSearch').click();await p.locator('.libraryCard').filter({hasText:'Chansey'}).click();await p.getByRole('button',{name:'Holo · unlimited',exact:true}).click();
  await p.locator('#cardSheetNote').filter({hasText:'Algemene Cardmarket-marktindicatie'}).waitFor();
  const before=await p.evaluate(()=>({...localStorage}));
  await p.route('**/cardmarket-public-v193/manifest.json',r=>r.fulfill({json:{...manifest,priceGuideCreatedAt:'2020-01-01T00:00:00.000Z'}}));
  await p.getByRole('button',{name:'Prijs opnieuw controleren'}).click();
  await p.locator('#cardSheetNote').filter({hasText:'snapshot is verouderd'}).waitFor();assert.equal(await p.locator('#cardSheetPrice').innerText(),'Geen marktindicatie');
  await p.unroute('**/cardmarket-public-v193/manifest.json');await p.getByRole('button',{name:'Prijs opnieuw controleren'}).click();
  await p.locator('#cardSheetNote').filter({hasText:'Algemene Cardmarket-marktindicatie'}).waitFor();
  await context.setOffline(true);await p.getByRole('button',{name:'Prijs opnieuw controleren'}).click();
  await p.locator('#cardSheetNote').filter({hasText:'snapshot niet bereikbaar'}).waitFor();
  assert.equal(await p.locator('#cardSheetPrice').innerText(),'Geen marktindicatie');
  const after=await p.evaluate(()=>({...localStorage}));assert.deepEqual(after,before);
  await p.locator('#cardSheetClose').click();await p.locator('#navCollection').click();
  await p.getByRole('button',{name:'Toon gecontroleerde prijsdekking'}).click();assert.match(await p.locator('#officialPortfolio193').innerText(),/Geen marktindicatie/);
  assert.deepEqual(errors,[]);
});

test('coverage button cannot start external network requests when reading local quotes',()=>{
  const attempts=[];
  const element=tag=>({tag,children:[],textContent:'',attributes:{},
    setAttribute(k,v){this.attributes[k]=v;},append(...nodes){this.children.push(...nodes);}});
  const collection=element('section');
  const items=[{uid:'checked',listType:'OWNED',qty:2},{uid:'unknown',listType:'OWNED',qty:1}];
  const denied=kind=>(...args)=>{attempts.push({kind,args:args.map(String)});throw Error(kind+' network request');};
  const sandbox={
    document:{createElement:element,querySelector:selector=>selector==='[data-view="collection"]'?collection:null},
    window:{cardscoutCollectionUI:{items:()=>items}},
    HoloKeepOfficialMarket:{
      cached:item=>item.uid==='checked'?{state:'AVAILABLE',value:27.81,asOf:'2026-10-24T00:00:00.000Z'}:{state:'UNAVAILABLE'},
      display:q=>({value:q.state==='AVAILABLE'?q.value:null})
    },Intl,fetch:denied('fetch'),XMLHttpRequest:denied('xhr'),navigator:{sendBeacon:denied('beacon')}
  };
  vm.runInNewContext(fs.readFileSync('ui-market-v193.js','utf8'),sandbox,{filename:'ui-market-v193.js'});
  const section=collection.children[0],button=section.children[2],output=section.children[3];
  assert.equal(typeof button.onclick,'function');
  button.onclick();
  assert.deepEqual(attempts,[]);
  assert.match(output.textContent,/Gedekt subtotaal:.*1\/2.*1 zonder waarde/);
});
