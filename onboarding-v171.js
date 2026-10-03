/* Presentation only: reuse the existing account form, auth service and local app. */
(() => {
  'use strict';
  const $ = id=>document.getElementById(id), screen = $('onboarding');
  const guestKey = 'rareworth_guest_session_v171_1', auth = window.RareWorthAccount;
  let previousFocus, reopened = false, hadSession = !!auth.getSession();
  const moved = [$('accountForm'), $('accountStatus')].map(node=>{
    const marker = document.createComment('Account UI home');node.before(marker);return {node,marker};
  });
  const read = name=>{try {return localStorage.getItem(name);} catch {return null;}};
  const isGuest = ()=>{try {return sessionStorage.getItem(guestKey)==='1';} catch {return false;}};
  const rememberGuest = ()=>{try {sessionStorage.setItem(guestKey,'1');} catch { /* Guest still works when storage is unavailable. */ }};
  function restoreForm() {for (const {node,marker} of moved) marker.after(node);}
  function visibility(open) {
    screen.hidden = !open;document.body.classList.toggle('onboarding-open', open);
    for (const child of document.body.children) {
      if (child !== screen && !['SCRIPT','STYLE'].includes(child.tagName)) child.inert = open;
    }
  }
  function close() {
    restoreForm();visibility(false);
    (previousFocus?.isConnected ? previousFocus : $('quickInput')).focus({preventScroll:true});
  }
  function connection() {
    $('onboardingOffline').hidden = navigator.onLine;
    $('onboardingLogin').disabled = !navigator.onLine;
    if(!navigator.onLine&&!$('onboardingLoading').hidden){$('onboardingLoading').hidden=true;$('onboardingChoices').hidden=false;}
  }
  function choices() {
    restoreForm();$('onboardingChoices').hidden = false;$('onboardingAuth').hidden = true;
    $('onboardingLoading').hidden = true;connection();
  }
  function open() {
    previousFocus = document.activeElement;choices();visibility(true);
    (navigator.onLine ? $('onboardingLogin') : $('onboardingGuest')).focus({preventScroll:true});
  }
  function guest() {
    rememberGuest();
    close();
  }
  $('onboardingGuest').addEventListener('click',guest);
  $('onboardingSkip').addEventListener('click',guest);
  $('onboardingLogin').addEventListener('click',()=>{
    if (!navigator.onLine) return;
    if (auth.getSession()) {close();return;}
    reopened = false;
    $('onboardingChoices').hidden = true;$('onboardingAuth').hidden = false;
    for (const {node} of moved) $('onboardingAuthSlot').append(node);
    $('accountEmailInput').focus({preventScroll:true});
  });
  $('onboardingBack').addEventListener('click',()=>{choices();$('onboardingLogin').focus();});
  $('onboardingReopen').addEventListener('click',()=>{reopened = true;open();});
  auth.subscribe(session=>{
    // Logout keeps the current tab usable; a later fresh session shows the gate.
    if(!session&&hadSession)rememberGuest();
    hadSession=!!session;
    if (session && !reopened && !screen.hidden) close();
  });
  screen.addEventListener('keydown',event=>{
    if (event.key !== 'Tab') return;
    const items=[...screen.querySelectorAll('button,input,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
    const first=items[0],last=items.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  });
  window.addEventListener('online',connection);window.addEventListener('offline',connection);
  // Hide only idle presentation; status text and engine events are unchanged.
  const status=$('status');const idle=()=>{status.classList.toggle('idleStatus',status.textContent.trim()==='Klaar');};
  new MutationObserver(idle).observe(status,{childList:true,characterData:true,subtree:true});idle();
  const callback=new URL(location.href), project=new URL(window.RareWorthSupabaseConfig.url).hostname.split('.')[0];
  const resume=read('rareworth_account_enabled_v170')==='1'||read('sb-'+project+'-auth-token')||callback.searchParams.has('code')||/(?:access_token|error_description)=/.test(callback.hash);
  if(auth.getSession()){visibility(false);return;}
  // The legacy localStorage onboarding preference is deliberately neither read
  // nor removed. Only this tab's session flag can bypass a signed-out launch.
  const signedOut = ()=>{if(isGuest())close();else open();};
  visibility(true);connection();
  if(resume&&navigator.onLine){
    $('onboardingChoices').hidden=true;$('onboardingLoading').hidden=false;
    // SDK remains the sole authority for session validity; never parse its token.
    auth.start().then(()=>{
      if(screen.hidden||reopened)return;
      if(auth.getSession())close();else signedOut();
    }).catch(()=>{if(!screen.hidden&&!reopened)signedOut();});
  }else signedOut();
})();
