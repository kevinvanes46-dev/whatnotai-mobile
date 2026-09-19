'use strict';
// Shared Windows/Linux entry points; no production assets are written.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync,execFileSync}=require('node:child_process');
process.chdir(path.resolve(__dirname,'..'));
function run(command,args,options={}){
  const result=spawnSync(command,args,{stdio:'inherit',...options});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status||1);
}
switch(process.argv[2]){
  case 'syntax': {
    const files=execFileSync('git',['ls-files','-z','--','*.js','*.cjs','*.mjs'],{encoding:'utf8'}).split('\0').filter(Boolean);
    for(const file of files)run(process.execPath,['--check',file]);
    console.log(`Syntax PASS: ${files.length} files`);break;
  }
  case 'diff': {
    let base=process.env.CI_BASE_SHA;
    if(!base)base='HEAD^'; // Local default; CI provides the entire push/PR base.
    if(/^0+$/.test(base)){
      // A newly pushed branch has no before SHA; check its tip commit.
      const parent=spawnSync('git',['rev-parse','--verify','HEAD^'],{encoding:'utf8'});
      base=parent.status===0?parent.stdout.trim():execFileSync('git',['hash-object','-t','tree','--stdin'],{input:'',encoding:'utf8'}).trim();
    }
    run('git',['diff','--check',base,'HEAD']);
    run('git',['diff','--check']);
    run('git',['diff','--cached','--check']);break;
  }
  case 'audit': {
    const {records}=JSON.parse(fs.readFileSync('data/jp-cardmarket-audit-v165.json','utf8'));
    assert.equal(records.length,780);assert.equal(new Set(records.map(r=>r.source_id)).size,780);
    assert.equal(records.filter(r=>r.route==='EXACT').length,397);
    assert.equal(records.filter(r=>r.route==='SEARCH').length,383);
    assert.equal(records.find(r=>r.source_id==='PMCG1-057')?.route,'EXACT');
    console.log('JP audit PASS: 780 records; 397 EXACT; 383 SEARCH; Machamp EXACT');break;
  }
  case 'core': {
    // Same v156-v165 selection as the documented 72-test baseline. v166 runs separately.
    const files=fs.readdirSync('tests').filter(f=>f.endsWith('.test.cjs')&&/v15[6-9]|v16[0-5]/.test(f)).sort().map(f=>path.join('tests',f));
    assert.ok(files.includes(path.join('tests','jp-cardmarket-full-browser-v165.test.cjs')));
    run(process.execPath,['--test','--test-concurrency=1',...files],{
      env:{...process.env,PLAYWRIGHT_MODULE:require.resolve('playwright')}
    });break;
  }
  default: throw Error('Usage: node scripts/check-ci.cjs <syntax|diff|audit|core>');
}
