let DATA = { pokedex: {}, knownCards: [] };

const $ = (id) => document.getElementById(id);
const quickInput = $('quickInput');
const numberInput = $('numberInput');
const nameInput = $('nameInput');
const setSelect = $('setSelect');
const langSelect = $('langSelect');
const condSelect = $('condSelect');
const makeBtn = $('makeBtn');
const copyBtn = $('copyBtn');
const clearBtn = $('clearBtn');
const openBtn = $('openBtn');
const urlBox = $('urlBox');
const statusBox = $('status');
const matchBox = $('matchBox');

const CONDITION_IDS = { NM: '2', EX: '3', GD: '4', PL: '6' };
const LANGUAGE_IDS = { EN: '1', JP: '7' };

const SET_ALIASES = [
  ['EX DELTA SPECIES', ['ex delta species','delta species','delta','ds']],
  ['GYM CHALLENGE', ['gym challenge','challenge']],
  ['GYM HEROES', ['gym heroes','heroes']],
  ['NEO REVELATION', ['neo revelation','neo rev','revelation']],
  ['NEO DISCOVERY', ['neo discovery','neo disc','discovery']],
  ['NEO GENESIS', ['neo genesis','genesis']],
  ['NEO DESTINY', ['neo destiny','destiny']],
  ['ROCKET', ['team rocket','rocket','tr']],
  ['JUNGLE', ['jungle','ju']],
  ['FOSSIL', ['fossil','fo']],
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
  return (name || '')
    .trim()
    .replace(/[’']/g, '')
    .replace(/♀/g, 'Female')
    .replace(/♂/g, 'Male')
    .replace(/\./g, '')
    .replace(/\s*:\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9\-]/g, '')
    .replace(/-+/g, '-');
}
function cleanNumber(raw){
  const s = (raw || '').trim();
  if (!s) return '';
  const m = s.match(/(\d{1,3})\s*(?:\/\s*\d{1,3})?/);
  return m ? String(parseInt(m[1],10)) : s;
}
function pad3(n){
  const x = cleanNumber(n);
  if (!x) return '';
  return x.padStart(3, '0');
}
function normalizeName(s){return (s || '').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function setStatus(text, kind=''){
  statusBox.className = 'status' + (kind ? ' '+kind : '');
  statusBox.textContent = text;
}
function detectSet(text){
  let lower = ' ' + text.toLowerCase().replace(/\s+/g,' ') + ' ';
  for (const [set, aliases] of SET_ALIASES){
    for (const a of aliases){
      if (lower.includes(' ' + a + ' ')) return set;
    }
  }
  return 'AUTO';
}
function removeSetWords(text){
  let out = ' ' + text.toLowerCase().replace(/\s+/g,' ') + ' ';
  for (const [, aliases] of SET_ALIASES){
    aliases.sort((a,b)=>b.length-a.length).forEach(a => { out = out.replaceAll(' '+a+' ', ' '); });
  }
  return out.trim();
}
function parseQuick(){
  let text = quickInput.value.trim();
  if (!text) return;
  let lower = text.toLowerCase();
  let lang = lower.match(/\b(jp|jpn|japanese|japans)\b/) ? 'JP' : (lower.match(/\b(en|eng|english)\b/) ? 'EN' : langSelect.value);
  let cond = 'NM';
  const cm = lower.match(/\b(nm|ex|gd|pl)\b/);
  if (cm) cond = cm[1].toUpperCase();
  let set = detectSet(text);

  let cleaned = removeSetWords(text)
    .replace(/\b(jp|jpn|japanese|japans|en|eng|english|nm|ex|gd|pl)\b/gi, ' ')
    .replace(/\s+/g,' ').trim();
  const tokens = cleaned.split(' ').filter(Boolean);
  let number = '';
  let nameParts = [];
  for (const t of tokens){
    if (!number && /^\d{1,3}(\/\d{1,3})?$/.test(t)) number = cleanNumber(t);
    else nameParts.push(t);
  }
  let name = nameParts.join(' ').trim();

  if (!name && lang === 'JP' && number){
    const dex = DATA.pokedex[pad3(number)];
    if (dex) name = dex;
  }

  numberInput.value = number;
  nameInput.value = titleCasePokemon(name);
  setSelect.value = set;
  langSelect.value = lang;
  condSelect.value = cond;
  makeLink(true);
}
function titleCasePokemon(s){
  if (!s) return '';
  const specials = {'mr mime':'Mr. Mime', 'farfetchd':"Farfetch'd", 'nidoran female':'Nidoran Female', 'nidoran male':'Nidoran Male'};
  const key = normalizeName(s).replace(/ /g,' ');
  if (specials[key]) return specials[key];
  return s.split(' ').map(w => w ? w[0].toUpperCase()+w.slice(1).toLowerCase() : '').join(' ')
    .replace(/\bEx\b/g,'ex').replace(/\bLv\b/g,'LV');
}
function knownLookup(lang,set,number,name){
  const n = cleanNumber(number);
  const nm = normalizeName(name);
  const key = `${lang.toLowerCase()}|${set.toLowerCase()}|${lang === 'JP' ? pad3(n) : n}|${nm}`;
  return DATA.knownCards.find(c => c.key === key);
}
function searchUrl(name, number, lang, cond){
  const parts = [name, number].filter(Boolean).join(' ');
  const q = encodeURIComponent(parts || 'pokemon');
  return withFilters(`https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${q}`, lang, cond);
}
function withFilters(url, lang, cond){
  const sep = url.includes('?') ? '&' : '?';
  const params = [];
  if (CONDITION_IDS[cond]) params.push(`minCondition=${CONDITION_IDS[cond]}`);
  if (LANGUAGE_IDS[lang]) params.push(`language=${LANGUAGE_IDS[lang]}`);
  return params.length ? url + sep + params.join('&') : url;
}
function buildUrl(){
  let lang = langSelect.value;
  let set = setSelect.value;
  let number = cleanNumber(numberInput.value);
  let name = nameInput.value.trim();
  let cond = condSelect.value;

  if (!name && lang === 'JP' && number){
    const dex = DATA.pokedex[pad3(number)];
    if (dex){ name = dex; nameInput.value = dex; }
  }

  if (!name) return {url:'', exact:false, note:'Geen naam ingevuld.'};

  if (set === 'AUTO'){
    // Known cards first; otherwise fallback search.
    const exact = DATA.knownCards.find(c => normalizeName(c.name) === normalizeName(name) && (cleanNumber(c.number) === number || pad3(c.number) === pad3(number)) && c.language === lang);
    if (exact) return {url: withFilters(exact.url, lang, cond), exact:true, note:`Exact via database: ${exact.set} / ${exact.name}`};
    return {url: searchUrl(name, number, lang, cond), exact:false, note:'Geen set gekozen: zoekpagina geopend.'};
  }

  const known = knownLookup(lang,set,number,name);
  if (known) return {url: withFilters(known.url, lang, cond), exact:true, note:`Exacte match: ${known.set} / ${known.name}`};

  const slugName = slugifyName(name);
  if (lang === 'JP' && JAPANESE[set]){
    const info = JAPANESE[set];
    const suffix = info.suffix ? '-' + info.suffix : '';
    return {url: withFilters(`https://www.cardmarket.com/en/Pokemon/Products/Singles/${info.dir}/${slugName}${suffix}`, lang, cond), exact:true, note:`JP route: ${info.dir}`};
  }
  if (WESTERN[set]){
    const info = WESTERN[set];
    const n = number ? cleanNumber(number) : '';
    const ending = n ? '-' + info.code + n : '';
    return {url: withFilters(`https://www.cardmarket.com/en/Pokemon/Products/Singles/${info.dir}/${slugName}${ending}`, lang, cond), exact:true, note:`EN route: ${info.dir}`};
  }
  return {url: searchUrl(name, number, lang, cond), exact:false, note:'Fallback zoekpagina.'};
}
async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch(e){
    urlBox.focus(); urlBox.select();
    return false;
  }
}
async function makeLink(autoCopy=false){
  const r = buildUrl();
  if (!r.url){
    urlBox.value = '';
    openBtn.href = '#'; openBtn.classList.add('disabled');
    setStatus(r.note || 'Geen link.', 'warn');
    matchBox.innerHTML = '';
    return;
  }
  urlBox.value = r.url;
  openBtn.href = r.url;
  openBtn.classList.remove('disabled');
  matchBox.innerHTML = `<b>${r.exact ? 'Directe kaartpagina' : 'Zoekpagina'}</b><br>${r.note}<br>${nameInput.value || '-'} · ${numberInput.value || '-'} · ${setSelect.value} · ${langSelect.value}/${condSelect.value}`;
  const ok = await copyToClipboard(r.url);
  setStatus(ok ? 'Link gemaakt en gekopieerd.' : 'Link gemaakt. Kopieer handmatig uit het vak.', ok ? 'ok' : 'warn');
}
function clearAll(){
  quickInput.value=''; numberInput.value=''; nameInput.value=''; setSelect.value='AUTO'; langSelect.value='JP'; condSelect.value='NM'; urlBox.value=''; openBtn.href='#'; openBtn.classList.add('disabled'); matchBox.innerHTML=''; setStatus('Klaar.',''); quickInput.focus();
}

document.querySelectorAll('[data-fill]').forEach(b => b.addEventListener('click', () => { quickInput.value = b.dataset.fill; parseQuick(); }));
quickInput.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); parseQuick(); }});
[numberInput,nameInput,setSelect,langSelect,condSelect].forEach(el => el.addEventListener('change', () => makeLink(true)));
nameInput.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); makeLink(true); }});
numberInput.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); makeLink(true); }});
makeBtn.addEventListener('click', () => { if(quickInput.value.trim()) parseQuick(); else makeLink(true); });
copyBtn.addEventListener('click', () => makeLink(true));
clearBtn.addEventListener('click', clearAll);

fetch('data/cards.json').then(r=>r.json()).then(j => { DATA=j; setStatus('Klaar.',''); }).catch(() => { setStatus('Data niet geladen; basis werkt nog wel.', 'warn'); });
