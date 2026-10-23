'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const {build,serialize}=require('../scripts/cardmarket-public-v186.cjs');
const preview=require('../cardmarket-preview-v187.js');
const {fileFor}=require('../scripts/serve-cardmarket-preview-v187.cjs');

const when=Date.parse('2026-10-23T09:00:00Z');
const card={id:'base1-4',name:'Charizard',localId:'4',set:{id:'base1'},
  variants:{normal:false,holo:true,reverse:false,firstEdition:true},
  pricing:{cardmarket:{idProduct:273699,trend:90000000,'trend-holo':90000000}}};
function files(){return serialize(build({version:1,createdAt:'2026-10-21T13:49:03+0200',products:[
  {idProduct:273699,name:'Charizard [Energy Burn | Fire Spin]',categoryName:'Pokémon Single',idExpansion:1523}]},
  {version:1,createdAt:'2026-10-22T02:45:11+0200',priceGuides:[{idProduct:273699,trend:7,'trend-holo':99999}]},{now:when}));}
function fakeFetch(bundle=files()){return async url=>{
  if(url==='https://api.tcgdex.net/v2/en/cards/base1-4')return {ok:true,json:async()=>card};
  const raw=bundle.get(url.split('/').at(-1));
  return {ok:raw!==undefined,arrayBuffer:async()=>new TextEncoder().encode(raw||'').buffer};
};}
test('explicitly confirmed edition is required before any card lookup',async()=>{
  let calls=0;const result=await preview.lookup('base1-4',{fetchImpl:async()=>{calls++;throw Error('no');},cryptoImpl:webcrypto,now:when});
  assert.equal(result.quote.reason,'EDITION_NOT_CONFIRMED');assert.equal(calls,0);
});
test('only checksum-verified official trend is displayed, not numeric TCGdex price',async()=>{
  const x=await preview.lookup('base1-4',{fetchImpl:fakeFetch(),cryptoImpl:webcrypto,now:when,qty:2,confirmed:true});
  assert.equal(x.quote.state,'AVAILABLE');assert.equal(x.quote.value,7);
  assert.equal(x.item.qty,2);assert.equal(x.item.edition,'UNLIMITED');
  assert.equal(preview.cardmarketUrl(x.quote),'https://www.cardmarket.com/en/Pokemon/Products?idProduct=273699');
  assert.equal(x.quote.conditionSpecific,false);assert.equal(x.quote.languageSpecific,false);
});
test('unrecognized identity and missing manifest do not yield a guessed price',async()=>{
  let calls=0;
  const missing=await preview.lookup('weird-card',{confirmed:true,fetchImpl:async()=>{calls++;return {ok:false};},cryptoImpl:webcrypto,now:when});
  assert.equal(missing.quote.state,'UNAVAILABLE');assert.equal(calls,1);
  assert.equal((await preview.lookup('../base1-4',{confirmed:true,fetchImpl:fakeFetch(),cryptoImpl:webcrypto,now:when})).quote.reason,'IDENTITY');
  const empty=new Map();assert.equal((await preview.lookup('base1-4',{confirmed:true,fetchImpl:fakeFetch(empty),cryptoImpl:webcrypto,now:when})).quote.state,'UNAVAILABLE');
  assert.equal(preview.cardmarketUrl({state:'UNAVAILABLE',productId:1}),null);
  assert.equal(preview.itemFor({...card,id:'JP-base1-4'}),null);
});
test('local server exposes only allowlisted preview assets and official shards',()=>{
  assert.match(fileFor('/cardmarket-preview-v187.html'),/cardmarket-preview-v187\.html$/);
  assert.match(fileFor('/cardmarket-public-v186/00.json'),/cardmarket-public-v186\/00\.json$/);
  assert.equal(fileFor('/cardmarket-public-v186/secret.json'),null);
  assert.equal(fileFor('/docs/BRAND-V172.md'),null);
  assert.equal(fileFor('/.git/config'),null);
  assert.equal(fileFor('/%2e%2e%2fmanifest.json'),null);
});
