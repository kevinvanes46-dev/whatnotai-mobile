let DATA = { pokedex: {}, knownCards: [] };
let lastBuilt = null;

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

const STORAGE_RECENT = 'whatnotai_mobile_recent_v36';
const STORAGE_FAV = 'whatnotai_mobile_favorites_v36';
const MAX_RECENT = 10;
const MAX_FAV = 30;

const CONDITION_IDS = { NM: '2', EX: '3', GD: '4', PL: '6' };
const LANGUAGE_IDS = { EN: '1', JP: '7' };

const SET_ALIASES = [
  ['EX DELTA SPECIES', ['ex delta species','delta species','delta','ds']],
  ['GYM CHALLENGE', ['gym challenge','challenge']],
  ['GYM HEROES', ['gym heroes','heroes']],
  ['NEO REVELATION', ['neo revelation','neo rev','revelation','neo 3']],
  ['NEO DISCOVERY', ['neo discovery','neo disc','discovery','neo 2']],
  ['NEO GENESIS', ['neo genesis','genesis','neo 1']],
  ['NEO DESTINY', ['neo destiny','destiny','neo 4']],
  ['ROCKET', ['team rocket','rocket','tr']],
  ['JUNGLE', ['jungle','ju']],
  ['FOSSIL', ['fossil','fo','fossile']],
  ['BASE', ['base set','base','expansion pack','expansion']],
];

const WESTERN = {
  'BASE': {dir:'Base-Set', code:'BS'}, 'JUNGLE': {dir:'Jungle', code:'JU'},
  'FOSSIL': {dir:'Fossil', code:'FO'}, 'ROCKET': {dir:'Team-Rocket', code:'TR'},
  'GYM HEROES': {dir:'Gym-Heroes', code:'G1'}, 'GYM CHALLENGE': {dir:'Gym-Challenge', code:'G2'},
  'NEO GENESIS': {dir:'Neo-Genesis', code:'N1'}, 'NEO DISCOVERY': {dir:'Neo-Discovery', code:'N2'},
  'NEO REVELATION': {dir:'Neo-Revelation', code:'NR'}, 'NEO DESTINY': {dir:'Neo-Destiny', code:'N4'},
  'EX DELTA SPECIES': {dir:'EX-Delta-Species', code:'DS'},
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
};

function slugifyName(name){
  return (name || '').trim().replace(/[’']/g,'').replace(/♀/g,'Female').replace(/♂/g,'Male')
    .replace(/\./g,'').replace(/\s*:\s*/g,'-').replace(/\s+/g,'-').replace(/[^A-Za-z0-9\-]/g,'').replace(/-+/g,'-');
}
function cleanNumber(raw){
  const s = (raw || '').trim(); if(!s) return '';
  const m = s.match(/(\d{1,3})\s*(?:\/\s*\d{1,3})?/);
  return m ? String(parseInt(m[1],10)) : s;
}
function pad3(n){ const x = cleanNumber(n); return x ? x.padStart(3,'0') : ''; }
function normalizeName(s){ return (s || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
function setStatus(text, kind=''){ statusBox.className = 'status' + (kind ? ' '+kind : ''); statusBox.textContent = text; }
function readStore(key){ try{return JSON.parse(localStorage.getItem(key) || '[]')}catch{return []} }
function writeStore(key, arr){ localStorage.setItem(key, JSON.stringify(arr)); }

function detectSet(text){
  let lower = ' ' + text.toLowerCase().replace(/\s+/g,' ') + ' ';
  for (const [set, aliases] of SET_ALIASES){ for (const a of aliases){ if (lower.includes(' '+a+' ')) return set; } }
  return 'AUTO';
}
function removeSetWords(text){
  let out = ' ' + text.toLowerCase().replace(/\s+/g,' ') + ' ';
  for (const [, aliases] of SET_ALIASES){ [...aliases].sort((a,b)=>b.length-a.length).forEach(a => { out = out.replaceAll(' '+a+' ', ' '); }); }
  return out.trim();
}
function titleCasePokemon(s){
  if(!s) return '';
  const specials = {'mr mime':'Mr. Mime','farfetchd':"Farfetch'd",'nidoran female':'Nidoran Female','nidoran male':'Nidoran Male','ho oh':'Ho-Oh','porygon z':'Porygon-Z'};
  const key = normalizeName(s); if (specials[key]) return specials[key];
  return s.split(' ').map(w => w ? w[0].toUpperCase()+w.slice(1).toLowerCase() : '').join(' ').replace(/\bEx\b/g,'ex').replace(/\bLv\b/g,'LV');
}

function parseQuick(){
  let text = quickInput.value.trim(); if(!text) return false;
  let lower = text.toLowerCase();
  const langExplicit = lower.match(/\b(jp|jpn|japanese|japans|en|eng|english)\b/);
  let lang = lower.match(/\b(jp|jpn|japanese|japans)\b/) ? 'JP' : (lower.match(/\b(en|eng|english)\b/) ? 'EN' : langSelect.value);
  let cond = condSelect.value || 'NM';
  const cm = lower.match(/\b(nm|ex|gd|pl)\b/); if(cm) cond = cm[1].toUpperCase();
  let set = detectSet(text);
  if (set === 'EX DELTA SPECIES' && !langExplicit) lang = 'EN';

  let cleaned = removeSetWords(text).replace(/\b(jp|jpn|japanese|japans|en|eng|english|nm|ex|gd|pl)\b/gi,' ').replace(/\s+/g,' ').trim();
  const tokens = cleaned.split(' ').filter(Boolean);
  let number = ''; let nameParts = [];
  for (const t of tokens){ if(!number && /^\d{1,3}(\/\d{1,3})?$/.test(t)) number = cleanNumber(t); else nameParts.push(t); }
  let name = nameParts.join(' ').trim();
  if(!name && lang === 'JP' && number){ const dex = DATA.pokedex[pad3(number)]; if(dex) name = dex; }
  numberInput.value = number;
  nameInput.value = titleCasePokemon(name);
  setSelect.value = set;
  langSelect.value = lang;
  condSelect.value = cond;
  return true;
}

function knownLookup(lang,set,number,name){
  const n = cleanNumber(number); const nm = normalizeName(name);
  const key = `${lang.toLowerCase()}|${set.toLowerCase()}|${lang === 'JP' ? pad3(n) : n}|${nm}`;
  return DATA.knownCards.find(c => c.key === key);
}
function searchUrl(name, number, lang, cond){
  const parts = [name, number].filter(Boolean).join(' ');
  const q = encodeURIComponent(parts || 'pokemon');
  return withFilters(`https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${q}`, lang, cond);
}
function withFilters(url, lang, cond){
  const sep = url.includes('?') ? '&' : '?'; const params = [];
  if(CONDITION_IDS[cond]) params.push(`minCondition=${CONDITION_IDS[cond]}`);
  if(LANGUAGE_IDS[lang]) params.push(`language=${LANGUAGE_IDS[lang]}`);
  return params.length ? url + sep + params.join('&') : url;
}
function buildUrl(){
  let lang = langSelect.value; let set = setSelect.value; let number = cleanNumber(numberInput.value); let name = nameInput.value.trim(); let cond = condSelect.value;
  if(!name && lang === 'JP' && number){ const dex = DATA.pokedex[pad3(number)]; if(dex){name = dex; nameInput.value = dex;} }
  if(!name) return {url:'', exact:false, note:'Geen naam ingevuld.'};
  if(set === 'AUTO'){
    const exact = DATA.knownCards.find(c => normalizeName(c.name) === normalizeName(name) && (cleanNumber(c.number) === number || pad3(c.number) === pad3(number)) && c.language === lang);
    if(exact) return {url:withFilters(exact.url, lang, cond), exact:true, note:`Exact via database: ${exact.set} / ${exact.name}`};
    return {url:searchUrl(name, number, lang, cond), exact:false, note:'Geen set gekozen: zoekpagina.'};
  }
  const known = knownLookup(lang,set,number,name);
  if(known) return {url:withFilters(known.url, lang, cond), exact:true, note:`Exacte match: ${known.set} / ${known.name}`};
  const slugName = slugifyName(name);
  if(lang === 'JP' && JAPANESE[set]){ const info = JAPANESE[set]; const suffix = info.suffix ? '-' + info.suffix : ''; return {url:withFilters(`https://www.cardmarket.com/en/Pokemon/Products/Singles/${info.dir}/${slugName}${suffix}`, lang, cond), exact:true, note:`JP route: ${info.dir}`}; }
  if(WESTERN[set]){ const info = WESTERN[set]; const n = number ? cleanNumber(number) : ''; const ending = n ? '-' + info.code + n : ''; return {url:withFilters(`https://www.cardmarket.com/en/Pokemon/Products/Singles/${info.dir}/${slugName}${ending}`, lang, cond), exact:true, note:`EN route: ${info.dir}`}; }
  return {url:searchUrl(name, number, lang, cond), exact:false, note:'Fallback zoekpagina.'};
}
async function copyToClipboard(text){
  try{ await navigator.clipboard.writeText(text); return true; }
  catch(e){ urlBox.focus(); urlBox.select(); return false; }
}
function itemFromCurrent(url, result){
  const quick = quickInput.value.trim() || `${langSelect.value.toLowerCase()} ${setSelect.value.toLowerCase()} ${numberInput.value} ${nameInput.value} ${condSelect.value.toLowerCase()}`.replace(/\s+/g,' ').trim();
  return { id: Date.now(), quick, url, name:nameInput.value.trim(), number:numberInput.value.trim(), set:setSelect.value, lang:langSelect.value, cond:condSelect.value, exact:!!result.exact, note:result.note };
}
function addRecent(item){
  let arr = readStore(STORAGE_RECENT).filter(x => x.quick.toLowerCase() !== item.quick.toLowerCase());
  arr.unshift(item); arr = arr.slice(0, MAX_RECENT); writeStore(STORAGE_RECENT, arr); renderSaved();
}
function addFavorite(){
  if(!lastBuilt || !lastBuilt.url){ setStatus('Maak eerst een link.', 'warn'); return; }
  let item = itemFromCurrent(lastBuilt.url, lastBuilt.result);
  let arr = readStore(STORAGE_FAV).filter(x => x.quick.toLowerCase() !== item.quick.toLowerCase());
  arr.unshift(item); arr = arr.slice(0, MAX_FAV); writeStore(STORAGE_FAV, arr); renderSaved(); setStatus('Favoriet opgeslagen.', 'ok');
}
async function makeLink(autoCopy=true){
  const r = buildUrl();
  if(!r.url){ urlBox.value=''; openBtn.href='#'; openBtn.classList.add('disabled'); setStatus(r.note || 'Geen link.', 'warn'); matchBox.innerHTML=''; lastBuilt=null; return; }
  urlBox.value = r.url; openBtn.href = r.url; openBtn.classList.remove('disabled');
  matchBox.innerHTML = `<b>${r.exact ? 'Directe kaartpagina' : 'Zoekpagina'}</b><br>${r.note}<br>${nameInput.value || '-'} · ${numberInput.value || '-'} · ${setSelect.value} · ${langSelect.value}/${condSelect.value}`;
  lastBuilt = {url:r.url, result:r};
  addRecent(itemFromCurrent(r.url, r));
  if(autoCopy){ const ok = await copyToClipboard(r.url); setStatus(ok ? 'Link gemaakt en gekopieerd.' : 'Link gemaakt. Kopieer handmatig.', ok ? 'ok' : 'warn'); }
  else setStatus('Link gemaakt.', 'ok');
}
function applyItem(item, make=true){
  quickInput.value = item.quick || '';
  numberInput.value = item.number || '';
  nameInput.value = item.name || '';
  setSelect.value = item.set || 'AUTO';
  langSelect.value = item.lang || 'JP';
  condSelect.value = item.cond || 'NM';
  if(make) makeLink(true);
}
function deleteItem(key, id){
  let arr = readStore(key).filter(x => x.id !== id); writeStore(key, arr); renderSaved();
}
function renderList(el, key){
  const arr = readStore(key);
  if(!arr.length){ el.className='savedList empty'; el.textContent = key === STORAGE_RECENT ? 'Nog geen recente zoekopdrachten.' : 'Nog geen favorieten.'; return; }
  el.className='savedList'; el.innerHTML='';
  arr.forEach(item => {
    const div = document.createElement('div'); div.className='item';
    const title = `${item.name || '-'} ${item.number ? '('+item.number+')' : ''}`;
    div.innerHTML = `<div class="itemMain"><div class="itemTitle"></div><div class="itemMeta"></div></div><div class="itemActions"><button class="useBtn">Gebruik</button><a class="openMini" target="_blank" rel="noopener">Open</a><button class="delBtn">×</button></div>`;
    div.querySelector('.itemTitle').textContent = title;
    div.querySelector('.itemMeta').textContent = `${item.set || 'AUTO'} · ${item.lang}/${item.cond} · ${item.exact ? 'direct' : 'search'}`;
    div.querySelector('.useBtn').addEventListener('click', () => applyItem(item, true));
    div.querySelector('.openMini').href = item.url;
    div.querySelector('.delBtn').addEventListener('click', () => deleteItem(key, item.id));
    el.appendChild(div);
  });
}
function renderSaved(){ renderList(recentList, STORAGE_RECENT); renderList(favoriteList, STORAGE_FAV); }
function clearAll(){ quickInput.value=''; numberInput.value=''; nameInput.value=''; setSelect.value='AUTO'; langSelect.value='JP'; condSelect.value='NM'; urlBox.value=''; openBtn.href='#'; openBtn.classList.add('disabled'); matchBox.innerHTML=''; lastBuilt=null; setStatus('Klaar.',''); quickInput.focus(); }

function processQuick(){ if(quickInput.value.trim()) parseQuick(); makeLink(true); }

document.querySelectorAll('[data-fill]').forEach(b => b.addEventListener('click', () => { quickInput.value = b.dataset.fill; processQuick(); }));
quickInput.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); processQuick(); }});
quickGo.addEventListener('click', processQuick);
[numberInput,nameInput,setSelect,langSelect,condSelect].forEach(el => el.addEventListener('change', () => makeLink(true)));
nameInput.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); makeLink(true); }});
numberInput.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); makeLink(true); }});
makeBtn.addEventListener('click', processQuick);
copyBtn.addEventListener('click', () => makeLink(true));
favoriteBtn.addEventListener('click', addFavorite);
clearBtn.addEventListener('click', clearAll);
clearRecentBtn.addEventListener('click', () => { writeStore(STORAGE_RECENT, []); renderSaved(); });
clearFavBtn.addEventListener('click', () => { writeStore(STORAGE_FAV, []); renderSaved(); });

fetch('data/cards.json').then(r=>r.json()).then(j => { DATA=j; setStatus('Klaar.',''); renderSaved(); }).catch(() => { setStatus('Data niet geladen; basis werkt nog wel.', 'warn'); renderSaved(); });

if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
