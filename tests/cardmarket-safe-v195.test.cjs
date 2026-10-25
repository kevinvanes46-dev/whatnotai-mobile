'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),L=require('../library-v185.js');
test('search and collection adapters use the safe resolver instead of legacy product IDs',()=>{
  const fs=require('node:fs'),vm=require('node:vm'),{context}=require('./helpers/cardmarket-harness.cjs'),{c}=context();
  c.window.HoloDexLibrary=L;c.window.cardscoutCollectionUI={cardmarketLink:()=>{throw Error('unsafe legacy route invoked');}};
  vm.runInContext(fs.readFileSync('ui-library-v185.js','utf8').split('(()=>{')[0],c);
  const input={source_id:'ecard2-14',number:'14',name:'Houndoom',language:'EN'};
  assert.equal(c.resolveFinalCardmarketRoute(input).url,L.safeRoute(input).url);
  assert.equal(c.window.cardscoutCollectionUI.cardmarketLink(input),L.safeRoute(input).url);
});
const card=(set,number,name)=>({source_id:set+'-'+number,source_set_id:set,number,name,language:'EN'});
test('Aquapolis verified pages win over conflicting provider IDs; other numbers stay searches',()=>{
  for(const [number,name,slug] of [['15','Houndoom','Houndoom-V3-AQ15'],['1','Ampharos','Ampharos-V2-AQ1']]){
    const r=L.safeRoute({...card('ecard2',number,name),url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=275086'});
    assert.equal(r.kind,'EXACT');assert.equal(new URL(r.url).pathname.split('/').at(-1),slug);
  }
  for(const [number,name] of [['14','Houndoom'],['H11','Houndoom'],['H1','Ampharos']]){
    const r=L.safeRoute(card('ecard2',number,name));assert.equal(r.kind,'TARGETED_SEARCH');
    assert.equal(new URL(r.url).searchParams.get('searchString'),name+' aq'+number);
  }
});
test('controlled codes, untrusted IDs and conflicting identity fail to labelled search',()=>{
  for(const [set,number,name,query] of [['base1','4','Charizard','Charizard bs4'],['xy4','1','Venonat','Venonat phf1'],['me02','2','Gloom','Gloom pfl2']]){
    const r=L.safeRoute({...card(set,number,name),verified:true,direct:true,url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=1'});
    assert.equal(r.exact,false);assert.equal(new URL(r.url).searchParams.get('searchString'),query);
  }
  for(const c of [{...card('unknown','1','Pikachu'),code:'FAKE'},{...card('ecard2','15','Houndoom'),source_set_id:'base1'},{...card('ecard2','15','Houndoom'),set_name:'Skyridge'}])assert.equal(L.safeRoute(c).kind,'BROAD_SEARCH');
  assert.equal(L.safeRoute({}).kind,'UNAVAILABLE');
});
test('NM, explicit edition and reverse filters survive targeted search; JP delegates unchanged',()=>{
  const c={...card('ecard2','H1','Ampharos'),condition:'NM',edition:'1ST',variant:'STAMPED'},r=L.safeRoute(c),u=new URL(r.url);
  for(const [key,value] of [['language','1'],['minCondition','2'],['isFirstEd','Y'],['isReverseHolo','Y']])assert.equal(u.searchParams.get(key),value);
  const jp={url:'verified-native-JP',exact:true};assert.equal(L.safeRoute({...c,language:'JP'},()=>jp),jp);
  assert.equal(L.safeRoute({...card('ecard2','1','Ampharos'),variant:'HOLO'}).exact,false);
});
