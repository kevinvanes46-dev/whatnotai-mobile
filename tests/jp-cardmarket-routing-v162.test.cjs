'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {context}=require('./helpers/cardmarket-harness.cjs');
function setup(){
  const {c}=context();
  for(const file of ['cardmarket-products-v152.js','jp-cardmarket-twin-v157.js','jp-artwork-v158.js','jp-set-catalog-v160.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
  return c;
}
function card(c,id){
  const source=id.slice(0,id.lastIndexOf('-')),raw=JSON.parse(fs.readFileSync(`tests/fixtures/jp-sets-v160/${source}.json`)).cards.find(row=>row.id===id);
  return c.window.JPSetCatalog.normalize({source_id:id,name:raw.name,language:'JP',number:'',condition:'EX',edition:'AUTO',variant:'NORMAL'});
}
for(const [id,twin,product] of [['PMCG1-035','base1-58',273753],['PMCG2-024','base2-60',273857],['neo1-036','neo1-70',274470]])test(`${id}: original Japanese name resolves exact twin without changing identity`,()=>{
  const c=setup(),jp=card(c,id),before=JSON.stringify(jp);c.window.CardCatalog={byId:()=>jp};
  const route=c.resolveFinalCardmarketRoute(jp),url=new URL(route.url);
  assert.equal(route.exact,true);assert.equal(route.marketplaceTwin.source_id,twin);assert.equal(url.searchParams.get('idProduct'),String(product));assert.equal(url.searchParams.get('language'),'7');
  assert.equal(JSON.stringify(jp),before);assert.equal(route.autoName,undefined);assert.equal(route.autoSet,undefined);
});
test('Gym, unknown IDs, wrong source/set, catalog conflicts and untrusted aliases fail closed',()=>{
  const c=setup(),jp=card(c,'PMCG1-035');
  for(const invalid of [card(c,'PMCG5-036'),{...jp,source_id:'PMCG1-999'},{...jp,source_id:'pmcg1-035'},{...jp,source_set_id:'PMCG2'},{...jp,set:'JUNGLE'},{...jp,source_id:'neo1-74',set:'NEO GENESIS',source_set_id:'neo1',aliases:['Pikachu'],search_aliases:['Pikachu']}])assert.equal(c.resolveFinalCardmarketRoute(invalid).exact,false);
  c.window.CardCatalog={byId:()=>({...jp,name:'Different card'})};assert.equal(c.resolveFinalCardmarketRoute(jp).exact,false);
  delete c.window.CardCatalog;delete c.window.JPArtwork;assert.equal(c.resolveFinalCardmarketRoute({...jp,aliases:['Pikachu'],search_aliases:['Pikachu']}).exact,false);
});
test('Japanese exact-ID names still reject ambiguous and conflicting English products',()=>{
  const c=setup(),jp=card(c,'PMCG1-035');
  c.window.CM_PRODUCT_CATALOG['base1-999']={id:'base1-999',name:'Pikachu',number:'999',set:{name:'BASE'},product:999};assert.equal(c.resolveFinalCardmarketRoute(jp).exact,false);
  delete c.window.CM_PRODUCT_CATALOG['base1-999'];c.window.CardCatalog={marketplaceCards:()=>[{source_id:'base1-58',name:'Wrong card',number:'58',set:'BASE',language:'EN'}]};assert.equal(c.resolveFinalCardmarketRoute(jp).exact,false);
});
test('safe twin without a verified product searches the marketplace name, never the Japanese name',async()=>{
  const c=setup(),jp=card(c,'PMCG1-035');delete c.window.CM_PRODUCT_CATALOG['base1-58'];
  c.window.CardCatalog={marketplaceCards:()=>[{source_id:'base1-58',name:'Pikachu',number:'58',set:'BASE',language:'EN'}]};
  const route=await c.resolveFinalCardmarketRoute(jp);assert.equal(route.exact,false);assert.equal(new URL(route.url).searchParams.get('searchString'),'Pikachu');
});
