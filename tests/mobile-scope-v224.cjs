'use strict';
const assert=require('node:assert/strict');

module.exports=(code,file='ui-v153-mobile.js')=>{
  if(file==='index.html'||file==='sw.js'){
    for(const [updated,baseline] of [
      ['style-v153-mobile.css?build=224-mobile-layout','style-v153-mobile.css?build=168-product-shell-cleanup'],
      ['ui-v153-mobile.js?build=224-mobile-layout','ui-v153-mobile.js?build=154-keyboard']
    ]){
      const updatedCount=code.split(updated).length-1;
      if(updatedCount===0){
        assert.equal(code.split(baseline).length-1,1,'Expected one reviewed mobile asset reference');
        continue;
      }
      assert.equal(updatedCount,1,'Expected one reviewed mobile asset reference');
      code=code.replace(updated,baseline);
    }
    return code;
  }
  if(file!=='ui-v153-mobile.js')return code;
  const changes=[
    [
      `   const readyDock=el.id==='actionDock'&&el.classList.contains('ready')&&!document.body.classList.contains('resultOpen')&&!keyboard;\n   if(style.display!=='none'&&style.visibility!=='hidden'&&(Number(style.opacity)>.01||readyDock)&&rect.height&&rect.bottom>0)obstacle=Math.min(obstacle,rect.top);`,
      `   if(style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)>.01&&rect.height&&rect.bottom>0)obstacle=Math.min(obstacle,rect.top);`
    ],
    [
      `  const headerBottom=Math.max(0,header?.getBoundingClientRect().bottom||0);\n  const top=vv?.offsetTop||0,topClearance=Math.max(headerBottom,top)+12;\n  root.style.setProperty('--top-clearance',topClearance+'px');`,
      `  root.style.setProperty('--top-clearance',Math.max(0,header?.getBoundingClientRect().bottom||0)+12+'px');`
    ],
    [
      `   const maxRoom=Math.min(520,(vv?.height||innerHeight)*.52);\n   const largestResult=[...results.children].reduce((height,result)=>Math.max(height,result.getBoundingClientRect().height),0);\n   const paddingBottom=parseFloat(getComputedStyle(results).paddingBottom)||0;\n   const desiredRoom=Math.min(maxRoom,Math.max(90,largestResult+paddingBottom));\n   const resultsTop=results.getBoundingClientRect().top;\n   const availableRoom=obstacle-Math.max(resultsTop,topClearance)-20;\n   const neededShift=Math.max(0,desiredRoom-availableRoom);\n   const runway=parseFloat(root.style.getPropertyValue('--results-runway'))||0;\n   root.style.setProperty('--results-runway',Math.max(runway,neededShift)+'px');\n   const pageShift=Math.min(neededShift,Math.max(0,resultsTop-topClearance));\n   if(pageShift>1)window.scrollBy(0,pageShift);\n   const visibleTop=Math.max(results.getBoundingClientRect().top,topClearance);\n   root.style.setProperty('--results-room',Math.max(0,obstacle-visibleTop-20)+'px');\n  }else root.style.setProperty('--results-runway','0px');`,
      `   const top=results.getBoundingClientRect().top;\n   // A bounded nested scrollport ends above the actual fixed controls.\n   root.style.setProperty('--results-room',Math.max(90,obstacle-Math.max(top,12)-20)+'px');\n  }`
    ]
  ];
  for(const [updated,baseline] of changes){
    const updatedCount=code.split(updated).length-1;
    if(updatedCount===0){
      assert.equal(code.split(baseline).length-1,1,'Expected one reviewed mobile layout baseline');
      continue;
    }
    assert.equal(updatedCount,1,'Expected one reviewed mobile layout change');
    code=code.replace(updated,baseline);
  }
  return code;
};
