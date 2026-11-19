'use strict';
// v197: user-confirmed product pages and name-only fallbacks retain independent identity.
require('node:test')('v197 Ruby & Sapphire links enforce identity and print filters',()=>{
  const assert=require('node:assert/strict'),L=require('../library-v185.js');
  for(const [name,number,slug]of [['Beautifly','2','Beautifly-RS2'],['Seaking','21','Seaking-RS21']]){
    const card={source_id:'ex1-'+number,source_set_id:'ex1',name,number,set_name:'EX Ruby & Sapphire',set:'EX RUBY SAPPHIRE',language:'EN',condition:'NM',edition:'UNLIMITED'};
    for(const variant of ['NORMAL','REVERSE','REVERSE_HOLO']){
      const route=L.safeRoute({...card,variant,url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=1'}),u=new URL(route.url);
      assert.equal(route.confirmed,true);assert.equal(route.exact,true);assert.equal(u.pathname,'/en/Pokemon/Products/Singles/EX-Ruby-Sapphire/'+slug);
      assert.equal(u.searchParams.has('idProduct'),false);assert.equal(u.searchParams.get('language'),'1');assert.equal(u.searchParams.get('minCondition'),'2');assert.equal(u.searchParams.get('isFirstEd'),'N');assert.equal(u.searchParams.get('isReverseHolo'),variant==='NORMAL'?'N':'Y');
    }
    for(const change of [{number:'3'},{name:'Pikachu'},{source_id:'ex2-'+number},{source_set_id:'ex2'},{set_name:'Aquapolis'},{set:'AQUAPOLIS'},{language:'JP'},{edition:'1ST'},{variant:'STAMPED'},{subtype:'shadowless'},{condition:'PSA10'}])assert.equal(L.confirmedRoute({...card,...change}),null,JSON.stringify(change));
    assert.equal(!!L.confirmedRoute({...card,variant:'HOLO'}),name==='Beautifly');
    assert.equal(L.safeRoute({...card,set:'Ruby & Sapphire',set_name:'Ruby & Sapphire'}).confirmed,true);
  }
});
require('node:test')('v197 unverified EN search contains only name and preserves identity outside the URL',()=>{
  const assert=require('node:assert/strict'),L=require('../library-v185.js');
  const card={source_id:'ex1-3',source_set_id:'ex1',name:'Blaziken',number:'3',set_name:'EX Ruby & Sapphire',language:'EN',condition:'EX',edition:'1ST',variant:'STAMPED',verified:true,direct:true,url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=1'};
  const original=JSON.stringify(card),r=L.safeRoute(card),u=new URL(r.url);
  assert.equal(r.exact,false);assert.equal(r.kind,'BROAD_SEARCH');assert.equal(u.pathname,'/en/Pokemon/Products/Search');assert.equal(u.searchParams.get('searchString'),'Blaziken');assert.equal(u.searchParams.has('idProduct'),false);
  assert.equal(r.identity.set,'EX Ruby & Sapphire');assert.equal(r.identity.number,'3');assert.equal(r.identity.source_id,'ex1-3');assert.match(r.note,/niet geverifieerd/);assert.match(r.note,/#3/);
  for(const [key,value]of [['language','1'],['minCondition','3'],['isFirstEd','Y'],['isReverseHolo','Y']])assert.equal(u.searchParams.get(key),value);
  assert.equal(JSON.stringify(card),original);
});
const {test}=require('node:test'),assert=require('node:assert/strict'),Library=require('../library-v185.js'),snapshot=require('../catalog-sets-v185.json');
const fixture=require('./fixtures/library-v185/en-sv03.5.json');
function setup(handler=()=>fixture){let time=1000000000000,calls=0;const store=new Map(),storage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};const api=Library.create({snapshot,storage,now:()=>time,fetch:async(url)=>{calls++;return {ok:true,json:async()=>handler(url)}}});return {api,store,advance:()=>time+=Library.TTL+1,calls:()=>calls};}
test('discovery snapshot excludes Pocket and preserves languages and explicit empty coverage',()=>{const {api}=setup();assert.equal(api.getSets('EN').some(s=>s.series==='tcgp'),false);assert.ok(api.getSets('JP').some(s=>s.available===0));assert.throws(()=>api.getSets('FR'));});
test('151 has 207 unique source tuples, no prices or invented images, warm cache avoids requests',async()=>{const s=setup(),result=await s.api.loadSet('EN','sv03.5');assert.equal(result.cards.length,207);assert.equal(result.complete,true);const c=result.cards.find(c=>c.source_id==='sv03.5-199');assert.equal(c.name,'Charizard ex');assert.equal(c.number,'199');assert.equal(c.direct,false);assert.equal(c.url,'');assert.equal('pricing' in c,false);assert.equal((await s.api.loadSet('EN','sv03.5')).cached,true);assert.equal(s.calls(),1);});
test('duplicate, wrong-set, incomplete and malformed identity cannot claim complete coverage',async()=>{const s=setup(()=>({...fixture,cards:[fixture.cards[0],fixture.cards[0],{id:'wrong-5',localId:'5',name:'wrong'}]})),r=await s.api.loadSet('EN','sv03.5');assert.equal(r.cards.length,1);assert.equal(r.complete,false);assert.equal(Library.artwork('https://evil.test/image'),'');});
test('expired cache survives offline and incomplete refresh without discarding cards',async()=>{let fail=false,partial=false;const s=setup(()=>{if(fail)throw Error('offline');return partial?{...fixture,cards:fixture.cards.slice(0,1)}:fixture});await s.api.loadSet('EN','sv03.5');s.advance();fail=true;const offline=await s.api.loadSet('EN','sv03.5');assert.equal(offline.stale,true);assert.equal(offline.cards.length,207);fail=false;partial=true;const updated=await s.api.loadSet('EN','sv03.5');assert.equal(updated.complete,false);assert.equal(updated.cards.length,207);assert.equal(updated.received,1);});
test('concurrent set loads share one request and unknown set fails closed',async()=>{const s=setup();await Promise.all([s.api.loadSet('EN','sv03.5'),s.api.loadSet('EN','sv03.5')]);assert.equal(s.calls(),1);await assert.rejects(s.api.loadSet('EN','invented'));});
test('combined name number and numeric set title resolves the actual set',async()=>{const s=setup(),r=await s.api.search('EN','Charizard 199 151');assert.deepEqual(r.cards.map(c=>c.source_id),['sv03.5-199']);assert.equal(r.more,false);});
test('remote search uses bounded pages, explicit metadata-only identities and special numbers',async()=>{let url;const s=setup(u=>{url=u;return [fixture.cards[0]]});const r=await s.api.search('EN','Charizard',2);assert.equal(r.cards.length,1);assert.match(url,/pagination%3Apage=2/);assert.match(url,/pagination%3AitemsPerPage=80/);await s.api.search('EN','Pikachu TG05');assert.match(url,/localId=eq%3ATG05/);});
test('Cardmarket uses verified product identity or a broad honest name-only search',()=>{
  const oddish={source_id:'me02-001',source_set_id:'me02',name:'Oddish',number:'001',set_name:'Phantasmal Flames',language:'EN'};
  const direct=Library.cardmarketRoute(oddish);
  assert.equal(direct.exact,true);
  assert.equal(direct.url,'https://www.cardmarket.com/en/Pokemon/Products/Singles/Phantasmal-Flames/Oddish-PFL001?language=1&minCondition=2');
  const result=Library.cardmarketRoute({...oddish,source_id:'other-001'});
  assert.equal(result.exact,false);
  assert.equal(new URL(result.url).searchParams.get('searchString'),'Oddish');
  assert.equal(new URL(result.url).searchParams.has('language'),false,'Broad search must not exclude cards of unknown variants');
  assert.doesNotMatch(result.url,/Phantasmal|001/);
  assert.equal(Library.cardmarketRoute({name:'Mega Charizard X ex',language:'EN'}).url.endsWith('Mega%20Charizard%20X%20ex'),true);
  assert.equal(Library.cardmarketRoute({name:''}).url,'');
});
test('v191 restores legacy Cardmarket IDs only after independent official-catalog verification',()=>{
  const card={source_id:'base1-2',source_set_id:'base1',name:'Blastoise',number:'2',set_name:'Base Set',language:'EN'};
  const legacy={'base1-2':{id:'base1-2',name:'Blastoise',number:'2',set:{id:'base1'},product:273697}};
  const index=require('../cardmarket-product-index-v191.json');
  assert.equal(Library.cardmarketRoute(card,legacy).exact,false);
  assert.deepEqual(Library.cardmarketOptions(card,{},index,legacy),[{
    id:273697,label:'Bekend product · uitvoering controleren',url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=273697&language=1&minCondition=2'}]);
  for(const invalid of [{...card,source_set_id:'base2'},{...card,name:'Dark Blastoise'},
    {...card,number:'4'},{...card,language:'JP'},{...card,source_id:'base1-4'}]){
    assert.equal(Library.cardmarketOptions(invalid,{},index,legacy).length,0,JSON.stringify(invalid));
  }
  assert.equal(Library.cardmarketOptions(card,{},index,{'base1-2':{...legacy['base1-2'],product:0}}).length,0);
});
test('v191 official Cardmarket index validates identity without reading a price',()=>{
  const index=require('../cardmarket-product-index-v191.json');
  assert.equal(index.source,'CARDMARKET_OFFICIAL_PRODUCT_CATALOG');assert.ok(index.count>=70000);
  const card={source_id:'me02-039',source_set_id:'me02',name:'Cresselia',number:'039',set_name:'Phantasmal Flames',language:'EN'};
  const detail={id:'me02-039',localId:'039',name:'Cresselia',set:{id:'me02'},variants_detailed:[
    {type:'normal',thirdParty:{cardmarket:857614}},{type:'reverse',thirdParty:{cardmarket:857614}}]};
  const options=Library.cardmarketOptions(card,detail,index);assert.equal(options.length,2);
  assert.equal(options[0].label,'Normaal');assert.equal(options[1].label,'Reverse Holo');
  assert.equal(new URL(options[1].url).searchParams.get('isReverseHolo'),'Y');
  assert.ok(options.every(o=>o.id===857614&&new URL(o.url).searchParams.get('minCondition')==='2'));
  assert.equal(Library.cardmarketOptions({...card,source_set_id:'base1'},detail,index).length,0);
  assert.equal(Library.cardmarketOptions(card,{...detail,name:'Blastoise'},index).length,0);
  assert.equal(Library.cardmarketOptions(card,{...detail,variants_detailed:[{type:'normal',thirdParty:{cardmarket:273697}}]},index).length,0);
});
test('v191 keeps Base Set 1st Edition separate from Unlimited; unknown variants do not create direct links',()=>{
  const index=require('../cardmarket-product-index-v191.json');
  const card={source_id:'base1-2',source_set_id:'base1',name:'Blastoise',number:'2',language:'EN'};
  const detail={id:'base1-2',localId:'2',name:'Blastoise',set:{id:'base1'},variants_detailed:[
    {type:'holo',subtype:'unlimited',thirdParty:{cardmarket:273697}},
    {type:'holo',subtype:'shadowless',stamp:['1st-edition'],thirdParty:{cardmarket:660226}},
    {type:'normal',thirdParty:{cardmarket:99999999}}]};
  const choices=Library.cardmarketOptions(card,detail,index);
  assert.equal(choices.length,2);
  assert.equal(choices[0].id,273697);assert.equal(choices[1].id,660226);
  assert.match(choices[0].label,/unlimited/);assert.match(choices[1].label,/1st-edition/);
  assert.equal(Library.cardmarketRoute({source_id:'xy4-23',source_set_id:'xy4',number:'23',name:'Manectric EX',set_name:'Phantom Forces',language:'EN'}).exact,true);
});
