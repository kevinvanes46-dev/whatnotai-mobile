'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const zlib=require('node:zlib');

const root=path.resolve(__dirname,'..');
const auditDir=path.join(root,'artifacts','en-cardmarket-audit');
const sourceDir=path.join(auditDir,'v202-source');
const outputJson=path.join(auditDir,'v203-final-report.json');
const outputMarkdown=path.join(auditDir,'v203-final-report.md');
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const normalize=value=>String(value||'').normalize('NFKC').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const compareText=(a,b)=>a<b?-1:a>b?1:0;
const candidateContradictions=new Set([
  'PRODUCT_NOT_IN_OFFICIAL_CATALOG','NOT_A_POKEMON_SINGLE','PRODUCT_INDEX_MISMATCH',
  'PRODUCT_NAME_MISMATCH','SHARED_TCGDEX_PRODUCT_ID','PRINTED_ACTION_MISMATCH'
]);

function readJson(file){
  return JSON.parse(fs.readFileSync(file,'utf8'));
}

function indexZip(buffer){
  const signature=Buffer.from([0x50,0x4b,0x05,0x06]);
  const start=Math.max(0,buffer.length-65557);
  const eocd=buffer.lastIndexOf(signature);
  if(eocd<start||eocd<0)throw Error('TCGdex ZIP end record is missing.');
  const disk=buffer.readUInt16LE(eocd+4),directoryDisk=buffer.readUInt16LE(eocd+6);
  const entriesOnDisk=buffer.readUInt16LE(eocd+8),entryCount=buffer.readUInt16LE(eocd+10);
  const directorySize=buffer.readUInt32LE(eocd+12),directoryOffset=buffer.readUInt32LE(eocd+16);
  if(disk||directoryDisk||entriesOnDisk!==entryCount||entryCount===0xffff||
    directoryOffset===0xffffffff||directorySize===0xffffffff)throw Error('Unsupported or incomplete TCGdex ZIP directory.');
  const entries=new Map();
  let offset=directoryOffset;
  for(let index=0;index<entryCount;index++){
    if(buffer.readUInt32LE(offset)!==0x02014b50)throw Error('Invalid TCGdex ZIP central directory.');
    const flags=buffer.readUInt16LE(offset+8),method=buffer.readUInt16LE(offset+10);
    const compressedSize=buffer.readUInt32LE(offset+20),size=buffer.readUInt32LE(offset+24);
    const nameLength=buffer.readUInt16LE(offset+28),extraLength=buffer.readUInt16LE(offset+30);
    const commentLength=buffer.readUInt16LE(offset+32),localOffset=buffer.readUInt32LE(offset+42);
    const name=buffer.subarray(offset+46,offset+46+nameLength).toString('utf8');
    if(name.startsWith('cards-database-master/data/')&&name.endsWith('.ts')){
      if(flags&1)throw Error('Encrypted TCGdex source entry is unsupported: '+name);
      if(method!==0&&method!==8)throw Error('Unsupported TCGdex compression method for '+name);
      entries.set(name,{method,compressedSize,size,localOffset});
    }
    offset+=46+nameLength+extraLength+commentLength;
  }
  if(offset!==directoryOffset+directorySize)throw Error('TCGdex ZIP directory length did not match.');
  return entries;
}

function readZipEntry(buffer,entry,name){
  const offset=entry.localOffset;
  if(buffer.readUInt32LE(offset)!==0x04034b50)throw Error('Invalid TCGdex local header: '+name);
  const nameLength=buffer.readUInt16LE(offset+26),extraLength=buffer.readUInt16LE(offset+28);
  const start=offset+30+nameLength+extraLength,end=start+entry.compressedSize;
  const compressed=buffer.subarray(start,end);
  const data=entry.method===0?compressed:zlib.inflateRawSync(compressed,{maxOutputLength:entry.size});
  if(data.length!==entry.size)throw Error('TCGdex source entry length mismatch: '+name);
  return data.toString('utf8');
}

const dataContext=vm.createContext({Set:{},serie:{}},{codeGeneration:{strings:false,wasm:false}});
function parseTs(text,file){
  const source=text.replace(/^import[^\r\n]*$/gm,'')
    .replace(/\b(const\s+\w+)\s*:\s*(?:Card|Set|Serie)\s*=/g,'$1 =')
    .replace(/export default (\w+);?/,'result = $1;');
  const value=vm.runInContext('(function(){let result;\n'+source+'\nreturn result;})()',
    dataContext,{timeout:1000,filename:file});
  if(!value)throw Error('TCGdex source did not export a record: '+file);
  return JSON.parse(JSON.stringify(value));
}

function sourceVariants(card){
  const variants=Array.isArray(card.variants)?card.variants:[];
  const result=variants.map(variant=>({
    type:variant.type||'UNSPECIFIED',
    subtype:variant.subtype||null,
    foil:variant.foil||null,
    size:variant.size||null,
    stamp:Array.isArray(variant.stamp)?variant.stamp:null,
    productId:Number.isSafeInteger(variant.thirdParty?.cardmarket)?variant.thirdParty.cardmarket:null
  }));
  if(Number.isSafeInteger(card.thirdParty?.cardmarket)){
    result.push({type:'UNSPECIFIED',subtype:null,foil:null,size:null,stamp:null,productId:card.thirdParty.cardmarket});
  }
  return result;
}

function appLibrary(){
  const app=fs.readFileSync(path.join(root,'app-v137.js'),'utf8');
  const embedded=app.match(/const EMBEDDED_DATA = .*;/)?.[0];
  const sets=app.match(/const CM_SOURCE_SETS = \{[\s\S]*?\n\s*\};/)?.[0];
  if(!embedded||!sets)throw Error('Cannot initialize the existing Cardmarket routing baseline.');
  const context={URL};
  vm.createContext(context);
  vm.runInContext(embedded+'\n'+sets+'\n'+fs.readFileSync(path.join(root,'library-v185.js'),'utf8'),context);
  if(!context.HoloDexLibrary?.safeRoute)throw Error('Existing Cardmarket library did not initialize.');
  return context.HoloDexLibrary;
}

function makeMarkdown(report){
  const s=report.summary,c=report.comparison;
  const lines=[
    '# V203 Cardmarket-linkreparatie',
    '',
    `Offline audit van de 21.290 EN-kaartidentiteiten. De officiële productsnapshot heeft de velden ${s.officialProductFields.join(', ')} en geen gedrukt kaartnummer; productnaam, set-kandidaat en provider-ID zijn daarom geen onafhankelijk nummerbewijs.`,
    '',
    '## Status per kaartidentiteit',
    '',
    '| Status | Aantal |',
    '|---|---:|',
    `| EXACT | ${s.statusCounts.EXACT} |`,
    `| CANDIDATE | ${s.statusCounts.CANDIDATE} |`,
    `| SEARCH | ${s.statusCounts.SEARCH} |`,
    `| CONFLICT | ${s.statusCounts.CONFLICT} |`,
    `| Totaal | ${s.records} |`,
    '',
    'Statussen zijn exclusief. Bestaande V201-kandidaatlinks blijven kandidaten; V202-clean candidates worden niet automatisch directe productlinks.',
    `Van de ${s.v202CleanCandidates} V202-kandidaten zijn ${s.v202CleanCandidatesRejectedBySourceMismatch} wegens naam-, aanval/ability- of eigenaarschap-tegenspraak teruggezet naar SEARCH. CANDIDATE-status: ${s.v202CleanCandidatesPassingCrossChecks} bron-consistente V202-kandidaten + ${s.v201CandidateLinks} behouden V201-links − ${s.v201CandidateOverlapV202CleanPassing} overlap − ${s.v202PassingCandidatesAlreadyCoveredByExistingExact} bestaande exacte routes = ${s.statusCounts.CANDIDATE}.`,
    `Van de ${s.conflictIdentities} identiteiten in de conflictqueue blijven ${s.conflictIdentitiesRemaining} exclusief CONFLICT; ${s.conflictIdentitiesWithExistingExact} bestaande exact-routes en ${s.conflictIdentitiesWithV201Candidate} V201-kandidaten zijn behouden, en ${s.conflictOwnersVerifiedByV203} Unown-eigenaars zijn nieuw bewezen.`,
    '',
    '## Uitgaande routes',
    '',
    '| Route | Voor V203 | Na V203 | Verschil |',
    '|---|---:|---:|---:|',
    `| EXACT direct (alle bestaande plus nieuw) | ${c.before.exact} | ${c.after.exact} | +${c.after.exact-c.before.exact} |`,
    `| V201 historische kandidaatlink | ${c.before.candidate} | ${c.after.candidate} | ${c.after.candidate-c.before.candidate} |`,
    `| Cardmarket-zoeklink | ${c.before.search} | ${c.after.search} | ${c.after.search-c.before.search} |`,
    '',
    `Van de ${c.after.exact} directe routes zijn precies ${s.newlyVerifiedExact} de nieuwe V203-browserbevestigingen. De bestaande ${c.before.exact} exact-gemarkeerde routes zijn behouden, niet opnieuw door V203 bewezen.`,
    '',
    '## Bewijs en open werk',
    '',
    `- TCGdex-bronrecords gematcht: ${s.sourceRecordsMatched}/${s.records}.`,
    `- Officiële Cardmarket-productcatalogus: ${s.officialProducts} producten.`,
    `- V202 unieke naam/set-kandidaten: ${s.v202CleanCandidates}; ze introduceren nooit een nieuwe directe route zonder onafhankelijk kaartnummerbewijs.`,
    `- V201 enkelvoudige Primal Clash-kandidaatlinks behouden: ${s.v201CandidateLinks}; drie meervoudige identiteiten blijven zoekroutes.`,
    `- V202 gedeelde product-ID’s in de reviewqueue: ${s.conflictProducts}; betrokken bronidentiteiten: ${s.conflictIdentities}. De volledige queue met eigenaar-ID’s staat in dit JSON-rapport.`,
    `- Nieuwe onafhankelijk door gebruiker aangeleverde browserbevestigingen: ${s.newlyVerifiedExact} (productexpansie 1548).`,
    '- De drie gedocumenteerde Unown-mappings zijn W → W-28 / 276635, V → V-28 / 276636 en X → X-28 / 276637. L/M/N worden expliciet niet als eigenaar geaccepteerd.',
    '- Geen prijzen opgehaald of verzonnen; er is niet gescrapet en er is geen live Cardmarket-toegang gebruikt.',
    '',
    'V202-clean candidates die niet al een bestaande exacte of V201-kandidaatroute hebben, blijven zoekresultaten. De officiële catalogussnapshot heeft doorgaans geen gedrukt kaartnummer; waar dat onafhankelijk bewijs ontbreekt blijft de kaart onopgelost.',
    '',
    '## Bronintegriteit',
    '',
    '| Input | SHA-256 |',
    '|---|---|',
    ...Object.entries(report.inputs.sha256).map(([name,hash])=>`| ${name} | \`${hash}\` |`),
    ''
  ];
  return lines.join('\n');
}

function buildAudit(){
  const packageDir=process.env.HOLOKEEP_V203_PACKAGE;
  if(!packageDir)throw Error('HOLOKEEP_V203_PACKAGE is required to read the supplied V203 evidence.');
  const evidenceFile=path.join(packageDir,'v203-verified-evidence.json');
  const files={
    v199:path.join(root,'data','en-cardmarket-audit-v199.json'),
    productIndex:path.join(root,'cardmarket-product-index-v191.json'),
    officialProducts:path.join(sourceDir,'products_singles_6.json'),
    tcgdexZip:path.join(sourceDir,'tcgdex-cards-database.zip'),
    cleanCandidates:path.join(auditDir,'v202-clean-candidates.json'),
    conflicts:path.join(auditDir,'v202-conflict-triage.json'),
    v201:path.join(auditDir,'v201-primal-clash-candidates.json'),
    evidence:evidenceFile
  };
  for(const [name,file] of Object.entries(files))if(!fs.existsSync(file))throw Error('Required local V203 input is missing: '+name);

  const bytes=Object.fromEntries(Object.entries(files).map(([name,file])=>[name,fs.readFileSync(file)]));
  const v199=JSON.parse(bytes.v199.toString('utf8'));
  const index=JSON.parse(bytes.productIndex.toString('utf8'));
  const catalogue=JSON.parse(bytes.officialProducts.toString('utf8'));
  const clean=JSON.parse(bytes.cleanCandidates.toString('utf8'));
  const conflicts=JSON.parse(bytes.conflicts.toString('utf8'));
  const v201=JSON.parse(bytes.v201.toString('utf8'));
  const evidence=JSON.parse(bytes.evidence.toString('utf8'));
  const records=v199.records;
  const officialProductFields=[...new Set(catalogue.products?.flatMap(product=>Object.keys(product))||[])].sort(compareText);
  const officialProductNumberFields=officialProductFields.filter(field=>/number|collector/i.test(field));
  if(v199.summary?.observedRecords!==21290||records.length!==21290||new Set(records.map(r=>r.id)).size!==records.length)
    throw Error('V199 audit must contain exactly 21,290 unique source identities.');
  if(catalogue.products?.length!==75066||index.count!==75066||index.schema!==191||
    index.source!=='CARDMARKET_OFFICIAL_PRODUCT_CATALOG')
    throw Error('Official Cardmarket catalog/index shape or count changed.');
  if(officialProductNumberFields.length)
    throw Error('Official catalog now exposes a possible printed-number field; review before classifying candidates.');
  if(clean.cards?.length!==14936||conflicts.products?.length!==899||
    v201.cards?.length!==164||v201.unmappedProducts?.length!==10)
    throw Error('V201/V202 source counts changed; refusing to publish a mismatched report.');
  if(evidence.scope!=='THREE_CARDS_ONLY'||evidence.records?.length!==3)
    throw Error('V203 evidence is not scoped to the three supplied Unown records.');

  const productById=new Map(catalogue.products.map(product=>[product.idProduct,product]));
  for(const [id,product] of productById){
    const indexed=index.rows[id];
    if(!indexed||indexed[0]!==product.idExpansion||indexed[1]!==product.name)
      throw Error('Official catalog and product index disagree for product '+id+'.');
  }
  const auditById=new Map(records.map(record=>[record.id,record]));
  const cleanById=new Map(clean.cards.map(record=>[record.cardId,record]));
  if(cleanById.size!==clean.cards.length)throw Error('V202 clean-candidate identities are duplicated.');
  const v201ById=new Map(v201.cards.filter(record=>record.links.length===1).map(record=>[record.cardId,record]));
  const triageByProduct=new Map(conflicts.products.map(record=>[record.productId,record]));
  if(triageByProduct.size!==conflicts.products.length)throw Error('V202 conflict product IDs are duplicated.');

  const zipBuffer=bytes.tcgdexZip;
  const zipEntries=indexZip(zipBuffer);
  const sourceSetIds=new Set(records.map(record=>record.setId));
  const sourceSets=new Map();
  for(const name of zipEntries.keys()){
    const parts=name.split('/');
    if(parts.length!==4||!name.endsWith('.ts'))continue;
    const set=parseTs(readZipEntry(zipBuffer,zipEntries.get(name),name),name);
    if(sourceSetIds.has(set.id)){
      if(sourceSets.has(set.id))throw Error('Duplicate TCGdex set definition for '+set.id+'.');
      sourceSets.set(set.id,{path:name.slice(0,-3),record:set});
    }
  }
  if(sourceSets.size!==sourceSetIds.size)throw Error('TCGdex ZIP does not define every V199 source set.');

  const sourceCards=new Map(),ownersByProduct=new Map();
  for(const record of records){
    const sourceSet=sourceSets.get(record.setId);
    if(!sourceSet)throw Error('TCGdex source set missing for '+record.id+'.');
    const cardPath=sourceSet.path+'/'+record.number+'.ts';
    const entry=zipEntries.get(cardPath);
    if(!entry)throw Error('TCGdex source card missing for '+record.id+'.');
    const card=parseTs(readZipEntry(zipBuffer,entry,cardPath),cardPath);
    const productVariants=sourceVariants(card);
    const productIds=[...new Set(productVariants.map(variant=>variant.productId).filter(Number.isSafeInteger))].sort((a,b)=>a-b);
    sourceCards.set(record.id,{card,set:sourceSet.record,variants:productVariants,productIds});
    for(const productId of productIds){
      if(!ownersByProduct.has(productId))ownersByProduct.set(productId,new Set());
      ownersByProduct.get(productId).add(record.id);
    }
  }
  if(sourceCards.size!==records.length)throw Error('TCGdex ZIP card count did not match V199 records.');

  const verifiedByCardId=new Map();
  for(const proof of evidence.records){
    const record=auditById.get(proof.holoKeepCardId),source=sourceCards.get(proof.holoKeepCardId);
    const product=productById.get(proof.idProduct),triage=triageByProduct.get(proof.idProduct);
    const redirect=new URL(proof.officialRedirectEntryUrl);
    const expectedTitle='Unown ['+proof.tcgdexSourceCollectorNumber+']';
    const sourcePath='cards-database-master/'+proof.tcgdexSourceFile.replace(/^cards-database-master\//,'');
    if(!record||!source||!product||!triage)throw Error('V203 evidence does not resolve against every local source: '+proof.holoKeepCardId);
    if(proof.decision!=='PRODUCT_IDENTITY_CONFIRMED_BY_SCREENSHOT'||
      proof.evidence?.type!=='user-provided-browser-screenshot-after-following-entry-url'||
      proof.officialExpansionIdFromProductCatalogue!==1548||product.idExpansion!==1548||
      product.categoryName!=='Pokémon Single'||!product.name.startsWith(expectedTitle)||
      proof.officialCardTitle!==expectedTitle+' (UF '+proof.officialCollectorNumber+')'||
      proof.officialCollectorNumber!==proof.tcgdexSourceCollectorNumber+'-28'||
      !source.productIds.includes(proof.idProduct)||source.set.id!=='exu'||
      !source.variants.some(variant=>variant.type===proof.tcgdexVariantType&&variant.productId===proof.idProduct)||
      source.card.name?.en!=='Unown'||record.number!==proof.tcgdexSourceCollectorNumber||
      record.setId!=='exu'||!triage.allCardIds.includes(proof.rejectedSharedOwner)||
      !sourceCards.get(proof.rejectedSharedOwner)?.productIds.includes(proof.idProduct)||
      redirect.origin!=='https://www.cardmarket.com'||redirect.pathname!=='/en/Pokemon/Products'||
      redirect.searchParams.get('idProduct')!==String(proof.idProduct)||[...redirect.searchParams.keys()].length!==1)
      throw Error('V203 supplied evidence failed source/catalog cross-check: '+proof.holoKeepCardId);
    const expectedPath='cards-database-master/data/EX/Unseen Forces Unown Collection/'+proof.tcgdexSourceCollectorNumber+'.ts';
    if(sourcePath!==expectedPath)throw Error('Unexpected TCGdex evidence source path for '+proof.holoKeepCardId);
    verifiedByCardId.set(proof.holoKeepCardId,proof);
  }
  if(verifiedByCardId.size!==3)throw Error('V203 must verify exactly three product owners.');

  for(const candidate of clean.cards){
    const record=auditById.get(candidate.cardId),product=productById.get(candidate.productId);
    if(!record||!product||product.idExpansion!==candidate.expansionId)
      throw Error('V202 clean candidate failed product/expansion cross-check: '+candidate.cardId);
    if(!sourceCards.get(candidate.cardId).productIds.includes(candidate.productId))
      throw Error('V202 clean candidate is absent from the TCGdex source variant: '+candidate.cardId);
  }
  for(const conflict of conflicts.products){
    if(!Number.isSafeInteger(conflict.productId)||conflict.allCardIds.length<2||
      conflict.allCardIds.some(id=>!auditById.has(id)))
      throw Error('V202 conflict queue has an invalid or unknown card owner.');
    const sourceOwners=ownersByProduct.get(conflict.productId)||new Set();
    if(!conflict.allCardIds.every(id=>sourceOwners.has(id)))
      throw Error('V202 conflict owner list disagrees with TCGdex source for product '+conflict.productId+'.');
  }

  const conflictProductsByCard=new Map();
  for(const conflict of conflicts.products){
    for(const id of conflict.allCardIds){
      if(!conflictProductsByCard.has(id))conflictProductsByCard.set(id,[]);
      conflictProductsByCard.get(id).push(conflict.productId);
    }
  }
  for(const productIds of conflictProductsByCard.values())productIds.sort((a,b)=>a-b);
  const library=appLibrary();
  const statusCounts={EXACT:0,CANDIDATE:0,SEARCH:0,CONFLICT:0};
  const routeCounts={EXACT:0,CANDIDATE:0,SEARCH:0,UNAVAILABLE:0};
  const acceptedCleanCandidateIds=new Set();
  let cleanCandidateSourceMismatches=0;
  let sourceRecordsMatched=0;
  const resultRecords=[];
  const existingExactIds=new Set();
  for(const record of records){
    const source=sourceCards.get(record.id);
    sourceRecordsMatched++;
    const route=library.safeRoute({
      source_id:record.id,source_set_id:record.setId,name:record.name,number:record.number,
      set_name:record.setName,language:'EN',condition:'NM'
    });
    const v201Record=v201ById.get(record.id);
    const conflictIds=conflictProductsByCard.get(record.id)||[];
    const cleanRecord=cleanById.get(record.id);
    const verified=verifiedByCardId.get(record.id);
    if(route.exact){
      routeCounts.EXACT++;
      if(!verified)existingExactIds.add(record.id);
    }else if(route.candidate){
      routeCounts.CANDIDATE++;
    }else{
      routeCounts[route.url?'SEARCH':'UNAVAILABLE']++;
    }

    const candidateIds=[...new Set([...source.productIds,...record.candidateIds])].sort((a,b)=>a-b);
    const candidateEvidence=candidateIds.map(productId=>{
      const product=productById.get(productId),owners=[...(ownersByProduct.get(productId)||[])].sort(compareText);
      const catalogIndex=index.rows[productId];
      const actionText=product?.name.match(/ \[([^\]]+)\]$/)?.[1]||'';
      const cardActions=[...(source.card.abilities||[]),...(source.card.attacks||[])].map(action=>action.name?.en||'').filter(Boolean);
      const actionsMatch=actionText&&cardActions.length
        ?normalize(actionText.split(' | ').join(' '))===normalize(cardActions.join(' '))
        :null;
      const reasons=[];
      if(!product)reasons.push('PRODUCT_NOT_IN_OFFICIAL_CATALOG');
      else{
        if(product.categoryName!=='Pokémon Single')reasons.push('NOT_A_POKEMON_SINGLE');
        if(!catalogIndex||catalogIndex[0]!==product.idExpansion||catalogIndex[1]!==product.name)
          reasons.push('PRODUCT_INDEX_MISMATCH');
        if(normalize(product.name.split(' [')[0])!==normalize(record.name))reasons.push('PRODUCT_NAME_MISMATCH');
      }
      if(owners.length>1)reasons.push('SHARED_TCGDEX_PRODUCT_ID');
      if(actionsMatch===false)reasons.push('PRINTED_ACTION_MISMATCH');
      reasons.push('OFFICIAL_CATALOG_HAS_NO_INDEPENDENT_COLLECTOR_NUMBER');
      return {
        productId,officialName:product?.name||null,expansionId:product?.idExpansion||null,
        metacardId:product?.idMetacard||null,category:product?.categoryName||null,
        sourceVariantTypes:[...new Set(source.variants.filter(v=>v.productId===productId).map(v=>v.type))].sort(compareText),
        ownerCount:owners.length,owners,actionsMatch,reasons
      };
    });
    const cleanCandidateEvidence=cleanRecord&&candidateEvidence.find(candidate=>candidate.productId===cleanRecord.productId);
    const cleanCandidateContradictions=cleanCandidateEvidence
      ?cleanCandidateEvidence.reasons.filter(reason=>candidateContradictions.has(reason)):[];
    const cleanCandidateAccepted=Boolean(cleanRecord&&cleanCandidateEvidence&&!cleanCandidateContradictions.length);
    if(cleanCandidateAccepted)acceptedCleanCandidateIds.add(record.id);
    else if(cleanRecord)cleanCandidateSourceMismatches++;
    let status,reason;
    if(route.exact){
      status='EXACT';
      reason=verified?'Independently browser-confirmed product owner; official catalog, source card, set and expansion cross-checked.'
        :'Existing exact route retained unchanged from the pre-V203 application.';
    }else if(route.candidate){
      status='CANDIDATE';
      reason='V201 historical candidate route retained and still labelled unverified.';
    }else if(conflictIds.length){
      status='CONFLICT';
      reason='One or more Cardmarket IDs have multiple source owners; no direct V203 product route is used.';
    }else if(cleanCandidateAccepted){
      status='CANDIDATE';
      reason='V202 unique name/set candidate has no independent printed-number proof; route remains a search.';
    }else if(v201Record){
      status='CANDIDATE';
      reason='V201 historical candidate evidence exists, but no unique direct route is enabled.';
    }else if(cleanRecord){
      status='SEARCH';
      reason='V202 candidate rejected because official name, printed action/ability or product ownership evidence conflicts; keep search.';
    }else{
      status='SEARCH';
      reason='No sufficiently supported direct product identity; keep a name/set/number search.';
    }
    statusCounts[status]++;
    resultRecords.push({
      id:record.id,setId:record.setId,setName:record.setName,name:record.name,number:record.number,
      status,reason,routeMode:route.exact?'EXACT':route.candidate?'CANDIDATE':route.url?'SEARCH':'UNAVAILABLE',
      routeUrl:route.url||'',routeEvidence:verified?'V203_USER_BROWSER_VERIFIED':route.evidence||'',
      verifiedProductId:verified?.idProduct||null,officialPrintedNumber:verified?.officialCollectorNumber||null,
      v202CandidateProductId:cleanRecord?.productId||null,
      v201CandidateProductId:v201Record?.links[0]?.idProduct||null,
      conflictProductIds:conflictIds,
      sourceProviderExpansionId:source.set.thirdParty?.cardmarket||null,
      sourceVariantEvidence:source.variants,
      candidateEvidence
    });
  }
  if(sourceRecordsMatched!==21290)throw Error('Not all source cards were audited.');
  const candidateEvidenceIds=new Set([...cleanById.keys(),...v201ById.keys()]);
  const conflictOwnerIds=new Set(conflictProductsByCard.keys());
  const before={exact:215,candidate:161,search:20914,unavailable:0};
  const after={exact:routeCounts.EXACT,candidate:routeCounts.CANDIDATE,
    search:routeCounts.SEARCH,unavailable:routeCounts.UNAVAILABLE};
  if(after.exact!==218||after.candidate!==161||after.search!==20911||after.unavailable!==0)
    throw Error('V203 routing changed beyond the three evidenced links or altered existing routes.');

  const conflictQueue=conflicts.products.map(conflict=>{
    const verifiedOwners=conflict.allCardIds.filter(id=>verifiedByCardId.has(id));
    const preservedExactOwners=conflict.allCardIds.filter(id=>existingExactIds.has(id));
    const preservedCandidateOwners=conflict.allCardIds.filter(id=>v201ById.has(id));
    return {
      productId:conflict.productId,status:conflict.status,
      officialProduct:productById.get(conflict.productId)?.name||null,
      expansionId:productById.get(conflict.productId)?.idExpansion||null,
      owners:conflict.allCardIds,
      compatibleOwners:conflict.compatibleCardIds,
      verifiedOwners,
      rejectedOwners:conflict.allCardIds.filter(id=>verifiedOwners.length&&
        evidence.records.some(proof=>proof.idProduct===conflict.productId&&proof.rejectedSharedOwner===id)),
      existingExactRoutesPreserved:preservedExactOwners,
      v201CandidateRoutesPreserved:preservedCandidateOwners
    };
  }).sort((a,b)=>a.productId-b.productId);
  const summary={
    records:records.length,sourceRecordsMatched,officialProducts:catalogue.products.length,
    officialProductFields,
    statusCounts,routeCounts:after,newlyVerifiedExact:verifiedByCardId.size,
    existingExactRoutesPreserved:existingExactIds.size,
    v202CleanCandidates:clean.cards.length,v201CandidateLinks:v201ById.size,
    v202CleanCandidatesPassingCrossChecks:clean.cards.length-cleanCandidateSourceMismatches,
    v202CleanCandidatesRejectedBySourceMismatch:cleanCandidateSourceMismatches,
    uniqueCandidateEvidence: candidateEvidenceIds.size,
    candidateEvidenceAlreadyCoveredByExistingExact:[...candidateEvidenceIds].filter(id=>existingExactIds.has(id)).length,
    v201CandidateOverlapV202Clean:[...v201ById.keys()].filter(id=>cleanById.has(id)).length,
    v202PassingCandidatesAlreadyCoveredByExistingExact:[...acceptedCleanCandidateIds].filter(id=>existingExactIds.has(id)).length,
    v201CandidateOverlapV202CleanPassing:[...v201ById.keys()].filter(id=>acceptedCleanCandidateIds.has(id)).length,
    conflictProducts:triageByProduct.size,conflictIdentities:conflictOwnerIds.size,
    conflictIdentitiesWithExistingExact:[...conflictOwnerIds].filter(id=>existingExactIds.has(id)).length,
    conflictIdentitiesWithV201Candidate:[...conflictOwnerIds].filter(id=>v201ById.has(id)).length,
    conflictOwnersVerifiedByV203:[...conflictOwnerIds].filter(id=>verifiedByCardId.has(id)).length,
    conflictIdentitiesRemaining:statusCounts.CONFLICT
  };
  if(Object.values(statusCounts).reduce((sum,value)=>sum+value,0)!==records.length)
    throw Error('Per-record status totals do not reconcile to the full catalog.');
  const report={
    schema:'holokeep-cardmarket-v203-final-report-v1',
    statusDefinitions:{
      EXACT:'An existing exact route preserved, or a new identity independently verified by supplied browser evidence.',
      CANDIDATE:'Candidate evidence exists, but it does not establish a product identity; V202-only candidates route to search.',
      SEARCH:'No sufficiently supported product identity; Cardmarket search only.',
      CONFLICT:'At least one product ID is shared by multiple source identities; Cardmarket search only.'
    },
    summary,
    comparison:{basis:'Recorded V201 route totals from the complete 21,290-record audit.',before,after,
      delta:{exact:after.exact-before.exact,candidate:after.candidate-before.candidate,
        search:after.search-before.search,unavailable:after.unavailable-before.unavailable}},
    candidateSummary:{
      v202CleanCandidateCount:clean.cards.length,v201SingleHistoricalLinkCount:v201ById.size,
      unionCount:candidateEvidenceIds.size,notEquivalentToVerifiedLinks:true
    },
    limitations:[
      'The official Cardmarket catalog has no generally usable printed collector-number field; no product ID is inferred from name and set alone.',
      'V202 clean candidates without independent number evidence do not introduce new direct routes; absent an existing exact or V201 route, they stay search-only.',
      'All 899 shared-product rows remain in the explicit conflict queue, even when a pre-existing exact or V201 candidate route is preserved.',
      'The three V203 exact routes use only the supplied user browser evidence; no other product IDs are promoted.',
      'No prices, scraping, network verification or Cloudflare bypass were used.'
    ],
    inputs:{
      tcgdexTypeScriptEntries:zipEntries.size,
      tcgdexSourceCards:sourceCards.size,
      sha256:Object.fromEntries(Object.entries(bytes).map(([name,value])=>[name,sha256(value)]))
    },
    records:resultRecords.sort((a,b)=>compareText(a.id,b.id)),
    conflictQueue
  };
  report.markdown=makeMarkdown(report);
  return report;
}

function run(){
  const report=buildAudit();
  const {markdown,...json}=report;
  fs.writeFileSync(outputJson,JSON.stringify(json,null,2)+'\n');
  fs.writeFileSync(outputMarkdown,markdown);
  console.log(JSON.stringify({summary:json.summary,comparison:json.comparison,outputs:[outputJson,outputMarkdown]},null,2));
}

if(require.main===module)run();
module.exports={buildAudit};
