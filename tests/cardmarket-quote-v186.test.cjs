'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {quote,shardPath} = require('../cardmarket-price-v186.js');
const {expansions} = require('../cardmarket-expansions-v186.json');

const now = Date.parse('2026-10-23T09:00:00Z');
const manifest = {schema:186,source:'CARDMARKET_PUBLIC_GUIDE',currency:'EUR',metric:'trend',priceGuideCreatedAt:'2026-10-22T00:45:11.000Z'};
const item = {sourceId:'base1-4',source_set_id:'base1',number:'4',name:'Charizard',language:'EN',variant:'NORMAL',edition:'UNLIMITED',condition:'NM'};
const card = {id:'base1-4',set:{id:'base1'},localId:'4',name:'Charizard',variants:{normal:false,holo:true,reverse:false,firstEdition:true},pricing:{cardmarket:{idProduct:273699,trend:999999999,'trend-holo':999999999}}};
const row = [273699,1523,'Charizard [Energy Burn | Fire Spin]',7,231];
const input = {item,card,productRow:row,manifest,expansions,now};

test('regular holo uses official product trend, not reverse-holo column or injected TCGdex prices',() => {
  const result=quote(input);
  assert.equal(result.state,'AVAILABLE');
  assert.equal(result.value,7);
  assert.equal(result.priceField,'trend');
  assert.equal(result.metric,'trend');
  assert.equal(result.source,'CARDMARKET_PUBLIC_GUIDE');
  assert.equal(result.conditionSpecific,false);
  assert.equal(result.languageSpecific,false);
  assert.equal(result.asOf,'2026-10-22T00:45:11.000Z');
  assert.equal(shardPath(273699),'23.json');
});

test('mismatched TCGdex identity and Cardmarket set never quote',() => {
  assert.equal(quote({...input,card:{...card,id:'base2-4'}}).reason,'IDENTITY');
  assert.equal(quote({...input,card:{...card,name:'Blastoise'}}).reason,'IDENTITY');
  assert.equal(quote({...input,productRow:[733794,...row.slice(1)]}).reason,'PRODUCT_ID_MISMATCH');
  assert.equal(quote({...input,productRow:[273699,9999,...row.slice(2)]}).reason,'EXPANSION_UNVERIFIED');
  assert.equal(quote({...input,productRow:[273699,1523,'Blastoise [Hydro Pump]',7,231]}).reason,'PRODUCT_NAME');
  assert.equal(quote({...input,expansions:{}}).reason,'EXPANSION_UNVERIFIED');
});

test('uncertain finish, edition and variants never receive a generic quote',() => {
  assert.equal(quote({...input,item:{...item,variant:'STAMPED'}}).reason,'SPECIAL_VARIANT');
  assert.equal(quote({...input,item:{...item,edition:'1ST'}}).reason,'SPECIAL_VARIANT');
  assert.equal(quote({...input,item:{...item,edition:'AUTO'}}).reason,'EDITION_UNVERIFIED');
  assert.equal(quote({...input,card:{...card,variants:{...card.variants,reverse:true}}}).reason,'FINISH_UNVERIFIED');
  assert.equal(quote({...input,card:{...card,variants:{...card.variants,normal:true}}}).reason,'FINISH_UNVERIFIED');
  assert.equal(quote({...input,card:{...card,variants_detailed:[{type:'reverse'}]}}).reason,'FINISH_UNVERIFIED');
  assert.equal(quote({...input,card:{...card,variants_detailed:[{stamp:'reverse'}]}}).reason,'FINISH_UNVERIFIED');
  assert.equal(quote({...input,productRow:[273699,1523,row[2],null,231]}).reason,'PRICE_MISSING');
});

test('approved Japanese expansion permits product trend only with exact JP identity',() => {
  const jpItem = {...item,sourceId:'SV2a-006',source_set_id:'SV2a',number:'006',name:'リザードンex',language:'JP',edition:'UNLIMITED'};
  const jpCard = {id:'SV2a-006',set:{id:'SV2a'},localId:'006',name:'リザードンex',variants:{normal:false,holo:true,reverse:false,firstEdition:false},pricing:{cardmarket:{idProduct:719448}}};
  const result = quote({item:jpItem,card:jpCard,productRow:[719448,5328,'Charizard ex [Brave Wing | Explosive Vortex]',35,null],manifest,expansions,now});
  assert.equal(result.state,'AVAILABLE');
  assert.equal(result.productId,719448);
  assert.equal(result.languageSpecific,false);
  assert.equal(quote({item:jpItem,card:jpCard,productRow:[719448,5402,'Charizard ex',35,null],manifest,expansions,now}).reason,'EXPANSION_UNVERIFIED');
});

test('stale official files, invalid IDs and impossible quotes fail closed',() => {
  assert.equal(quote({...input,now:now+4*86400000}).reason,'STALE_SOURCE');
  assert.equal(quote({...input,manifest:{...manifest,source:'TCGDEX_CARDMARKET'}}).reason,'SOURCE');
  assert.equal(quote({...input,card:{...card,pricing:{cardmarket:{idProduct:-1}}}}).reason,'PRODUCT_ID');
  assert.equal(quote({...input,productRow:[273699,1523,row[2],Infinity,7]}).reason,'PRICE_MISSING');
  assert.equal(shardPath('273699'),null);
});
