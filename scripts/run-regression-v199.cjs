'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
process.chdir(path.resolve(__dirname,'..'));
const dir='artifacts/en-cardmarket-audit/ci';fs.mkdirSync(dir,{recursive:true});
const commands=fs.readFileSync('.github/workflows/ci.yml','utf8').split(/\r?\n/).map(l=>l.match(/^\s+run: (node .+)$/)?.[1]).filter(Boolean);
const results=[];
for(let i=0;i<commands.length;i++){
  const command=commands[i],start=Date.now(),log=path.join(dir,String(i+1).padStart(2,'0')+'.txt');
  const r=spawnSync(process.execPath,command.split(' ').slice(1),{encoding:'utf8',timeout:300000,env:{...process.env,PLAYWRIGHT_MODULE:path.resolve('scripts/node_modules/playwright'),CI_BASE_SHA:'edcbf76963f4def4a56608f75712ad4c89448325'},maxBuffer:32*1024*1024});
  const output=(r.stdout||'')+(r.stderr||'');fs.writeFileSync(log,output);
  results.push({command,exitCode:r.status,error:r.error?.message,durationMs:Date.now()-start,tests:Number(output.match(/(?:#|ℹ) tests (\d+)/)?.[1]||0),failed:Number(output.match(/(?:#|ℹ) fail (\d+)/)?.[1]||0),log});
  fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2)+'\n');
  console.log(`${i+1}/${commands.length} ${r.status===0?'PASS':'FAIL'} ${command}`);
}
process.exitCode=results.some(r=>r.exitCode!==0)?1:0;
