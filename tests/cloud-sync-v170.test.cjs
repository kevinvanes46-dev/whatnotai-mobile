'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const sync=require('../cloud-sync-v170.js');
const local=(payload,metadata)=>sync.createLocalSnapshot(payload,metadata);
const remote=(payload,revision='1',metadata={})=>sync.parseSnapshot({payload,revision,...metadata});
const withBase=(payload,cloud,metadata={})=>local(payload,{...sync.prepareDownload(cloud).metadata,...metadata});
const card={sourceId:'neo1-036',source_id:'neo1-036',language:'JP',set:'NEO GENESIS',
  condition:'EX',variant:'NORMAL',quantity:2,paidPrice:12.50,
  cardmarketUrl:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Gold-Silver-to-a-New-World/Pikachu-GSNW?minCondition=3',
  artwork:{src:'assets/cards/jp/neo1/neo1-036.webp',futureFlags:[true,null]},
  name:'ピカチュウ',future:{nested:{custom:'🗂️ e\u0301 é 金、銀、新世界へ…'},list:[1,'2',false]}};

test('empty local and cloud are EMPTY, including explicit empty content',()=>{
  assert.equal(sync.classifySyncState(null,null),'EMPTY');
  assert.equal(sync.classifySyncState(local([]),remote([])),'EMPTY');
  assert.equal(sync.classifySyncState(local([]),null),'EMPTY');
});
test('local-only and cloud-only require confirmed absence',()=>{
  assert.equal(sync.classifySyncState(local([card]),null),'LOCAL_ONLY');
  assert.equal(sync.classifySyncState(null,remote([card])),'CLOUD_ONLY');
});
test('identical content is IN_SYNC regardless of descriptive metadata',()=>{
  const a=local([card],{device_id:'local-device',updated_at:'2040-01-01T00:00:00Z'});
  const b=remote([card],'8',{device_id:'another-device',updated_at:'2020-01-01T00:00:00Z'});
  assert.equal(sync.classifySyncState(a,b),'IN_SYNC');
});
test('only a local edit against the known cloud basis is LOCAL_NEWER',()=>{
  const cloud=remote([card],'4');
  assert.equal(sync.classifySyncState(withBase([{...card,quantity:3}],cloud),cloud),'LOCAL_NEWER');
});
test('only a cloud edit against the known common basis is CLOUD_NEWER',()=>{
  const original=remote([card],'4'),cloud=remote([{...card,quantity:3}],'5');
  assert.equal(sync.classifySyncState(withBase([card],original),cloud),'CLOUD_NEWER');
});
test('both edited since a common basis returns CONFLICT, never merges',()=>{
  const original=remote([card],'4'),a=withBase([{...card,quantity:3}],original),b=remote([{...card,paidPrice:99}],'5');
  const before=JSON.stringify([a,b]);
  assert.equal(sync.classifySyncState(a,b),'CONFLICT');assert.equal(JSON.stringify([a,b]),before);
});
test('unrelated snapshots, same-revision edits and revision regression fail closed',()=>{
  const initial=remote([card],'4'),changed=local([{...card,quantity:3}]);
  assert.equal(sync.classifySyncState(changed,initial),'CONFLICT');
  assert.equal(sync.classifySyncState(withBase([card],initial),remote([{...card,quantity:2.5}],'4')),'CONFLICT');
  assert.equal(sync.classifySyncState(withBase([{...card,quantity:3}],initial),remote([card],'3')),'CONFLICT');
  assert.equal(sync.classifySyncState(withBase([card],initial),null),'CONFLICT');
  assert.equal(sync.classifySyncState(initial,null),'CONFLICT');
});
test('intentional empty collections retain deletion/conflict semantics',()=>{
  const original=remote([card],'1');
  assert.equal(sync.classifySyncState(withBase([],original),original),'LOCAL_NEWER');
  assert.equal(sync.classifySyncState(withBase([card],original),remote([],'2')),'CLOUD_NEWER');
  assert.equal(sync.classifySyncState(withBase([],original),remote([{...card,quantity:10}],'2')),'CONFLICT');
  assert.equal(sync.classifySyncState(withBase([],original),null),'CONFLICT');
});
test('clock skew and device identity never choose a winning side',()=>{
  const a=local([card],{updated_at:'2099-01-01T00:00:00Z',device_id:'same-device'});
  const b=remote([{...card,quantity:7}],'1',{updated_at:'2000-01-01T00:00:00Z',device_id:'same-device'});
  assert.equal(sync.classifySyncState(a,b),'CONFLICT');
});
test('unknown fields, JP/Unicode and dangerous-looking keys roundtrip without mutation',()=>{
  const payload=[card,JSON.parse('{"__proto__":{"kept":true},"constructor":"kept","name":"金、銀、新世界へ…"}')];
  const snapshot=local(payload),again=sync.parseSnapshot(JSON.stringify(snapshot));
  const upload=sync.prepareUpload(again,'0');assert.deepEqual(upload.args.new_payload,payload);
  const download=sync.prepareDownload(remote(upload.args.new_payload));assert.deepEqual(download.collection,payload);
  assert.equal(download.collection[0].name,'ピカチュウ');
  assert.equal(download.collection[0].future.nested.custom,card.future.nested.custom);
  assert.equal(Object.hasOwn(download.collection[1],'__proto__'),true);
  download.collection[0].future.nested.custom='changed';
  assert.equal(snapshot.payload[0].future.nested.custom,card.future.nested.custom);
  assert.equal({}.kept,undefined);
});
test('canonical signatures sort object keys recursively and keep array order',()=>{
  const a=local([{z:{b:1,a:2},'10':'ten','2':'two',a:[{y:3,x:4},5]}]);
  const b=local([{'2':'two',a:[{x:4,y:3},5],'10':'ten',z:{a:2,b:1}}]);
  assert.equal(a.signature,b.signature);
  assert.notEqual(local([1,2]).signature,local([2,1]).signature);
  assert.notEqual(local(['é']).signature,local(['e\u0301']).signature);
  assert.notEqual(local([card]).signature,local([card],{schema_version:'future'}).signature);
});
test('forged snapshot signatures are ignored and recomputed from content',()=>{
  const a=local([card]),b=remote([{...card,quantity:100}]);b.signature=a.signature;
  assert.equal(sync.classifySyncState(a,b),'CONFLICT');
  assert.notEqual(sync.parseSnapshot(b).signature,a.signature);
});
test('upload proposals bind the exact expected revision and never contain a user_id',()=>{
  const initial=local([card],{device_id:'opaque-metadata'});
  const first=sync.prepareUpload(initial,0);assert.equal(first.status,'READY');
  assert.deepEqual(Object.keys(first.args).sort(),['expected_revision','new_device_id','new_payload','new_schema_version']);
  assert.equal(first.args.expected_revision,'0');assert.equal(first.args.new_device_id,'opaque-metadata');
  assert.deepEqual(sync.prepareUpload(initial,'2'),{status:'CONFLICT'});
  const cloud=remote([card],'2'),edited=withBase([{...card,quantity:3}],cloud);
  assert.equal(sync.prepareUpload(edited,2).args.expected_revision,'2');
  assert.deepEqual(sync.prepareUpload(edited,3),{status:'CONFLICT'});
  assert.deepEqual(sync.prepareUpload(edited,0),{status:'CONFLICT'});
  assert.deepEqual(sync.prepareUpload(cloud,0),{status:'CONFLICT'});
});
test('revision advance with unchanged content still requires refreshed basis before upload',()=>{
  const cloud=remote([card],'2'),edited=withBase([{...card,quantity:3}],cloud),newer=remote([card],'3');
  assert.equal(sync.classifySyncState(edited,newer),'LOCAL_NEWER');
  assert.deepEqual(sync.prepareUpload(edited,newer.revision),{status:'CONFLICT'});
});
test('download is detached and supplies a reusable confirmed sync basis',()=>{
  const cloud=remote([card],'9007199254740993'),proposal=sync.prepareDownload(cloud);
  assert.equal(proposal.metadata.revision,'9007199254740993');
  const localCopy=local(proposal.collection,proposal.metadata);
  assert.equal(sync.classifySyncState(localCopy,cloud),'IN_SYNC');
  assert.equal(sync.prepareUpload(localCopy,cloud.revision).args.expected_revision,'9007199254740993');
  proposal.collection[0].quantity=99;assert.equal(cloud.payload[0].quantity,2);
});
test('bad revisions, malformed bases and invalid metadata are rejected',()=>{
  for(const rev of [-1,1.5,Number.MAX_SAFE_INTEGER+1,'01','-1','1.0','9223372036854775808',null])assert.throws(()=>sync.prepareUpload(local([]),rev));
  assert.throws(()=>local([],{base:{revision:'2',signature:'fake'}}));
  assert.throws(()=>local([],{schema_version:''}));
  assert.throws(()=>local([],{device_id:{fingerprint:true}}));
  assert.throws(()=>local([],{updated_at:'yesterday'}));
  assert.throws(()=>sync.prepareDownload(local([])),/positive revision/);
  assert.throws(()=>sync.prepareUpload(null,0));assert.throws(()=>sync.prepareDownload(null));
});
test('invalid non-array payload and unsupported JSON never silently become empty data',()=>{
  for(const payload of [{},'[]',42,null]){
    assert.throws(()=>local(payload));assert.throws(()=>sync.parseSnapshot({payload}));
  }
  for(const value of [undefined,Infinity,NaN,()=>{},Symbol('x'),1n,new Date(),new Map()])assert.throws(()=>local([{unknown:value}]));
  const cycle={};cycle.self=cycle;assert.throws(()=>local([cycle]));
  assert.throws(()=>local(new Array(1)));
  const extended=[];extended.extra=1;assert.throws(()=>local(extended));
  let called=false;const getter={get x(){called=true;return 1;}};assert.throws(()=>local([getter]));assert.equal(called,false);
  assert.throws(()=>sync.parseSnapshot('{invalid'));
});
test('browser-safe API has no storage, network or device side effects',()=>{
  const context={};
  for(const key of ['localStorage','sessionStorage','indexedDB','fetch','XMLHttpRequest','navigator','crypto'])Object.defineProperty(context,key,{get(){throw Error('Forbidden side effect: '+key);}});
  vm.runInNewContext(fs.readFileSync('cloud-sync-v170.js','utf8')+`
    const api=RareWorthCloudSync;
    const snapshot=api.createLocalSnapshot([{sourceId:'neo1-036'}]);
    api.parseSnapshot(JSON.stringify(snapshot));
    api.classifySyncState(snapshot,null);
    api.prepareUpload(snapshot,0);
    api.prepareDownload({payload:[],revision:'1'});
  `,context);
  assert.equal(typeof context.RareWorthCloudSync.prepareUpload,'function');
});
