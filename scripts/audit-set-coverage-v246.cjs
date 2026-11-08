'use strict';
const fs=require('node:fs');
const path=require('node:path');
const snapshot=require('../catalog-sets-v185.json');

function inspect(set,data){
  if(!data||data.id!==set.id||!Array.isArray(data.cards))return {status:'defect',reason:'invalid set response'};
  const seen=new Set(),duplicates=[],invalid=[],numbers=new Set(),duplicateNumbers=[];
  for(const card of data.cards){
    if(typeof card?.localId!=='string'||!card.localId||card.id!==set.id+'-'+card.localId||
      typeof card.name!=='string'||!card.name.trim()){
      invalid.push(card?.id||'(missing id)');continue;
    }
    if(seen.has(card.id))duplicates.push(card.id);
    if(numbers.has(card.localId))duplicateNumbers.push(card.localId);
    seen.add(card.id);numbers.add(card.localId);
  }
  const total=Number.isSafeInteger(data.cardCount?.total)&&data.cardCount.total>=0?data.cardCount.total:null;
  const complete=total!==null&&total>0&&seen.size===total&&!invalid.length&&!duplicates.length&&!duplicateNumbers.length;
  return {status:complete?'complete':'incomplete',total,received:data.cards.length,unique:seen.size,
    missingImages:data.cards.filter(c=>!c.image).length,duplicates,duplicateNumbers,invalid};
}

async function main(){
  const entries=[],listingConflicts=[];
  for(const [language,code] of [['EN','en'],['JP','ja']]){
    const response=await fetch('https://api.tcgdex.net/v2/'+code+'/sets',{signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw Error(code+' set list HTTP '+response.status);
    const live=await response.json();if(!Array.isArray(live))throw Error(code+' invalid set list');
    const groups=new Map();
    for(const set of live){if(!groups.has(set.id))groups.set(set.id,[]);groups.get(set.id).push(set);}
    for(const [id,rows] of groups)if(rows.length>1)listingConflicts.push({language,id,names:rows.map(s=>s.name)});
    const known=snapshot.languages[language].filter(s=>s.series!=='tcgp');
    for(const set of known)entries.push({language,set,live:groups.get(set.id)?.[0],conflict:groups.get(set.id)?.length>1});
    for(const [id,rows] of groups)if(!known.some(s=>s.id===id))
      entries.push({language,set:rows[0],live:rows[0],conflict:rows.length>1});
  }
  const results=new Array(entries.length);let next=0;
  async function worker(){
    while(next<entries.length){
      const i=next++,{language,set,live,conflict}=entries[i],code=language==='JP'?'ja':'en';
      try{
        if(conflict)throw Error('duplicate set id in source listing');
        if(!live)throw Error('set missing from source listing');
        const response=await fetch('https://api.tcgdex.net/v2/'+code+'/sets/'+encodeURIComponent(set.id),
          {headers:{Accept:'application/json'},signal:AbortSignal.timeout(20000)});
        if(!response.ok)throw Error('HTTP '+response.status);
        const data=await response.json();
        if(data.name!==live.name)throw Error('source set name differs from listing');
        results[i]={language,id:set.id,name:data.name,...(set.name!==data.name?{snapshotName:set.name}:{}),series:data.serie?.id||null,snapshotAvailable:set.available,
          ...(data.serie?.id==='tcgp'?{status:'excluded',reason:'digital Pocket set'}:inspect(set,data))};
      }catch(error){results[i]={language,id:set.id,name:set.name,snapshotAvailable:set.available,status:'defect',reason:error.message};}
      if((i+1)%25===0)console.log('Checked '+(i+1)+' / '+entries.length);
    }
  }
  await Promise.all(Array.from({length:3},worker));
  const nlResponse=await fetch('https://api.tcgdex.net/v2/nl/sets',{signal:AbortSignal.timeout(20000)});
  if(!nlResponse.ok)throw Error('nl set list HTTP '+nlResponse.status);
  const nlSets=await nlResponse.json();if(!Array.isArray(nlSets))throw Error('invalid NL set list');
  const nl=[];
  for(const set of nlSets){
    try{const response=await fetch('https://api.tcgdex.net/v2/nl/sets/'+encodeURIComponent(set.id),{signal:AbortSignal.timeout(20000)});
      if(!response.ok)throw Error('HTTP '+response.status);
      nl.push({id:set.id,name:set.name,...inspect(set,await response.json())});
    }catch(error){nl.push({id:set.id,name:set.name,status:'defect',reason:error.message});}
  }
  const report={measuredAt:new Date().toISOString(),snapshotMeasuredAt:snapshot.measuredAt,source:'https://api.tcgdex.net/v2/',listingConflicts,nl,results};
  const output=process.argv[2];
  if(!output)throw Error('Pass an output JSON path');
  fs.writeFileSync(path.resolve(output),JSON.stringify(report,null,2)+'\n');
  for(const language of ['EN','JP']){
    const rows=results.filter(r=>r.language===language);
    console.log(language,JSON.stringify({sets:rows.length,complete:rows.filter(r=>r.status==='complete').length,
      incomplete:rows.filter(r=>r.status==='incomplete').length,defect:rows.filter(r=>r.status==='defect').length,excluded:rows.filter(r=>r.status==='excluded').length,
      unique:rows.reduce((n,r)=>n+(r.unique||0),0)}));
  }
}
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
module.exports={inspect};
