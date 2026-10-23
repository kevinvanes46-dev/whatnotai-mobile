'use strict';
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
  assert.equal(direct.url,'https://www.cardmarket.com/en/Pokemon/Products/Singles/Phantasmal-Flames/Oddish-PFL001');
  const result=Library.cardmarketRoute({...oddish,source_id:'other-001'});
  assert.equal(result.exact,false);
  assert.equal(new URL(result.url).searchParams.get('searchString'),'Oddish');
  assert.doesNotMatch(result.url,/Phantasmal|001/);
  assert.equal(Library.cardmarketRoute({name:'Mega Charizard X ex',language:'EN'}).url.endsWith('Mega%20Charizard%20X%20ex'),true);
  assert.equal(Library.cardmarketRoute({name:''}).url,'');
});
