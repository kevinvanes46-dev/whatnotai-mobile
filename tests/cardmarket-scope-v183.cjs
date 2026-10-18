'use strict';
const assert=require('node:assert/strict');

module.exports=(file,code)=>{
  const changes={
    'index.html':[{
      before:'  <script src="ui-v181-redesign.js?build=181-live-integration"></script>',
      after:'  <script src="ui-v181-redesign.js?build=181-live-integration"></script>\n  <script src="ui-v183-cardmarket.js?build=183-reverse-holo"></script>'
    }],
    'sw.js':[{
      before:"  'ui-v181-redesign.js?build=181-live-integration',",
      after:"  'ui-v181-redesign.js?build=181-live-integration',\n  'ui-v183-cardmarket.js?build=183-reverse-holo',"
    }]
  };

  for(const {before,after} of [...(changes[file]||[])].reverse()){
    assert.equal(
      code.split(after).length,
      2,
      file+': exact reviewed v183 change'
    );

    code=code.replace(after,before);
  }

  return code;
};