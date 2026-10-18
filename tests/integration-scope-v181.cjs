'use strict';
const assert=require('node:assert/strict'),patches=require('./fixtures/integration-scope-v181.json');
module.exports=(file,code)=>{for(const {before,after} of [...(patches[file]||[])].reverse()){assert.equal(code.split(after).length,2,file+': exact reviewed v181 change');code=code.replace(after,before);}return code;};
