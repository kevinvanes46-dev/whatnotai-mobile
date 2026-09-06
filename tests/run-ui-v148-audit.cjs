'use strict';
const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'artifacts','ui-v148');
fs.mkdirSync(out,{recursive:true});
for(const suite of ['cardmarket-routing','cardmarket-resolver-v146','cardmarket-engine-v147','cardmarket-ui-v146','cardmarket-ui-v147','ui-polish-v148']){
 const result=spawnSync(process.execPath,[`tests/${suite}.test.cjs`],{cwd:root,encoding:'utf8',env:{...process.env,V147_SCREENSHOT_DIR:out}});
 fs.writeFileSync(path.join(out,suite+'.txt'),(result.stdout||'')+(result.stderr||''));
 console.log(`${result.status===0?'PASS':'FAIL'} ${suite}`);
 if(result.status!==0){console.error(result.error||result.stderr);process.exit(1);}
}
