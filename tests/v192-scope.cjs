'use strict';
const assert=require('node:assert/strict');

// Reverse only the reviewed v192 service-worker revision before comparing
// the frozen v191/v189 integration baselines. All existing checks still run.
module.exports=(file,code)=>{
  if(file!=='sw.js')return code;
  const before="const CACHE = 'rareworth-shell-v191-cardmarket-identity';";
  const after="const CACHE = 'rareworth-shell-v192-cardmarket-language';";
  assert.equal(code.split(after).length,2,'sw.js: exact reviewed v192 cache revision');
  return code.replace(after,before);
};
