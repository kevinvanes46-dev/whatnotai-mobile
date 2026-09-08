'use strict';
// Keyboard lifecycle only: never replace results, change filters or re-focus the input.
(() => {
 const input=document.getElementById('quickInput'),results=document.getElementById('smartSuggestions');
 if(!input||!results)return;
 const vv=window.visualViewport;
 let snapshot=null,timer=0,deadline=0,gesture=null,suppressClick=false,clickTimer=0,inFlight=false,enterHeld=false;
 const signature=()=>[input.value,...['langSelect','condSelect','editionSelect'].map(id=>document.getElementById(id)?.value),document.getElementById('stampedToggle')?.getAttribute('aria-pressed')].join('|');
 const keyboardVisible=()=>!!vv&&Math.abs(vv.scale-1)<.01&&innerHeight-vv.height>150;
 const schedule=()=>{if(snapshot){clearTimeout(timer);timer=setTimeout(settle,140);}};
 function cancel(){clearTimeout(timer);clearTimeout(deadline);if(snapshot)results.style.maxHeight=snapshot.maxHeight;snapshot=null;}
 function begin(){
  if(snapshot||results.hidden||!results.children.length)return;
  snapshot={x:scrollX,y:scrollY,top:results.scrollTop,signature:signature(),maxHeight:results.style.maxHeight};
  // Keep the scrollport from shrinking while iOS animates its viewport and fixed controls.
  results.style.maxHeight=results.getBoundingClientRect().height+'px';
  schedule();deadline=setTimeout(()=>{cancel();window.dispatchEvent(new Event('rareworth:keyboard-settle'));},1200);
 }
 function settle(){
  if(!snapshot)return;
  if(keyboardVisible()){schedule();return;}
  const saved=snapshot;
  results.style.maxHeight=saved.maxHeight;
  window.dispatchEvent(new Event('rareworth:keyboard-settle'));
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(snapshot!==saved)return;
   const valid=signature()===saved.signature&&!results.hidden;
   cancel();
   if(!valid)return;
   results.scrollTop=Math.min(saved.top,Math.max(0,results.scrollHeight-results.clientHeight));
   const root=document.documentElement,behavior=root.style.scrollBehavior;
   root.style.scrollBehavior='auto';window.scrollTo({left:saved.x,top:saved.y,behavior:'instant'});root.style.scrollBehavior=behavior;
  }));
 }
 function dismiss(){if(document.activeElement===input){begin();input.blur();}}
 input.addEventListener('blur',()=>{enterHeld=false;begin();schedule();});
 input.addEventListener('focus',cancel);
 input.addEventListener('input',cancel);
 results.addEventListener('scroll',()=>{if(snapshot)snapshot.top=results.scrollTop;},{passive:true});
 results.addEventListener('touchstart',event=>{
  clearTimeout(clickTimer);suppressClick=false;
  const t=event.touches.length===1?event.touches[0]:null;
  gesture=t?{x:t.clientX,y:t.clientY,drag:false}:null;
 },{passive:true});
 results.addEventListener('touchmove',event=>{
  if(!gesture||gesture.drag||event.touches.length!==1)return;
  const t=event.touches[0],dx=Math.abs(t.clientX-gesture.x),dy=Math.abs(t.clientY-gesture.y);
  if(dy>=12&&dy>dx*1.2){gesture.drag=true;suppressClick=true;dismiss();}
 },{passive:true});
 for(const name of ['touchend','touchcancel'])results.addEventListener(name,()=>{gesture=null;clickTimer=setTimeout(()=>suppressClick=false,400);},{passive:true});
 results.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}},true);
 results.addEventListener('wheel',event=>{if(Math.abs(event.deltaY)>4&&Math.abs(event.deltaY)>Math.abs(event.deltaX))dismiss();},{passive:true});
 // An intentional page gesture cancels restoration; never fight subsequent user scrolling.
 for(const name of ['touchstart','wheel'])document.addEventListener(name,event=>{if(!results.contains(event.target)&&event.target!==input)cancel();},{passive:true});
 async function search(){
  if(inFlight)return;
  inFlight=true;dismiss();
  try{
   if(input.value.trim()&&typeof parseQuick==='function')parseQuick();
   if(typeof updateCustomSelects==='function')updateCustomSelects();
   if(typeof makeLink==='function')await makeLink(false);
  }finally{inFlight=false;}
 }
 input.addEventListener('keydown',event=>{
  if(event.isComposing||event.keyCode===229){event.stopImmediatePropagation();return;}
  if(event.key==='Done'||(event.key==='Enter'&&input.enterKeyHint==='done')){event.preventDefault();event.stopImmediatePropagation();dismiss();return;}
  if(event.key!=='Enter')return;
  event.preventDefault();event.stopImmediatePropagation();
  if(event.repeat||enterHeld)return;enterHeld=true;void search();
 },true);
 input.addEventListener('keyup',event=>{if(event.key==='Enter')enterHeld=false;});
 document.getElementById('quickGo')?.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();void search();},true);
 input.form?.addEventListener('submit',event=>{event.preventDefault();void search();});
 vv?.addEventListener('resize',schedule);vv?.addEventListener('scroll',schedule);
 window.addEventListener('orientationchange',cancel);
 window.RareWorthKeyboard={isKeyboardVisible:keyboardVisible};
})();
