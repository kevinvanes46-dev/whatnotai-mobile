'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {analyze,resolver}=require('../scripts/audit-cardmarket-v247.cjs');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n')).digest('hex');
const list=[{id:'set',name:'Example'},{id:'empty',name:'Empty'},{id:'pocket',name:'Digital'}];
const details={
  set:{id:'set',name:'Example',serie:{id:'series'},cardCount:{total:3},cards:[
    {id:'set-001',localId:'001',name:'First'},{id:'set-TG05',localId:'TG05',name:'Second'}]},
  empty:{id:'empty',name:'Empty',serie:{id:'series'},cardCount:{total:4},cards:[]},
  pocket:{id:'pocket',name:'Digital',serie:{id:'tcgp'},cardCount:{total:1},cards:[{id:'pocket-1',localId:'1',name:'Digital'}]}
};
const historical={records:[
  {id:'set-001',candidateState:'SINGLE_CANDIDATE',officialIdentity:'UNCONFIRMED',candidateIds:[10],providerExpansionId:1},
  {id:'set-TG05',candidateState:'MULTIPLE_CANDIDATES',officialIdentity:'UNCONFIRMED',candidateIds:[10,20],providerExpansionId:1}
]};
const official={products:[{idProduct:10,idExpansion:1,name:'First'},{idProduct:20,idExpansion:1,name:'Second'}]};
const fake={setIds:{},library:{safeRoute:c=>({url:'https://www.cardmarket.com/en/Pokemon/Products/Search?searchString='+c.name,exact:false,kind:'BROAD_SEARCH'})}};
test('audit preserves special numbers and separately counts missing coverage and candidate conflicts',()=>{
  const report=analyze(list,details,historical,official,fake);
  assert.deepEqual(report.summary,{physicalSets:2,cards:2,exactExisting:0,searchFallback:2,unavailable:0,
    candidateConflict:2,missingCandidate:0,missingSourceSets:0,incompleteSets:2,missingSourceCards:5,excludedDigital:1,exactRouteConflicts:0});
  assert.deepEqual(report.sets[0].rows.map(r=>r.number),['001','TG05']);
  assert.deepEqual(report.sets[0].rows.map(r=>r.candidateConflicts),[[10],[10]]);
  assert.equal(report.sets[0].rows[0].historical.identity,'UNCONFIRMED');
});
test('audit detects duplicate card and set identities and shared exact routes',()=>{
  assert.throws(()=>analyze([...list,list[0]],details,historical,official,fake),/duplicate set/);
  assert.throws(()=>analyze(list,details,historical,{products:[official.products[0],official.products[0]]},fake),/duplicate official/);
  const bad={...details,set:{...details.set,cards:[...details.set.cards,details.set.cards[0]]}};
  const shared={setIds:{},library:{safeRoute:()=>({url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct=10',exact:true})}};
  const report=analyze(list,bad,historical,official,shared);
  assert.equal(report.sets[0].status,'incomplete');
  assert.deepEqual(report.sets[0].invalidOrDuplicate,['set-001']);
  assert.deepEqual(report.exactRouteConflicts,[{product:'10',ids:['set-001','set-TG05']}]);
});
test('every measured EN card retains its audited route and rejects a conflicting set identity offline',()=>{
  const report=require('../docs/CARDMARKET-AUDIT-V247.json'),r=resolver(),baseline=resolver(execFileSync('git',['show','6dcbe15d8acf1747f5d6e646cafac89a92cb6c6a:library-v185.js'],{encoding:'utf8'})),seen=new Set(),paths=new Map();
  assert.equal(hash('data/en-cardmarket-audit-v199.json'),report.sources.historicalSha256);
  assert.equal(hash('data/en-cardmarket-candidates-v201.json'),report.sources.v201Sha256);
  assert.equal(hash('tests/fixtures/v203-exact-routes.json'),report.sources.v203Sha256);
  assert.equal(hash('library-v185.js'),report.sources.resolverSha256);
  assert.equal(hash('app-v137.js'),report.sources.appSha256);
  assert.equal(hash('nl-jungle-v242.js'),report.sources.jungleSha256);
  assert.equal(hash('scripts/audit-cardmarket-v247.cjs'),report.sources.auditSha256);
  let count=0,exact=0,search=0;
  for(const set of report.sets){
    if(!set.rows)continue;
    for(const row of set.rows){
      assert.equal(seen.has(row.id),false,row.id);seen.add(row.id);
      assert.equal(row.id,set.id+'-'+row.number);
      const key=Object.keys(r.setIds).find(k=>r.setIds[k].includes(set.id));
      const card={source_id:row.id,source_set_id:set.id,language:'EN',name:row.name,number:row.number,
        set:key||'TCGDEX EN '+set.id,set_name:set.name,condition:'NM',variant:'NORMAL',edition:'AUTO'};
      const route=r.library.safeRoute(card);
      assert.equal(route.url,row.route.url,row.id);
      assert.equal(route.exact===true,row.route.exact,row.id);
      if(row.id!=='sv03.5-199'&&set.id!=='base2')assert.equal(route.url,baseline.library.safeRoute(card).url,'existing route changed: '+row.id);
      if(set.id==='base2'){
        const before=baseline.library.safeRoute(card);
        if(before.exact){
          const previous=new URL(before.url),current=new URL(route.url);
          previous.searchParams.sort();current.searchParams.sort();
          assert.equal(current.href,previous.href,'existing Jungle route changed: '+row.id);
        }
      }
      assert.notEqual(r.library.safeRoute({...card,source_set_id:'wrong-set'}).exact,true,row.id);
      assert.notEqual(r.library.safeRoute({...card,source_set_id:undefined,sourceSetId:'wrong-set'}).exact,true,'wrong set alias: '+row.id);
      if(route.exact){
        const url=new URL(route.url),product=url.searchParams.get('idProduct')||url.pathname;
        assert.equal(paths.has(product),false,'duplicate exact route '+row.id);paths.set(product,row.id);exact++;
      }else if(route.url)search++;
      count++;
    }
  }
  assert.equal(count,report.summary.cards);
  assert.equal(exact,report.summary.exactExisting);
  assert.equal(search,report.summary.searchFallback);
  assert.equal(report.summary.exactRouteConflicts,0);
});
