'use strict';
const fs=require('node:fs');
const snapshotPath='catalog-sets-v185.json';
const auditPath=process.argv[2];
if(!auditPath)throw Error('Pass the completed v246 audit JSON path');
const report=JSON.parse(fs.readFileSync(auditPath,'utf8'));
const snapshot=JSON.parse(fs.readFileSync(snapshotPath,'utf8'));
async function main(){
  for(const entry of report.results){
    if(!['complete','incomplete'].includes(entry.status))continue;
    const sets=snapshot.languages[entry.language];
    const old=sets.find(s=>s.id===entry.id);
    if(old){
      if(entry.snapshotName&&old.name===entry.snapshotName){old.name=entry.name;old.nameVerifiedAt=report.measuredAt;}
      continue;
    }
    const code=entry.language==='JP'?'ja':'en';
    const response=await fetch('https://api.tcgdex.net/v2/'+code+'/sets/'+encodeURIComponent(entry.id),
      {headers:{Accept:'application/json'},signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw Error(entry.id+': HTTP '+response.status);
    const data=await response.json();
    if(data.id!==entry.id||data.name!==entry.name||data.serie?.id!==entry.series||!Array.isArray(data.cards)||
      data.cardCount?.total!==entry.total||data.cards.length!==entry.received)throw Error(entry.id+': source changed after audit');
    sets.push({id:data.id,name:data.name,...(data.logo?{logo:data.logo}:{}),...(data.symbol?{symbol:data.symbol}:{}),
      cardCount:data.cardCount,series:data.serie.id,seriesName:data.serie.name||data.serie.id,
      available:entry.unique,images:data.cards.filter(c=>c.image).length,measuredAt:report.measuredAt});
  }
  fs.writeFileSync(snapshotPath,JSON.stringify(snapshot)+'\n');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
