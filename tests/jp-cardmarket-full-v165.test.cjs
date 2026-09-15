'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {context}=require('./helpers/cardmarket-harness.cjs');
const audit=JSON.parse(fs.readFileSync('data/jp-cardmarket-audit-v165.json','utf8'));
function setup(){const {c}=context();c.CONDITION_IDS={NM:'2',EX:'3'};for(const file of ['cardmarket-products-v152.js','jp-cardmarket-twin-v157.js','jp-artwork-v158.js','jp-set-catalog-v160.js','jp-cardmarket-native-v165.js','jp-cardmarket-native-v163.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);return c;}
function card(r){return {source_id:r.source_id,source_set_id:r.source_set_id,language:'JP',set:r.set,set_name:r.set_name,name:r.jp_name,condition:'EX',edition:'1ST',variant:'REVERSE'};}
test('audit covers exactly all 780 baseline records and keeps identity separate',()=>{
 const inventory=JSON.parse(fs.readFileSync('data/jp-image-inventory-v161.json','utf8'));
 assert.equal(audit.records.length,780);assert.equal(new Set(audit.records.map(r=>r.source_id)).size,780);
 assert.deepEqual(audit.records.map(r=>r.source_id).sort(),inventory.map(r=>r.source_id).sort());
 for(const r of audit.records){const raw=inventory.find(x=>x.source_id===r.source_id),fixture=JSON.parse(fs.readFileSync(`tests/fixtures/jp-sets-v160/${r.source_set_id}.json`)).cards.find(x=>x.id===r.source_id);assert.ok(fixture);assert.equal(r.jp_name,fixture.name);assert.equal(r.source_set_id,raw.source_set_id);assert.equal(r.set,raw.set);assert.equal(r.set_name,raw.display_set);assert.equal(r.language,'JP');assert.ok(r.evidence.length);assert.ok(r.reason);}
});
test('all 780 routes: EX/NM, immutable identity, native JP only, stale Western URL ignored',()=>{
 const c=setup(),paths=new Set();
 for(const r of audit.records){
  for(const [condition,filter] of [['EX','3'],['NM','2']]){
   const input={...card(r),condition,verified:true,direct:true,url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Pikachu?language=7',cardmarketUrl:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=273753&language=7'},before=JSON.stringify(input),route=c.resolveFinalCardmarketRoute(input),u=new URL(route.url);
   assert.equal(JSON.stringify(input),before,r.source_id);assert.equal(route.exact,r.route==='EXACT',r.source_id);
   assert.equal(u.hostname,'www.cardmarket.com');assert.equal(route.marketplaceTwin,undefined);assert.equal(route.autoSet,undefined);
   if(r.route==='EXACT'){
    assert.equal(u.origin+u.pathname,r.url);assert.equal(u.searchParams.get('minCondition'),filter);assert.equal(u.searchParams.get('isFirstEd'),'Y');assert.equal(u.searchParams.has('language'),false);assert.equal(u.searchParams.has('idProduct'),false);
    assert.equal(route.jpCardmarket.source_id,r.source_id);assert.equal(route.jpCardmarket.source_set_id,r.source_set_id);assert.equal(route.jpCardmarket.expansion,audit.expansions[r.source_set_id].slug);assert.equal(audit.expansions[r.source_set_id].language,'JP');
    assert.ok(r.evidence.some(e=>['cardmarket_indexed_product','baseline_acceptance'].includes(e.kind)));if(condition==='EX'){assert.ok(!paths.has(u.pathname));paths.add(u.pathname);}
   }else{assert.equal(u.pathname,'/en/Pokemon/Products/Search');assert.ok(u.searchParams.get('searchString'));assert.deepEqual([...u.searchParams.keys()],['searchString']);assert.equal(r.url,null);}
  }
 }
});
test('every exact mapping rejects cross-set and conflicting source identifiers',()=>{
 const c=setup();for(const r of audit.records.filter(r=>r.route==='EXACT')){
  const jp=card(r),wrong=r.source_set_id==='PMCG1'?'PMCG2':'PMCG1';
  for(const bad of [{...jp,source_set_id:wrong},{...jp,sourceSetId:wrong},{...jp,sourceId:wrong+'-001'},{...jp,catalogId:wrong+'-001'},{...jp,set:'UNKNOWN'},{...jp,lang:'EN'}])assert.equal(c.resolveFinalCardmarketRoute(bad).exact,false,r.source_id);
 }
});
test('manifest matches the audit, rejects duplicate mappings and stays before resolver in HTML',()=>{
 const c=setup(),m=c.window.JPCardmarketDataV165,expected=audit.records.filter(r=>r.route==='EXACT').map(r=>[r.source_id,r.source_set_id,r.cardmarket_product_slug]);assert.deepEqual(JSON.parse(JSON.stringify(m.products)),expected);
 const r=audit.records.find(r=>r.source_id==='PMCG1-057'),row=m.products.find(x=>x[0]===r.source_id);
 assert.equal(c.window.JPCardmarketNative.createResolver(m.expansions,[row,row])(card(r)),null);
 const html=fs.readFileSync('index.html','utf8');assert.ok(html.indexOf('src="jp-cardmarket-native-v165.js')<html.indexOf('src="jp-cardmarket-native-v163.js'));
});
test('Machamp regression and EN route preservation',()=>{
 const c=setup(),r=audit.records.find(r=>r.source_id==='PMCG1-057'),route=c.resolveFinalCardmarketRoute(card(r));assert.equal(route.exact,true);assert.equal(new URL(route.url).pathname,'/en/Pokemon/Products/Singles/Expansion-Pack/Machamp-EXP');
 const en=c.resolveFinalCardmarketRoute({source_id:'base1-58',name:'Pikachu',number:'58',set:'BASE',language:'EN',condition:'EX'});assert.equal(en.exact,true);assert.equal(new URL(en.url).searchParams.get('idProduct'),'273753');assert.equal(new URL(en.url).searchParams.get('language'),'1');
});
