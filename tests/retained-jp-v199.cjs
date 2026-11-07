'use strict';
// Historical suites still exercise JP identity, artwork and stored-card flows.
// Public language selection is frozen and covered separately in v199 tests.
module.exports=async page=>{
  await page.evaluate(()=>{
    const select=document.getElementById('langSelect');
    select.value='JP';select.dispatchEvent(new Event('change',{bubbles:true}));
  });
};
