'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
const I=require('../portfolio-insights-v178'),C=require('../cost-basis-v177'),M=require('../market-v176'),F=require('./fixtures/market-v176.cjs');
const item=(uid,qty=1,cost=10)=>C.initialize({...F.item,uid,addedAt:1},qty,cost);
const quote=(value,quality='GENERAL_MARKET',age=0)=>({...M.observe(F.card,F.item,{requestedLanguage:'en',now:F.now}),value,quality,sourceUpdatedAt:new Date(F.now-age).toISOString()});
const derive=(items,entries)=>I.derive(items,x=>entries[x.uid]||null,C,M,F.now);
test('summary delegates exact market and cost totals including partial, free, missing and wishlist',()=>{
 const rows=[item('a',2,10),C.addUnknown(item('b',3,20),2),item('free',1,0),{...item('w',4,90),listType:'WISHLIST'},item('missing',2,null)];
 const prices={a:quote(50),b:quote(10),free:quote(5),w:quote(500)};const x=derive(rows,prices);
 assert.deepEqual(x.summary.market,M.totals(rows,i=>prices[i.uid]||null,F.now));assert.deepEqual(x.summary.cost,C.totals(rows,i=>prices[i.uid]||null));
 assert.equal(x.summary.cost.qty,10);assert.equal(x.summary.market.value,155);assert.equal(x.summary.cost.cost,80);assert.equal(x.summary.cost.comparableQty,6);assert.equal(x.summary.cost.difference,55);assert.equal(x.summary.cost.percentage,68.75);
});
test('most valuable uses position; JP reference and legacy numeric fields excluded',()=>{const a=item('a'),b=item('b',3),c={...item('c'),language:'JP'},d=item('d');const x=derive([a,b,c,d],{a:quote(100),b:quote(40),c:quote(500,'REFERENCE_ONLY')});assert.deepEqual(x.mostValuable.map(r=>[r.item.uid,r.positionValue]),[['b',120],['a',100]]);});
test('positive rankings use comparable quantities only',()=>{const a=item('a',1,10),b=C.addUnknown(item('b',1,10),9);const x=derive([a,b,item('c',1,null)],{a:quote(30),b:quote(60),c:quote(100)});assert.deepEqual(x.positive.map(r=>[r.item.uid,r.comparison.difference]),[['b',50],['a',20]]);});
test('negative rankings start with most negative amount',()=>{const x=derive([item('a',1,20),item('b',1,90),item('c',1,5)],{a:quote(10),b:quote(10),c:quote(10)});assert.deepEqual(x.negative.map(r=>r.item.uid),['b','a']);});
test('attention counts independent; compact list deduplicates UID and has defined priority',()=>{
 const legacy={...F.item,uid:'l'},partial=C.addUnknown(item('p'),1),unknown=item('u',1,null),missing=item('m'),stale=item('s'),unavailable=item('x'),ref={...item('jp'),language:'JP'};
 const x=derive([stale,missing,unknown,partial,legacy,unavailable,ref],{s:quote(10,'GENERAL_MARKET',80*3600000),x:quote(null,'UNAVAILABLE'),jp:quote(99,'REFERENCE_ONLY')});
 assert.deepEqual(x.attention.map(r=>r.item.uid),['l','p','u','m','x','jp','s']);assert.equal(x.counters.MISSING_MARKET_PRICE,4);assert.equal(x.counters.UNKNOWN_COST,1);assert.equal(x.counters.STALE_MARKET_PRICE,1);
 assert.equal(derive([legacy,{...legacy}],{}).attention.length,1);
});
for(const state of ['STALE','OLD','UNKNOWN'])test('freshness attention '+state,()=>{const e=quote(10,'GENERAL_MARKET',state==='STALE'?48*3600000:96*3600000);if(state==='UNKNOWN')e.sourceUpdatedAt=null;assert.equal(derive([item('a')],{a:e}).counters.STALE_MARKET_PRICE,1);});
for(const [mode,order] of Object.entries({'value-desc':['b','a','c','m'],'value-asc':['a','c','b','m'],positive:['b','a','c','m'],negative:['m','a','b','c'],'paid-desc':['m','a','b','c'],'paid-asc':['a','b','c','m'],recent:['m','a','b','c'],name:['a','b','c','m'],set:['a','b','c','m']}))test('stable sort '+mode,()=>{
 const rows=[item('a'),item('b'),item('c'),item('m',1,100)].map((r,i)=>({...r,name:r.uid,setName:'Set',addedAt:i===3?2:1}));const x=derive(rows,{a:quote(20),b:quote(40),c:quote(20),m:quote(10,'REFERENCE_ONLY')});
 // Negative has no eligible negative result, so every item retains original order.
 const expected=mode==='negative'?['a','b','c','m']:order;
 assert.deepEqual(I.sort(rows,mode,x).map(r=>r.uid),expected);assert.deepEqual(rows.map(r=>r.uid),['a','b','c','m']);
});
test('missing numeric values always sort below zero known costs and valid results',()=>{const rows=[item('m',1,null),item('z',1,0),item('p',1,10)],x=derive(rows,{z:quote(20),p:quote(10)});assert.deepEqual(I.sort(rows,'paid-asc',x).map(r=>r.uid),['z','p','m']);});
test('all filters include only owned corresponding states',()=>{
 const rows=[item('a'),item('m',1,null),{...F.item,uid:'l'},C.addUnknown(item('p'),2),{...item('w'),listType:'WISHLIST'}],x=derive(rows,{a:quote(25,'GENERAL_MARKET',48*3600000)});
 const expected={'with-price':['a'],'without-price':['m','l','p'],complete:['a'],incomplete:['m','l','p'],legacy:['l'],stale:['a'],attention:['a','m','l','p']};
 for(const [filter,ids] of Object.entries(expected))assert.deepEqual(rows.filter(r=>I.matches(x.byItem.get(r),filter)).map(r=>r.uid),ids);
});
test('empty and wishlist-only produce no owned insights',()=>{for(const rows of [[],[{...item('w'),listType:'WISHLIST'}]]){const x=derive(rows,{w:quote(90)});assert.equal(x.summary.cost.qty,0);assert.equal(x.rows.length,0);assert.equal(x.attention.length,0);}});
test('derivation never mutates inputs and lookup is linear for 100, 500, 1000 items',()=>{
 for(const size of [100,500,1000]){const rows=Array.from({length:size},(_,i)=>item(String(i),2,10)),before=JSON.stringify(rows);let calls=0;const e=quote(25),start=performance.now();let result;for(let n=0;n<20;n++)result=I.derive(rows,()=>{calls++;return e;},C,M,F.now);const ms=(performance.now()-start)/20;console.log('v178 '+size+' items average '+ms.toFixed(2)+'ms');assert.equal(calls,size*20);assert.equal(result.summary.market.value,size*50);assert.equal(JSON.stringify(rows),before);assert.ok(ms<2000,'catastrophic local computation regression');}
});
test('pure module contains no network, persistence, shared history, chart or alert implementation',()=>{const s=fs.readFileSync('portfolio-insights-v178.js','utf8');assert.doesNotMatch(s,/fetch\s*\(|localStorage|sessionStorage|XMLHttpRequest|market_snapshots|market_series|supabase|setInterval|pushManager|Notification|\bchart\b|7D|30D/i);});
test('protected financial, routing, storage, scanner and backend files retain baseline content',()=>{
 const base='466ea1147d4ba532b36d89025dcbb5daf791262f';for(const f of ['market-v176.js','cost-basis-v177.js','app-v137.js','cards.json','ui-v137-focus.js','cardmarket-ui-v156.js','cloud-sync-v170.js','supabase-config-v170.js','supabase-client-v170.js','cloud-adapter-v170.js','account-ui-v170.js','jp-image-library-v161.js','jp-cardmarket-native-v163.js','jp-cardmarket-native-v165.js'])assert.equal(require('./beta-scope-v180.cjs')(f,fs.readFileSync(f,'utf8').replace(/\r\n?/g,'\n')),cp.execFileSync('git',['show',base+':'+f],{encoding:'utf8',maxBuffer:20e6}).replace(/\r\n?/g,'\n'),f);
});
