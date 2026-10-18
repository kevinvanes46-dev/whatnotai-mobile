'use strict';
const assert=require('node:assert/strict'),patches=require('./fixtures/beta-scope-v180.json');
module.exports=(file,code)=>{code=require('./integration-scope-v181.cjs')(file,code);for(const {before,after} of [...(patches[file]||[])].reverse()){assert.equal(code.split(after).length,2,file+': exact reviewed v180 change');code=code.replace(after,before);}return code;};
