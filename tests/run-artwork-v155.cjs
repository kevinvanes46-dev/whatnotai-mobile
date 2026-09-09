'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const out='artifacts/artwork-v155/regression';fs.mkdirSync(out,{recursive:true});
for(const suite of ['artwork-v155','history-identity-v154','history-v154','keyboard-v154','mobile-v153','release-v152']){
 const dir=path.join(out,suite);fs.mkdirSync(dir,{recursive:true});
 const r=spawnSync(process.execPath,['tests/'+suite+'.test.cjs'],{encoding:'utf8',env:{...process.env,UI_SCREENSHOT_DIR:dir}});
 fs.writeFileSync(path.join(out,suite+'.txt'),(r.stdout||'')+(r.stderr||''));console.log((r.status===0?'PASS ':'FAIL ')+suite);
 if(r.status!==0){console.error(r.stderr||r.error);process.exit(1);}
}
