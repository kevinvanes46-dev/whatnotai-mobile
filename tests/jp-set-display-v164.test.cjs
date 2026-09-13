'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){const c={window:{}};vm.createContext(c);for(const f of ['card-identity-v154.js','jp-set-catalog-v160.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);return c.window;}
const cases=[['PMCG1-035','BASE','Expansion Pack','拡張パック'],['PMCG2-024','JUNGLE','Pokémon Jungle','ポケモンジャングル'],['PMCG5-036','JP GYM 1',"Leader's Stadium",'リーダーズスタジアム'],['neo1-036','NEO GENESIS','Neo Genesis','金、銀、新世界へ...'],['neo3-038','NEO REVELATION','Awakening Legends','めざめる伝説']];
for(const [id,set,label,remoteLabel] of cases)test(`${id}: canonical display wins before catalog load, after hydration and from stored aliases`,async()=>{
 const w=setup(),source=id.split('-')[0],raw={source_id:id,source_set_id:source,set,set_name:label,language:'JP',name:'Pikachu',edition:'1ST',variant:'REVERSE',condition:'EX',url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Gold-Silver-to-a-New-World/Pikachu-GSNW?minCondition=3',jpCardmarket:{expansion:'Gold-Silver-to-a-New-World'}};
 const before=JSON.stringify(raw);w.CardArtwork={lookup:async()=>({id,name:'ピカチュウ',set:{id:source,name:remoteLabel},image:'https://assets.tcgdex.net/ja/test'})};
 const hydrated=await w.CardIdentity.hydrate(raw);
 for(const value of [hydrated,w.CardIdentity.normalize({...raw,set_name:remoteLabel}),w.CardIdentity.normalize({...raw,source_id:undefined,sourceId:id,set_name:undefined,setName:remoteLabel})]){
   assert.equal(value.set_name,label);assert.equal(value.setName,label);assert.equal(value.set,set);assert.equal(value.source_set_id,source);assert.equal(value.source_id,id);
   for(const key of ['language','edition','variant','condition','url'])assert.equal(value[key],raw[key]);assert.deepEqual(value.jpCardmarket,raw.jpCardmarket);
 }
 assert.equal(JSON.stringify(raw),before);
 w.CardCatalog={byId:()=>({...raw,set_name:remoteLabel})};assert.equal(w.CardIdentity.normalize(raw).set_name,label);
});
test('all ten JP source sets use the same display policy; missing source-set is recovered',()=>{
 const w=setup();for(const row of w.JPSetCatalog.sets){const value=w.CardIdentity.normalize({source_id:row.source+'-001',language:'JP',set:'AUTO',set_name:'External title'});assert.equal(value.set,row.key);assert.equal(value.set_name,row.label);assert.equal(value.source_set_id,row.source);}
});
test('EN, unknown JP sources, conflicting identities and queries are not relabelled',()=>{
 const w=setup();for(const raw of [{source_id:'neo1-70',language:'EN',set:'NEO GENESIS'},{source_id:'unknown-001',language:'JP',set:'AUTO'},{source_id:'neo1-036',source_set_id:'neo3',language:'JP',set:'NEO GENESIS'},{source_id:'neo1-036',language:'JP',set:'JUNGLE'}])assert.equal(w.CardIdentity.normalize({...raw,set_name:'Keep label'}).set_name,'Keep label');
 assert.equal(w.CardIdentity.normalize({kind:'query',source_id:'neo1-036',name:'Pikachu',language:'JP'}).set_name,'');
});
