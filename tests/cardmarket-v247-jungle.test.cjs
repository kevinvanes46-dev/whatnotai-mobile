'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {resolver}=require('../scripts/audit-cardmarket-v247.cjs');
const J=require('../nl-jungle-v242.js');
const L=resolver().library;
test('all EN Jungle identities use the existing Jungle resolver centrally',()=>{
  for(let n=1;n<=64;n++){
    const card={source_id:'base2-'+n,source_set_id:'base2',set:'JUNGLE',set_name:'Jungle',
      name:J.CATALOG[n-1],number:String(n),language:'EN',condition:'EX',edition:'AUTO',variant:'NORMAL'};
    const expected=J.englishRouteFor(card,{condition:'EX',edition:'AUTO'}),actual=L.safeRoute(card);
    assert.equal(actual.url,expected.url,card.source_id);
    assert.equal(actual.exact,expected.exact,card.source_id);
    for(const changes of [{source_set_id:'base1'},{sourceSetId:'base1'},{sourceId:'base2-'+(n+1)},{set_name:'Base Set'},{number:String(n+100)},{variant:'STAMPED'},{variant:'REVERSE'}])
      assert.equal(L.safeRoute({...card,...changes}).exact,false,JSON.stringify([n,changes]));
  }
});
