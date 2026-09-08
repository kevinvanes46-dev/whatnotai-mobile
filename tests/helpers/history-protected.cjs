'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
module.exports=()=>{
 const current=fs.readFileSync('app-v137.js','utf8').replace(/\r\n/g,'\n');
 const before=execFileSync('git',['show','4bbfb0057afcee13d230fd283c74fd500f60d421:app-v137.js'],{encoding:'utf8',maxBuffer:20e6}).replace(/\r\n/g,'\n');
 const make=(s,end)=>s.slice(s.indexOf('async function makeLink('),s.indexOf(end)).replace('  if(window.CardIdentity) card = selectedCardIdentity(route.url);\n','').trim();
 assert.equal(make(current,'async function applyItem('),make(before,'function applyItem('),'Existing resolver invocation and stale-response guards unchanged');
 for(const [start,end] of [['','function currentCardmarketCard('],['function validCardmarketRoute(','function itemFromCurrent('],['function clearAll(',null]]){
  const slice=s=>s.slice(start?s.indexOf(start):0,end?s.indexOf(end==='function itemFromCurrent('&&s.includes('function selectedCardIdentity(')?'function selectedCardIdentity(':end):undefined);
  assert.equal(slice(current),slice(before),'Protected app section '+start);
 }
};
