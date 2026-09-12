'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const expected=[
 ['PMCG1','BASE','Expansion Pack'],['PMCG2','JUNGLE','Pokémon Jungle'],['PMCG3','FOSSIL','Mystery of the Fossils'],['PMCG4','ROCKET','Rocket Gang'],
 ['PMCG5','JP GYM 1',"Leader's Stadium"],['PMCG6','JP GYM 2','Challenge from the Darkness'],
 ['neo1','NEO GENESIS','Neo Genesis'],['neo2','NEO DISCOVERY','Neo Discovery'],['neo3','NEO REVELATION','Awakening Legends'],['neo4','NEO DESTINY','Neo Destiny']
];
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('jp-set-catalog-v160.js','utf8'),c);const api=c.window.JPSetCatalog;
for(const [source,set,label] of expected)test(`${source} -> ${label}: every captured source record preserves identity`,()=>{
 const data=require(`./fixtures/jp-sets-v160/${source}.json`);assert.equal(data.id,source);assert.ok(data.cards.length);
 assert.equal(api.sourceSets[set][0],source);
 for(const row of data.cards){const raw={source_id:row.id,source_set_id:source,name:row.name,language:'JP',set,edition:'1ST',variant:'STAMPED',number:''};
  const card=api.normalize(raw);assert.equal(card.set,set);assert.equal(card.set_name,label);
  for(const key of ['source_id','source_set_id','name','language','edition','variant','number'])assert.equal(card[key],raw[key],key);
 }
});
test('all source Pikachu records are searchable without inventing absent cards',()=>{
 const actual=[];
 for(const [source] of expected)for(const card of require(`./fixtures/jp-sets-v160/${source}.json`).cards){
  if(api.searchAliases(card.name).some(alias=>/pikachu/i.test(alias)))actual.push(card.id);
 }
 assert.deepEqual(actual,['PMCG1-035','PMCG2-024','PMCG5-036','neo1-036']);
});
test('Gym sets remain separate, with explicit legacy migration only by source',()=>{
 assert.equal(api.normalize({source_id:'PMCG5-036',language:'JP',set:'GYM HEROES'}).set,'JP GYM 1');
 assert.equal(api.normalize({source_id:'PMCG6-001',language:'JP',set:'GYM CHALLENGE'}).set,'JP GYM 2');
 assert.equal(api.identity({source_id:'PMCG5-036',language:'JP',set:'JP GYM 2'}),null);
 assert.equal(api.identity({source_id:'PMCG5-036',source_set_id:'PMCG6',language:'JP'}),null);
});
test('EN cards and unknown JP sources are not rewritten',()=>{
 for(const card of [{source_id:'neo3-038',name:'Swinub',language:'EN',set:'NEO REVELATION'},{source_id:'unknown-1',language:'JP',set:'BASE'}])assert.equal(api.normalize(card),card);
});
test('search aliases preserve owner and Dark card names and are not identity aliases',()=>{
 const raw={name:'マチスのピカチュウ',language:'JP',source_id:'PMCG5-036',set:'JP GYM 1'};
 const card=api.normalize(raw);assert.equal(card.name,raw.name);assert.equal(card.aliases,undefined);assert.equal(card.search_aliases[0],'Pikachu');
 assert.equal(api.searchAliases('わるいリザード')[0],'Dark Charmeleon');
 assert.equal(api.searchAliases('ピカチュウのカード').length,0);
});
