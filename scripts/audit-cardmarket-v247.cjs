'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const hashText=bytes=>hash(bytes.toString('utf8').replace(/\r\n?/g,'\n'));
const validId=s=>typeof s==='string'&&s.length>0&&s.length<100&&!/[\s/\\?#]/.test(s);

function resolver(librarySource=fs.readFileSync(path.join(root,'library-v185.js'),'utf8')){
  const app=fs.readFileSync(path.join(root,'app-v137.js'),'utf8');
  const embedded=app.match(/const EMBEDDED_DATA = .*;/),sets=app.match(/const CM_SOURCE_SETS = [\s\S]*?;/);
  if(!embedded||!sets)throw Error('Existing resolver constants are unavailable');
  const context=vm.createContext({URL,document:{}});
  context.window=context;
  vm.runInContext(fs.readFileSync(path.join(root,'nl-jungle-v242.js'),'utf8')+'\n'+embedded[0]+'\n'+sets[0]+'\n'+librarySource,context);
  return {library:context.HoloDexLibrary,setIds:vm.runInContext('CM_SOURCE_SETS',context)};
}

function analyze(list,details,historical,official,resolve=resolver(),baseline={records:[]},candidates201={cards:[]}){
  if(!Array.isArray(list)||!Array.isArray(historical?.records)||!Array.isArray(official?.products))throw Error('Invalid audit input');
  if(!Array.isArray(baseline.records))throw Error('Invalid v203 route fixture');
  if(!Array.isArray(candidates201.cards))throw Error('Invalid v201 candidates');
  const baselineRoutes=new Map();
  for(const row of baseline.records){if(!validId(row?.id)||baselineRoutes.has(row.id)||typeof row.url!=='string')throw Error('Invalid v203 route');baselineRoutes.set(row.id,row.url);}
  const v201=new Map();
  for(const row of candidates201.cards){
    if(!validId(row?.cardId)||v201.has(row.cardId)||!Array.isArray(row.links))throw Error('Invalid or duplicate v201 identity');
    v201.set(row.cardId,row);
  }
  const hist=new Map();
  for(const row of historical.records){if(!validId(row.id)||hist.has(row.id))throw Error('Invalid or duplicate historical identity');hist.set(row.id,row);}
  const products=new Map();
  for(const row of official.products){if(!Number.isSafeInteger(row?.idProduct)||products.has(row.idProduct))throw Error('Invalid or duplicate official product ID');products.set(row.idProduct,row);}
  const setIds=new Set(),rows=[],setReports=[],claims=new Map(),routeClaims=new Map();
  for(const set of list){
    if(!validId(set?.id)||!String(set.name||'').trim()||setIds.has(set.id))throw Error('Invalid or duplicate set identity: '+set?.id);
    setIds.add(set.id);
    const detail=details[set.id];
    if(!detail||detail.error){setReports.push({id:set.id,name:set.name,status:'missing_source',error:detail?.error||'Missing set response'});continue;}
    if(detail.id!==set.id||detail.name!==set.name||!Array.isArray(detail.cards)||!detail.serie?.id){
      setReports.push({id:set.id,name:set.name,status:'defect',error:'Set identity or response invalid'});continue;
    }
    if(detail.serie.id==='tcgp'){setReports.push({id:set.id,name:set.name,status:'excluded_digital'});continue;}
    const total=detail.cardCount?.total;
    if(!Number.isSafeInteger(total)||total<0){setReports.push({id:set.id,name:set.name,status:'defect',error:'Invalid total'});continue;}
    const seen=new Set(),setRows=[],errors=[];
    for(const c of detail.cards){
      if(!validId(c?.localId)||c.id!==set.id+'-'+c.localId||!String(c.name||'').trim()||seen.has(c.id)){
        errors.push(String(c?.id||'(missing id)'));continue;
      }
      seen.add(c.id);
      const key=Object.keys(resolve.setIds).find(k=>resolve.setIds[k].includes(set.id));
      const card={source_id:c.id,source_set_id:set.id,language:'EN',name:c.name,number:c.localId,
        set:key||'TCGDEX EN '+set.id,set_name:set.name,condition:'NM',variant:'NORMAL',edition:'AUTO'};
      const route=resolve.library.safeRoute(card);
      const old=hist.get(c.id);
      const prior=v201.get(c.id);
      const v201Candidates=(prior?.links||[]).map(link=>link.idProduct);
      if(v201Candidates.some(id=>!Number.isSafeInteger(id)||id<=0))throw Error('Invalid v201 candidate: '+c.id);
      const oldCandidates=(old?.candidateIds||[]).filter(Number.isSafeInteger);
      const candidates=[...new Set([...oldCandidates,...v201Candidates])];
      for(const id of candidates){if(!claims.has(id))claims.set(id,new Set());claims.get(id).add(c.id);}
      const item={id:c.id,setId:set.id,number:c.localId,name:c.name,
        route:{kind:route.kind||'',exact:route.exact===true,url:route.url||'',evidence:route.confirmed?'confirmed':route.jungle?'existing_jungle':route.curated?'existing_curated':route.exact?'existing_route':'search'},
        historical:old?{state:old.candidateState,identity:old.officialIdentity,providerExpansionId:old.providerExpansionId,candidates:oldCandidates}:null,
        candidateIds:candidates,
        v201:prior?{status:candidates201.status,links:prior.links}:null,v203:baselineRoutes.get(c.id)||null};
      if(item.route.exact){
        const u=new URL(item.route.url);
        const product=u.searchParams.get('idProduct')||u.pathname;
        if(!routeClaims.has(product))routeClaims.set(product,new Set());
        routeClaims.get(product).add(c.id);
      }
      setRows.push(item);rows.push(item);
    }
    setReports.push({id:set.id,name:set.name,status:!errors.length&&total>0&&seen.size===total?'complete':'incomplete',
      total,received:detail.cards.length,unique:seen.size,missing:Math.max(0,total-seen.size),invalidOrDuplicate:errors,rows:setRows});
  }
  for(const item of rows){
    const ids=item.candidateIds;
    item.candidateConflicts=ids.filter(id=>claims.get(id).size>1);
    item.missingCandidate=!item.historical||!ids.length||ids.every(id=>!products.has(id));
    item.officialCandidates=ids.map(id=>{
      const product=products.get(id);
      return product?{id,expansionId:product.idExpansion,name:product.name}: {id,missing:true};
    });
  }
  const duplicates=[...routeClaims].filter(([,ids])=>ids.size>1).map(([product,ids])=>({product,ids:[...ids]}));
  for(const set of setReports){
    if(!set.rows)continue;
    set.counts={cards:set.rows.length,exactExisting:set.rows.filter(x=>x.route.exact).length,
      searchFallback:set.rows.filter(x=>!x.route.exact&&x.route.url).length,
      unavailable:set.rows.filter(x=>!x.route.url).length,
      candidateConflict:set.rows.filter(x=>x.candidateConflicts.length).length,
      missingCandidate:set.rows.filter(x=>x.missingCandidate).length};
  }
  return {sets:setReports,exactRouteConflicts:duplicates,summary:{
    physicalSets:setReports.filter(s=>s.rows).length,cards:rows.length,
    exactExisting:rows.filter(x=>x.route.exact).length,searchFallback:rows.filter(x=>!x.route.exact&&x.route.url).length,
    unavailable:rows.filter(x=>!x.route.url).length,candidateConflict:rows.filter(x=>x.candidateConflicts.length).length,
    missingCandidate:rows.filter(x=>x.missingCandidate).length,
    missingSourceSets:setReports.filter(s=>s.status==='missing_source'||s.status==='defect').length,
    incompleteSets:setReports.filter(s=>s.status==='incomplete').length,
    missingSourceCards:setReports.reduce((n,s)=>n+(s.missing||0),0),excludedDigital:setReports.filter(s=>s.status==='excluded_digital').length,
    exactRouteConflicts:duplicates.length}};
}

async function getJson(url){
  const response=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  return response.json();
}
async function run(){
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=='--catalog'||args[2]!=='--out')throw Error('Usage: node scripts/audit-cardmarket-v247.cjs --catalog <official-products.json> --out <report.json>');
  const bytes=fs.readFileSync(path.resolve(args[1])),official=JSON.parse(bytes);
  if(official.version!==1||!Number.isFinite(Date.parse(official.createdAt))||official.products?.length<70000)throw Error('Invalid official catalog');
  const historicalBytes=fs.readFileSync(path.join(root,'data','en-cardmarket-audit-v199.json'));
  const baselineBytes=fs.readFileSync(path.join(root,'tests','fixtures','v203-exact-routes.json'));
  const v201Bytes=fs.readFileSync(path.join(root,'data','en-cardmarket-candidates-v201.json'));
  const historical=JSON.parse(historicalBytes),baseline=JSON.parse(baselineBytes),v201=JSON.parse(v201Bytes),list=await getJson('https://api.tcgdex.net/v2/en/sets');
  if(!Array.isArray(list))throw Error('Invalid set listing');
  const details={},errors=[];let next=0;
  async function worker(){
    while(next<list.length){
      const i=next++,set=list[i];
      if(!validId(set?.id)){errors.push('Invalid set ID at '+i);continue;}
      try{details[set.id]=await getJson('https://api.tcgdex.net/v2/en/sets/'+encodeURIComponent(set.id));}
      catch(error){details[set.id]={error:error.message};errors.push(set.id+': '+error.message);}
      if((i+1)%25===0)console.log('Checked '+(i+1)+' / '+list.length);
    }
  }
  await Promise.all(Array.from({length:3},worker));
  const report=analyze(list,details,historical,official,resolver(),baseline,v201);
  report.sources={measuredAt:new Date().toISOString(),setList:'https://api.tcgdex.net/v2/en/sets',
    officialCatalog:'https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_6.json',
    officialCreatedAt:official.createdAt,officialSha256:hash(bytes),historicalCommit:'bfa45fec79ae4d6329826950b9c5746d1a0f4014',
    historicalSha256:hashText(historicalBytes),v201Sha256:hashText(v201Bytes),v203Sha256:hashText(baselineBytes),
    resolverSha256:hashText(fs.readFileSync(path.join(root,'library-v185.js'))),
    appSha256:hashText(fs.readFileSync(path.join(root,'app-v137.js'))),
    jungleSha256:hashText(fs.readFileSync(path.join(root,'nl-jungle-v242.js'))),auditSha256:hashText(fs.readFileSync(__filename)),errors};
  fs.writeFileSync(path.resolve(args[3]),JSON.stringify(report)+'\n');
  console.log(JSON.stringify(report.summary));
  if(errors.length||report.summary.missingSourceSets||report.summary.exactRouteConflicts)process.exitCode=1;
}
if(require.main===module)run().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={analyze,resolver};
