'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const M=require('../market-v176'),fixture=require('./fixtures/market-v176.cjs');
const copy=x=>structuredClone(x),observe=(card=fixture.card,item=fixture.item)=>M.observe(card,item,{requestedLanguage:item.language==='JP'?'ja':'en',now:fixture.now});
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};};
for(const [wanted,remove] of [['trend',[]],['avg7',['trend-holo']],['avg30',['trend-holo','avg7-holo']],['none',['trend-holo','avg7-holo','avg30-holo']]])test('metric '+wanted,()=>{
 const c=copy(fixture.card);for(const f of remove)delete c.pricing.cardmarket[f];c.pricing.cardmarket['low-holo']=1;c.pricing.cardmarket['avg-holo']=2;c.pricing.cardmarket['avg1-holo']=3;
 const q=observe(c);assert.equal(q.metric,wanted==='none'?null:wanted);assert.equal(q.quality,wanted==='none'?'UNAVAILABLE':'GENERAL_MARKET');
 if(wanted!=='none')assert.match(M.display(q,fixture.item,{now:fixture.now}).metric,new RegExp({trend:'Cardmarket trend',avg7:'7-daags gemiddelde',avg30:'30-daags gemiddelde'}[wanted]));
});
for(const bad of [0,-1,Infinity,NaN,'25',true,null])test('invalid metric '+String(bad),()=>{const c=copy(fixture.card);c.pricing.cardmarket={'trend-holo':bad,unit:'EUR',idProduct:1};assert.equal(observe(c).quality,'UNAVAILABLE');});
for(const date of [undefined,'broken','2030-01-01T00:00:00Z'])test('invalid source date '+date,()=>{const c=copy(fixture.card);c.pricing.cardmarket.updated=date;const e=observe(c);assert.equal(e.sourceUpdatedAt,null);assert.equal(e.fetchedAt,new Date(fixture.now).toISOString());assert.equal(M.freshness(e,fixture.now),'UNKNOWN');});
for(const [age,state] of [[36*3600000,'CURRENT'],[36*3600000+1,'STALE'],[72*3600000,'STALE'],[72*3600000+1,'OLD']])test('freshness boundary '+age,()=>assert.equal(M.freshness({sourceUpdatedAt:new Date(fixture.now-age).toISOString()},fixture.now),state));
for(const condition of ['NM','EX','GD','PL'])test(condition+' is general, same series, no adjustment',()=>{const i={...fixture.item,condition},e=observe(fixture.card,i);assert.equal(e.quality,'GENERAL_MARKET');assert.equal(e.value,25);assert.equal(M.key(i),M.key(fixture.item));assert.equal(M.display(e,i,{now:fixture.now}).condition,'Conditie niet verwerkt');});
for(const [field,value,reason] of [['edition','1ST','FIRST_EDITION'],['variant','STAMPED','STAMPED']])test(reason+' excluded',()=>{const c=copy(fixture.card);c.variants_detailed.push({type:'reverse',stamp:['set-logo']});const e=observe(c,{...fixture.item,[field]:value});assert.equal(e.reason,reason);assert.equal(M.eligible(e),false);});
test('normal and holo select their own family; reverse and ambiguous finishes rejected',()=>{
 const c=copy(fixture.card);c.variants={normal:true,holo:false,reverse:false};c.variants_detailed=[{type:'normal'}];c.pricing.cardmarket.trend=7;assert.equal(observe(c).value,7);
 c.variants.holo=true;assert.equal(observe(c).reason,'FINISH');c.variants.normal=false;c.variants.holo=false;c.variants.reverse=true;assert.equal(observe(c).reason,'FINISH');
});
for(const [label,change] of [['id',c=>c.id='base1-5'],['set',c=>c.set.id='base2'],['number',c=>c.localId='5'],['name',c=>c.name='Blastoise'],['language',c=>c.language='ja'],['currency',c=>c.pricing.cardmarket.unit='USD'],['product',c=>delete c.pricing.cardmarket.idProduct]])test('reject wrong '+label,()=>{const c=copy(fixture.card);change(c);assert.equal(observe(c).quality,'UNAVAILABLE');});
test('request language and conflicting item set are validated',()=>{
 assert.equal(M.observe(fixture.card,fixture.item,{requestedLanguage:'ja',now:fixture.now}).reason,'IDENTITY');
 assert.equal(observe(fixture.card,{...fixture.item,source_set_id:'base2'}).reason,'IDENTITY');
});
test('JP cannot use EN twin; exact JP response is reference only',()=>{
 const i={...fixture.item,language:'JP',sourceId:'PMCG1-035',source_set_id:'PMCG1',number:'035',name:'ピカチュウ'};
 assert.equal(observe(fixture.card,i).reason,'IDENTITY');const c={...copy(fixture.card),id:i.sourceId,set:{id:'PMCG1'},localId:'035',name:i.name};const e=observe(c,i);assert.equal(e.quality,'REFERENCE_ONLY');assert.equal(M.eligible(e),false);
});
test('cache key, throttle, invalid storage, condition sharing and older response protection',()=>{
 const s=storage(),e=observe();M.put(s,fixture.item,e);assert.ok(s.getItem('holokeep_market_cache_v176'));assert.deepEqual(M.get(s,{...fixture.item,condition:'PL'}),e);
 assert.equal(M.due(e,fixture.now+M.TTL-1),false);assert.equal(M.due(e,fixture.now+M.TTL),true);
 M.put(s,fixture.item,{...e,value:1,sourceUpdatedAt:'2026-10-01T00:00:00Z',fetchedAt:new Date(fixture.now+1).toISOString()});assert.equal(M.get(s,fixture.item).value,25);
 s.setItem(M.KEY,'bad');assert.equal(M.get(s,fixture.item),null);
});
test('legacy is never validated; primary total uses quantity and known zero cost',()=>{
 assert.equal(M.display(null,fixture.item).legacy,true);assert.equal(M.display(null,fixture.item).state,'UNKNOWN');
 const items=[fixture.item,{...fixture.item,uid:'missing',qty:3,paidEach:null},{...fixture.item,uid:'one',qty:1,paidEach:0}];
 assert.deepEqual(M.totals(items,i=>i.uid==='missing'?null:observe(),fixture.now),{qty:6,priced:3,paidQty:3,value:75,paid:14,outdated:0});
});
test('production scope preserves routing, cloud, catalog and storage contracts',()=>{
 const baseline='27a09d72d92de2fbe9740e4aa32a3113d9b3c335';
 for(const file of ['app-v137.js','ui-v137-focus.js','card-identity-v154.js','cloud-sync-v170.js','cloud-adapter-v170.js','jp-cardmarket-native-v163.js','jp-cardmarket-native-v165.js','jp-image-library-v161.js','cards.json'])assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n'),execFileSync('git',['show',baseline+':'+file],{encoding:'utf8',maxBuffer:16e6}).replace(/\r\n?/g,'\n'),file);
 assert.match(fs.readFileSync('sw.js','utf8'),/rareworth-shell-v176/);assert.match(fs.readFileSync('sw.js','utf8'),/market-v176.js\?build=176-market-value-trust/);
});
test('representative synthetic diagnostic; not whole-catalog coverage',()=>{
 const cases=[['Base','base1'],['Jungle','base2'],['Neo','neo1'],['EX','ex1'],['DP','dp1'],['Platinum','pl1'],['HGSS','hgss1'],['POP','pop1']];const counts={GENERAL_MARKET:0,REFERENCE_ONLY:0,UNAVAILABLE:0};
 for(const [label,id] of cases){const i={...fixture.item,sourceId:id+'-4',source_set_id:id};const c={...copy(fixture.card),id:i.sourceId,set:{id}};const e=observe(c,i);counts[e.quality]++;console.log('Fixture '+label+': '+e.quality);}
 const jp={...fixture.item,language:'JP'};counts[observe(fixture.card,jp).quality]++;
 for(const i of [{...fixture.item,edition:'1ST'},{...fixture.item,variant:'STAMPED'}])counts[observe(fixture.card,i).quality]++;
 assert.deepEqual(counts,{GENERAL_MARKET:8,REFERENCE_ONLY:1,UNAVAILABLE:2});console.log('Synthetic diagnostic',counts);
});
test('existing frozen card-type audit without inventing missing price metadata',()=>{
 const full=f=>require('./fixtures/'+f),known=require('../cards.json').knownCards;
 const local=(set,sid)=>{const c=known.find(c=>c.set===set&&c.language==='EN');return {id:sid+'-'+c.number,localId:c.number,name:c.name,set:{id:sid}};};
 const brief=(f)=>{const s=full(f);return {...s.cards[0],set:{id:s.id}};};
 const cases=[['Base',local('BASE','base1')],['Jungle',full('artwork/base2-25.json')],['Neo',local('NEO GENESIS','neo1')],['EX',full('artwork/ex14-4.json')],['DP',brief('en-sets-v174/dp1.json')],['Platinum',brief('en-sets-v175/pl1.json')],['HGSS',full('en-sets-v175/prime-hgss3-86.json')],['POP',brief('en-sets-v174/pop1.json')],['JP',full('artwork-v155/ja-neo1-001.json')],['1ST',full('artwork/base2-25.json')],['STAMPED',full('artwork/ex14-4.json')]];
 const counts={GENERAL_MARKET:0,REFERENCE_ONLY:0,UNAVAILABLE:0};
 for(const [label,c] of cases){const i={...fixture.item,sourceId:c.id,source_set_id:c.set.id,name:c.name,number:c.localId,language:label==='JP'?'JP':'EN',edition:label==='1ST'?'1ST':'AUTO',variant:label==='STAMPED'?'STAMPED':'NORMAL'};const e=observe(c,i);counts[e.quality]++;console.log('Existing fixture audit '+label+' '+c.id+': '+e.quality+' '+(e.reason||e.metric));}
 assert.deepEqual(counts,{GENERAL_MARKET:2,REFERENCE_ONLY:0,UNAVAILABLE:9});
});
