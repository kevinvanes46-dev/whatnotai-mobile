'use strict';
// Reverse only exact reviewed v175 edits; all other bytes remain protected.
const assert=require('node:assert/strict'),patches=require('./fixtures/en-scope-v175.json');
module.exports=(file,code)=>{
  code=require('./market-scope-v176.cjs')(file,code);
  for(const {before,after} of [...(patches[file]||[])].reverse()){
    assert.equal(code.split(after).length,2,file+': reviewed v175 block must occur once');
    code=code.replace(after,before);
  }
  return code;
};
