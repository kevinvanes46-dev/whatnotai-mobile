'use strict';

let DATA = { pokedex: {}, knownCards: [] };
let lastBuilt = null;
const APP_VERSION = 'v48';

const $ = (id) => document.getElementById(id);
const quickInput = $('quickInput');
const quickGo = $('quickGo');
const numberInput = $('numberInput');
const nameInput = $('nameInput');
const setSelect = $('setSelect');
const langSelect = $('langSelect');
const condSelect = $('condSelect');
const makeBtn = $('makeBtn');
const favoriteBtn = $('favoriteBtn');
const copyBtn = $('copyBtn');
const clearBtn = $('clearBtn');
const clearRecentBtn = $('clearRecentBtn');
const clearFavBtn = $('clearFavBtn');
const openBtn = $('openBtn');
const urlBox = $('urlBox');
const statusBox = $('status');
const matchBox = $('matchBox');
const recentList = $('recentList');
const favoriteList = $('favoriteList');

const STORAGE_RECENT = 'whatnotai_mobile_recent_v37'; // keep v37 key so saved items stay
const STORAGE_FAV = 'whatnotai_mobile_favorites_v37'; // keep v37 key so favorites stay
const MAX_RECENT = 10;
const MAX_FAV = 40;

const CONDITION_IDS = { NM: '2', EX: '3', GD: '4', PL: '6' };
const LANGUAGE_IDS = { EN: '1', JP: '7' };

const SET_ALIASES = [
  ['EX CRYSTAL GUARDIANS', ['ex crystal guardians','crystal guardians','crystal','cg']],
  ['EX DELTA SPECIES', ['ex delta species','delta species','ex delta','delta','ds']],
  ['GYM CHALLENGE', ['gym challenge','challenge']],
  ['GYM HEROES', ['gym heroes','heroes']],
  ['NEO REVELATION', ['neo revelation','neo rev','revelation','neo 3']],
  ['NEO DISCOVERY', ['neo discovery','neo disc','discovery','neo 2']],
  ['NEO GENESIS', ['neo genesis','genesis','neo 1']],
  ['NEO DESTINY', ['neo destiny','destiny','neo 4']],
  ['ROCKET', ['team rocket','rocket','rocket gang','tr']],
  ['SOUTHERN ISLANDS', ['southern islands','southern','si']],
  ['WOTC PROMO', ['wotc promo','wizards black star','black star','promo','basep']],
  ['EXPEDITION', ['expedition','ecard','ecard1']],
  ['AQUAPOLIS', ['aquapolis','ecard2']],
  ['SKYRIDGE', ['skyridge','ecard3']],
  ['JUNGLE', ['jungle','ju']],
  ['FOSSIL', ['fossil','fossile','fo']],
  ['BASE', ['base set','base','expansion pack','expansion']],
];

const WESTERN = {
  'BASE': {dir:'Base-Set', code:'BS'},
  'JUNGLE': {dir:'Jungle', code:'JU'},
  'FOSSIL': {dir:'Fossil', code:'FO'},
  'ROCKET': {dir:'Team-Rocket', code:'TR'},
  'GYM HEROES': {dir:'Gym-Heroes', code:'G1'},
  'GYM CHALLENGE': {dir:'Gym-Challenge', code:'G2'},
  'NEO GENESIS': {dir:'Neo-Genesis', code:'N1'},
  'NEO DISCOVERY': {dir:'Neo-Discovery', code:'N2'},
  'NEO REVELATION': {dir:'Neo-Revelation', code:'NR'},
  'NEO DESTINY': {dir:'Neo-Destiny', code:'N4'},
  'SOUTHERN ISLANDS': {dir:'Southern-Islands', code:'SI'},
  'WOTC PROMO': {dir:'Wizards-Black-Star-Promos', code:'WP'},
  'EXPEDITION': {dir:'Expedition-Base-Set', code:'EX'},
  'AQUAPOLIS': {dir:'Aquapolis', code:'AQ'},
  'SKYRIDGE': {dir:'Skyridge', code:'SK'},
  'EX DELTA SPECIES': {dir:'EX-Delta-Species', code:'DS'},
  'EX CRYSTAL GUARDIANS': {dir:'EX-Crystal-Guardians', code:'CG'},
};

const JAPANESE = {
  'BASE': {dir:'Expansion-Pack', suffix:''},
  'JUNGLE': {dir:'Pokemon-Jungle', suffix:''},
  'FOSSIL': {dir:'Mystery-of-the-Fossils', suffix:''},
  'GYM HEROES': {dir:'Leaders-Stadium', suffix:''},
  'GYM CHALLENGE': {dir:'Challenge-from-the-Darkness', suffix:''},
  'NEO GENESIS': {dir:'Gold-Silver-to-a-New-World', suffix:''},
  'NEO DISCOVERY': {dir:'Crossing-the-Ruins', suffix:''},
  'NEO REVELATION': {dir:'Awakening-Legends', suffix:'AL'},
  'NEO DESTINY': {dir:'Darkness-and-to-Light', suffix:''},
  'SOUTHERN ISLANDS': {dir:'Southern-Islands-JP', suffix:''},
};

function setStatus(text, type=''){
  statusBox.textContent = text;
  statusBox.className = 'status ' + (type || '');
}
function cleanNumber(n){ return String(n || '').trim().replace(/^0+(?=\d)/,'').split('/')[0]; }
function pad3(n){ const raw = String(n || '').trim().split('/')[0]; return raw.padStart(3,'0'); }
function normalizeName(s){ return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
function slugifyName(s){
  return String(s || '').trim()
    .replace(/&/g,'and')
    .replace(/[’']/g,'')
    .replace(/[^A-Za-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .replace(/-+/g,'-');
}
function titleCasePokemon(s){
  if(!s) return '';
  const specials = {
    'mr mime':'Mr. Mime', 'farfetchd':"Farfetch'd", 'nidoran female':'Nidoran Female',
    'nidoran male':'Nidoran Male', 'ho oh':'Ho-Oh', 'porygon z':'Porygon-Z'
  };
  const key = normalizeName(s);
  if(specials[key]) return specials[key];
  return String(s).split(' ').map(w => w ? w[0].toUpperCase()+w.slice(1).toLowerCase() : '').join(' ').replace(/\bEx\b/g,'ex');
}

function readStore(key){
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch(e) { return []; }
}
function writeStore(key, arr){
  try { localStorage.setItem(key, JSON.stringify(arr)); return true; }
  catch(e) { setStatus('Opslaan lokaal geblokkeerd door browser.', 'warn'); return false; }
}

function detectSet(text){
  const lower = ' ' + String(text).toLowerCase().replace(/\s+/g,' ') + ' ';
  for (const [set, aliases] of SET_ALIASES){
    for (const a of aliases){ if (lower.includes(' '+a+' ')) return set; }
  }
  return 'AUTO';
}
function removeSetWords(text){
  let out = ' ' + String(text).toLowerCase().replace(/\s+/g,' ') + ' ';
  const aliases = SET_ALIASES.flatMap(([, arr]) => arr).sort((a,b)=>b.length-a.length);
  for (const a of aliases){ out = out.replaceAll(' '+a+' ', ' '); }
  return out.trim();
}

function parseQuick(){
  const text = quickInput.value.trim();
  if(!text) return false;
  const lower = text.toLowerCase();
  const langExplicit = /\b(jp|jpn|japanese|japans|en|eng|english)\b/.test(lower);
  let lang = /\b(jp|jpn|japanese|japans)\b/.test(lower) ? 'JP' : (/\b(en|eng|english)\b/.test(lower) ? 'EN' : langSelect.value);
  let cond = condSelect.value || 'NM';
  const cm = lower.match(/\b(nm|gd|pl)\b|\bex\b(?!\s*delta)/);
  if(cm) cond = cm[1].toUpperCase();
  const set = detectSet(text);
  if(set === 'EX DELTA SPECIES' && !langExplicit) lang = 'EN';

  const cleaned = removeSetWords(text)
    .replace(/\b(jp|jpn|japanese|japans|en|eng|english|nm|ex|gd|pl)\b/gi,' ')
    .replace(/\s+/g,' ')
    .trim();
  const tokens = cleaned.split(' ').filter(Boolean);
  let number = '';
  const nameParts = [];
  for (const t of tokens){
    if(!number && /^\d{1,3}(\/\d{1,3})?$/.test(t)) number = cleanNumber(t);
    else nameParts.push(t);
  }
  let name = nameParts.join(' ').trim();
  if(!name && lang === 'JP' && number){
    const dex = DATA.pokedex[pad3(number)];
    if(dex) name = dex;
  }
  numberInput.value = number;
  nameInput.value = titleCasePokemon(name);
  setSelect.value = set;
  langSelect.value = lang;
  condSelect.value = cond;
  updateCustomSelects();
  return true;
}


const AUTO_VALUE_DIRECTS = {
  'EN|shining gyarados|65': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Shining-Gyarados-NR65', set:'NEO REVELATION', name:'Shining Gyarados', note:'AUTO shortcut: Neo Revelation NR65'},
  'EN|shining magikarp|66': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Shining-Magikarp-NR66', set:'NEO REVELATION', name:'Shining Magikarp', note:'AUTO shortcut: Neo Revelation NR66'},
  'EN|lugia|9': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Lugia-NG9', set:'NEO GENESIS', name:'Lugia', note:'AUTO shortcut: Neo Genesis NG9'},
  'EN|shining charizard|107': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Charizard-NDE107', set:'NEO DESTINY', name:'Shining Charizard', note:'AUTO shortcut: Neo Destiny NDE107'},
  'EN|shining celebi|106': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Celebi-NDE106', set:'NEO DESTINY', name:'Shining Celebi', note:'AUTO shortcut: Neo Destiny NDE106'},
  'EN|shining kabutops|108': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Kabutops-NDE108', set:'NEO DESTINY', name:'Shining Kabutops', note:'AUTO shortcut: Neo Destiny NDE108'},
  'EN|shining raichu|111': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Raichu-NDE111', set:'NEO DESTINY', name:'Shining Raichu', note:'AUTO shortcut: Neo Destiny NDE111'},
  'EN|shining tyranitar|113': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Tyranitar-NDE113', set:'NEO DESTINY', name:'Shining Tyranitar', note:'AUTO shortcut: Neo Destiny NDE113'},
  'JP|lugia|249': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Gold-Silver-to-a-New-World/Lugia-GSNW', set:'NEO GENESIS', name:'Lugia', note:'JP AUTO shortcut: Gold/Silver/New World'},
  'JP|shining gyarados|130': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Awakening-Legends/Shining-Gyarados-AL', set:'NEO REVELATION', name:'Shining Gyarados', note:'JP AUTO shortcut: Awakening Legends'},
  'JP|shining magikarp|129': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Awakening-Legends/Shining-Magikarp-AL', set:'NEO REVELATION', name:'Shining Magikarp', note:'JP AUTO shortcut: Awakening Legends'},
  'JP|shining charizard|6': {url:'https://www.cardmarket.com/en/Pokemon/Products/Singles/Darkness-and-to-Light/Shining-Charizard-DL', set:'NEO DESTINY', name:'Shining Charizard', note:'JP AUTO shortcut: Darkness and to Light'},
};

function autoValueDirect(lang, number, name, cond){
  const n = cleanNumber(number);
  const nm = normalizeName(name);
  const key = `${lang}|${nm}|${n}`;
  const item = AUTO_VALUE_DIRECTS[key];
  if(!item) return null;
  return {
    url: withFilters(item.url, lang, cond),
    exact: true,
    note: item.note,
    autoSet: item.set,
    autoName: item.name
  };
}

function knownLookup(lang,set,number,name){
  const n = cleanNumber(number);
  const nm = normalizeName(name);
  const keyNum = lang === 'JP' ? pad3(n) : n;
  const key = `${lang.toLowerCase()}|${set.toLowerCase()}|${keyNum}|${nm}`;
  return (DATA.knownCards || []).find(c => c.key === key);
}
function findAutoKnown(lang, number, name){
  const n = cleanNumber(number);
  const nm = normalizeName(name);
  return (DATA.knownCards || []).find(c => normalizeName(c.name) === nm && c.language === lang && (cleanNumber(c.number) === n || pad3(c.number) === pad3(n)));
}
function withFilters(url, lang, cond){
  const params = [];
  if(CONDITION_IDS[cond]) params.push(`minCondition=${CONDITION_IDS[cond]}`);
  if(LANGUAGE_IDS[lang]) params.push(`language=${LANGUAGE_IDS[lang]}`);
  if(!params.length) return url;
  return url + (url.includes('?') ? '&' : '?') + params.join('&');
}
function searchUrl(name, number, lang, cond){
  const q = encodeURIComponent([name, number].filter(Boolean).join(' ') || 'pokemon');
  return withFilters(`https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${q}`, lang, cond);
}

function buildUrl(){
  const lang = langSelect.value;
  const set = setSelect.value;
  const number = cleanNumber(numberInput.value);
  let name = nameInput.value.trim();
  const cond = condSelect.value;
  if(!name && lang === 'JP' && number){
    const dex = DATA.pokedex[pad3(number)];
    if(dex){ name = dex; nameInput.value = dex; }
  }
  if(!name) return {url:'', exact:false, note:'Geen naam ingevuld.'};

  if(set === 'AUTO'){
    const autoDirect = autoValueDirect(lang, number, name, cond);
    if(autoDirect){
      if(autoDirect.autoSet) setSelect.value = autoDirect.autoSet;
      if(autoDirect.autoName) nameInput.value = autoDirect.autoName;
      updateCustomSelects();
      return autoDirect;
    }
    const exact = findAutoKnown(lang, number, name);
    if(exact) return {url:withFilters(exact.url, lang, cond), exact:true, note:`Exact via database: ${exact.set} / ${exact.name}`};
    return {url:searchUrl(name, number, lang, cond), exact:false, note:'Geen set gekozen: zoekpagina.'};
  }

  // v41 special correction: "delta charizard 4" is EX Crystal Guardians CG4, not EX Delta Species DS4.
  if(lang === 'EN' && (set === 'EX DELTA SPECIES' || set === 'EX CRYSTAL GUARDIANS') && cleanNumber(number) === '4' && normalizeName(name) === 'charizard'){
    const url = withFilters('https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Crystal-Guardians/Charizard-Delta-Species-CG4', lang, cond);
    return {url, exact:true, note:'Special: Delta Charizard #4 = EX Crystal Guardians / CG4'};
  }

  const known = knownLookup(lang,set,number,name);
  if(known) return {url:withFilters(known.url, lang, cond), exact:true, note:`Exacte match: ${known.set} / ${known.name}`};

  const slugName = slugifyName(name);
  if(lang === 'JP' && JAPANESE[set]){
    const info = JAPANESE[set];
    const suffix = info.suffix ? '-' + info.suffix : '';
    return {url:withFilters(`https://www.cardmarket.com/en/Pokemon/Products/Singles/${info.dir}/${slugName}${suffix}`, lang, cond), exact:true, note:`JP route: ${info.dir}`};
  }
  if(WESTERN[set]){
    const info = WESTERN[set];
    const ending = number ? '-' + info.code + number : '';
    return {url:withFilters(`https://www.cardmarket.com/en/Pokemon/Products/Singles/${info.dir}/${slugName}${ending}`, lang, cond), exact:true, note:`EN route: ${info.dir}`};
  }
  return {url:searchUrl(name, number, lang, cond), exact:false, note:'Fallback zoekpagina.'};
}

async function copyToClipboard(text){
  try { await navigator.clipboard.writeText(text); return true; }
  catch(e) { urlBox.focus(); urlBox.select(); return false; }
}

function currentQuickText(){
  const typed = quickInput.value.trim();
  if(typed) return typed;
  return `${langSelect.value.toLowerCase()} ${setSelect.value.toLowerCase()} ${numberInput.value} ${nameInput.value} ${condSelect.value.toLowerCase()}`.replace(/\s+/g,' ').trim();
}
function itemFromCurrent(url, result){
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    quick: currentQuickText(),
    url,
    name: nameInput.value.trim(),
    number: numberInput.value.trim(),
    set: setSelect.value,
    lang: langSelect.value,
    cond: condSelect.value,
    exact: !!result.exact,
    note: result.note || ''
  };
}
function sameItem(a,b){
  return (a.quick || '').toLowerCase() === (b.quick || '').toLowerCase() || (a.url && b.url && a.url === b.url);
}
function addRecent(item){
  let arr = readStore(STORAGE_RECENT).filter(x => !sameItem(x,item));
  arr.unshift(item);
  arr = arr.slice(0, MAX_RECENT);
  writeStore(STORAGE_RECENT, arr);
  renderSaved();
}
function addFavorite(){
  if(!lastBuilt || !lastBuilt.url){ setStatus('Maak eerst een link.', 'warn'); return; }
  const item = itemFromCurrent(lastBuilt.url, lastBuilt.result);
  let arr = readStore(STORAGE_FAV).filter(x => !sameItem(x,item));
  arr.unshift(item);
  arr = arr.slice(0, MAX_FAV);
  writeStore(STORAGE_FAV, arr);
  renderSaved();
  setStatus('Favoriet opgeslagen ✅', 'ok');
}

async function makeLink(autoCopy=true){
  const r = buildUrl();
  if(!r.url){
    urlBox.value = '';
    openBtn.href = '#';
    openBtn.classList.add('disabled');
    matchBox.innerHTML = '';
    lastBuilt = null;
    setStatus(r.note || 'Geen link.', 'warn');
    return;
  }
  urlBox.value = r.url;
  openBtn.href = r.url;
  openBtn.classList.remove('disabled');
  matchBox.innerHTML = `<b>${r.exact ? 'Directe kaartpagina' : 'Zoekpagina'}</b><br>${r.note}<br>${nameInput.value || '-'} · ${numberInput.value || '-'} · ${setSelect.value} · ${langSelect.value}/${condSelect.value}`;
  lastBuilt = {url:r.url, result:r};
  addRecent(itemFromCurrent(r.url, r));
  if(autoCopy){
    const ok = await copyToClipboard(r.url);
    setStatus(ok ? 'Link gemaakt en gekopieerd.' : 'Link gemaakt. Kopieer handmatig.', ok ? 'ok' : 'warn');
  } else {
    setStatus('Link gemaakt.', 'ok');
  }
}

function applyItem(item, make=true){
  quickInput.value = item.quick || '';
  numberInput.value = item.number || '';
  nameInput.value = item.name || '';
  setSelect.value = item.set || 'AUTO';
  langSelect.value = item.lang || 'JP';
  condSelect.value = item.cond || 'NM';
  updateCustomSelects();
  if(make) makeLink(true);
}
function deleteItem(key, id){
  const arr = readStore(key).filter(x => x.id !== id);
  writeStore(key, arr);
  renderSaved();
}
function renderList(el, key){
  const arr = readStore(key);
  if(!arr.length){
    el.className = 'savedList empty';
    el.textContent = key === STORAGE_RECENT ? 'Nog geen recente zoekopdrachten.' : 'Nog geen favorieten.';
    return;
  }
  el.className = 'savedList';
  el.innerHTML = '';
  arr.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `<div class="itemMain"><div class="itemTitle"></div><div class="itemMeta"></div></div><div class="itemActions"><button type="button" class="useBtn">Gebruik</button><a class="openMini" target="_blank" rel="noopener">Open</a><button type="button" class="delBtn">×</button></div>`;
    div.querySelector('.itemTitle').textContent = `${item.name || '-'} ${item.number ? '('+item.number+')' : ''}`;
    div.querySelector('.itemMeta').textContent = `${item.set || 'AUTO'} · ${item.lang}/${item.cond} · ${item.exact ? 'direct' : 'search'}`;
    div.querySelector('.useBtn').addEventListener('click', () => applyItem(item, true));
    div.querySelector('.openMini').href = item.url || '#';
    div.querySelector('.delBtn').addEventListener('click', () => deleteItem(key, item.id));
    el.appendChild(div);
  });
}
function renderSaved(){ renderList(recentList, STORAGE_RECENT); renderList(favoriteList, STORAGE_FAV); }
function clearAll(){
  quickInput.value=''; numberInput.value=''; nameInput.value=''; setSelect.value='AUTO'; langSelect.value='JP'; condSelect.value='NM';
  updateCustomSelects();
  urlBox.value=''; openBtn.href='#'; openBtn.classList.add('disabled'); matchBox.innerHTML=''; lastBuilt=null;
  setStatus('Klaar.',''); quickInput.focus();
}
function processQuick(){
  if(quickInput.value.trim()) parseQuick();
  updateCustomSelects();
  makeLink(true);
}


function choiceTitle(select){
  if(select.id === 'setSelect') return 'Set kiezen';
  if(select.id === 'langSelect') return 'Taal kiezen';
  if(select.id === 'condSelect') return 'Staat kiezen';
  return 'Kiezen';
}

function closeCustomSelects(){
  const overlay = document.getElementById('choiceOverlay');
  if(overlay) overlay.classList.remove('show');
  document.documentElement.classList.remove('sheetOpen');
  document.body.classList.remove('sheetOpen');
}

function updateCustomSelects(){
  document.querySelectorAll('select').forEach(select => {
    if(select._customButton) {
      select._customButton.textContent = select.value || (select.options[select.selectedIndex]?.textContent || '');
    }
  });
}

function openChoiceSheet(select){
  let overlay = document.getElementById('choiceOverlay');
  if(!overlay) return;

  const title = overlay.querySelector('.choiceTitle');
  const options = overlay.querySelector('.choiceOptions');

  title.textContent = choiceTitle(select);
  options.innerHTML = '';

  let startX = 0;
  let startY = 0;
  let didScroll = false;

  Array.from(select.options).forEach(opt => {
    const value = opt.value || opt.textContent;
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'choiceOption' + (value === select.value ? ' active' : '');
    item.textContent = opt.textContent;

    item.addEventListener('touchstart', (ev) => {
      const t = ev.touches && ev.touches[0];
      if(!t) return;
      startX = t.clientX;
      startY = t.clientY;
      didScroll = false;
    }, {passive:true});

    item.addEventListener('touchmove', (ev) => {
      const t = ev.touches && ev.touches[0];
      if(!t) return;
      if(Math.abs(t.clientY - startY) > 9 || Math.abs(t.clientX - startX) > 9) {
        didScroll = true;
      }
    }, {passive:true});

    item.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if(didScroll) return;
      select.value = value;
      updateCustomSelects();
      closeCustomSelects();
      select.dispatchEvent(new Event('change', {bubbles:true}));
    });
    options.appendChild(item);
  });

  document.documentElement.classList.add('sheetOpen');
  document.body.classList.add('sheetOpen');
  overlay.classList.add('show');
}

function initCustomSelects(){
  if(!document.getElementById('choiceOverlay')){
    const overlay = document.createElement('div');
    overlay.id = 'choiceOverlay';
    overlay.className = 'choiceOverlay';
    overlay.innerHTML = `
      <div class="choiceSheet" role="dialog" aria-modal="true">
        <div class="choiceHeader">
          <strong class="choiceTitle">Kiezen</strong>
          <button type="button" class="choiceClose" aria-label="Sluiten">×</button>
        </div>
        <div class="choiceOptions"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('touchmove', (ev) => {
      if(!ev.target.closest('.choiceOptions')) ev.preventDefault();
    }, {passive:false});

    overlay.addEventListener('click', (ev) => {
      if(ev.target === overlay) closeCustomSelects();
    });
    overlay.querySelector('.choiceClose').addEventListener('click', closeCustomSelects);
    document.addEventListener('keydown', ev => { if(ev.key === 'Escape') closeCustomSelects(); });
  }

  document.querySelectorAll('select').forEach(select => {
    if(select._customReady) return;
    select._customReady = true;
    select.classList.add('nativeSelectHidden');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'customSelectBtn sheetSelectBtn';
    btn.textContent = select.value || (select.options[select.selectedIndex]?.textContent || '');
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      openChoiceSheet(select);
    });

    select.insertAdjacentElement('afterend', btn);
    select._customButton = btn;
  });

  updateCustomSelects();
}

function bind(){
  document.querySelectorAll('[data-fill]').forEach(b => b.addEventListener('click', () => { quickInput.value = b.dataset.fill; processQuick(); }));
  quickInput.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); processQuick(); }});
  quickGo.addEventListener('click', processQuick);
  makeBtn.addEventListener('click', processQuick);
  copyBtn.addEventListener('click', () => makeLink(true));
  favoriteBtn.addEventListener('click', addFavorite);
  clearBtn.addEventListener('click', clearAll);
  clearRecentBtn.addEventListener('click', () => { writeStore(STORAGE_RECENT, []); renderSaved(); setStatus('Recent gewist.', ''); });
  clearFavBtn.addEventListener('click', () => { writeStore(STORAGE_FAV, []); renderSaved(); setStatus('Favorieten gewist.', ''); });
  [numberInput,nameInput].forEach(el => el.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); makeLink(true); }}));
  [setSelect,langSelect,condSelect].forEach(el => el.addEventListener('change', () => makeLink(true)));
}

async function unregisterOldServiceWorkers(){
  if(!('serviceWorker' in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('whatnotai-mobile')).map(k => caches.delete(k)));
  } catch(e) {}
}

initCustomSelects();
bind();
renderSaved();
setStatus('Data laden...', 'warn');
fetch('data/cards.json?v=48')
  .then(r => r.json())
  .then(j => { DATA = j; setStatus('Klaar.', ''); renderSaved(); })
  .catch(() => { setStatus('Data niet geladen; basis werkt nog wel.', 'warn'); renderSaved(); });
unregisterOldServiceWorkers();
