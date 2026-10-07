'use strict';
// Reverse only exact reviewed coverage edits. Any additional engine change still fails
// the historical byte comparisons. Each replacement must occur exactly once.
const assert=require('node:assert/strict'),patches=require('./fixtures/en-scope-v174.json');
module.exports=(file,code)=>{
  code=require('./host-scope-v174-1.cjs')(file,code);
  for(const {before,after} of [...(patches[file]||[])].reverse()){
    assert.equal(code.split(after).length,2,file+': reviewed v174 block must exist exactly once');
    code=code.replace(after,before);
  }
  return code;
};
