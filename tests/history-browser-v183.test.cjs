'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),os=require('node:os');
const {chromium}=require('../scripts/node_modules/playwright'),F=require('./fixtures/market-v176.cjs');
let browser,server,origin;const KEY='cardscout_collection_v133';
before(async()=>{server=http.createServer((req,res)=>{try{const f=new URL(req.url,'http://local').pathname.slice(1)||'index.html';res.setHeader('Content-Type',({js:'text/javascript',html:'text/html',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png',woff2:'font/woff2'})[f.split('.').pop()]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch();});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
async function setup(t){const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});t.after(()=>context.close());await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin)return r.continue();if(u.hostname==='api.tcgdex.net'){const id=u.pathname.split('/').pop();if(u.pathname.includes('/cards/'))return r.fulfill({json:F.card});if(u.pathname.includes('/en/sets/')&&id==='base1')return r.fulfill({json:{cards:Array.from({length:10},(_,i)=>({id:'base1-'+(i+1),localId:String(i+1),name:i===3?'Charizard':'Fixture '+(i+1),image:'https://assets.tcgdex.net/en/base/base1/'+(i+1)}))}});if(u.pathname.includes('/en/sets/')&&id==='base2')return r.fulfill({json:require('./fixtures/beta-en-jungle-v180.json')});for(const folder of (u.pathname.includes('/ja/')?['jp-sets-v160']:['en-sets-v174','en-sets-v175'])){const f='tests/fixtures/'+folder+'/'+id+'.json';if(fs.existsSync(f))return r.fulfill({json:(()=>{const data=JSON.parse(fs.readFileSync(f));if(u.pathname.includes('/ja/'))data.cards=data.cards.map(c=>({...c,image:'https://assets.tcgdex.net/ja/base/'+id+'/'+c.id}));return data;})()});}return r.fulfill({json:{cards:[]}});}if(['assets.tcgdex.net','cdn.artofpkm.com'].includes(u.hostname))return r.fulfill({contentType:'image/png',body:fs.readFileSync('icon-rareworth-192.png')});return r.abort();});const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));t.after(()=>assert.deepEqual(errors,[]));await p.clock.setFixedTime(new Date('2026-10-17T12:00:00Z'));await p.goto(origin);await p.locator('#onboardingGuest').click();return {p,context};}

async function observe(p,day,value=25,qty=2){
  await p.clock.setFixedTime(new Date('2026-10-'+day+'T12:00:00Z'));
  await p.evaluate(({f,card,KEY,value,qty})=>{
    const item={...f,edition:'UNLIMITED',qty};
    localStorage.setItem(KEY,JSON.stringify([item]));
    const source={...card,pricing:{cardmarket:{...card.pricing.cardmarket,'trend-holo':value,updated:new Date().toISOString()}}};
    const entry=HoloKeepMarket.observe(source,item,{requestedLanguage:'en',now:Date.now()});
    HoloKeepMarket.put(localStorage,item,entry);
    cardscoutCollectionUI.render();
    document.getElementById('navHome').click();
  },{f:F.item,card:F.card,KEY,value,qty});
  await p.waitForFunction(()=>HoloDexHistory.read(localStorage).data?.cohorts.some(c=>c.points.some(x=>x.observedAt===new Date().toISOString())));
}
test('real local observations drive the existing chart, survive reload and never request prices',async t=>{
  const {p,context}=await setup(t);let requests=0;
  p.on('request',r=>{if(new URL(r.url()).hostname==='api.tcgdex.net'&&r.url().includes('/cards/'))requests++;});
  await observe(p,'17');
  const panel=p.locator('#homeComparisonPanel');
  assert.equal(await panel.locator('svg').count(),0);
  await observe(p,'18',30);
  await p.waitForFunction(()=>document.querySelector('#homeComparisonPanel svg circle'));
  assert.equal(await panel.locator('svg circle').count(),2);
  assert.match(await panel.locator('.homeChartSummary').innerText(),/50,00.*60,00.*10,00/);
  const stored=await p.evaluate(()=>localStorage.getItem(HoloDexHistory.KEY));
  for(let i=0;i<3;i++)await p.locator('#navHome').click();
  await p.evaluate(()=>navigator.locks.request(HoloDexHistory.KEY,()=>{}));
  assert.equal(await p.evaluate(()=>localStorage.getItem(HoloDexHistory.KEY)),stored);
  assert.equal(requests,0);
  for(const width of [320,375,390,430]){
    await p.setViewportSize({width,height:844});
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const out=path.join(os.tmpdir(),'holodex-v183-history');fs.mkdirSync(out,{recursive:true});
    await panel.screenshot({path:path.join(out,width+'.png')});
  }
  await p.reload();await p.locator('#navHome').click();
  await p.waitForFunction(()=>document.querySelectorAll('#homeComparisonPanel svg circle').length===2);
  assert.equal(await p.evaluate(()=>localStorage.getItem(HoloDexHistory.KEY)),stored);
  await observe(p,'28',35);
  await panel.getByRole('button',{name:'1W',exact:true}).click();
  assert.equal(await panel.locator('svg').count(),0);
  await panel.getByRole('button',{name:'Alles',exact:true}).click();
  assert.equal(await panel.locator('svg circle').count(),3);
  await observe(p,'28',35,3);
  await p.waitForFunction(()=>!document.querySelector('#homeComparisonPanel svg'));
  assert.equal(await p.evaluate(()=>HoloDexHistory.read(localStorage).data.cohorts.length),2);
  assert.equal(requests,0);
});
test('corrupt history stays untouched and duplicate UI initialization creates no second panel',async t=>{
  const {p}=await setup(t);await observe(p,'17');
  await p.evaluate(()=>{localStorage.setItem(HoloDexHistory.KEY,'{broken');dispatchEvent(new StorageEvent('storage',{key:HoloDexHistory.KEY}));});
  await p.addScriptTag({content:fs.readFileSync('ui-v183-parity.js','utf8')});
  await p.locator('#navHome').click();
  await p.evaluate(()=>navigator.locks.request(HoloDexHistory.KEY,()=>{}));
  assert.equal(await p.locator('.homeChartStage').count(),1);
  assert.equal(await p.locator('#homeComparisonPanel svg').count(),0);
  assert.equal(await p.evaluate(()=>localStorage.getItem(HoloDexHistory.KEY)),'{broken');
});
