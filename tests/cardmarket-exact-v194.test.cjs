'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const L=require('../library-v185.js'),index=require('../cardmarket-product-index-v191.json');
const context={window:{}};vm.runInNewContext(fs.readFileSync('cardmarket-products-v152.js','utf8'),context);
const catalog=context.window.CM_PRODUCT_CATALOG;
test('Aquapolis repeated names cannot verify collector number from legacy and public index alone',()=>{
  for(const id of ['ecard2-15','ecard2-1']){
    const row=catalog[id],card={source_id:id,source_set_id:row.set.id,number:row.number,name:row.name,language:'EN'};
    assert.equal(L.ambiguousLegacy(card,catalog),true);
    assert.deepEqual(L.cardmarketOptions(card,{},index,catalog),[]);
  }
  assert.equal(L.ambiguousLegacy({source_id:'base1-2'},catalog),false);
});
test('contradictory official attack identity rejects a TCGdex product even in an allowed expansion',()=>{
  const card={source_id:'base1-2',source_set_id:'base1',number:'2',name:'Blastoise',language:'EN'};
  const detail={id:'base1-2',localId:'2',set:{id:'base1'},name:'Blastoise',attacks:[{name:'Wrong attack'}],variants_detailed:[{type:'holo',subtype:'unlimited',thirdParty:{cardmarket:273697}}]};
  assert.deepEqual(L.cardmarketOptions(card,detail,index,catalog),[]);
});
test('normal excludes reverse even when only detailed variants disclose reverse',()=>{
  const card={source_id:'me02-039',source_set_id:'me02',number:'039',name:'Cresselia',language:'EN'};
  const detail={id:card.source_id,localId:card.number,set:{id:'me02'},name:card.name,variants_detailed:['normal','reverse'].map(type=>({type,thirdParty:{cardmarket:857614}}))};
  const choices=L.cardmarketOptions(card,detail,index);
  assert.deepEqual(choices.map(c=>new URL(c.url).searchParams.get('isReverseHolo')),['N','Y']);
  assert.ok(choices.every(c=>new URL(c.url).searchParams.get('language')==='1'&&new URL(c.url).searchParams.get('minCondition')==='2'));
  assert.deepEqual(L.cardmarketOptions({...card,language:'JP'},detail,index),[]);
});
test('detail observer preserves library variant ownership and still handles legacy details',()=>{
  let href='https://www.cardmarket.com/en/Pokemon/Products?idProduct=857614&isReverseHolo=Y';
  const link={hidden:false,dataset:{cmVariantOwner:'library'},getAttribute:()=>href,setAttribute:(k,v)=>{href=v;}};
  const meta={textContent:''};const ctx={URL,document:{getElementById:id=>id==='cardSheetLink'?link:id==='cardSheetMeta'?meta:null},addEventListener:()=>{}};ctx.window=ctx;
  vm.runInNewContext(fs.readFileSync('ui-v183-cardmarket.js','utf8'),ctx);
  assert.equal(new URL(href).searchParams.get('isReverseHolo'),'Y');
  delete link.dataset.cmVariantOwner;ctx.HoloDexCardmarketV183.syncDetail();
  assert.equal(new URL(href).searchParams.get('isReverseHolo'),'Y','No selected print preserves existing routing');
  meta.textContent='EN · NORMAL';ctx.HoloDexCardmarketV183.syncDetail();assert.equal(new URL(href).searchParams.get('isReverseHolo'),'N');
  meta.textContent='EN · REVERSE';ctx.HoloDexCardmarketV183.syncDetail();assert.equal(new URL(href).searchParams.get('isReverseHolo'),'Y');
  link.dataset.cmVariantOwner='library';meta.textContent='EN · NORMAL';ctx.HoloDexCardmarketV183.syncDetail();assert.equal(new URL(href).searchParams.get('isReverseHolo'),'Y');
});

test('user-confirmed Aquapolis URLs match exact identity and reject H1, other sets, JP and editions',()=>{
  for(const [number,name,slug] of [['15','Houndoom','Houndoom-V3-AQ15'],['1','Ampharos','Ampharos-V2-AQ1']]){
    const card={source_id:'ecard2-'+number,source_set_id:'ecard2',number,name,language:'EN',condition:'NM',set_name:'Aquapolis'};
    const route=L.cardmarketRoute(card),url=new URL(route.url);
    assert.equal(route.confirmed,true);assert.equal(url.pathname,'/en/Pokemon/Products/Singles/Aquapolis/'+slug);
    assert.equal(url.searchParams.get('language'),'1');assert.equal(url.searchParams.get('minCondition'),'2');
    assert.equal(url.searchParams.has('isFirstEd'),false);
    for(const changes of [{source_id:'ecard2-H1',number:'H1'},{number:'H1'},{source_set_id:'ecard1'},{set_name:'Skyridge'},{language:'JP'},{edition:'1ST'},{variant:'HOLO'}])assert.equal(L.confirmedRoute({...card,...changes}),null);
    assert.equal(new URL(L.confirmedRoute({...card,variant:'REVERSE'}).url).searchParams.get('isReverseHolo'),'Y');
    assert.equal(new URL(L.confirmedRoute({...card,variant:'NORMAL'}).url).searchParams.get('isReverseHolo'),'N');
  }
});
test('confirmed library route returns before any TCGdex or index request can overwrite it',async()=>{
  const code=fs.readFileSync('ui-library-v185.js','utf8');
  const link={},panel={setAttribute(){}};
  const ctx={el:()=>panel,$:id=>id==='cardSheetLink'?link:id==='cardSheetAction'?{before(){}}:{},
    setCardmarketLink:(target,route)=>{target.href=route.url;},detailedCard:()=>assert.fail('TCGdex must not run'),officialIndex:()=>assert.fail('index must not run')};
  vm.createContext(ctx);vm.runInContext(code.slice(code.indexOf('  async function resolveCardmarket('),code.indexOf('  function openLibraryCard(')),ctx);
  const card={source_id:'ecard2-15',number:'15',name:'Houndoom',language:'EN'};
  await ctx.resolveCardmarket(card,L.confirmedRoute(card),1);
  assert.equal(link.href,L.confirmedRoute(card).url);
});
test('selected-card resolver prefers confirmation over a conflicting saved product URL',()=>{
  const {context:load}=require('./helpers/cardmarket-harness.cjs');const {c}=load();c.window.HoloDexLibrary=L;
  const adapter=fs.readFileSync('ui-library-v185.js','utf8').split('(()=>{')[0];vm.runInContext(adapter,c);
  const card={source_id:'ecard2-15',number:'15',name:'Houndoom',language:'EN',verified:true,direct:true,url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=275086'};
  assert.equal(c.resolveFinalCardmarketRoute(card).url,L.confirmedRoute(card).url);
});
