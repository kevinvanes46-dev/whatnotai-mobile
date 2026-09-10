'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {context}=require('./helpers/cardmarket-harness.cjs');
function setup(options){const {c}=context(options);vm.runInContext(fs.readFileSync('cardmarket-products-v152.js','utf8'),c);vm.runInContext(fs.readFileSync('jp-cardmarket-twin-v157.js','utf8'),c);return c;}
const jp=(set='NEO GENESIS',id='neo1-061',name='Snubbull')=>({source_id:id,name,set,language:'JP',number:'',condition:'EX',edition:'AUTO',variant:'NORMAL'});
test('Two Snubbulls resolve through existing distinct product mappings without mutating JP identity',()=>{
 const c=setup(),urls=[];
 for(const [card,number,product]of [[jp(),'74',274474],[jp('NEO REVELATION','neo3-048'),'55',274641]]){
  const before=JSON.stringify(card),route=c.resolveFinalCardmarketRoute(card);assert.equal(route.exact,true);assert.equal(route.marketplaceTwin.number,number);assert.equal(route.marketplaceTwin.language,'EN');assert.equal(new URL(route.url).searchParams.get('idProduct'),String(product));assert.equal(new URL(route.url).searchParams.get('language'),'7');assert.equal(JSON.stringify(card),before);assert.equal(route.autoName,undefined);assert.equal(route.autoSet,undefined);urls.push(route.url);
 }assert.notEqual(...urls);
});
test('Ambiguous counterparts and missing counterparts use SEARCH',()=>{
 const c=setup();c.window.CM_PRODUCT_CATALOG['neo1-999']={id:'neo1-999',name:'Snubbull',number:'999',set:{id:'neo1',name:'NEO GENESIS'},product:999};assert.equal(c.resolveFinalCardmarketRoute(jp()).exact,false);
 assert.equal(c.resolveFinalCardmarketRoute(jp('NEO GENESIS','neo1-999','Missing card')).exact,false);
});
test('Unknown source, mismatched set/source and uncertain Gym mapping cannot claim EXACT',()=>{
 const c=setup();for(const card of [jp('NEO REVELATION'),jp('BASE','unknown-1'),{...jp(),source_set_id:'neo3'},jp('GYM HEROES','PMCG5-1')])assert.equal(c.resolveFinalCardmarketRoute(card).exact,false);
});
test('Shared JA/EN IDs and unverified cached aliases never provide an English identity',()=>{
 const c=setup();const card={...jp('NEO GENESIS','neo1-74','ブルー'),aliases:['Snubbull']};assert.equal(c.resolveFinalCardmarketRoute(card).exact,false);
 assert.equal(c.resolveFinalCardmarketRoute({...jp(),aliases:['Wrong old alias']}).marketplaceTwin.number,'74');
});
test('Current source and English catalog conflicts fail closed',()=>{
 const c=setup();c.window.CardCatalog={byId:()=>({...jp(),name:'Different card'})};assert.equal(c.resolveFinalCardmarketRoute(jp()).exact,false);
 c.window.CardCatalog={marketplaceCards:()=>[{language:'EN',set:'NEO GENESIS',source_id:'neo1-74',name:'Different card',number:'74'}]};assert.equal(c.resolveFinalCardmarketRoute(jp()).exact,false);
});
test('Generic unique set/name matching works beyond Snubbull',()=>{
 const c=setup();const result=c.resolveFinalCardmarketRoute(jp('FOSSIL','PMCG3-999','Slowpoke'));assert.equal(result.exact,true);assert.equal(result.marketplaceTwin.source_id,'base3-55');
});
test('Known EN route is unchanged and JP verified direct routes keep priority',()=>{
 const c=setup();const en={name:'Bagon',source_id:'ex15-43',number:'43',set:'EX DRAGON FRONTIERS',language:'EN',condition:'NM'};assert.equal(c.resolveFinalCardmarketRoute(en).exact,true);
 const direct={...jp(),verified:true,direct:true,url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Gold-Silver-to-a-New-World/Snubbull-GSNW'};assert.equal(c.resolveFinalCardmarketRoute(direct).url.split('?')[0],direct.url);
});
test('Existing remote resolver preserves verified product paths when no bundled mapping is available',async()=>{
 // User-supplied regression paths are API fixtures only, never production URL construction.
 const expected={'neo1-74':'Neo-Genesis/Snubbull-NG74','neo3-55':'Neo-Revelation/Snubbull-NR55'};
 const c=setup({fetch:async url=>{const id=url.split('/').pop(),[set,number]=id.split('-');return {ok:true,json:async()=>({data:{id,name:'Snubbull',number,set:{id:set,name:set==='neo1'?'Neo Genesis':'Neo Revelation'},cardmarket:{url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/'+expected[id]}}})};}});
 const cards=Object.keys(expected).map(id=>{const p=c.window.CM_PRODUCT_CATALOG[id];delete c.window.CM_PRODUCT_CATALOG[id];return {source_id:id,name:p.name,number:p.number,set:p.set.name,language:'EN'};});
 c.window.CardCatalog={marketplaceCards:()=>cards};
 for(const card of [jp(),jp('NEO REVELATION','neo3-048')]){const route=await c.resolveFinalCardmarketRoute(card);assert.equal(route.exact,true);assert.ok(route.url.includes(expected[route.marketplaceTwin.source_id]));assert.deepEqual(new URL(route.url).searchParams.getAll('language'),['7']);}
});
test('A real JP number is never replaced by the marketplace number; blank selection stays unavailable',()=>{
 const c=setup(),card={...jp(),number:'209'};assert.equal(c.resolveFinalCardmarketRoute(card).marketplaceTwin.number,'74');assert.equal(card.number,'209');assert.equal(c.resolveFinalCardmarketRoute({...jp(),name:''}).url,'');
});
