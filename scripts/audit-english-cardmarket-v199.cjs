'use strict';
// Read-only source audit. Provider IDs are candidates, never independent proof.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),base=path.join(root,'artifacts/en-cardmarket-audit');
const source=path.join(base,'tcgdex-source');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=v=>String(v||'').normalize('NFKC').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const dataContext=vm.createContext({Set:{},serie:{}},{codeGeneration:{strings:false,wasm:false}});
function readData(file){
  let text=fs.readFileSync(file,'utf8');
  text=text.replace(/^import[^\r\n]*$/gm,'').replace(/\b(const\s+\w+)\s*:\s*(?:Card|Set|Serie)\s*=/g,'$1 =').replace(/export default (\w+);?/,'result = $1;');
  const result=vm.runInContext('(function(){let result;\n'+text+'\nreturn result;})()',dataContext,{timeout:1000});
  if(!result)throw Error('No data object');
  return JSON.parse(JSON.stringify(result));
}
function run(){
  const officialBytes=fs.readFileSync(path.join(base,'official-products.json'));
  const official=JSON.parse(officialBytes),products=new Map(official.products.map(p=>[p.idProduct,p]));
  const snapshot=JSON.parse(fs.readFileSync(path.join(root,'catalog-sets-v185.json'))).languages.EN;
  const apiBytes=fs.readFileSync(path.join(base,'api-cards.json'));
  const apiCards=new Map(JSON.parse(apiBytes).filter(c=>snapshot.some(s=>c.id.startsWith(s.id+'-')&&c.id.slice(0,c.id.lastIndexOf('-'))===s.id)).map(c=>[c.id,c]));
  const sets=new Map(),errors=[],records=[];
  for(const series of fs.readdirSync(path.join(source,'data'),{withFileTypes:true}).filter(d=>d.isDirectory())){
    const dir=path.join(source,'data',series.name);
    for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.ts'))){
      try{const set=readData(path.join(dir,file));if(set.id)sets.set(set.id,{...set,dir:path.join(dir,file.slice(0,-3))});}catch(e){errors.push({file:path.relative(source,path.join(dir,file)),error:e.message});}
    }
  }
  const setCounts=[];
  for(const expected of snapshot){
    const set=sets.get(expected.id);let count=0;
    if(set&&fs.existsSync(set.dir))for(const file of fs.readdirSync(set.dir).filter(f=>f.endsWith('.ts'))){
      let card;try{card=readData(path.join(set.dir,file));}catch(e){errors.push({file:path.relative(source,path.join(set.dir,file)),error:e.message});continue;}
      if(!card.name?.en)continue;
      const number=file.slice(0,-3),id=set.id+'-'+number,candidates=[];
      if(!apiCards.has(id))continue;
      const variants=Array.isArray(card.variants)?[...card.variants]:[];
      if(card.thirdParty?.cardmarket)variants.push({type:'UNSPECIFIED',thirdParty:card.thirdParty});
      for(const v of variants){
        const productId=v.thirdParty?.cardmarket;if(!Number.isSafeInteger(productId))continue;
        const p=products.get(productId),reasons=[];
        if(!p)reasons.push('PRODUCT_MISSING');
        else{
          if(p.categoryName!=='Pokémon Single')reasons.push('CATEGORY');
          if(!set.thirdParty?.cardmarket)reasons.push('PROVIDER_SET_MISSING');
          else if(p.idExpansion!==set.thirdParty.cardmarket)reasons.push('PROVIDER_SET_CONFLICT');
          if(norm(p.name.split(' [')[0])!==norm(card.name.en))reasons.push('NAME_CONFLICT');
          const attacks=p.name.match(/ \[([^\]]+)\]$/)?.[1];
          const printedActions=[...(card.abilities||[]),...(card.attacks||[])].map(a=>a.name?.en||'');
          if(attacks&&norm(attacks.split(' | ').join(' '))!==norm(printedActions.join(' ')))reasons.push('PRINTED_ACTION_CONFLICT');
        }
        candidates.push({productId,expansionId:p?.idExpansion,officialName:p?.name,variant:v,reasons});
      }
      const consistent=[...new Set(candidates.filter(c=>!c.reasons.length).map(c=>c.productId))];
      records.push({id,setId:set.id,setName:set.name.en,name:card.name.en,number,providerExpansionId:set.thirdParty?.cardmarket||null,
        candidateState:consistent.length===1?'SINGLE_CANDIDATE':consistent.length>1?'MULTIPLE_CANDIDATES':'UNCONFIRMED',
        officialIdentity:'UNCONFIRMED',reason:'Official download has no collector number, edition, finish or expansion name; provider cross-reference is not independent verification.',candidates});count++;
    }
    setCounts.push({id:expected.id,expected:expected.available,observed:count});
  }
  records.sort((a,b)=>a.id.localeCompare(b.id,'en'));
  const recordIds=new Set(records.map(r=>r.id));
  const summary={schema:199,officialCreatedAt:official.createdAt,officialProducts:products.size,officialSha256:hash(officialBytes),
    providerCommit:execFileSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),
    expectedRecords:snapshot.reduce((n,s)=>n+s.available,0),apiScopedRecords:apiCards.size,apiSha256:hash(apiBytes),observedRecords:records.length,
    missingSourceRecords:[...apiCards.keys()].filter(id=>!recordIds.has(id)),
    nameAndProviderSetOnly:records.filter(r=>r.candidates.some(c=>c.reasons.every(e=>e==='PRINTED_ACTION_CONFLICT'))).length,
    singleCandidate:records.filter(r=>r.candidateState==='SINGLE_CANDIDATE').length,
    multipleCandidates:records.filter(r=>r.candidateState==='MULTIPLE_CANDIDATES').length,
    noConsistentCandidate:records.filter(r=>r.candidateState==='UNCONFIRMED').length,
    independentlyVerifiedFromDownload:0,liveVerified:0,errors,setCounts};
  if(errors.length||summary.missingSourceRecords.length||records.length!==apiCards.size){
    fs.writeFileSync(path.join(base,'failed-import.json'),JSON.stringify(summary,null,2)+'\n');
    throw Error('Incomplete source import; audit and CI fixture not published. See failed-import.json.');
  }
  fs.writeFileSync(path.join(base,'audit.json'),JSON.stringify({summary,records},null,2)+'\n');
  fs.writeFileSync(path.join(base,'summary.json'),JSON.stringify(summary,null,2)+'\n');
  // Small reviewable fixture for offline catalog-wide CI; full candidate evidence
  // remains in the audit artifact beside the immutable downloaded inputs.
  fs.writeFileSync(path.join(root,'data/en-cardmarket-audit-v199.json'),JSON.stringify({summary,records:records.map(({candidates,reason,...record})=>({...record,candidateIds:[...new Set(candidates.map(c=>c.productId))]}))})+'\n');
  console.log(JSON.stringify({...summary,setCounts:undefined,errors:errors.slice(0,8)},null,2));
}
if(require.main===module)run();
module.exports={readData,norm};
