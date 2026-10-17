'use strict';
const assert=require('node:assert/strict');
module.exports=(file,code)=>{
 if(file==='ui-v137-collection.js'){
  const added="openAttention(){filterState={list:'ALL',language:'',variant:''};searchEl.value='';conditionFilter.value='';setFilter.value='';syncQuickFilterButtons();$('collectionAttention').click();},"+'openItem(id){const item=read().map(normalizeItem).find(x=>x?.uid===id);if(item)openEditEditor(item);},';
  assert.equal(code.split(added).length,2,'exact v179 navigation handoff once');return code.replace(added,'');
 }
 return code;
};
