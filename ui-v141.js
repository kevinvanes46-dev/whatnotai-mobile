'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const navButtons = [...document.querySelectorAll('.navBtn[data-tab]')];
  const views = [...document.querySelectorAll('.tabView[data-view]')];
  const actionDock = $('actionDock');
  const openBtn = $('openBtn');
  const favoriteBtn = $('favoriteBtn');
  const ocrResult = $('ocrResult');
  const ocrProgress = $('ocrProgress');
  const ocrProgressFill = $('ocrProgressFill');
  const ocrProgressText = $('ocrProgressText');
  const scanPhotoBtn = $('scanPhotoBtn');
  const takePhotoBtn = $('takePhotoBtn');
  const choosePhotoBtn = $('choosePhotoBtn');
  const cameraInput = $('cameraInput');
  const galleryInput = $('galleryInput');
  const cameraCancelBtn = $('cameraCancelBtn');
  const clearPhotoBtn = $('clearPhotoBtn');
  const photoStage = $('photoStage');
  const status = $('status');
  const quickInput = $('quickInput');
  const smartSuggestions = $('smartSuggestions');
  const nameInput = $('nameInput');
  const numberInput = $('numberInput');
  const setSelect = $('setSelect');
  const langSelect = $('langSelect');
  const condSelect = $('condSelect');
  const editionSelect = $('editionSelect');
  const scanPrefsText = $('scanPrefsText');

  const scanOverlay = $('scanOverlay');
  const scanOverlayText = $('scanOverlayText');
  const scanOverlayFill = $('scanOverlayFill');

  const resultBackdrop = $('resultBackdrop');
  const resultSheet = $('resultSheet');
  const resultState = $('resultState');
  const resultEyebrow = $('resultEyebrow');
  const resultTitle = $('resultTitle');
  const resultMeta = $('resultMeta');
  const resultLangChip = $('resultLangChip');
  const resultCondChip = $('resultCondChip');
  const resultEditionChip = $('resultEditionChip');
  const resultEditionChooser = $('resultEditionChooser');
  const resultOpenBtn = $('resultOpenBtn');
  const resultCloseBtn = $('resultCloseBtn');
  const resultRescanBtn = $('resultRescanBtn');
  const resultEditBtn = $('resultEditBtn');
  const resultBadBtn = $('resultBadBtn');
  const resultHint = $('resultHint');
  const toast = $('toast');

  let activeTab = 'scan';
  let autoScanPending = false;
  let autoScanRunning = false;
  let autoScanTimer = null;
  let toastTimer = null;
  let catalog = [];
  let setInfo = {};
  let suggestionSeq = 0;

  const PREF_KEYS = {lang:'cardscout_pref_lang',cond:'cardscout_pref_cond',edition:'cardscout_pref_edition'};
  try{const old={lang:'cardscout_pref_lang_v130',cond:'cardscout_pref_cond_v130',edition:'cardscout_pref_edition_v130'};for(const k of Object.keys(PREF_KEYS)){if(localStorage.getItem(PREF_KEYS[k])==null&&localStorage.getItem(old[k])!=null)localStorage.setItem(PREF_KEYS[k],localStorage.getItem(old[k]));}}catch(_){}

  function restorePrefs(){
    try{
      const savedLang = localStorage.getItem(PREF_KEYS.lang);
      const savedCond = localStorage.getItem(PREF_KEYS.cond);
      const savedEdition = localStorage.getItem(PREF_KEYS.edition);
      if(langSelect) langSelect.value = ['JP','EN'].includes(savedLang) ? savedLang : 'EN';
      if(condSelect) condSelect.value = ['NM','EX','GD','PL'].includes(savedCond) ? savedCond : 'NM';
      if(editionSelect) editionSelect.value = ['AUTO','1ST'].includes(savedEdition) ? savedEdition : 'AUTO';
      if(typeof updateCustomSelects === 'function') updateCustomSelects();
    }catch(_){
      if(langSelect) langSelect.value='EN';
      if(condSelect) condSelect.value='NM';
      if(editionSelect) editionSelect.value='AUTO';
    }
  }
  function savePrefs(){
    try{
      if(langSelect) localStorage.setItem(PREF_KEYS.lang,langSelect.value);
      if(condSelect) localStorage.setItem(PREF_KEYS.cond,condSelect.value);
      if(editionSelect) localStorage.setItem(PREF_KEYS.edition,editionSelect.value);
    }catch(_){ }
  }

  function setTab(tab, focus=false){
    if(!views.some(v => v.dataset.view === tab)) tab = 'scan';
    activeTab = tab;
    if(tab !== 'search' && !autoScanRunning && status){ status.textContent='Klaar'; status.className='status ok'; }
    views.forEach(v => v.classList.toggle('active', v.dataset.view === tab));
    navButtons.forEach(btn => {
      const on = btn.dataset.tab === tab;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    document.documentElement.dataset.activeTab = tab;
    closeResult(false);
    syncDock();
    window.scrollTo({top:0, behavior:focus ? 'smooth' : 'auto'});
    if(focus && tab === 'search') setTimeout(() => quickInput?.focus({preventScroll:true}), 220);
    try{ history.replaceState(null,'',`#${tab}`); }catch(_){ }
  }

  function linkReady(){
    return !!openBtn && !openBtn.classList.contains('disabled') && !!openBtn.getAttribute('href') && openBtn.getAttribute('href') !== '#';
  }

  function syncDock(){
    if(!actionDock) return;
    const relevant = activeTab === 'scan' || activeTab === 'search';
    const ready = relevant && linkReady() && !document.body.classList.contains('resultOpen');
    actionDock.classList.toggle('ready', ready);
    actionDock.setAttribute('aria-hidden', String(!ready));
    document.body.classList.toggle('hasActionDock', ready);
  }

  function showToast(message){
    if(!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
  }

  function prettySet(set){
    if(!set || set === 'AUTO') return '';
    return setInfo?.[set]?.label || String(set).toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  function syncPrefs(){
    if(!scanPrefsText) return;
    const edition = editionSelect?.value === '1ST' ? ' · 1ST' : '';
    scanPrefsText.textContent = `${langSelect?.value || 'EN'} · ${condSelect?.value || 'NM'}${edition}`;
  }

  function exactCatalogCard(){
    const nm = (nameInput?.value || '').trim().toLowerCase();
    const num = String(numberInput?.value || '').trim().split('/')[0].replace(/^0+(?=\d)/,'');
    const set = setSelect?.value || 'AUTO';
    const lang = langSelect?.value || 'EN';
    if(!nm || !num || !set || set === 'AUTO') return null;
    return catalog.find(c => (c.language || 'EN') === lang && String(c.set) === set && String(c.number).replace(/^0+(?=\d)/,'') === num && String(c.name).toLowerCase() === nm) || null;
  }

  function collectorTotalFromHiddenResult(){
    const text = ocrResult?.textContent || '';
    const m = text.match(/Kaartnummer:\s*(\d+)\s*\/\s*(\d+)/i);
    return m ? {number:m[1], total:m[2]} : null;
  }

  function resultComplete(){
    return !!((nameInput?.value || '').trim() && (numberInput?.value || '').trim() && setSelect?.value && setSelect.value !== 'AUTO');
  }

  function syncResultSheet(){
    if(!resultSheet) return;
    const complete = resultComplete();
    const name = (nameInput?.value || '').trim() || 'Kaart niet zeker';
    const number = String(numberInput?.value || '').trim();
    const set = setSelect?.value || 'AUTO';
    const card = exactCatalogCard();
    const collector = collectorTotalFromHiddenResult();
    const total = collector?.total || '';
    const setLabel = prettySet(set);
    const rarity = card?.rarity ? ` · ${card.rarity}` : '';

    resultState?.classList.toggle('warn', !complete);
    if(resultState) resultState.innerHTML = complete ? '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M12 8v5m0 3h.01"/><circle cx="12" cy="12" r="9"/></svg>';
    if(resultEyebrow) resultEyebrow.textContent = complete ? 'Kaart gevonden' : 'Controle nodig';
    if(resultTitle) resultTitle.textContent = name;
    if(resultMeta){
      if(complete) resultMeta.textContent = `#${number}${total ? '/'+total : ''} · ${setLabel}${rarity}`;
      else resultMeta.textContent = [number ? `#${number}${total ? '/'+total : ''}` : '', setLabel].filter(Boolean).join(' · ') || 'Niet genoeg zekerheid voor een exacte match';
    }

    if(resultLangChip) resultLangChip.textContent = langSelect?.value || 'EN';
    if(resultCondChip) resultCondChip.textContent = condSelect?.value || 'NM';
    if(resultEditionChip) resultEditionChip.textContent = editionSelect?.value === '1ST' ? '1st Edition' : 'Normaal';

    const ready = linkReady();
    if(resultOpenBtn){
      resultOpenBtn.href = ready ? openBtn.href : '#';
      resultOpenBtn.classList.toggle('disabled', !ready);
      resultOpenBtn.setAttribute('aria-disabled', String(!ready));
    }
    if(resultHint) resultHint.textContent = complete
      ? 'Controleer bij twijfel altijd de kaart op Cardmarket.'
      : 'CardScout gokt niet. Bewerk de kaart of scan opnieuw.';
  }

  function openResult(){
    if(!resultSheet || activeTab !== 'scan') return;
    syncResultSheet();
    resultBackdrop.hidden = false;
    resultSheet.hidden = false;
    document.body.classList.add('resultOpen');
    syncDock();
    try{ navigator.vibrate?.(12); }catch(_){ }
  }

  function closeResult(updateDock=true){
    if(!resultSheet) return;
    resultSheet.hidden = true;
    if(resultBackdrop) resultBackdrop.hidden = true;
    if(resultEditionChooser) resultEditionChooser.hidden = true;
    document.body.classList.remove('resultOpen');
    if(updateDock) syncDock();
  }

  function setScanOverlay(on){
    if(!scanOverlay) return;
    scanOverlay.hidden = !on;
    if(on){
      if(scanOverlayText) scanOverlayText.textContent = ocrProgressText?.textContent || 'Scanner voorbereiden…';
      if(scanOverlayFill) scanOverlayFill.style.width = ocrProgressFill?.style.width || '7%';
    }
  }

  function mirrorProgress(){
    if(!autoScanRunning) return;
    if(scanOverlayText) scanOverlayText.textContent = ocrProgressText?.textContent || 'Kaart analyseren…';
    if(scanOverlayFill) scanOverlayFill.style.width = ocrProgressFill?.style.width || '12%';
  }

  function armAutoScan(){
    autoScanPending = true;
    clearTimeout(autoScanTimer);
  }

  function cancelAutoScan(){
    autoScanPending = false;
    autoScanRunning = false;
    clearTimeout(autoScanTimer);
    setScanOverlay(false);
  }

  function triggerAutoScan(){
    if(!autoScanPending || autoScanRunning || !scanPhotoBtn || !photoStage || photoStage.classList.contains('empty')) return;
    const attempt = () => {
      if(!autoScanPending || autoScanRunning) return;
      if(scanPhotoBtn.disabled){
        autoScanTimer = setTimeout(attempt, 70);
        return;
      }
      autoScanPending = false;
      autoScanRunning = true;
      closeResult(false);
      setScanOverlay(true);
      scanPhotoBtn.click();
    };
    attempt();
  }

  function statusChanged(){
    const text = (status?.textContent || '').trim();
    if(autoScanPending && /foto geladen|galerijfoto geladen/i.test(text)){
      autoScanTimer = setTimeout(triggerAutoScan, 40);
    }
  }

  function scanResultChanged(){
    if(!ocrResult || ocrResult.hidden) return;
    autoScanRunning = false;
    setScanOverlay(false);
    syncResultSheet();
    if(activeTab === 'scan') setTimeout(openResult, 80);
  }

  function safelyRebuildLink(){
    try{
      if(typeof updateCustomSelects === 'function') updateCustomSelects();
      if(typeof makeLink === 'function'){
        Promise.resolve(makeLink(false)).finally(() => setTimeout(() => { syncResultSheet(); syncDock(); }, 0));
      }
    }catch(_){ setTimeout(() => { syncResultSheet(); syncDock(); }, 0); }
  }

  function cycleLanguage(){
    if(!langSelect) return;
    langSelect.value = langSelect.value === 'EN' ? 'JP' : 'EN';
    savePrefs(); syncPrefs(); safelyRebuildLink();
  }

  function cycleCondition(){
    if(!condSelect) return;
    const order = ['NM','EX','GD','PL'];
    const i = Math.max(0, order.indexOf(condSelect.value));
    condSelect.value = order[(i + 1) % order.length];
    savePrefs(); syncPrefs(); safelyRebuildLink();
  }

  function setEdition(value){
    if(!editionSelect) return;
    editionSelect.value = value === '1ST' ? '1ST' : 'AUTO';
    if(typeof updateCustomSelects === 'function') updateCustomSelects();
    savePrefs(); syncPrefs();
    if(resultEditionChooser){
      resultEditionChooser.querySelectorAll('[data-edition]').forEach(b => b.classList.toggle('active', b.dataset.edition === editionSelect.value));
      resultEditionChooser.hidden = true;
    }
    safelyRebuildLink();
  }

  function normalize(s){ return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim(); }

  function suggestionScore(card, tokens){
    const name = normalize(card.name);
    const number = normalize(card.number);
    const setName = normalize(card.set_name || setInfo?.[card.set]?.label || card.set);
    const code = normalize(card.code || setInfo?.[card.set]?.code || '');
    const aliases = (setInfo?.[card.set]?.aliases || []).map(normalize).join(' ');
    const hay = `${name} ${number} ${setName} ${code} ${aliases}`;
    let score = 0;
    for(const token of tokens){
      if(/^\d+$/.test(token)){
        if(number === token) score += 12;
        else if(number.startsWith(token)) score += 4;
        else return -1;
      }else{
        if(name === token) score += 14;
        else if(name.startsWith(token)) score += 9;
        else if(name.split(' ').some(w => w.startsWith(token))) score += 7;
        else if(setName.includes(token) || aliases.includes(token) || code === token) score += 5;
        else if(hay.includes(token)) score += 2;
        else return -1;
      }
    }
    if(card.direct) score += .4;
    return score;
  }

  function renderSuggestions(query){
    if(!smartSuggestions) return;
    const seq = ++suggestionSeq;
    const rawTokens = normalize(query).split(' ').filter(Boolean);
    const ignored = new Set(['en','eng','english','jp','jpn','japanese','nm','ex','gd','pl','1st','first','edition','normal','normaal']);
    const tokens = rawTokens.filter(t => !ignored.has(t));
    if(!tokens.length || !catalog.length){ smartSuggestions.hidden = true; smartSuggestions.innerHTML=''; return; }
    const lang = langSelect?.value || 'EN';
    const results = catalog
      .filter(c => (c.language || 'EN') === lang)
      .map(c => ({card:c, score:suggestionScore(c,tokens)}))
      .filter(x => x.score >= 0)
      .sort((a,b) => b.score-a.score || Number(a.card.number)-Number(b.card.number))
      .slice(0,3);
    if(seq !== suggestionSeq) return;
    if(!results.length){ smartSuggestions.hidden = true; smartSuggestions.innerHTML=''; return; }
    smartSuggestions.innerHTML = '';
    results.forEach(({card}) => {
      const btn = document.createElement('button');
      btn.type='button'; btn.className='suggestion';
      const label = card.set_name || setInfo?.[card.set]?.label || prettySet(card.set);
      btn.innerHTML = `<span class="suggestionMain"><span class="suggestionTitle"></span><span class="suggestionMeta"></span></span><span class="suggestionArrow"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></span>`;
      btn.querySelector('.suggestionTitle').textContent = `${card.name} · #${card.number}`;
      btn.querySelector('.suggestionMeta').textContent = `${label}${card.rarity ? ' · '+card.rarity : ''}`;
      btn.addEventListener('click', () => {
        nameInput.value = card.name;
        numberInput.value = card.number;
        if([...setSelect.options].some(o => o.value === card.set)) setSelect.value = card.set;
        quickInput.value = `${card.number} ${card.name} ${label}`;
        if(typeof updateCustomSelects === 'function') updateCustomSelects();
        smartSuggestions.hidden = true;
        smartSuggestions.innerHTML='';
        safelyRebuildLink();
        showToast(`${card.name} klaar voor Cardmarket`);
      });
      smartSuggestions.appendChild(btn);
    });
    smartSuggestions.hidden = false;
  }

  async function loadCatalog(){
    try{
      const res = await fetch(`cards.json?build=141`, {cache:'no-store'});
      if(!res.ok) return;
      const data = await res.json();
      catalog = Array.isArray(data.knownCards) ? data.knownCards : [];
      setInfo = data.sets || {};
    }catch(_){ }
  }

  navButtons.forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab, true)));
  window.addEventListener('hashchange', () => setTab(location.hash.replace('#','') || 'scan', false));
  $('brandHomeBtn')?.addEventListener('click', () => setTab('scan', true));
  $('scanPrefsBtn')?.addEventListener('click', () => setTab('settings', true));

  takePhotoBtn?.addEventListener('click', armAutoScan);
  choosePhotoBtn?.addEventListener('click', armAutoScan);
  cameraInput?.addEventListener('change', () => { if(cameraInput.files?.length) armAutoScan(); else cancelAutoScan(); });
  galleryInput?.addEventListener('change', () => { if(galleryInput.files?.length) armAutoScan(); else cancelAutoScan(); });
  cameraCancelBtn?.addEventListener('click', cancelAutoScan);
  clearPhotoBtn?.addEventListener('click', cancelAutoScan);

  resultCloseBtn?.addEventListener('click', () => closeResult(true));
  resultBackdrop?.addEventListener('click', () => closeResult(true));
  resultRescanBtn?.addEventListener('click', () => {
    closeResult(false);
    clearPhotoBtn?.click();
    setTab('scan', false);
    setTimeout(() => takePhotoBtn?.click(), 140);
  });
  resultEditBtn?.addEventListener('click', () => { try{window.CardScoutLearningHooks?.beginCorrection?.();}catch(_){} closeResult(false); setTab('search', true); });
  resultBadBtn?.addEventListener('click', () => {
    const mark = ocrResult?.querySelector('#debugMarkBad');
    if(mark && !mark.disabled){ try{window.CardScoutLearningHooks?.markRejected?.();}catch(_){} mark.click(); showToast('Foute scan opgeslagen in debuglog'); }
    else showToast('Deze scan staat al in het debuglog');
  });
  resultLangChip?.addEventListener('click', cycleLanguage);
  resultCondChip?.addEventListener('click', cycleCondition);
  resultEditionChip?.addEventListener('click', () => {
    if(!resultEditionChooser) return;
    resultEditionChooser.hidden = !resultEditionChooser.hidden;
    resultEditionChooser.querySelectorAll('[data-edition]').forEach(b => b.classList.toggle('active', b.dataset.edition === editionSelect?.value));
  });
  resultEditionChooser?.querySelectorAll('[data-edition]').forEach(btn => btn.addEventListener('click', () => setEdition(btn.dataset.edition)));
  resultOpenBtn?.addEventListener('pointerdown', () => { if(!resultOpenBtn.classList.contains('disabled')) try{window.CardScoutLearningHooks?.acceptOrCorrect?.();}catch(_){} });
  resultOpenBtn?.addEventListener('click', () => { if(resultOpenBtn.classList.contains('disabled')) showToast('Nog geen zekere Cardmarket-link'); });
  openBtn?.addEventListener('pointerdown', () => { if(!openBtn.classList.contains('disabled')) try{window.CardScoutLearningHooks?.acceptOrCorrect?.();}catch(_){} });

  quickInput?.addEventListener('input', () => renderSuggestions(quickInput.value));
  quickInput?.addEventListener('blur', () => setTimeout(() => { if(smartSuggestions && !smartSuggestions.matches(':hover')) smartSuggestions.hidden=true; }, 180));
  quickInput?.addEventListener('focus', () => renderSuggestions(quickInput.value));

  [langSelect,condSelect,editionSelect].filter(Boolean).forEach(el => el.addEventListener('change', () => { savePrefs(); syncPrefs(); setTimeout(() => { syncResultSheet(); syncDock(); },0); }));
  document.querySelectorAll('.choiceBtn').forEach(btn => btn.addEventListener('click', () => setTimeout(syncPrefs,0)));

  if(status) new MutationObserver(statusChanged).observe(status,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
  if(ocrResult) new MutationObserver(scanResultChanged).observe(ocrResult,{attributes:true,attributeFilter:['hidden']});
  if(ocrProgressText) new MutationObserver(mirrorProgress).observe(ocrProgressText,{childList:true,subtree:true,characterData:true});
  if(ocrProgressFill) new MutationObserver(mirrorProgress).observe(ocrProgressFill,{attributes:true,attributeFilter:['style']});
  if(openBtn) new MutationObserver(() => { syncResultSheet(); syncDock(); }).observe(openBtn,{attributes:true,attributeFilter:['href','class']});

  restorePrefs();
  loadCatalog();
  syncPrefs();
  setTab((location.hash || '#scan').slice(1), false);
  // Keep technical CORE3 version out of normal UI while leaving the engine untouched.
  if(status){ status.textContent='Klaar'; status.className='status ok'; }
})();
