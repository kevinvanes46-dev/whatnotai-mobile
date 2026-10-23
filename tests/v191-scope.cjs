'use strict';
const assert=require('node:assert/strict');

// Reverse only the reviewed v191 service-worker cache revision before
// comparing the older frozen integration baselines. Do not relax their checks.
module.exports=(file,code)=>{
  if(file!=='sw.js')return code;
  const before="const CACHE = 'rareworth-shell-v189-app-experience';";
  const after="const CACHE = 'rareworth-shell-v191-cardmarket-identity';";
  assert.equal(code.split(after).length,2,'sw.js: exact reviewed v191 cache revision');
  return code.replace(after,before);
};
