'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'../scripts/node_modules/playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

test('Pidgeotto print selection routes exactly and is retained by collection editor; promo #7 opens its exact page',async()=>{
  const server=http.createServer((req,res)=>{
    const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
    if(!/^[\w.-]+\.(html|js|css|json|svg)$/.test(file)){res.writeHead(404).end();return;}
    try{
      res.setHeader('Content-Type',({html:'text/html',js:'text/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml'})[file.split('.').pop()]);
      res.end(fs.readFileSync(path.join(root,file)));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
    const context=await browser.newContext(),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.hostname==='127.0.0.1')return route.continue();
      return route.abort();
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.locator('#onboardingGuest').click();
    await page.locator('#navSearch').click();
    await page.waitForFunction(()=>typeof resolveFinalCardmarketRoute==='function');
    await page.evaluate(()=>window.HoloDexRedesign.open({card:{source_id:'base1-22',
      source_set_id:'base1',name:'Pidgeotto',number:'22',set:'BASE',set_name:'Base Set',
      language:'EN',catalogOnly:true},condition:'NM',edition:'AUTO',stamped:false,cardmarketUrl:''}));
    const choices=page.locator('#cardSheetPrints');
    await choices.waitFor({state:'visible'});
    const cases=[
      ['UNLIMITED','Pidgeotto-V1-BS22','N'],
      ['SHADOWLESS','Pidgeotto-V2-BS22','N'],
      ['1ST','Pidgeotto-V2-BS22','Y']
    ];
    for(const [index,[edition,slug,first]] of cases.entries()){
      await choices.locator(`[data-edition="${edition}"]`).click();
      await page.waitForFunction(slug=>document.getElementById('cardSheetLink').href.includes(slug),slug);
      const url=new URL(await page.locator('#cardSheetLink').getAttribute('href'));
      assert.equal(url.pathname,'/en/Pokemon/Products/Singles/Base-Set/'+slug);
      assert.equal(url.searchParams.get('isFirstEd'),first);
      assert.equal(url.searchParams.has('idProduct'),false);
      assert.equal(await choices.locator(`[data-edition="${edition}"]`).getAttribute('aria-pressed'),'true');
      assert.match(await page.locator('#cardSheetMeta').textContent(),new RegExp(edition==='1ST'?'Shadowless · 1st Edition':edition==='SHADOWLESS'?'Shadowless':'Unlimited'));
      assert.equal(await page.locator('#cardSheetPrice').textContent(),'Geen marktindicatie');
      await page.locator('#cardSheetAction').click();
      const pending=JSON.parse(await page.locator('#collectionEditor').getAttribute('data-pending'));
      assert.equal(pending.edition,edition);
      assert.equal(pending.cardmarketUrl,url.href);
      await page.locator('#collectionEditorClose').click();
      if(index<cases.length-1)await page.evaluate(()=>window.HoloDexRedesign.open({card:{
        source_id:'base1-22',source_set_id:'base1',name:'Pidgeotto',number:'22',
        set:'BASE',set_name:'Base Set',language:'EN',catalogOnly:true},
        condition:'NM',edition:'AUTO',stamped:false,cardmarketUrl:''}));
    }

    await page.evaluate(()=>{
      localStorage.setItem('cardscout_collection_v133',JSON.stringify([{
        uid:'v208-shadowless-first',sourceId:'base1-22',source_set_id:'base1',
        name:'Pidgeotto',number:'22',set:'BASE',setName:'Base Set',language:'EN',
        condition:'NM',edition:'1ST',variant:'NORMAL',listType:'OWNED',qty:1
      }]));
      window.cardscoutCollectionUI.render();
    });
    await page.waitForFunction(()=>document.querySelector('[data-id="v208-shadowless-first"] [data-v208-print]')?.textContent==='Shadowless');

    await page.evaluate(()=>{
      window.HoloDexRedesign.open({card:{source_id:'basep-7',source_set_id:'basep',
        name:'Jigglypuff',number:'7',set:'WOTC PROMO',set_name:'Wizards Black Star Promos',
        language:'EN',catalogOnly:true},condition:'NM',edition:'AUTO',stamped:false,cardmarketUrl:''});
    });
    await page.waitForFunction(()=>document.getElementById('cardSheetLink').href.includes('Jigglypuff-WP7'));
    const promo=new URL(await page.locator('#cardSheetLink').getAttribute('href'));
    assert.equal(promo.pathname,'/en/Pokemon/Products/Singles/Wizards-Black-Star-Promos/Jigglypuff-WP7');
    assert.equal(promo.searchParams.has('idProduct'),false);
    assert.deepEqual(errors,[]);
  }finally{
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
});
