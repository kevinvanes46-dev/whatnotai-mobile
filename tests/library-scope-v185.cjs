'use strict';
// Exact approved v185 catalog and disabled-price policy blocks only. All other
// historical engine bytes remain compared with their original baselines.
const assert=require('node:assert/strict'),patches=require('./fixtures/library-scope-v185.json');
module.exports=(file,code)=>{if(file==='market-v176.js')code=require('./v208-market-projection.cjs')(code);if(file==='app-v137.js')code=require('./v193-scope.cjs')(file,code);for(const {before,after} of [...(patches[file]||[])].reverse()){assert.equal(code.split(after).length,2,file+': exact v185 block must occur once');code=code.replace(after,before);}return code;};
