'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const Library=require('../library-v185.js');
const {inspect}=require('../scripts/audit-set-coverage-v246.cjs');
const catalog=require('../catalog-sets-v185.json');
const audit=require('../docs/SET-COVERAGE-V246.json');

const card=(set,number)=>({id:set+'-'+number,localId:number,name:'Card '+number});
const snapshot={languages:{EN:[{id:'one',name:'One',series:'base'}],JP:[]}};
function setup(handler){
  const store=new Map();
  const api=Library.create({snapshot,storage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},
    fetch:async url=>({ok:true,json:async()=>handler(url)})});
  return {api,store};
}

test('per-set audit rejects wrong IDs, duplicates and partial coverage',()=>{
  assert.equal(inspect({id:'one'},{id:'one',cardCount:{total:1},cards:[card('one','1')]}).status,'complete');
  for(const rows of [[card('one','1'),card('one','1')],[card('wrong','1')],[]]){
    assert.equal(inspect({id:'one'},{id:'one',cardCount:{total:2},cards:rows}).status,'incomplete');
  }
  assert.equal(inspect({id:'one'},{id:'other',cards:[]}).status,'defect');
});

test('discovery rejects conflicting duplicate set IDs and preserves unambiguous records',async()=>{
  const {api}=setup(url=>url.endsWith('/sets')?
    [{id:'one',name:'One'},{id:'dup',name:'First'},{id:'dup',name:'Second'},{id:'two',name:'Two'}]:
    {id:'two',name:'Two',serie:{id:'base',name:'Base'},cards:[card('two','1')]});
  const result=await api.discover('EN');
  assert.equal(result.unclassified,1);
  assert.deepEqual(result.sets.map(s=>s.id),['one','two']);
});

test('restored complete coverage is available without treating expired or partial cache as current',async()=>{
  const {api,store}=setup(()=>({id:'one',cardCount:{total:1},cards:[card('one','1')]}));
  await api.loadSet('EN','one');
  api.state.clear();
  assert.equal(api.restore().length,1);
  assert.equal(api.state.get('EN-set-one').complete,true);
  const key='holodex_library_v185_EN-set-one',cached=JSON.parse(store.get(key));
  cached.savedAt=Date.now()-Library.TTL-1;
  store.set(key,JSON.stringify(cached));
  api.restore();
  assert.equal(api.state.get('EN-set-one').stale,true);
  cached.value.total=2;cached.savedAt=Date.now();
  store.set(key,JSON.stringify(cached));
  api.restore();
  assert.equal(api.state.get('EN-set-one').complete,false);
});

test('empty source response is not a complete set',async()=>{
  const {api}=setup(()=>({id:'one',cardCount:{total:0},cards:[]}));
  const result=await api.loadSet('EN','one');
  assert.equal(result.complete,false);
});

test('a set becomes stale when the validation expires, even without a reload',async()=>{
  let time=1000000000000;
  const store=new Map();
  const api=Library.create({snapshot,now:()=>time,storage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},
    fetch:async()=>({ok:true,json:async()=>({id:'one',cardCount:{total:1},cards:[card('one','1')]})})});
  await api.loadSet('EN','one');
  assert.equal(api.coverage('EN','one').stale,false);
  time+=Library.TTL;
  assert.equal(api.coverage('EN','one').stale,true);
});

for(const language of ['EN','JP']){
  const sets=catalog.languages[language].filter(set=>set.series!=='tcgp');
  test(language+' catalog has no duplicate set identities',()=>{
    assert.equal(new Set(sets.map(set=>set.id)).size,sets.length);
  });
  for(const set of sets)test(language+' source audit '+set.id,()=>{
    const records=audit.results.filter(row=>row.language===language&&row.id===set.id);
    assert.equal(records.length,1);
    const row=records[0];
    assert.ok(['complete','incomplete'].includes(row.status));
    assert.deepEqual(row.duplicates,[]);
    assert.deepEqual(row.invalid,[]);
    assert.deepEqual(row.duplicateNumbers,[]);
    assert.equal(row.name,set.name);
    if(row.status==='complete'){
      assert.ok(row.total>0);
      assert.equal(row.unique,row.total);
      assert.equal(row.received,row.total);
    }
  });
}
