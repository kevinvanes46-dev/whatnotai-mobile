'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');

function setup(){
  const c={window:{JPCardmarketTwin:{canonicalSet:card=>card.set&&card.set!=='AUTO'?card.set:''}}};
  vm.createContext(c);vm.runInContext(fs.readFileSync('jp-artwork-v158.js','utf8'),c);return c.window.JPArtwork;
}
const samples={
  BASE:['PMCG1-001','PMCG1-002','PMCG1-003'],JUNGLE:['PMCG2-001','PMCG2-002','PMCG2-003'],FOSSIL:['PMCG3-001','PMCG3-002','PMCG3-003'],
  'NEO GENESIS':['neo1-001','neo1-002','neo1-003'],'NEO DISCOVERY':['neo2-001','neo2-002','neo2-003'],
  'NEO REVELATION':['neo3-001','neo3-002','neo3-038'],'NEO DESTINY':['neo4-001','neo4-002','neo4-003']
};

test('seven requested JP sets expose multiple exact source_id records',()=>{
  const api=setup();
  for(const [set,ids] of Object.entries(samples))for(const id of ids){
    const result=api.resolve({source_id:id,source_set_id:id.slice(0,id.lastIndexOf('-')),language:'JP',set});
    assert.equal(result.source_id,id);assert.equal(result.set,set);assert.equal(result.source_set_id,id.slice(0,id.lastIndexOf('-')));
    assert.match(result.image,/^https:\/\/cdn\.artofpkm\.com\/[a-z0-9]+$/);assert.match(result.sourceRecord,/^https:\/\/www\.artofpkm\.com\/sets\/\d+\/card\/\d+$/);
  }
});

test('Swinub is the exact Japanese Awakening Legends record',()=>{
  const result=setup().resolve({source_id:'neo3-038',source_set_id:'neo3',name:'Swinub',language:'JP',set:'NEO REVELATION'});
  assert.equal(result.name,'Swinub');assert.equal(result.sourceRecord,'https://www.artofpkm.com/sets/40/card/13');
  assert.equal(result.image,'https://cdn.artofpkm.com/ki7p3hj3p3phx6tjwmi4av5x0tm6');
});

test('resolver fails closed for EN, wrong source set, wrong canonical set and unknown ids',()=>{
  const api=setup(),base={source_id:'neo3-038',source_set_id:'neo3',language:'JP',set:'NEO REVELATION'};
  for(const card of [{...base,language:'EN'},{...base,source_set_id:'neo1'},{...base,set:'NEO GENESIS'},{...base,source_id:'neo3-999'}])assert.equal(api.resolve(card),null);
});

test('coverage is explicit and ambiguity is excluded',()=>{
  const coverage=setup().coverage;assert.equal(coverage.length,7);assert.equal(coverage.reduce((sum,row)=>sum+row.matched,0),413);
  assert.deepEqual(Array.from(coverage,row=>row.source_set_id),['PMCG1','PMCG2','PMCG3','neo1','neo2','neo3','neo4']);
  for(const row of coverage)assert.equal(row.sourceCards,row.matched+row.missing);
});
