'use strict';
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');

const BASE='143e1732d0622fb6bce78c5372aa6aae6c34df3f';
const EXPECTED={
  'index.html':'127ab09d0daeb8fb06f2cb7ac2bbee5738beede9fb7b702fad0fd72c6d406d50',
  'library-v185.js':'745a0b5635b8ea3cc376428812ea3aa2e274952c8291ddf6df25401ade1e1e3f',
  'nl-jungle-v242.js':'bdb2f90164c7e8a852b66fe7e2ef8d8e10fe3072d797d1937532ce48b9d6c32a',
  'sw.js':'76b32bd3c7808a53b5203fa3e03217eba4f4b9e67a16f4647c720f69ed4b946f',
  'ui-library-v185.js':'5cd1f3361e5c1c7c9e9894d2442af622ae6110072a099caf0a8aed45fa072c92',
  'ui-v137-collection.js':'d4469befa692b9957555fedced87655aba160e8e3f1e19972e22055c3d0008aa',
  'ui-v137-focus.js':'118d5ae87baf9c345381d4f3ada01b7ac4c5fbac1ca495f79c87348109cbfa05',
  'ui-v181-redesign.js':'b02505393250285f35b2c47219d640c25a41f73116ed27164886feb9ecd651d6'
};

module.exports=(file,code)=>{
  const expected=EXPECTED[file];
  if(!expected)return code;
  const baseline=execFileSync('git',['show',BASE+':'+file],{encoding:'utf8',maxBuffer:32*1024*1024}).replace(/\r\n?/g,'\n');
  if(code.replace(/\r\n?/g,'\n')===baseline)return code;
  const normalized=code.replace(/\r\n?/g,'\n');
  const hash=createHash('sha256').update(normalized).digest('hex');
  assert.equal(hash,expected,file+': reviewed v245 source changed');
  return baseline;
};
