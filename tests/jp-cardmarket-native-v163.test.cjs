'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {context}=require('./helpers/cardmarket-harness.cjs');
function setup(){
  const {c}=context();c.CONDITION_IDS={NM:'2',EX:'3',GD:'4',PL:'6'};
  for(const file of ['cardmarket-products-v152.js','jp-cardmarket-twin-v157.js','jp-artwork-v158.js','jp-set-catalog-v160.js','jp-cardmarket-native-v163.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
  return c;
}
function card(c,id){
  const source=id.split('-')[0],raw=JSON.parse(fs.readFileSync(`tests/fixtures/jp-sets-v160/${source}.json`)).cards.find(row=>row.id===id);
  return c.window.JPSetCatalog.normalize({source_id:id,name:raw.name,language:'JP',number:'',condition:'EX',edition:'AUTO',variant:'NORMAL'});
}
for(const [id,path] of [['PMCG1-035','Expansion-Pack/Pikachu'],['PMCG2-024','Pokemon-Jungle/Pikachu'],['neo1-036','Gold-Silver-to-a-New-World/Pikachu-GSNW'],['PMCG5-036','Leaders-Stadium/Lt-Surges-Pikachu-LST']])test(`${id}: native product, filters and immutable JP identity`,()=>{
  const c=setup();
  for(const [condition,filter] of [['EX','3'],['NM','2']]){
    const jp={...card(c,id),condition,edition:'1ST',variant:'REVERSE'},before=JSON.stringify(jp),route=c.resolveFinalCardmarketRoute(jp),url=new URL(route.url);
    assert.equal(route.exact,true);assert.equal(url.pathname,'/en/Pokemon/Products/Singles/'+path);assert.equal(url.searchParams.get('minCondition'),filter);assert.equal(url.searchParams.get('isFirstEd'),'Y');assert.equal(url.searchParams.has('language'),false);assert.equal(url.searchParams.has('idProduct'),false);
    assert.equal(JSON.stringify(jp),before);assert.equal(route.jpCardmarket.source_id,id);assert.equal(route.marketplaceTwin,undefined);assert.equal(route.autoName,undefined);assert.equal(route.autoSet,undefined);
  }
});
test('known native mapping overrides saved verified Western URLs; missing mappings never use Western products',()=>{
  const c=setup();
  for(const id of ['PMCG1-035','PMCG2-024','neo1-036','PMCG5-036']){
    const jp=card(c,id),expected=c.resolveFinalCardmarketRoute(jp).url;
    assert.equal(c.resolveFinalCardmarketRoute({...jp,verified:true,direct:true,url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Pikachu-NG70?language=7',cardmarketUrl:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=274470'}).url,expected);
  }
  const jp={...card(c,'PMCG1-001'),verified:true,direct:true,url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=273739&language=7'};
  assert.ok(c.window.JPCardmarketTwin.counterpart(jp));const route=c.resolveFinalCardmarketRoute(jp);assert.equal(route.exact,false);assert.equal(new URL(route.url).pathname,'/en/Pokemon/Products/Search');
});
test('unknown, mixed, wrong-source and wrong-set identities fail closed',()=>{
  const c=setup(),jp=card(c,'PMCG1-035');
  for(const bad of [{...jp,source_id:'PMCG1-999'},{...jp,source_id:'pmcg1-035'},{...jp,sourceId:'PMCG2-024'},{...jp,catalogId:'neo1-036'},{...jp,source_set_id:'PMCG2'},{...jp,set:'JUNGLE'},{...jp,lang:'EN'},{name:'Pikachu',language:'JP',set:'BASE'}])assert.equal(c.resolveFinalCardmarketRoute(bad).exact,false);
  c.window.CardCatalog={byId:()=>({...jp,set:'JUNGLE'})};assert.equal(c.resolveFinalCardmarketRoute(jp).exact,false);
});
test('ambiguous product mappings and unsafe expansion/path data cannot produce EXACT',()=>{
  const c=setup(),jp=card(c,'PMCG1-035'),build=c.window.JPCardmarketNative.createResolver,sets={PMCG1:{set:'BASE',slug:'Expansion-Pack'}};
  assert.equal(build(sets,[['PMCG1-035','PMCG1','Pikachu'],['PMCG1-035','PMCG1','Pikachu-V2']])(jp),null);
  assert.equal(build(sets,[['PMCG1-035','PMCG1','Pikachu'],['PMCG1-999','PMCG1','Pikachu']])(jp),null);
  assert.equal(build(sets,[['PMCG1-035','PMCG2','Pikachu']])(jp),null);
  assert.equal(build(sets,[['PMCG1-035','PMCG1','../Pikachu?language=7']])(jp),null);
  assert.equal(build({PMCG1:{set:'JUNGLE',slug:'Jungle'}},[['PMCG1-035','PMCG1','Pikachu']])(jp),null);
});
test('EN routing and Western twin reference remain available without supplying the final JP route',()=>{
  const c=setup(),jp=card(c,'neo1-036');assert.equal(c.window.JPCardmarketTwin.counterpart(jp).source_id,'neo1-70');
  const en={source_id:'base1-58',name:'Pikachu',number:'58',set:'BASE',language:'EN',condition:'EX'},route=c.resolveFinalCardmarketRoute(en);
  assert.equal(route.exact,true);assert.equal(new URL(route.url).searchParams.get('idProduct'),'273753');assert.equal(new URL(route.url).searchParams.get('language'),'1');
});
