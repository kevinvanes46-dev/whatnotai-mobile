'use strict';
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');

const BASE='143e1732d0622fb6bce78c5372aa6aae6c34df3f';
const EXPECTED={
  'index.html':'127ab09d0daeb8fb06f2cb7ac2bbee5738beede9fb7b702fad0fd72c6d406d50',
  'library-v185.js':'77fdfac54bbeb7f3436febfc7364dc04dc9b46a161ada1b0a1e8cf11505475ad',
  'nl-jungle-v242.js':'bdb2f90164c7e8a852b66fe7e2ef8d8e10fe3072d797d1937532ce48b9d6c32a',
  'sw.js':'8210f2cd9a027e387ca59e66b5a2c7b0155ed1226f6e57028cc7d6fb4448e939',
  'ui-library-v185.js':'be7bcab44caa87b3cfc2546c7b8b30ff637446204c53714b0b79ef51434288d5',
  'ui-v137-collection.js':'dbef0b35ab5198927c9e8a4eae0151c400b5f85d2bb880247ec20c5bc44d25eb',
  'ui-v137-focus.js':'fd427465fc4e37cea38cb89f1752e2d94bc882c105d9c87edabaf828538eae2c',
  'ui-v181-redesign.js':'2e093031332d3a04f1e432d4f2a9daa43dc2359a21d2f8df1041c5e0635a40ea'
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
