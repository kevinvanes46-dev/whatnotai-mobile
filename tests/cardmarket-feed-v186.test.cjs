'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {webcrypto} = require('node:crypto');
const {build,serialize} = require('../scripts/cardmarket-public-v186.cjs');
const {loadQuote} = require('../cardmarket-feed-v186.js');
const {expansions} = require('../cardmarket-expansions-v186.json');

const now = Date.parse('2026-10-23T09:00:00Z');
const item = {sourceId:'base1-4',source_set_id:'base1',number:'4',name:'Charizard',language:'EN',variant:'NORMAL',edition:'UNLIMITED',condition:'NM'};
const card = {id:'base1-4',set:{id:'base1'},localId:'4',name:'Charizard',
  variants:{normal:false,holo:true,reverse:false,firstEdition:true},
  pricing:{cardmarket:{idProduct:273699,trend:999999999,'trend-holo':999999999}}};

function fixture({id=273699, expansion=1523, name='Charizard [Energy Burn | Fire Spin]', prices=[7,231]} = {}) {
  const catalog = {version:1,createdAt:'2026-10-21T13:49:03+0200',products:[
    {idProduct:id,name,categoryName:'Pokémon Single',idExpansion:expansion}]};
  const guide = {version:1,createdAt:'2026-10-22T02:45:11+0200',priceGuides:[
    {idProduct:id,trend:prices[0],'trend-holo':prices[1]}]};
  return serialize(build(catalog,guide,{now}));
}

function harness(files=fixture()) {
  const requested=[];
  const fetchImpl=async (path, options) => {
    requested.push([path,options]);
    const name=path.slice(path.lastIndexOf('/')+1);
    const body=files.get(name);
    return {ok:typeof body==='string',arrayBuffer:async()=>new TextEncoder().encode(body||'').buffer};
  };
  return {requested,fetchImpl};
}
const input = (extra={}) => ({item,card,expansions,cryptoImpl:webcrypto,now,...extra});

test('reads only same-origin, checksum-verified Cardmarket snapshot, not TCGdex price',async () => {
  const h=harness();
  const price=await loadQuote(input({fetchImpl:h.fetchImpl}));
  assert.equal(price.state,'AVAILABLE');
  assert.equal(price.value,7);
  assert.equal(price.source,'CARDMARKET_PUBLIC_GUIDE');
  assert.equal(price.conditionSpecific,false);
  assert.deepEqual(h.requested.map(([path])=>path),[
    './cardmarket-public-v186/manifest.json','./cardmarket-public-v186/23.json']);
  assert.ok(h.requested.every(([,options])=>options.credentials==='omit'));
});

test('tampering with price shard fails closed; no fallback numeric price',async () => {
  const files=fixture();
  const shard='23.json';
  files.set(shard,files.get(shard).replace('231','999999'));
  const h=harness(files);
  assert.equal((await loadQuote(input({fetchImpl:h.fetchImpl}))).reason,'HASH_MISMATCH');
});

test('same-name and same-expansion product with a different ID never matches',async () => {
  const files=fixture({id:273699});
  const shard='23.json';
  files.set(shard, files.get(shard).replace('[273699,1523', '[111111,1523'));
  const manifest=JSON.parse(files.get('manifest.json'));
  const {createHash}=require('node:crypto');
  manifest.checksums[shard]=createHash('sha256').update(files.get(shard)).digest('hex');
  files.set('manifest.json',JSON.stringify(manifest));
  assert.equal((await loadQuote(input({fetchImpl:harness(files).fetchImpl}))).reason,'PRODUCT_ID_MISMATCH');
});

test('missing source/ambiguous card variant cannot accidentally trigger fallback',async () => {
  const h=harness();
  assert.equal((await loadQuote(input({card:{...card,pricing:{cardmarket:{trend:123}}},fetchImpl:h.fetchImpl}))).reason,'PRODUCT_ID');
  assert.equal(h.requested.length,0);
  assert.equal((await loadQuote(input({item:{...item,variant:'STAMPED'},fetchImpl:h.fetchImpl}))).reason,'SPECIAL_VARIANT');
});

test('stale manifest and failed same-origin response yield unavailable',async () => {
  const h=harness();
  assert.equal((await loadQuote(input({fetchImpl:h.fetchImpl,now:now+4*86400000}))).reason,'STALE_SOURCE');
  assert.equal(h.requested.length,1);
  assert.equal((await loadQuote(input({fetchImpl:async()=>{throw new Error('offline');}}))).reason,'FETCH_OR_PARSE');
  assert.equal((await loadQuote(input({basePath:'https://example.com/data/',fetchImpl:h.fetchImpl}))).reason,'CONFIG');
});
