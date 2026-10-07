'use strict';
// Exact, reviewed host-only edits; unrelated changes still fail historical byte checks.
const assert=require('node:assert/strict'),patches=require('./fixtures/host-scope-v174-1.json');
module.exports=(file,code)=>{
  for(const {before,after} of [...(patches[file]||[])].reverse()){
    assert.equal(code.split(after).length,2,file+': reviewed v174.1 block must occur once');
    code=code.replace(after,before);
  }
  return code;
};
