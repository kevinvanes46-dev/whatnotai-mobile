'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const L=require('../library-v185.js');
const card={source_id:'sv03.5-199',source_set_id:'sv03.5',set:'TCGDEX EN sv03.5',set_name:'151',
  name:'Charizard ex',number:'199',language:'EN',edition:'AUTO',variant:'NORMAL',condition:'NM'};
const pathname='/en/Pokemon/Products/Singles/151/Charizard-ex-V3-MEW199';
test('existing Aquapolis routes reject conflicting set metadata',()=>{
  const aquapolis={source_id:'ecard2-15',source_set_id:'ecard2',set:'AQUAPOLIS',set_name:'Aquapolis',
    name:'Houndoom',number:'15',language:'EN',edition:'AUTO',variant:'NORMAL',condition:'NM'};
  assert.equal(L.safeRoute(aquapolis).exact,true);
  for(const changes of [{set:'BASE'},{setName:'Base Set'},{source_set_id:undefined,sourceSetId:'base1'}])
    assert.equal(L.safeRoute({...aquapolis,...changes}).exact,false,JSON.stringify(changes));
});
test('151 Charizard ex 199 has the independently evidenced product route',()=>{
  const result=L.safeRoute(card),url=new URL(result.url);
  assert.equal(result.exact,true);
  assert.equal(url.pathname,pathname);
  assert.equal(url.searchParams.get('language'),'1');
  assert.equal(url.searchParams.get('minCondition'),'2');
  assert.equal(new URL(L.safeRoute({...card,number:'199/165'}).url).pathname,pathname);
});
test('151 Charizard ex rejects conflicting identity, edition and finish',()=>{
  for(const changes of [
    {source_id:'sv03.5-006'}, {sourceId:'sv03.5-006'}, {source_set_id:'sv03'},
    {sourceSetId:'sv03'}, {set:'BASE'}, {set_name:'Base Set'}, {setName:'Base Set'},
    {name:'Charizard'}, {number:'006'}, {number:'199/198'}, {language:'JP'}, {language:'NL'},
    {edition:'1ST'}, {variant:'REVERSE'}, {variant:'STAMPED'}, {subtype:'shadowless'}, {condition:'UNKNOWN'}
  ]){
    const result=L.safeRoute({...card,...changes});
    assert.notEqual(new URL(result.url||'https://example.invalid').pathname,pathname,JSON.stringify(changes));
    assert.notEqual(result.exact,true,JSON.stringify(changes));
  }
});
