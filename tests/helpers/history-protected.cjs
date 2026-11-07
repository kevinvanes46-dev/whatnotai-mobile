'use strict';
const assert=require('node:assert/strict');

module.exports=async page=>{
 const result=await page.evaluate(async()=>{
  const saved={
   resolver:resolveFinalCardmarketRoute,
   selected:cmSelectedCard,
   fields:Object.fromEntries(['quickInput','nameInput','numberInput','setSelect','langSelect','condSelect','editionSelect','urlBox'].map(id=>[id,document.getElementById(id)?.value])),
   recent:localStorage.getItem('whatnotai_mobile_recent_v37'),
   match:matchBox.innerHTML,
   status:{text:status.textContent,className:status.className},
   lastBuilt,
   routeState:openBtn.dataset.cmState,
   href:openBtn.getAttribute('href'),
   disabled:openBtn.classList.contains('disabled')
  };
  try{
   quickInput.value='Unverified safety fixture';
   nameInput.value='Unverified safety fixture';
   numberInput.value='987';
   setSelect.value='AUTO';
   langSelect.value='EN';
   condSelect.value='NM';
   if(editionSelect)editionSelect.value='AUTO';
   cmSelectedCard=null;
   resolveFinalCardmarketRoute=()=>({url:'https://example.invalid/untrusted-product',exact:true,note:'untrusted test route'});
   await makeLink(false);
   return {url:openBtn.href,exact:lastBuilt?.result?.exact,state:openBtn.dataset.cmState};
  }finally{
   resolveFinalCardmarketRoute=saved.resolver;
   cmSelectedCard=saved.selected;
   for(const [id,value] of Object.entries(saved.fields))if(value!==undefined)document.getElementById(id).value=value;
   localStorage.removeItem('whatnotai_mobile_recent_v37');
   if(saved.recent!==null)localStorage.setItem('whatnotai_mobile_recent_v37',saved.recent);
   renderSaved();
   matchBox.innerHTML=saved.match;
   status.textContent=saved.status.text;status.className=saved.status.className;
   lastBuilt=saved.lastBuilt;
   if(saved.href===null)openBtn.removeAttribute('href');else openBtn.setAttribute('href',saved.href);
   openBtn.classList.toggle('disabled',saved.disabled);
   if(saved.routeState===undefined)delete openBtn.dataset.cmState;else openBtn.dataset.cmState=saved.routeState;
   updateCustomSelects();
   ++cmLinkGeneration;
  }
 });
 const url=new URL(result.url);
 assert.equal(url.hostname,'www.cardmarket.com','Unsafe resolver URLs must not escape Cardmarket');
 assert.equal(url.pathname,'/en/Pokemon/Products/Search','Unsafe product routes must use the safe search fallback');
 assert.match(url.searchParams.get('searchString')||'',/Unverified safety fixture/,'Fallback must retain the current card identity');
 assert.equal(result.exact,false,'A fallback search must not be presented as an exact product route');
 assert.equal(result.state,'ready','The validated fallback must remain actionable');
};
