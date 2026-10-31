'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const Library=require('../library-v185.js');
const Market=require('../market-v176.js');
const fixture=require('./fixtures/market-v176.cjs');

const pidgeotto={
  source_id:'base1-22',source_set_id:'base1',name:'Pidgeotto',number:'22',
  set:'BASE',set_name:'Base Set',language:'EN',condition:'EX',variant:'NORMAL'
};
const routeFor=edition=>Library.safeRoute({...pidgeotto,edition});

test('Base Set Pidgeotto has three identity-checked product-print routes',()=>{
  assert.deepEqual(Library.cardmarketPrintChoices(pidgeotto).map(choice=>choice.label),[
    'Unlimited','Shadowless','Shadowless · 1st Edition'
  ]);
  for(const [edition,slug,first] of [
    ['UNLIMITED','Pidgeotto-V1-BS22','N'],
    ['SHADOWLESS','Pidgeotto-V2-BS22','N'],
    ['1ST','Pidgeotto-V2-BS22','Y']
  ]){
    const route=routeFor(edition),url=new URL(route.url);
    assert.equal(route.exact,true,edition);
    assert.equal(route.confirmed,true,edition);
    assert.equal(url.origin,'https://www.cardmarket.com');
    assert.equal(url.pathname,'/en/Pokemon/Products/Singles/Base-Set/'+slug);
    assert.equal(url.searchParams.get('isFirstEd'),first);
    assert.equal(url.searchParams.get('isReverseHolo'),'N');
    assert.equal(url.searchParams.get('language'),'1');
    assert.equal(url.searchParams.get('minCondition'),'3');
    assert.equal(url.searchParams.has('idProduct'),false);
  }
});

test('unverified Pidgeotto prints and conflicting identities fail closed to search',()=>{
  for(const changes of [
    {edition:'SHADOWLESS_UNVERIFIED'},
    {edition:'SHADOWLESS',name:'Pikachu'},
    {edition:'SHADOWLESS',number:'23'},
    {edition:'SHADOWLESS',source_set_id:'base2'},
    {edition:'SHADOWLESS',set_name:'Jungle'}
  ]){
    const route=Library.safeRoute({...pidgeotto,...changes}),url=new URL(route.url);
    assert.equal(route.exact,false,JSON.stringify(changes));
    assert.equal(url.pathname,'/en/Pokemon/Products/Search',JSON.stringify(changes));
    assert.equal(url.searchParams.has('idProduct'),false,JSON.stringify(changes));
  }
  const japanese=Library.safeRoute({...pidgeotto,edition:'SHADOWLESS',language:'JP'});
  assert.equal(japanese.kind,'UNAVAILABLE');
  assert.equal(japanese.url,'');
});

test('ambiguous Pidgeotto catalog products cannot produce edition-specific prices',()=>{
  const detail={id:'base1-22',localId:'22',name:'Pidgeotto',set:{id:'base1'},
    variants_detailed:[{type:'normal'}]};
  const index=require('../cardmarket-product-index-v191.json');
  for(const edition of ['UNLIMITED','SHADOWLESS','1ST']){
    assert.deepEqual(Library.cardmarketOptions({...pidgeotto,edition},detail,index),[],edition);
  }
});

test('Jigglypuff WOTC Promo #7 uses the supplied exact page; other promos remain searches',()=>{
  const promo={source_id:'basep-7',source_set_id:'basep',name:'Jigglypuff',number:'7',
    set:'WOTC PROMO',set_name:'Wizards Black Star Promos',language:'EN',condition:'NM'};
  const route=Library.safeRoute(promo),url=new URL(route.url);
  assert.equal(route.exact,true);
  assert.equal(route.confirmed,true);
  assert.equal(url.pathname,'/en/Pokemon/Products/Singles/Wizards-Black-Star-Promos/Jigglypuff-WP7');
  assert.equal(url.searchParams.get('language'),'1');
  assert.equal(url.searchParams.get('minCondition'),'2');
  assert.equal(url.searchParams.has('idProduct'),false);

  const unknown=Library.safeRoute({...promo,source_id:'basep-8',number:'8'});
  assert.equal(unknown.exact,false);
  assert.equal(new URL(unknown.url).pathname,'/en/Pokemon/Products/Search');
  assert.equal(new URL(unknown.url).searchParams.get('searchString'),'Jigglypuff wp8');
  assert.equal(new URL(unknown.url).searchParams.has('idProduct'),false);
});

test('Shadowless and First Edition never display a general or stale cached price',()=>{
  const card={...fixture.card,id:'base1-22',localId:'22',name:'Pidgeotto',set:{id:'base1'}};
  for(const [edition,reason,label] of [
    ['SHADOWLESS','SPECIAL_VARIANT','Shadowless'],
    ['1ST','FIRST_EDITION','1st Edition']
  ]){
    const item={...fixture.item,sourceId:'base1-22',source_set_id:'base1',name:'Pidgeotto',
      number:'22',edition,price:999};
    const quote=Market.observe(card,item,{requestedLanguage:'en',now:fixture.now});
    assert.equal(quote.reason,reason);
    assert.equal(Market.eligible(quote),false);
    assert.equal(Market.display(null,item).value,null);
    assert.match(Market.display(null,item).label,new RegExp(label));

    const general={...Market.observe(fixture.card,fixture.item),...Market.identity(item),
      editionScope:edition,quality:'GENERAL_MARKET'};
    const storage={getItem:()=>JSON.stringify({version:176,entries:{[Market.key(item)]:general}}),setItem(){}};
    assert.equal(Market.get(storage,item),null);
  }
});
