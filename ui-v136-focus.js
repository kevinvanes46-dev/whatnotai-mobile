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

  let activeTab = 'search';
  let autoScanPending = false;
  let autoScanRunning = false;
  let autoScanTimer = null;
  let toastTimer = null;
  let catalog = [];
  let setInfo = {};
  let suggestionSeq = 0;
  let localCatalog = [];
  let remoteCatalog = [];
  let activeSuggestionResults = [];
  let renderedSuggestionCount = 0;
  let enCatalogState = 'idle';
  let jpCatalogState = 'idle';

  const SEARCH_BUILD = '135-price-condition';
  const TCGDEX_API = 'https://api.tcgdex.net/v2';
  const ONLINE_CACHE_TTL = 14 * 24 * 60 * 60 * 1000;
  const ONLINE_CACHE_PREFIX = 'cardscout_search_catalog_v133_';
  const SUGGESTION_BATCH = 80;

  // Search-only catalog expansion. These IDs cover every set already defined in v131.
  // The scanner engine remains on app-v130.js and does not consume this mapping.
  const TCGDEX_SET_IDS = {
    'BASE':['base1'],
    'JUNGLE':['base2'],
    'FOSSIL':['base3'],
    'BASE SET 2':['base4'],
    'ROCKET':['base5'],
    'GYM HEROES':['gym1'],
    'GYM CHALLENGE':['gym2'],
    'NEO GENESIS':['neo1'],
    'NEO DISCOVERY':['neo2'],
    'NEO REVELATION':['neo3'],
    'NEO DESTINY':['neo4'],
    'LEGENDARY COLLECTION':['base6'],
    'SOUTHERN ISLANDS':['si1'],
    'WOTC PROMO':['basep'],
    'EXPEDITION':['ecard1'],
    'AQUAPOLIS':['ecard2'],
    'SKYRIDGE':['ecard3'],
    'EX RUBY SAPPHIRE':['ex1'],
    'EX SANDSTORM':['ex2'],
    'EX DRAGON':['ex3'],
    'EX TEAM MAGMA AQUA':['ex4'],
    'EX HIDDEN LEGENDS':['ex5'],
    'EX FIRERED LEAFGREEN':['ex6'],
    'EX TEAM ROCKET RETURNS':['ex7'],
    'EX DEOXYS':['ex8'],
    'EX EMERALD':['ex9'],
    'EX UNSEEN FORCES':['ex10'],
    'EX DELTA SPECIES':['ex11'],
    'EX LEGEND MAKER':['ex12'],
    'EX HOLON PHANTOMS':['ex13'],
    'EX CRYSTAL GUARDIANS':['ex14'],
    'EX DRAGON FRONTIERS':['ex15'],
    'EX POWER KEEPERS':['ex16'],
    'EX TRAINER KIT 2':['tk-ex-p','tk-ex-n','tk2a','tk2b'],
    'LEGENDS AWAKENED':['dp6']
  };


  // English EX-era set-logo stamped reverse holos start at EX Team Rocket Returns
  // and continue through EX Power Keepers. Japanese sets generally do not use this reverse-holo format.
  const STAMPED_SET_KEYS = new Set([
    'EX TEAM ROCKET RETURNS','EX DEOXYS','EX EMERALD','EX UNSEEN FORCES','EX DELTA SPECIES',
    'EX LEGEND MAKER','EX HOLON PHANTOMS','EX CRYSTAL GUARDIANS','EX DRAGON FRONTIERS','EX POWER KEEPERS'
  ]);
  const STAMP_TERMS = new Set(['stamp','stamps','stamped','stamping','stempel','stempels','gestempeld','setstamp','setstamps','reverse','reverseholo','rh','setlogo','logo']);
  let stampedToggleOn = false;
  const stampedToggle = $('stampedToggle');
  const stampedSetChips = $('stampedSetChips');
  function queryWantsStamped(q=''){
    const tokens=normalize(q).split(' ').filter(Boolean);
    return stampedToggleOn || tokens.some(t=>STAMP_TERMS.has(t));
  }
  function syncStampedSetChips(){
    if(!stampedSetChips) return;
    stampedSetChips.hidden = !stampedToggleOn;
    const q = normalize(quickInput?.value || '');
    stampedSetChips.querySelectorAll('[data-stamped-set]').forEach(btn=>{
      const setKey = btn.dataset.stampedSet || '';
      const def = setInfo?.[setKey] || {};
      const hay = normalize([setKey,def.label,def.code,...(def.aliases||[])].filter(Boolean).join(' '));
      btn.classList.toggle('active', !!q && q.split(' ').filter(Boolean).some(t=>t.length>2 && hay.includes(t)));
    });
  }
  function setStampedMode(on, rerender=true){
    stampedToggleOn=!!on;
    if(stampedToggle){ stampedToggle.classList.toggle('active',stampedToggleOn); stampedToggle.setAttribute('aria-pressed',String(stampedToggleOn)); }
    syncStampedSetChips();
    if(rerender && quickInput?.value.trim()) renderSuggestions(quickInput.value);
    if(rerender && !quickInput?.value.trim() && stampedToggleOn) renderSuggestions('stamped');
  }

  const PREF_KEYS = {lang:'cardscout_pref_lang_v130',cond:'cardscout_pref_cond_v130',edition:'cardscout_pref_edition_v130'};

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
    if(!views.some(v => v.dataset.view === tab)) tab = 'search';
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
    const relevant = activeTab === 'search';
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

  function numericKey(value){
    const m = String(value || '').match(/\d+/);
    if(!m) return '';
    return String(Number(m[0]));
  }

  // v131: one generic matcher for EVERY card in the current catalog.
  // No Pokemon names are hardcoded. Every query token can match name, number or set metadata.
  function suggestionScore(card, tokens, fullQuery){
    const name = normalize(card.name);
    const number = normalize(card.number);
    const numberKey = numericKey(card.number);
    const setName = normalize(card.set_name || setInfo?.[card.set]?.label || card.set);
    const code = normalize(card.code || setInfo?.[card.set]?.code || '');
    const aliasList = [
      ...(setInfo?.[card.set]?.aliases || []),
      ...(card.aliases || []),
      card.source_set_name || ''
    ].map(normalize).filter(Boolean);
    const aliases = aliasList.join(' ');
    const rarity = normalize(card.rarity || '');
    const language = normalize(card.language || 'EN');
    const nameWords = name.split(' ').filter(Boolean);
    const setWords = setName.split(' ').filter(Boolean);
    const aliasWords = aliases.split(' ').filter(Boolean);

    let score = 0;
    for(const token of tokens){
      if(/^\d+$/.test(token)){
        const tokenKey = numericKey(token);
        if(numberKey === tokenKey) score += 160;
        else if(numberKey.startsWith(tokenKey)) score += 70;
        else if(number.includes(token)) score += 30;
        else return -1;
        continue;
      }

      if(name === token) score += 260;
      else if(name.startsWith(token)) score += 190;
      else if(nameWords.some(w => w.startsWith(token))) score += 150;
      else if(name.includes(token)) score += 110;
      else if(code === token) score += 95;
      else if(setName === token) score += 90;
      else if(setWords.some(w => w.startsWith(token))) score += 80;
      else if(aliasWords.some(w => w.startsWith(token))) score += 75;
      else if(setName.includes(token) || aliases.includes(token)) score += 60;
      else if(rarity.includes(token)) score += 25;
      else if(language.startsWith(token)) score += 20;
      else return -1;
    }

    if(fullQuery){
      if(name === fullQuery) score += 500;
      else if(name.startsWith(fullQuery)) score += 300;
      else if(name.includes(fullQuery)) score += 140;
    }
    // Language remains a preference/ranking boost, NOT a hard filter, so all known cards stay searchable.
    if((card.language || 'EN') === (langSelect?.value || 'EN')) score += 8;
    if(card.direct) score += .4;
    return score;
  }

  function hideSuggestions(){
    if(smartSuggestions) smartSuggestions.hidden = true;
  }

  function catalogLoadingText(){
    const parts=[];
    if(enCatalogState === 'loading') parts.push('EN wordt aangevuld');
    if(jpCatalogState === 'loading') parts.push('JP wordt aangevuld');
    return parts.join(' · ');
  }

  function rebuildCatalog(){
    const merged=[];
    const seen=new Set();
    const localNameSetLang = new Set();

    for(const card of localCatalog){
      const id = card.key || `${card.language}|${card.set}|${card.number}|${normalize(card.name)}`;
      if(seen.has(id)) continue;
      seen.add(id);
      merged.push(card);
      localNameSetLang.add(`${card.language || 'EN'}|${card.set}|${normalize(card.name)}`);
    }

    for(const card of remoteCatalog){
      // If an authentic local JP route already exists, keep it and suppress the generic online duplicate.
      if(card.language === 'JP' && localNameSetLang.has(`JP|${card.set}|${normalize(card.name)}`)) continue;
      const id = card.key || `${card.language}|${card.set}|${card.number}|${normalize(card.name)}|${card.source_id || ''}`;
      if(seen.has(id)) continue;
      seen.add(id);
      merged.push(card);
    }
    catalog = merged;
  }

  function appendSuggestionBatch(){
    if(!smartSuggestions || renderedSuggestionCount >= activeSuggestionResults.length) return;
    const end = Math.min(renderedSuggestionCount + SUGGESTION_BATCH, activeSuggestionResults.length);
    for(let i=renderedSuggestionCount;i<end;i++){
      const card = activeSuggestionResults[i].card;
      const btn = document.createElement('button');
      btn.type='button'; btn.className='suggestion';
      const label = card.set_name || setInfo?.[card.set]?.label || prettySet(card.set);
      const lang = card.language || 'EN';
      const isRemote = card.source === 'tcgdex';
      const displayNumber = lang === 'JP' && isRemote ? '' : String(card.number || '').trim();
      btn.innerHTML = `<span class="suggestionMain"><span class="suggestionTitle"></span><span class="suggestionMeta"></span></span><span class="suggestionArrow"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></span>`;
      btn.querySelector('.suggestionTitle').textContent = `${card.name}${displayNumber ? ` #${displayNumber}` : ''}`;
      const sourceNote = isRemote ? (lang === 'JP' ? ' · JP online' : ' · volledige catalogus') : '';
      const stampNote = (queryWantsStamped(quickInput?.value || '') && lang === 'EN' && STAMPED_SET_KEYS.has(card.set)) ? ' · ⚡ STAMPED-era' : '';
      btn.querySelector('.suggestionMeta').textContent = `${label} · ${lang}${card.rarity ? ' · '+card.rarity : ''}${stampNote}${sourceNote}`;
      btn.addEventListener('click', () => {
        nameInput.value = card.name;
        // TCGdex Japanese records use a cross-language set mapping. Do not pretend that number is the
        // printed Japanese collector/Pokedex number; authentic local JP records still keep their real number.
        numberInput.value = (lang === 'JP' && isRemote) ? '' : (card.number || '');
        const hasSetOption = [...setSelect.options].some(o => o.value === card.set);
        if(hasSetOption) setSelect.value = card.set;
        else setSelect.value = 'AUTO';
        if(langSelect && ['EN','JP'].includes(lang)) langSelect.value = lang;
        quickInput.value = `${card.name}${displayNumber ? ' '+displayNumber : ''} ${label}`.trim();
        if(typeof updateCustomSelects === 'function') updateCustomSelects();
        savePrefs();
        smartSuggestions.hidden = true;
        smartSuggestions.innerHTML='';
        safelyRebuildLink();
        const stampedSelected = queryWantsStamped(quickInput?.value || '') && lang === 'EN' && STAMPED_SET_KEYS.has(card.set);
        window.dispatchEvent(new CustomEvent('cardscout:card-selected',{detail:{
          card:{...card}, stamped:stampedSelected,
          condition:condSelect?.value || 'NM', edition:editionSelect?.value || 'AUTO',
          cardmarketUrl:openBtn?.getAttribute('href') || card.url || ''
        }}));
        showToast(stampedSelected ? `${card.name}: stamped/reverse variant geselecteerd` : (isRemote && lang === 'JP'
          ? `${card.name}: veilige JP Cardmarket-zoekroute klaar`
          : `${card.name} klaar voor Cardmarket`));
      });
      smartSuggestions.appendChild(btn);
    }
    renderedSuggestionCount=end;
  }

  function renderSuggestions(query){
    if(!smartSuggestions) return;
    const seq = ++suggestionSeq;
    const fullQuery = normalize(query);
    const rawTokens = fullQuery.split(' ').filter(Boolean);
    const stampedOnly = queryWantsStamped(query);
    const ignored = new Set(['en','eng','english','jp','jpn','japanese','nm','ex','gd','pl','1st','first','edition','normal','normaal','stamp','stamps','stamped','stamping','stempel','stempels','gestempeld','setstamp','setstamps','reverse','reverseholo','rh','setlogo','logo','holo']);
    const tokens = rawTokens.filter(t => !ignored.has(t));
    if((!tokens.length && !stampedOnly) || !catalog.length){ smartSuggestions.hidden = true; smartSuggestions.innerHTML=''; return; }

    const results = catalog
      .filter(c => !stampedOnly || ((c.language || 'EN') === 'EN' && STAMPED_SET_KEYS.has(c.set)))
      .map(c => ({card:c, score:tokens.length ? suggestionScore(c,tokens,fullQuery) : 10}))
      .filter(x => x.score >= 0)
      .sort((a,b) => {
        if(b.score !== a.score) return b.score-a.score;
        const byName = String(a.card.name || '').localeCompare(String(b.card.name || ''), undefined, {sensitivity:'base'});
        if(byName) return byName;
        const bySet = String(a.card.set_name || a.card.set || '').localeCompare(String(b.card.set_name || b.card.set || ''), undefined, {sensitivity:'base'});
        if(bySet) return bySet;
        return Number(numericKey(a.card.number) || 9999)-Number(numericKey(b.card.number) || 9999);
      });

    if(seq !== suggestionSeq) return;
    if(!results.length){
      smartSuggestions.innerHTML='';
      if(enCatalogState === 'loading' || jpCatalogState === 'loading'){
        const summary=document.createElement('div');
        summary.className='suggestionSummary catalogLoading';
        summary.innerHTML=`<b>Catalogus laden…</b><span>${catalogLoadingText()}</span>`;
        smartSuggestions.appendChild(summary);
        smartSuggestions.hidden=false;
      }else smartSuggestions.hidden=true;
      return;
    }

    activeSuggestionResults = results;
    renderedSuggestionCount = 0;
    smartSuggestions.innerHTML = '';

    const summary = document.createElement('div');
    summary.className = 'suggestionSummary';
    const loading = catalogLoadingText();
    summary.innerHTML = `<b>${results.length} ${results.length === 1 ? 'kaart' : 'kaarten'}${stampedOnly ? ' · ⚡ STAMPED' : ''}</b><span>${loading || 'scroll voor alle matches'}</span>`;
    smartSuggestions.appendChild(summary);
    appendSuggestionBatch();
    smartSuggestions.scrollTop = 0;
    smartSuggestions.hidden = false;
  }

  async function fetchJson(url){
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try{
      const res = await fetch(url, {cache:'force-cache', signal:controller.signal, headers:{'Accept':'application/json'}});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }finally{ clearTimeout(timer); }
  }

  async function mapLimit(items, limit, fn){
    const output=[];
    let index=0;
    const workers=Array.from({length:Math.min(limit,items.length)}, async()=>{
      while(true){
        const i=index++;
        if(i>=items.length) return;
        try{ output[i]=await fn(items[i],i); }catch(_){ output[i]=null; }
      }
    });
    await Promise.all(workers);
    return output;
  }

  function readCatalogCache(lang){
    try{
      const raw=localStorage.getItem(`${ONLINE_CACHE_PREFIX}${lang}`);
      if(!raw) return null;
      const obj=JSON.parse(raw);
      if(!obj || !Array.isArray(obj.cards) || Date.now()-Number(obj.savedAt||0)>ONLINE_CACHE_TTL) return null;
      return obj.cards;
    }catch(_){ return null; }
  }

  function writeCatalogCache(lang,cards){
    try{
      localStorage.setItem(`${ONLINE_CACHE_PREFIX}${lang}`, JSON.stringify({savedAt:Date.now(),cards}));
    }catch(_){ }
  }

  function makeOnlineCard(card,setKey,lang,enNameById,sourceSetName){
    if(!card || !card.id) return null;
    const englishName = lang === 'JP' ? (enNameById?.get(card.id) || '') : '';
    const localizedName = String(card.name || '').trim();
    const name = englishName || localizedName;
    if(!name) return null;
    const def=setInfo?.[setKey] || {};
    const jp = lang === 'JP';
    const number = jp ? '' : String(card.localId || '').trim();
    const aliases=[];
    if(jp && localizedName && normalize(localizedName)!==normalize(name)) aliases.push(localizedName);
    return {
      key:`online|${lang.toLowerCase()}|${setKey}|${card.id}`,
      name,
      number,
      set:setKey,
      set_name:def.label || sourceSetName || setKey,
      source_set_name:sourceSetName || '',
      code:def.code || '',
      language:lang,
      rarity:'',
      url:'',
      query:[name,def.code && number ? `${def.code}${number}` : number].filter(Boolean).join(' '),
      aliases,
      verified:false,
      direct:false,
      source:'tcgdex',
      source_id:card.id
    };
  }

  async function fetchSetVariant(lang,setKey,setId,enNameById){
    try{
      const setData=await fetchJson(`${TCGDEX_API}/${lang.toLowerCase()==='jp'?'ja':'en'}/sets/${encodeURIComponent(setId)}`);
      const rows=Array.isArray(setData?.cards) ? setData.cards : [];
      return rows.map(c=>makeOnlineCard(c,setKey,lang,enNameById,setData?.name)).filter(Boolean);
    }catch(_){ return []; }
  }

  async function loadOnlineLanguage(lang){
    const stateKey = lang === 'JP' ? 'jpCatalogState' : 'enCatalogState';
    if((lang === 'JP' ? jpCatalogState : enCatalogState) === 'loading' || (lang === 'JP' ? jpCatalogState : enCatalogState) === 'ready') return;
    if(lang === 'JP') jpCatalogState='loading'; else enCatalogState='loading';

    const cached=readCatalogCache(lang);
    if(cached?.length){
      remoteCatalog = remoteCatalog.filter(c=>c.language!==lang).concat(cached);
      rebuildCatalog();
      if(lang === 'JP') jpCatalogState='ready'; else enCatalogState='ready';
      if(quickInput?.value.trim()) renderSuggestions(quickInput.value);
      return;
    }

    const jobs=[];
    Object.entries(TCGDEX_SET_IDS).forEach(([setKey,ids])=>ids.forEach(setId=>jobs.push({setKey,setId})));

    // English is fetched first. Japanese uses the English IDs/names as aliases wherever TCGdex shares IDs.
    let enNameById = new Map();
    if(lang === 'JP'){
      const enCards=remoteCatalog.filter(c=>c.language==='EN' && c.source_id);
      enNameById = new Map(enCards.map(c=>[c.source_id,c.name]));
    }

    const chunks=await mapLimit(jobs,6,job=>fetchSetVariant(lang,job.setKey,job.setId,enNameById));
    const cards=chunks.flat().filter(Boolean);
    remoteCatalog = remoteCatalog.filter(c=>c.language!==lang).concat(cards);
    writeCatalogCache(lang,cards);
    rebuildCatalog();
    if(lang === 'JP') jpCatalogState = cards.length ? 'ready' : 'failed';
    else enCatalogState = cards.length ? 'ready' : 'failed';
    if(quickInput?.value.trim()) renderSuggestions(quickInput.value);
    if(cards.length) showToast(`${lang}: ${cards.length} extra zoekkaarten geladen`);
  }

  async function loadCatalog(){
    try{
      const res = await fetch(`cards.json?build=${SEARCH_BUILD}`, {cache:'no-store'});
      if(!res.ok) return;
      const data = await res.json();
      localCatalog = Array.isArray(data.knownCards) ? data.knownCards : [];
      setInfo = data.sets || {};
      rebuildCatalog();

      // EN first for fastest English-name search. JP then fills quietly in the background.
      loadOnlineLanguage('EN').finally(()=>{
        const startJP=()=>loadOnlineLanguage('JP');
        if('requestIdleCallback' in window) requestIdleCallback(startJP,{timeout:1800});
        else setTimeout(startJP,700);
      });
    }catch(_){ }
  }

  navButtons.forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab, true)));
  window.addEventListener('hashchange', () => setTab(location.hash.replace('#','') || 'search', false));
  $('brandHomeBtn')?.addEventListener('click', () => setTab('search', true));
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
  resultEditBtn?.addEventListener('click', () => { closeResult(false); setTab('search', true); });
  resultBadBtn?.addEventListener('click', () => {
    const mark = ocrResult?.querySelector('#debugMarkBad');
    if(mark && !mark.disabled){ mark.click(); showToast('Foute scan opgeslagen in debuglog'); }
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
  resultOpenBtn?.addEventListener('click', () => { if(resultOpenBtn.classList.contains('disabled')) showToast('Nog geen zekere Cardmarket-link'); });

  // v134: Cardmarket is ONE CLICK. The legacy hidden openBtn remains only as the link engine.
  const makeBtnDirect = $('makeBtn');
  makeBtnDirect?.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopImmediatePropagation();
    try{
      if(quickInput?.value.trim() && typeof parseQuick === 'function') parseQuick();
      if(typeof updateCustomSelects === 'function') updateCustomSelects();
      if(typeof makeLink === 'function') makeLink(false);
      const href = openBtn?.getAttribute('href') || '';
      if(!href || href === '#' || openBtn?.classList.contains('disabled')){ showToast('Kies eerst een kaart of vul naam/nummer in'); return; }
      const w = window.open(href, '_blank', 'noopener');
      if(!w){ window.location.href = href; }
    }catch(_){ showToast('Cardmarket-link kon niet worden geopend'); }
  }, {capture:true});

  stampedSetChips?.querySelectorAll('[data-stamped-set]').forEach(btn=>btn.addEventListener('click',()=>{
    const setKey=btn.dataset.stampedSet;
    const def=setInfo?.[setKey] || {};
    const label=def.label || setKey;
    setStampedMode(true,false);
    quickInput.value = `${label} stamp`;
    syncStampedSetChips();
    renderSuggestions(quickInput.value);
    quickInput.focus({preventScroll:true});
  }));

  stampedToggle?.addEventListener('click', () => setStampedMode(!stampedToggleOn));
  quickInput?.addEventListener('input', () => {
    const typedStamp=normalize(quickInput.value).split(' ').some(t=>STAMP_TERMS.has(t));
    if(typedStamp && !stampedToggleOn) setStampedMode(true,false);
    syncStampedSetChips();
    renderSuggestions(quickInput.value);
  });
  quickInput?.addEventListener('focus', () => renderSuggestions(quickInput.value));
  smartSuggestions?.addEventListener('scroll', () => {
    if(smartSuggestions.scrollTop + smartSuggestions.clientHeight >= smartSuggestions.scrollHeight - 180) appendSuggestionBatch();
  }, {passive:true});
  document.addEventListener('pointerdown', e => {
    if(!smartSuggestions || smartSuggestions.hidden) return;
    const inSearch = quickInput?.closest('.searchBox')?.contains(e.target);
    if(!inSearch && !smartSuggestions.contains(e.target)) hideSuggestions();
  });

  [langSelect,condSelect,editionSelect].filter(Boolean).forEach(el => el.addEventListener('change', () => {
    savePrefs(); syncPrefs();
    if(el === langSelect){
      if(langSelect.value === 'JP') loadOnlineLanguage('JP');
      if(quickInput?.value.trim()) renderSuggestions(quickInput.value);
    }
    setTimeout(() => { syncResultSheet(); syncDock(); },0);
  }));
  document.querySelectorAll('.choiceBtn').forEach(btn => btn.addEventListener('click', () => setTimeout(syncPrefs,0)));

  if(status) new MutationObserver(statusChanged).observe(status,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
  if(ocrResult) new MutationObserver(scanResultChanged).observe(ocrResult,{attributes:true,attributeFilter:['hidden']});
  if(ocrProgressText) new MutationObserver(mirrorProgress).observe(ocrProgressText,{childList:true,subtree:true,characterData:true});
  if(ocrProgressFill) new MutationObserver(mirrorProgress).observe(ocrProgressFill,{attributes:true,attributeFilter:['style']});
  if(openBtn) new MutationObserver(() => { syncResultSheet(); syncDock(); }).observe(openBtn,{attributes:true,attributeFilter:['href','class']});

  restorePrefs();
  loadCatalog();
  syncPrefs();
  setTab((location.hash || '#search').slice(1), false);
  // Keep technical CORE3 version out of normal UI while leaving the engine untouched.
  if(status){ status.textContent='Klaar'; status.className='status ok'; }
})();
