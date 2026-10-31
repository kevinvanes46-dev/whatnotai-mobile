'use strict';
(() => {
 const $=id=>document.getElementById(id),root=document.documentElement;
 let scheduled=false;
 function measure(){
  scheduled=false;
  const vv=window.visualViewport,bottom=vv?vv.offsetTop+vv.height:innerHeight;
  const keyboard=window.RareWorthKeyboard?.isKeyboardVisible() ?? (!!vv&&innerHeight-vv.height>150&&/INPUT|TEXTAREA/.test(document.activeElement?.tagName||''));
  document.body.classList.toggle('mobileKeyboard',keyboard);
  let obstacle=bottom;
  for(const el of [document.querySelector('.bottomNav'),$('actionDock')]){
   if(!el)continue;const style=getComputedStyle(el),rect=el.getBoundingClientRect();
   const readyDock=el.id==='actionDock'&&el.classList.contains('ready')&&!document.body.classList.contains('resultOpen')&&!keyboard;
   if(style.display!=='none'&&style.visibility!=='hidden'&&(Number(style.opacity)>.01||readyDock)&&rect.height&&rect.bottom>0)obstacle=Math.min(obstacle,rect.top);
  }
  const header=document.querySelector('.topbar');
  const headerBottom=Math.max(0,header?.getBoundingClientRect().bottom||0);
  const top=vv?.offsetTop||0,topClearance=Math.max(headerBottom,top)+12;
  root.style.setProperty('--top-clearance',topClearance+'px');
  root.style.setProperty('--fixed-clearance',Math.max(0,innerHeight-obstacle)+20+'px');
  const results=$('smartSuggestions');
  if(results&&!results.hidden){
   const maxRoom=Math.min(520,(vv?.height||innerHeight)*.52);
   const largestResult=[...results.children].reduce((height,result)=>Math.max(height,result.getBoundingClientRect().height),0);
   const paddingBottom=parseFloat(getComputedStyle(results).paddingBottom)||0;
   const desiredRoom=Math.min(maxRoom,Math.max(90,largestResult+paddingBottom));
   const resultsTop=results.getBoundingClientRect().top;
   const availableRoom=obstacle-Math.max(resultsTop,topClearance)-20;
   const neededShift=Math.max(0,desiredRoom-availableRoom);
   const runway=parseFloat(root.style.getPropertyValue('--results-runway'))||0;
   root.style.setProperty('--results-runway',Math.max(runway,neededShift)+'px');
   const pageShift=Math.min(neededShift,Math.max(0,resultsTop-topClearance));
   if(pageShift>1)window.scrollBy(0,pageShift);
   const visibleTop=Math.max(results.getBoundingClientRect().top,topClearance);
   root.style.setProperty('--results-room',Math.max(0,obstacle-visibleTop-20)+'px');
  }else root.style.setProperty('--results-runway','0px');
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(measure);}}
 new ResizeObserver(schedule).observe($('actionDock'));
 new ResizeObserver(schedule).observe(document.querySelector('.bottomNav'));
 new MutationObserver(schedule).observe($('actionDock'),{attributes:true,attributeFilter:['class','style']});
 new MutationObserver(schedule).observe($('smartSuggestions'),{attributes:true,attributeFilter:['hidden'],childList:true});
 for(const name of ['scroll','resize','focusin','focusout'])window.addEventListener(name,schedule,{passive:true});
 window.addEventListener('rareworth:keyboard-settle',schedule);
 window.visualViewport?.addEventListener('resize',schedule);
 window.visualViewport?.addEventListener('scroll',schedule);
 function decorateRecent(){
  const rows=typeof readStore==='function'?readStore(STORAGE_RECENT):[];
  $('recentList').querySelectorAll(':scope > .item').forEach((tile,index)=>{
   if(tile.dataset.polished)return;const item=rows[index]&&window.CardIdentity.normalize(rows[index]),button=tile.querySelector('.useBtn');if(!item||!button)return;
   tile.dataset.polished='true';
   const old=tile.querySelector('.itemMain'),info=document.createElement('span'),art=document.createElement('span');
   info.className='recentInfo';art.className='recentThumb';
   for(const [className,text] of [['recentName',old.querySelector('.itemTitle').textContent],['recentMeta',old.querySelector('.itemMeta').textContent]]){const span=document.createElement('span');span.className=className;span.textContent=text;info.append(span);}
   button.replaceChildren(art,info);button.setAttribute('aria-label',item.name+' gebruiken');old.replaceWith(button);
   button.addEventListener('click',()=>$('navSearch').click());
   window.CardArtwork.mount(item,art);
   const open=tile.querySelector('.openMini'),del=tile.querySelector('.delBtn');
   open.textContent='↗';open.setAttribute('aria-label',item.name+' op Cardmarket');
   del.setAttribute('aria-label',item.name+' uit recent verwijderen');
  });schedule();
 }
 new MutationObserver(decorateRecent).observe($('recentList'),{childList:true});decorateRecent();
 window.addEventListener('cardscout:catalog-ready',()=>{
  const rows=readStore(STORAGE_RECENT);
  $('recentList').querySelectorAll(':scope > .item').forEach((tile,i)=>{const target=tile.querySelector('.recentThumb.artUnavailable');if(target&&rows[i])window.CardArtwork.mount(window.CardIdentity.normalize(rows[i]),target);});
  $('homeRecentCards').querySelectorAll('.recentCard').forEach((tile,i)=>{const target=tile.querySelector('.recentArt.artUnavailable');if(target&&rows[i])window.CardArtwork.mount(window.CardIdentity.normalize(rows[i]),target);});
 });
 schedule();
})();
