'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const history = require('../cardmarket-history-v186.js');

const day1='2026-10-21T00:45:11.000Z', day2='2026-10-22T00:45:11.000Z';
const at1=Date.parse('2026-10-22T08:00:00Z'), at2=Date.parse('2026-10-23T08:00:00Z');
const item = {listType:'OWNED',qty:2,condition:'NM',edition:'UNLIMITED',variant:'NORMAL',
  language:'EN',sourceId:'base1-4',source_set_id:'base1',number:'4',name:'Charizard'};
const quote = (value,asOf=day1) => ({state:'AVAILABLE',source:'CARDMARKET_PUBLIC_GUIDE',
  currency:'EUR',metric:'trend',quality:'GENERAL_MARKET',conditionSpecific:false,
  languageSpecific:false,productId:273699,finish:'holo',value,asOf});
const store=()=>{
  const values=new Map();
  return {values,getItem:key=>values.has(key)?values.get(key):null,setItem:(k,v)=>values.set(k,v)};
};

test('chart uses only two real dated observations; no fabricated intermediate days',() => {
  const storage=store();
  assert.equal(history.capture(storage,[item],()=>quote(150),at1).status,'STORED');
  assert.equal(history.series(storage,[item],()=>quote(150),'1M',at1).reason,'INSUFFICIENT');
  assert.equal(history.capture(storage,[item],()=>quote(155,day2),at2).status,'STORED');
  const graph=history.series(storage,[item],()=>quote(155,day2),'1W',at2);
  assert.equal(graph.status,'AVAILABLE');
  assert.equal(graph.source,'CARDMARKET_PUBLIC_GUIDE');
  assert.deepEqual(graph.points,[{observedAt:day1,value:300},{observedAt:day2,value:310}]);
  assert.equal(graph.difference,10);
  assert.match(graph.label,/conditie en taal niet verwerkt/);
  for (const range of ['1W','1M','3M','1J','Alles']) assert.equal(history.series(storage,[item],()=>quote(155,day2),range,at2).status,'AVAILABLE');
  assert.equal(history.capture(storage,[item],()=>quote(155,day2),at2).status,'DUPLICATE');
});

test('changed holdings begin another cohort, not false portfolio growth',() => {
  const storage=store();
  history.capture(storage,[item],()=>quote(150),at1);
  history.capture(storage,[{...item,qty:3}],()=>quote(155,day2),at2);
  assert.equal(history.series(storage,[{...item,qty:3}],()=>quote(155,day2),'1W',at2).reason,'INSUFFICIENT');
  assert.equal(history.series(storage,[item],()=>quote(155,day2),'1W',at2).reason,'INSUFFICIENT');
});

test('no price, incomplete coverage, JP, stamped and mixed source dates never create graph',() => {
  const storage=store();
  const other={...item,sourceId:'sv03.5-199',source_set_id:'sv03.5',number:'199',name:'Charizard ex',qty:1};
  assert.equal(history.capture(storage,[item],()=>({state:'UNAVAILABLE'}),at1).reason,'PRICE');
  assert.equal(history.capture(storage,[{...item,language:'JP'}],()=>quote(150),at1).reason,'IDENTITY');
  assert.equal(history.capture(storage,[{...item,variant:'STAMPED'}],()=>quote(150),at1).reason,'IDENTITY');
  assert.equal(history.capture(storage,[item,other],i=>i===item?quote(150,day1):quote(50,day2),at2).reason,'MIXED_DATES');
  assert.equal(history.read(storage,at2).data.cohorts.length,0);
});

test('duplicate timestamp with conflicting price excludes the data point',() => {
  const storage=store();
  history.capture(storage,[item],()=>quote(150),at1);
  assert.equal(history.capture(storage,[item],()=>quote(250),at1).reason,'CONFLICT');
  const saved=history.read(storage,at2);
  assert.equal(saved.status,'OK');
  assert.equal(saved.data.cohorts[0].points.length,0);
  assert.deepEqual(saved.data.cohorts[0].conflicts,[day1]);
  assert.equal(history.capture(storage,[item],()=>quote(150),at1).reason,'CONFLICT');
});

test('corrupt stored history is kept untouched and never overwritten',() => {
  const storage=store();
  storage.setItem(history.KEY,'{broken');
  const original=storage.getItem(history.KEY);
  assert.equal(history.capture(storage,[item],()=>quote(150),at1).reason,'STORAGE');
  assert.equal(storage.getItem(history.KEY),original);
  assert.equal(history.series(storage,[item],()=>quote(150),'Alles',at1).status,'UNAVAILABLE');
});
