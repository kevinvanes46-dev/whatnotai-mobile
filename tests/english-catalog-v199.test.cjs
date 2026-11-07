'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path');
const audit=require('../data/en-cardmarket-audit-v199.json');
const app=fs.readFileSync(path.join(__dirname,'../app-v137.js'),'utf8');
const context={URL};vm.createContext(context);
vm.runInContext(app.match(/const EMBEDDED_DATA = .*;/)[0]+'\n'+app.match(/const CM_SOURCE_SETS = \{[\s\S]*?\n\s*\};/)[0]+'\n'+fs.readFileSync(path.join(__dirname,'../library-v185.js'),'utf8'),context);
const L=context.HoloDexLibrary;
const card=r=>({source_id:r.id,source_set_id:r.setId,name:r.name,number:r.number,set_name:r.setName,language:'EN',condition:'NM'});
test('legacy majority cannot promote an unreviewed expansion to a product candidate',()=>{
  const c={source_id:'unknown-2',source_set_id:'unknown',number:'2',name:'Blastoise',language:'EN'};
  const legacy={'unknown-2':{id:'unknown-2',number:'2',name:'Blastoise',set:{id:'unknown'},product:273697}};
  assert.equal(L.cardmarketOptions(c,{},require('../cardmarket-product-index-v191.json'),legacy).length,0);
});
test('all 21,290 API-scoped identities have a reproducible audit record; candidates are not verification',()=>{
  assert.equal(audit.records.length,21290);assert.equal(new Set(audit.records.map(r=>r.id)).size,21290);
  assert.deepEqual(audit.summary.missingSourceRecords,[]);assert.deepEqual(audit.summary.errors,[]);
  assert.equal(audit.summary.liveVerified,0);
  assert.ok(audit.records.every(r=>r.officialIdentity==='UNCONFIRMED'));
  assert.equal(audit.summary.singleCandidate+audit.summary.multipleCandidates+audit.summary.noConsistentCandidate,21290);
});
test('entire English catalog and print selections stay on Cardmarket with correct offer filters',()=>{
  const totals={records:0,existingExact:0,fallback:0,unavailable:0,printRoutes:0};
  for(const r of audit.records){
    const c=card(r),route=L.safeRoute(c);totals.records++;
    totals[route.exact?'existingExact':route.url?'fallback':'unavailable']++;
    for(const selection of [{variant:'NORMAL',edition:'UNLIMITED'},{variant:'REVERSE',edition:'UNLIMITED'},{variant:'STAMPED',edition:'1ST'}]){
      const actual=L.safeRoute({...c,...selection}),u=new URL(actual.url);totals.printRoutes++;
      assert.equal(u.origin,'https://www.cardmarket.com',r.id);
      assert.equal(u.searchParams.get('language'),'1',r.id);
      assert.equal(u.searchParams.get('minCondition'),'2',r.id);
      if(actual.kind==='V201_CANDIDATE'){
        const row=require('../artifacts/en-cardmarket-audit/v201-primal-clash-candidates.json').cards.find(c=>c.cardId===r.id);
        assert.equal(row.links.length,1,r.id);assert.equal(u.origin+u.pathname,row.links[0].url,r.id);
        assert.equal(r.setId,'xy5');assert.equal(actual.exact,false);assert.equal(actual.verified,false);assert.equal(actual.confirmed,false);
        assert.equal(actual.identity.source_id,r.id);assert.equal(actual.identity.number,r.number);assert.equal(actual.identity.name,r.name);
        assert.equal(selection.variant,'NORMAL');assert.equal(u.searchParams.get('isFirstEd'),'N');assert.equal(u.searchParams.get('isReverseHolo'),'N');assert.equal(u.searchParams.has('idProduct'),false);
      }else if(!actual.exact){
        assert.equal(u.pathname,'/en/Pokemon/Products/Search',r.id);
        const query=u.searchParams.get('searchString');
        if(/^\d+$/.test(r.number)){
          assert.ok(query?.startsWith(r.name+' '),`${r.id}: ${query}`);
          assert.ok(query.endsWith(String(Number(r.number))),`${r.id}: ${query}`);
        }else{
          assert.ok(query===r.name||query?.startsWith(r.name+' '),`${r.id}: ${query}`);
        }
        assert.equal(u.searchParams.get('isFirstEd'),selection.edition==='1ST'?'Y':'N',r.id);
        assert.equal(u.searchParams.get('isReverseHolo'),selection.variant==='NORMAL'?'N':'Y',r.id);
        assert.equal(actual.identity.source_id,r.id,r.id);
      }
    }
    for(const conflict of [{sourceId:'wrong-identity'},{sourceSetId:'wrong-set'},{source_set_id:'wrong-set'},{subtype:'shadowless'},{stamp:['unverified-stamp']},{size:'jumbo'},{foil:'cosmos'}]){
      assert.equal(L.safeRoute({...c,...conflict}).exact,false,r.id+JSON.stringify(conflict));
    }
  }
  fs.mkdirSync('artifacts/en-cardmarket-audit',{recursive:true});
  fs.writeFileSync('artifacts/en-cardmarket-audit/route-summary.json',JSON.stringify(totals,null,2)+'\n');
});
test('collection alias normalization cannot erase a conflicting source identity',()=>{
  const {c}=require('./helpers/cardmarket-harness.cjs').context();c.window.HoloDexLibrary=L;
  c.window.cardscoutCollectionUI={cardmarketLink:()=>''};
  vm.runInContext(fs.readFileSync('ui-library-v185.js','utf8').split('(()=>{')[0],c);
  const stored={...card(audit.records.find(r=>r.id==='ecard2-15')),sourceId:'ecard2-H11'};
  assert.equal(new URL(c.window.cardscoutCollectionUI.cardmarketLink(stored)).pathname,'/en/Pokemon/Products/Search');
});
