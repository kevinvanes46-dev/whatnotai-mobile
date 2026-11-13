'use strict';
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');

const BASE='143e1732d0622fb6bce78c5372aa6aae6c34df3f';
const EXPECTED={
  'index.html':'127ab09d0daeb8fb06f2cb7ac2bbee5738beede9fb7b702fad0fd72c6d406d50',
  'library-v185.js':'01052d2364970feeeeb6c737870e3eacaa7b3227a522ebedb596ad2e838b1842',
  'nl-jungle-v242.js':'bdb2f90164c7e8a852b66fe7e2ef8d8e10fe3072d797d1937532ce48b9d6c32a',
  'sw.js':'05c09b6911ca5e645b5e6234d74b7b58afedbb94b0f29a4dac6f460bb71fd71e',
  'ui-library-v185.js':'0a2d0c340ed5e8e5f9993c479f3aeee355c8570ddefced152c4ebc369c4d330d',
  'ui-v137-collection.js':'dbef0b35ab5198927c9e8a4eae0151c400b5f85d2bb880247ec20c5bc44d25eb',
  'ui-v137-focus.js':'fd427465fc4e37cea38cb89f1752e2d94bc882c105d9c87edabaf828538eae2c',
  'ui-v181-redesign.js':'6e6c5b67b5f1c95236e1a80354e86b2d7ee1256f42b0239b08e1f3e544a80a96'
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
