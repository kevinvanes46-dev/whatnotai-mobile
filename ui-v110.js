'use strict';
(() => {
  const navButtons = [...document.querySelectorAll('.navBtn[data-tab]')];
  const views = [...document.querySelectorAll('.tabView[data-view]')];
  const actionDock = document.getElementById('actionDock');
  const openBtn = document.getElementById('openBtn');
  const ocrResult = document.getElementById('ocrResult');
  const langSelect = document.getElementById('langSelect');
  const condSelect = document.getElementById('condSelect');
  const editionSelect = document.getElementById('editionSelect');
  const filterSummary = document.getElementById('filterSummary');
  let activeTab = 'scan';

  function setTab(tab, focus=false){
    if(!views.some(v => v.dataset.view === tab)) tab = 'scan';
    activeTab = tab;
    views.forEach(v => v.classList.toggle('active', v.dataset.view === tab));
    navButtons.forEach(btn => {
      const on = btn.dataset.tab === tab;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    document.documentElement.dataset.activeTab = tab;
    syncDock();
    if(focus){
      window.scrollTo({top:0, behavior:'smooth'});
      if(tab === 'search') setTimeout(() => document.getElementById('quickInput')?.focus({preventScroll:true}), 260);
    } else {
      window.scrollTo(0,0);
    }
    try{ history.replaceState(null,'',`#${tab}`); }catch(_){ }
  }

  function linkReady(){
    return !!openBtn && !openBtn.classList.contains('disabled') && openBtn.getAttribute('href') && openBtn.getAttribute('href') !== '#';
  }

  function syncDock(){
    if(!actionDock) return;
    const relevant = activeTab === 'scan' || activeTab === 'search';
    const ready = relevant && linkReady();
    actionDock.classList.toggle('ready', ready);
    actionDock.setAttribute('aria-hidden', String(!ready));
    document.body.classList.toggle('hasActionDock', ready);
  }

  function syncFilterSummary(){
    if(!filterSummary) return;
    const edition = editionSelect?.value === '1ST' ? '1ST' : 'Normaal';
    filterSummary.textContent = `${langSelect?.value || 'EN'} · ${condSelect?.value || 'NM'} · ${edition}`;
  }

  navButtons.forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab, true)));
  window.addEventListener('hashchange', () => setTab(location.hash.replace('#','') || 'scan', false));

  [langSelect, condSelect, editionSelect].filter(Boolean).forEach(el => el.addEventListener('change', () => {
    syncFilterSummary();
    setTimeout(syncDock, 0);
  }));
  document.querySelectorAll('.choiceBtn').forEach(btn => btn.addEventListener('click', () => setTimeout(syncFilterSummary, 0)));

  if(openBtn){
    new MutationObserver(syncDock).observe(openBtn, {attributes:true, attributeFilter:['href','class']});
  }
  if(ocrResult){
    new MutationObserver(() => {
      if(!ocrResult.hidden && activeTab === 'scan'){
        setTimeout(() => ocrResult.scrollIntoView({behavior:'smooth', block:'center'}), 120);
      }
      syncDock();
    }).observe(ocrResult, {attributes:true, attributeFilter:['hidden']});
  }

  const initial = (location.hash || '#scan').slice(1);
  syncFilterSummary();
  setTab(initial, false);
})();
