'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const Library=require('../library-v185.js');
function card(sourceSet,number,name,setName){return {
  source_id:sourceSet+'-'+number,source_set_id:sourceSet,language:'EN',
  name,number,set_name:setName,condition:'NM',edition:'AUTO',variant:'NORMAL'
};}
function query(input){const r=Library.safeRoute(input);assert.ok(r.url,'Expected Cardmarket URL');
  const u=new URL(r.url);assert.equal(u.hostname,'www.cardmarket.com');
  assert.equal(u.pathname,'/en/Pokemon/Products/Search','test requires unverified fallback');
  assert.equal(u.searchParams.get('language'),'1');
  assert.equal(u.searchParams.get('minCondition'),'2');
  return u.searchParams.get('searchString');}
test('v200: targeted Cardmarket collector codes for matching trusted identity',()=>{
  assert.equal(query(card('xy4','1','Venonat','Phantom Forces')),'Venonat phf1');
  assert.equal(query(card('ex1','3','Blaziken','Ruby & Sapphire')),'Blaziken rs3');
  assert.equal(query(card('me02','2','Gloom','Phantasmal Flames')),'Gloom pfl2');
});
test('v200: unknown set code uses name + number, not guessed code',()=>{
  assert.equal(query(card('hgss3','86','Umbreon','Undaunted')),'Umbreon 86');
});
test('v200: mismatch never attaches wrong set code or number',()=>{
  const c=card('ex1','3','Blaziken','Ruby & Sapphire');
  assert.equal(query({...c,source_set_id:'ex2'}),'Blaziken');
  assert.equal(query({...c,set_name:'Aquapolis'}),'Blaziken');
  assert.equal(query({...c,source_id:'ex1-4'}),'Blaziken');
  assert.equal(query({...c,set:'TCGDEX EN ex2'}),'Blaziken');
});
test('v200: special invalid collector strings remain name-only',()=>{
  assert.equal(query(card('hgss1','ONE','Ho-Oh','HeartGold & SoulSilver')),'Ho-Oh');
});
test('v200: condition / edition / reverse filters remain unchanged',()=>{
  const r=Library.safeRoute({...card('xy4','1','Venonat','Phantom Forces'),condition:'EX',edition:'1ST',variant:'REVERSE'});
  const u=new URL(r.url);assert.equal(u.searchParams.get('searchString'),'Venonat phf1');
  assert.equal(u.searchParams.get('language'),'1');assert.equal(u.searchParams.get('minCondition'),'3');
  assert.equal(u.searchParams.get('isFirstEd'),'Y');assert.equal(u.searchParams.get('isReverseHolo'),'Y');
});
test('v200: existing verified direct links take precedence',()=>{
  const card={source_id:'ex1-2',source_set_id:'ex1',language:'EN',name:'Beautifly',number:'2',set_name:'EX Ruby & Sapphire',condition:'NM',edition:'UNLIMITED',variant:'NORMAL'};
  const r=Library.safeRoute(card);assert.equal(r.exact,true);
  assert.match(new URL(r.url).pathname,/\/Singles\/EX-Ruby-Sapphire\/Beautifly-RS2$/);
});
