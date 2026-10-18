'use strict';
const assert=require('node:assert/strict');

module.exports=(file,code)=>{
  const changes={
    'index.html':[
      {
        before:'<link rel="stylesheet" href="style-v182-parity.css?build=182-zip-parity">',
        after:'<link rel="stylesheet" href="style-v182-parity.css?build=182-zip-parity"><link rel="stylesheet" href="style-v183-parity.css?build=183-comparison-ui">'
      },
      {
        before:'  <script src="ui-v183-cardmarket.js?build=183-reverse-holo"></script>',
        after:'  <script src="ui-v183-cardmarket.js?build=183-reverse-holo"></script><script src="ui-v183-parity.js?build=183-comparison-ui"></script>'
      }
    ],
    'sw.js':[
      {
        before:"  'style-v182-parity.css?build=182-zip-parity',",
        after:"  'style-v182-parity.css?build=182-zip-parity', 'style-v183-parity.css?build=183-comparison-ui',"
      },
      {
        before:"  'ui-v181-redesign.js?build=181-live-integration', 'ui-v183-cardmarket.js?build=183-reverse-holo',",
        after:"  'ui-v181-redesign.js?build=181-live-integration', 'ui-v183-cardmarket.js?build=183-reverse-holo', 'ui-v183-parity.js?build=183-comparison-ui',"
      }
    ]
  };

  for(const {before,after} of [...(changes[file]||[])].reverse()){
    assert.equal(
      code.split(after).length,
      2,
      file+': exact reviewed v183 comparison change'
    );
    code=code.replace(after,before);
  }

  return code;
};