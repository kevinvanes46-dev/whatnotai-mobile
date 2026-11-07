'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const audit=require('../data/en-cardmarket-audit-v199.json');
const baseline=require('./fixtures/v203-exact-routes.json');
const evidence=require('./fixtures/v203-unown-evidence.json');
const productIndex=require('../cardmarket-product-index-v191.json');
const app=fs.readFileSync('app-v137.js','utf8');
const context={URL};
vm.createContext(context);
vm.runInContext(
  app.match(/const EMBEDDED_DATA = .*;/)[0]+'\n'+
  app.match(/const CM_SOURCE_SETS = \{[\s\S]*?\n\s*\};/)[0]+'\n'+
  fs.readFileSync('library-v185.js','utf8'),
  context
);
const Library=context.HoloDexLibrary;
const conditionIds={NM:'2',EX:'3',GD:'4',PL:'6',PO:'7'};
const auditedCard=record=>({
  source_id:record.id,
  source_set_id:record.setId,
  name:record.name,
  number:record.number,
  set_name:record.setName,
  language:'EN',
  condition:'NM'
});
const unownCard=record=>({
  source_id:record.holoKeepCardId,
  source_set_id:'exu',
  name:'Unown',
  number:record.letter,
  set_name:'Unseen Forces Unown Collection',
  language:'EN'
});

test('V203 exact routes are preserved; WP7 is the sole addition from 218 to 219',()=>{
  assert.equal(audit.records.length,21290);
  assert.equal(baseline.records.length,218);
  const baselineById=new Map(baseline.records.map(record=>[record.id,record.url]));
  assert.equal(baselineById.size,218);

  const exact=[];
  for(const record of audit.records){
    const route=Library.safeRoute(auditedCard(record));
    if(route.exact)exact.push({id:record.id,url:route.url});
    const priorUrl=baselineById.get(record.id);
    if(priorUrl)assert.equal(route.url,priorUrl,record.id);
  }

  const expectedIds=new Set([...baselineById.keys(),'basep-7']);
  assert.equal(exact.length,219);
  assert.deepEqual(new Set(exact.map(record=>record.id)),expectedIds);
  assert.equal(new Set(exact.map(record=>record.id)).size,219);

  const promo=audit.records.find(record=>record.id==='basep-7');
  assert.ok(promo);
  assert.equal(promo.name,'Jigglypuff');
  assert.equal(promo.number,'7');
  const route=Library.safeRoute(auditedCard(promo));
  const url=new URL(route.url);
  assert.equal(route.exact,true);
  assert.equal(route.confirmed,true);
  assert.equal(url.pathname,'/en/Pokemon/Products/Singles/Wizards-Black-Star-Promos/Jigglypuff-WP7');
  assert.equal(url.searchParams.get('language'),'1');
  assert.equal(url.searchParams.get('minCondition'),'2');
  assert.equal(url.searchParams.has('idProduct'),false);
});

test('V203 evidence keeps Unown W/V/X distinct and filters each offer safely',()=>{
  assert.equal(evidence.records.length,3);
  for(const proof of evidence.records){
    const card=unownCard(proof);
    for(const [condition,minCondition] of Object.entries(conditionIds)){
      const normal=Library.safeRoute({...card,condition,edition:'UNLIMITED',variant:'NORMAL'});
      const url=new URL(normal.url);
      assert.equal(normal.exact,true,proof.holoKeepCardId+condition);
      assert.equal(normal.confirmed,true,proof.holoKeepCardId+condition);
      assert.equal(normal.evidence,'V203_USER_BROWSER_VERIFIED',proof.holoKeepCardId+condition);
      assert.equal(normal.printedNumber,proof.printedNumber,proof.holoKeepCardId+condition);
      assert.equal(url.searchParams.get('idProduct'),String(proof.productId),proof.holoKeepCardId+condition);
      assert.equal(url.searchParams.get('language'),'1',proof.holoKeepCardId+condition);
      assert.equal(url.searchParams.get('minCondition'),minCondition,proof.holoKeepCardId+condition);
      assert.equal(url.searchParams.get('isReverseHolo'),'N',proof.holoKeepCardId+condition);
      assert.equal(url.searchParams.get('isFirstEd'),'N',proof.holoKeepCardId+condition);

      const reverse=Library.safeRoute({...card,condition,edition:'UNLIMITED',variant:'REVERSE'});
      const reverseUrl=new URL(reverse.url);
      assert.equal(reverse.exact,false,proof.holoKeepCardId+condition);
      assert.equal(reverseUrl.pathname,'/en/Pokemon/Products/Search',proof.holoKeepCardId+condition);
      assert.equal(reverseUrl.searchParams.has('idProduct'),false,proof.holoKeepCardId+condition);
      assert.equal(reverseUrl.searchParams.get('minCondition'),minCondition,proof.holoKeepCardId+condition);
      assert.equal(reverseUrl.searchParams.get('isReverseHolo'),'Y',proof.holoKeepCardId+condition);
    }

    const firstEdition=Library.safeRoute({...card,condition:'NM',edition:'1ST',variant:'NORMAL'});
    assert.equal(firstEdition.exact,false,proof.holoKeepCardId);
    assert.equal(new URL(firstEdition.url).searchParams.has('idProduct'),false,proof.holoKeepCardId);
  }
});

test('V203 shared IDs remain rejected for Unown L/M/N',()=>{
  for(const proof of evidence.records){
    const rejected=proof.rejectedSharedOwner;
    const letter=rejected.slice(-1);
    const card={
      source_id:rejected,
      source_set_id:'exu',
      name:'Unown',
      number:letter,
      set_name:'Unseen Forces Unown Collection',
      language:'EN',
      condition:'EX',
      edition:'UNLIMITED',
      variant:'NORMAL'
    };
    const route=Library.safeRoute(card);
    const url=new URL(route.url);
    assert.equal(route.exact,false,rejected);
    assert.equal(route.confirmed,undefined,rejected);
    assert.equal(url.pathname,'/en/Pokemon/Products/Search',rejected);
    assert.notEqual(url.searchParams.get('idProduct'),String(proof.productId),rejected);
    assert.equal(url.searchParams.get('minCondition'),'3',rejected);

    const options=Library.cardmarketOptions(card,{
      id:rejected,
      localId:letter,
      name:'Unown',
      set:{id:'exu'},
      variants_detailed:[{type:'holo',thirdParty:{cardmarket:proof.productId}}]
    },productIndex);
    assert.equal(options.some(option=>option.id===proof.productId),false,rejected);
  }
});

test('detail and collection links retain the confirmed Unown W route',()=>{
  const source=fs.readFileSync('ui-library-v185.js','utf8');
  const start=source.indexOf('  function setCardmarketLink(');
  const end=source.indexOf('  async function resolveCardmarket(',start);
  assert.ok(start>=0&&end>start);

  const proof=evidence.records.find(record=>record.holoKeepCardId==='exu-W');
  assert.ok(proof);
  const record=audit.records.find(item=>item.id===proof.holoKeepCardId);
  assert.ok(record);
  const route=Library.safeRoute({...auditedCard(record),variant:'NORMAL'});
  const context={};
  vm.createContext(context);
  vm.runInContext(source.slice(start,end),context);
  const link={dataset:{}};
  context.setCardmarketLink(link,route);
  assert.equal(link.hidden,false);
  assert.equal(link.dataset.cmEvidence,'EXACT');
  assert.match(link.textContent,/exacte kaart/);
  assert.equal(new URL(link.href).searchParams.get('idProduct'),String(proof.productId));
  assert.ok(source.includes('if(fallback.confirmed){setCardmarketLink(link,fallback);'));

  const adapterContext={
    HoloDexLibrary:Library,
    cardscoutCollectionUI:{cardmarketLink:()=>''},
    resolveFinalCardmarketRoute:()=>({url:'',exact:false})
  };
  adapterContext.window=adapterContext;
  vm.createContext(adapterContext);
  vm.runInContext(source.split('(()=>{')[0],adapterContext);
  const item={...auditedCard(record),sourceId:record.id,setName:record.setName,
    edition:'UNLIMITED',variant:'NORMAL'};
  const collectionUrl=adapterContext.cardscoutCollectionUI.cardmarketLink(item);
  const finalRoute=adapterContext.resolveFinalCardmarketRoute(item);
  assert.equal(new URL(collectionUrl).searchParams.get('idProduct'),String(proof.productId));
  assert.equal(finalRoute.confirmed,true);
  assert.equal(new URL(finalRoute.url).searchParams.get('idProduct'),String(proof.productId));
});
