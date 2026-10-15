'use strict';
// Undo exact reviewed cost UI blocks only, preserving historical engine assertions.
const assert=require('node:assert/strict'),patches=require('./fixtures/cost-scope-v177.json');
module.exports=(file,code)=>{
  code=require('./insights-scope-v178.cjs')(file,code);
  for(const {before,after} of [...(patches[file]||[])].reverse()){
    assert.equal(code.split(after).length,2,file+': reviewed v177 block must occur once');
    code=code.replace(after,before);
  }
  return code;
};
