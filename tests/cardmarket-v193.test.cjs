'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('../cardmarket-production-v193.js'),L=require('../library-v185.js'),F=require('./fixtures/chansey-v193.json');
const item={sourceId:'base1-3',source_set_id:'base1',number:'3',name:'Chansey',language:'EN',variant:'NORMAL',edition:'UNLIMITED',condition:'NM'};
test('all website conditions, defaults, JP and duplicate filter replacement',()=>{
  for(const [condition,id] of [['M',1],['MT',1],['Mint',1],['',2],['NM',2],['EX',3],['GD',4],['LP',5],['PL',6],['PO',7]]){
    const u=new URL(L.offerUrl('https://www.cardmarket.com/en/Pokemon/Products?idProduct=273698&minCondition=7&minCondition=6',{condition,language:'EN'}));
    assert.deepEqual(u.searchParams.getAll('minCondition'),[String(id)]);assert.equal(u.searchParams.get('language'),'1');
  }
  assert.equal(new URL(L.offerUrl('https://www.cardmarket.com/en/Pokemon/Products?idProduct=273698',{language:'JP'})).searchParams.get('language'),'7');
  assert.equal(new URL(L.offerUrl('https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=Chansey&language=1&minCondition=2',{name:'Chansey'})).search,'?searchString=Chansey');
  assert.match(L.offerUrl('https://www.cardmarket.com/en/Pokemon/Products?idProduct=1',{name:'Chansey',condition:'PSA10'}),/Products\/Search/);
});
test('Chansey exact selected print keeps unlimited, shadowless, stamped, reverse and identity separate',()=>{
  const original=JSON.stringify(F),r=M.verifiedCard(item,F,273698);assert.equal(r.card.pricing.cardmarket.idProduct,273698);
  assert.equal(M.verifiedCard(item,F,660225).error,'FINISH_UNVERIFIED');
  for(const changes of [{language:'JP'},{edition:'1ST'},{edition:'AUTO'},{variant:'STAMPED'},{name:'Blastoise'},{number:'4'},{source_set_id:'base2'}])assert.ok(M.verifiedCard({...item,...changes},F,273698).error);
  assert.ok(M.verifiedCard(item,{...F,variants_detailed:[{type:'reverse',thirdParty:{cardmarket:273698}}]},273698).error);
  assert.equal(JSON.stringify(F),original);
  const card={source_id:item.sourceId,source_set_id:'base1',number:'3',name:'Chansey',language:'EN'};
  const index=require('../cardmarket-product-index-v191.json'),choices=L.cardmarketOptions(card,F,index);
  assert.equal(choices.length,3);
  assert.equal(new URL(choices.find(c=>c.label==='Holo · unlimited').url).searchParams.get('isFirstEd'),'N');
  assert.equal(new URL(choices.find(c=>c.label.includes('1st-edition')).url).searchParams.get('isFirstEd'),'Y');
  const wrongIndex={...index,rows:{...index.rows,273698:[5402,index.rows[273698][1]],660225:[5402,index.rows[660225][1]]}};
  assert.deepEqual(L.cardmarketOptions(card,F,wrongIndex,{[card.source_id]:{product:273698}}),[]);
});
test('real staged official snapshot, missing/stale data, refresh and session-only cache',async()=>{
  const manifest=require('../cardmarket-public-v193/manifest.json'),now=Date.parse(manifest.priceGuideCreatedAt)+3600000;
  const calls=[],fetchImpl=async url=>{calls.push(url);const b=fs.readFileSync(url.replace(/^\.\//,''));return {ok:true,json:async()=>JSON.parse(b),arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};};
  const q=await M.quote(item,{card:F,productId:273698,fetchImpl,now});
  const row=require('../cardmarket-public-v193/22.json').rows[273698];
  assert.equal(q.state,'AVAILABLE');assert.equal(q.value,row[3]);assert.equal(q.conditionSpecific,false);assert.equal(q.asOf,manifest.priceGuideCreatedAt);
  assert.equal(M.display(q,now).value,row[3]);assert.match(M.display(q,now).label,/conditie, taal en editie niet verwerkt/);
  assert.equal(M.cached(item),q);assert.equal(M.cached({...item,edition:'1ST'}).value,null);
  assert.ok(calls.every(u=>u.startsWith('./')));
  assert.equal(M.display(q,now+4*86400000).value,null);
  const stale=await M.quote(item,{card:F,fetchImpl,now:now+4*86400000});assert.equal(stale.reason,'STALE_SOURCE');
  const missing=await M.quote(item,{card:F,fetchImpl:async()=>({ok:false}),now});assert.equal(missing.value,null);
  const refreshed=await M.quote(item,{card:F,fetchImpl,now});assert.equal(refreshed.value,q.value);
});
