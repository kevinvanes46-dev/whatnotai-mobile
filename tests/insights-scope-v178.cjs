'use strict';
// Reverse exact reviewed presentation changes, retaining all historical scope checks.
const assert=require('node:assert/strict'),patches=require('./fixtures/insights-scope-v178.json');
module.exports=(file,code)=>{
  code=require('./home-scope-v179.cjs')(file,code);
  for(const {before,after} of [...(patches[file]||[])].reverse()){
    assert.equal(code.split(after).length,2,file+': reviewed v178 block must occur once');
    code=code.replace(after,before);
  }
  return code;
};
