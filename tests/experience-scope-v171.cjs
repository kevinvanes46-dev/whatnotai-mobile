'use strict';
// Reverse ONLY the reviewed Home Recent presentation changes before comparing the
// rest of this shared file byte-for-byte with the pre-onboarding engine baseline.
module.exports=code=>code.replace(
`      // Home Recent presentation only: keep external-beta artwork elsewhere intact.
      if(isDirect&&target.closest('#homeRecentCards')){
        target.dataset.imageStatus='EXTERNAL_BETA';target.classList.remove('artLoading','artUnavailable');
        target.classList.add('homeJpPlaceholder');target.textContent='RareWorth · JP';return;
      }
`,'').replace(
`    const seen=new Set();
    const rows=(typeof readStore==='function'?readStore(STORAGE_RECENT):[]).filter(stored=>{
      const key=window.CardIdentity.key(stored);if(seen.has(key))return false;seen.add(key);return true;
    }).slice(0,4);`,"    const rows=typeof readStore==='function'?readStore(STORAGE_RECENT).slice(0,4):[];")
  .replace("      if(c.kind==='query')btn.classList.add('recentQuery');\n",'')
  .replace("c.kind==='card'?(c.set_name||c.set):''","c.kind==='card'?c.set:''");
