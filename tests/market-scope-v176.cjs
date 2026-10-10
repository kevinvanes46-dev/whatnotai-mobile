'use strict';
// Reverse only the exact reviewed market/UI changes for historical scope assertions.
const assert=require('node:assert/strict'),patches=require('./fixtures/market-scope-v176.json');
module.exports=(file,code)=>{
  for(const {before,after} of [...(patches[file]||[])].reverse()){
    assert.equal(code.split(after).length,2,file+': reviewed v176 block must occur once');
    code=code.replace(after,before);
  }
  return code;
};
