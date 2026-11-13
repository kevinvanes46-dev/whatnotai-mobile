'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Library=require('../library-v185.js');
const snapshot=require('../catalog-sets-v185.json');
const jungle=require('../nl-jungle-v242.js');

function setup({fail=false}={}) {
  const store=new Map(),requests=[];
  const storage={getItem:key=>store.get(key),setItem:(key,value)=>store.set(key,value)};
  const cards=jungle.CATALOG.map((name,index)=>({
    id:'base2-'+(index+1),localId:String(index+1),name,
    image:'https://assets.tcgdex.net/en/base/base2/'+(index+1)
  }));
  const library=Library.create({
    snapshot,storage,
    fetch:async url=>{
      requests.push(String(url));
      if(fail)throw Error('offline');
      assert.match(String(url),/\/en\/sets\/base2$/);
      return {ok:true,json:async()=>({id:'base2',cards,cardCount:{total:64}})};
    }
  });
  return {library,requests,store,setOffline:()=>{fail=true;}};
}

test('NL exposes only Jungle from the existing EN snapshot and retains EN/JP sets',()=>{
  const {library}=setup();
  assert.deepEqual(library.getSets('NL').map(set=>[set.id,set.name,set.available]),[['base2','Jungle',64]]);
  assert.ok(library.getSets('EN').some(set=>set.id==='base1'&&set.name==='Base Set'));
  assert.ok(library.getSets('EN').some(set=>set.id==='base3'&&set.name==='Fossil'));
  assert.ok(library.getSets('JP').length>0);
  assert.throws(()=>library.getSets('FR'),/Onbekende taal/);
});

test('NL cards use EN source images but distinct language identities and cache keys',async()=>{
  const {library,requests,store}=setup();
  const [en,nl]=await Promise.all([library.loadSet('EN','base2'),library.loadSet('NL','base2')]);
  assert.equal(en.cards.length,64);
  assert.equal(nl.cards.length,64);
  assert.ok(nl.complete);
  assert.ok(nl.cards.every(card=>card.language==='NL'&&card.source_set_id==='base2'));
  assert.equal(nl.cards[0].source_id,en.cards[0].source_id);
  assert.equal(nl.cards[0].image,en.cards[0].image);
  assert.notEqual(nl.cards[0].key,en.cards[0].key);
  assert.ok(store.has('holodex_library_v185_NL-set-base2'));
  assert.ok(store.has('holodex_library_v185_EN-set-base2'));
  assert.equal(requests.length,2);
});

test('NL search stays within the 64 Jungle records and requests the EN source, never /nl/',async()=>{
  const {library,requests}=setup();
  const result=await library.search('NL','Pikachu Jungle 60');
  assert.equal(result.cards.length,1);
  assert.equal(result.cards[0].language,'NL');
  assert.equal(result.cards[0].source_id,'base2-60');
  assert.equal(requests.length,1);
  assert.ok(requests.every(url=>url.includes('/en/sets/base2')));
});

test('cached NL Jungle identities remain available when the EN image catalog goes offline',async()=>{
  const online=setup();
  const first=await online.library.loadSet('NL','base2');
  online.setOffline();
  const stale=await online.library.loadSet('NL','base2',{refresh:true});
  assert.equal(stale.stale,true);
  assert.equal(stale.cards.length,64);
  assert.ok(stale.cards.every(card=>card.language==='NL'));
  assert.equal(stale.cards[0].source_id,first.cards[0].source_id);
});

test('v244 Cardmarket routing keeps language, condition and verification labels',()=>{
  const card={source_id:'base2-7',source_set_id:'base2',number:'7',name:'Nidoqueen'};
  const nl=jungle.routeFor({...card,language:'NL'},{condition:'EX'});
  const en=jungle.englishRouteFor({...card,language:'EN'},{condition:'EX'});
  assert.equal(nl.exact,true);
  assert.equal(nl.verified,'live');
  assert.equal(new URL(nl.url).searchParams.get('language'),'12');
  assert.equal(new URL(nl.url).searchParams.get('minCondition'),'3');
  assert.equal(new URL(en.url).searchParams.get('language'),'1');
  const search=jungle.routeFor({...card,source_id:'base2-20',number:'20',name:'Jolteon'});
  assert.equal(search.exact,false);
  assert.equal(search.verified,'');
  assert.equal(new URL(search.url).pathname,'/en/Pokemon/Products/Search');
});

test('NL/EN Jungle 1st Edition is an explicit filter and unverified numbers stay searches',()=>{
  const card={source_id:'base2-26',source_set_id:'base2',number:'26',name:'Scyther'};
  const first=jungle.routeFor(card,{condition:'NM',edition:'1ST'});
  const unlimited=jungle.routeFor(card,{condition:'NM',edition:'UNLIMITED'});
  assert.match(new URL(first.url).pathname,/\/Singles\/Jungle\/Scyther-V2-JU26$/);
  assert.equal(new URL(first.url).searchParams.get('language'),'12');
  assert.equal(new URL(first.url).searchParams.get('isFirstEd'),'Y');
  assert.equal(new URL(unlimited.url).searchParams.get('isFirstEd'),'N');
  const unverified=jungle.routeFor({source_id:'base2-20',source_set_id:'base2',number:'20',name:'Jolteon'},
    {edition:'1ST'});
  assert.equal(unverified.exact,false);
  assert.equal(new URL(unverified.url).searchParams.get('isFirstEd'),'Y');
  const wrong=jungle.routeFor({...card,name:'Pinsir'},{edition:'1ST'});
  assert.equal(wrong.url,'');
  const ui=fs.readFileSync(path.join(__dirname,'..','ui-library-v185.js'),'utf8');
  assert.match(ui,/\$\('editionSelect'\)\?\.value==='1ST'/);
});

test('the legacy checklist is retained as data but its standalone UI is removed',()=>{
  const source=fs.readFileSync(path.join(__dirname,'..','nl-jungle-v242.js'),'utf8');
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  assert.equal(jungle.LEGACY_OWNED_KEY,'holokeep_nl_jungle_beurs_v241');
  assert.doesNotMatch(source,/Jungle beurslijst|nlJunglePanel|nlJungleToggle/);
  assert.doesNotMatch(html,/Jungle beurslijst|nlJunglePanel|nlJungleToggle/);
  assert.match(fs.readFileSync(path.join(__dirname,'..','ui-v137-collection.js'),'utf8'),/collectionImportLegacyJungle/);
  assert.match(fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8'),/rareworth-shell-v246-set-coverage/);
});
