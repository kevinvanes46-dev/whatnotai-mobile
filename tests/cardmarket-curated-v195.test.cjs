'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('app-v137.js','utf8');
const context={URL};vm.createContext(context);
vm.runInContext(source.match(/const EMBEDDED_DATA = .*;/)[0]+'\n'+source.match(/const CM_SOURCE_SETS = [\s\S]*?;/)[0]+'\n'+fs.readFileSync('library-v185.js','utf8'),context);
const L=context.HoloDexLibrary;
const bagon={source_id:'ex15-43',source_set_id:'ex15',set:'EX DRAGON FRONTIERS',name:'Bagon',number:'43',language:'EN',condition:'NM'};
test('dp6-1 keeps full search identity, language, conditions and explicit editions without trusting 278150',()=>{
  const card={source_id:'dp6-1',source_set_id:'dp6',set:'LEGENDS AWAKENED',set_name:'Legends Awakened',number:'1',name:'Deoxys Normal Forme',language:'EN',verified:true,direct:true,url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=278150'};
  for(const [condition,min] of [['NM','2'],['EX','3'],['GD','4'],['PL','6']])for(const [edition,first] of [['AUTO',null],['1ST','Y'],['UNLIMITED','N']]){
    const r=L.safeRoute({...card,condition,edition}),u=new URL(r.url);
    assert.equal(r.exact,false);assert.equal(r.kind,'BROAD_SEARCH');assert.match(r.note,/niet geverifieerd/);
    assert.equal(u.pathname,'/en/Pokemon/Products/Search');assert.equal(u.searchParams.get('searchString'),'Deoxys Normal Forme 1');assert.equal(u.origin,'https://www.cardmarket.com');assert.equal(r.identity.source_id,'dp6-1');assert.equal(r.identity.source_set_id,'dp6');assert.equal(r.identity.set,'Legends Awakened');assert.equal(r.identity.number,'1');
    assert.equal(u.searchParams.get('language'),'1');assert.equal(u.searchParams.get('minCondition'),min);assert.equal(u.searchParams.get('isFirstEd'),first);assert.equal(u.searchParams.has('idProduct'),false);
  }
  assert.equal(L.safeRoute({...card,source_set_id:'dp1'}).kind,'BROAD_SEARCH');
  assert.equal(L.safeRoute({...card,set_name:'Diamond & Pearl'}).kind,'BROAD_SEARCH');
  assert.equal(L.safeRoute({...card,language:'JP'}).kind,'UNAVAILABLE');
});
test('bundled Bagon alias restores exact DF43 with NM and ignores conflicting saved URL',()=>{
  const r=L.safeRoute({...bagon,url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=1',verified:true,direct:true});
  assert.equal(r.kind,'EXACT');assert.equal(new URL(r.url).pathname,'/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Bagon-Delta-Species-DF43');assert.equal(new URL(r.url).searchParams.get('minCondition'),'2');
  for(const name of ['Bagon Delta Species','Delta Bagon','Bagon δ','Bagon Δ'])assert.equal(L.safeRoute({...bagon,name}).exact,true);
});
test('conflicting identity, forged flags, editions and finishes cannot borrow curated URL',()=>{
  for(const changes of [{source_id:'ex14-43'},{source_set_id:'ex14'},{set:'BASE'},{set_name:'Base Set'},{number:'44'},{name:'Charmander'},{language:'JP'},{variant:'HOLO'},{edition:'1ST'},{variant:'FAKE'}])assert.equal(L.safeRoute({...bagon,...changes,verified:true,direct:true}).exact,false,JSON.stringify(changes));
  assert.equal(L.safeRoute({...bagon,source_id:'ex15-42',number:'42',name:'Invented',verified:true,direct:true,url:L.safeRoute(bagon).url}).exact,false);
});
test('reverse and stamped preserve exact DF43; vintage First Edition stays filtered',()=>{
  for(const variant of ['REVERSE','REVERSE_HOLO','STAMPED'])assert.equal(new URL(L.safeRoute({...bagon,variant}).url).searchParams.get('isReverseHolo'),'Y');
  const base=L.safeRoute({source_id:'base1-2',source_set_id:'base1',name:'Blastoise',number:'2',language:'EN',edition:'1ST'});
  assert.equal(base.exact,true);assert.equal(new URL(base.url).searchParams.get('isFirstEd'),'Y');
  for(const [number,name] of [['15','Houndoom'],['1','Ampharos']])assert.equal(L.safeRoute({source_id:'ecard2-'+number,number,name,language:'EN'}).confirmed,true);
});
