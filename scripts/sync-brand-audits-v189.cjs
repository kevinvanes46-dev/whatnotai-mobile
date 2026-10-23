'use strict';
// Mechanical rebuild of the two strict audit inventories after an approved
// shell release. Never edits production modules or relaxes a verification.
const fs=require('node:fs');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {inventory}=require('../tests/brand-support-v172.cjs');
const docs='docs/BRAND-V172.md',v180='docs/BRAND-INVENTORY-V180.json';
const content=fs.readFileSync(docs,'utf8'),marker='|---|---|---|---|\n';
if(content.split(marker).length!==2)throw Error('Expected a single brand inventory table');
const nextDoc=content.split(marker)[0]+marker+inventory()+'\n';
const previous=JSON.parse(fs.readFileSync(v180,'utf8'));
const matches=[];
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
for(const file of files){
  if([v180,docs].includes(file))continue;
  const raw=fs.readFileSync(file);
  if(raw.includes(0))continue;
  raw.toString('utf8').split(/\r\n?|\n/).forEach((line,index)=>{
    const found=line.match(/HoloKeep|Rare\s?Worth|Card\s?Scout|Whatnot\s?AI/gi);
    if(found)matches.push({file,line:index+1,names:[...new Set(found)],
      category:/^tests\//.test(file)?'TEST_HISTORY':/^(docs\/)|\.md$/.test(file)?'DOC_HISTORY':'TECHNICAL_COMPATIBILITY',
      sha256:crypto.createHash('sha256').update(line).digest('hex')});
  });
}
const next180=JSON.stringify({...previous,matches},null,2)+'\n';
if(process.argv.includes('--check')){
  if(content!==nextDoc||fs.readFileSync(v180,'utf8')!==next180)throw Error('Brand inventories are stale');
  process.stdout.write('Brand inventories match tracked source\n');
}else{
  fs.writeFileSync(docs,nextDoc);
  fs.writeFileSync(v180,next180);
  process.stdout.write('Regenerated v172 and v180 brand inventories\n');
}
