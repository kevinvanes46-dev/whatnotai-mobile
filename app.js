'use strict';

const EMBEDDED_DATA = {"pokedex":{"001":"Bulbasaur","002":"Ivysaur","003":"Venusaur","004":"Charmander","005":"Charmeleon","006":"Charizard","007":"Squirtle","008":"Wartortle","009":"Blastoise","010":"Caterpie","011":"Metapod","012":"Butterfree","013":"Weedle","014":"Kakuna","015":"Beedrill","016":"Pidgey","017":"Pidgeotto","018":"Pidgeot","019":"Rattata","020":"Raticate","021":"Spearow","022":"Fearow","023":"Ekans","024":"Arbok","025":"Pikachu","026":"Raichu","027":"Sandshrew","028":"Sandslash","029":"Nidoran Female","030":"Nidorina","031":"Nidoqueen","032":"Nidoran Male","033":"Nidorino","034":"Nidoking","035":"Clefairy","036":"Clefable","037":"Vulpix","038":"Ninetales","039":"Jigglypuff","040":"Wigglytuff","041":"Zubat","042":"Golbat","043":"Oddish","044":"Gloom","045":"Vileplume","046":"Paras","047":"Parasect","048":"Venonat","049":"Venomoth","050":"Diglett","051":"Dugtrio","052":"Meowth","053":"Persian","054":"Psyduck","055":"Golduck","056":"Mankey","057":"Primeape","058":"Growlithe","059":"Arcanine","060":"Poliwag","061":"Poliwhirl","062":"Poliwrath","063":"Abra","064":"Kadabra","065":"Alakazam","066":"Machop","067":"Machoke","068":"Machamp","069":"Bellsprout","070":"Weepinbell","071":"Victreebel","072":"Tentacool","073":"Tentacruel","074":"Geodude","075":"Graveler","076":"Golem","077":"Ponyta","078":"Rapidash","079":"Slowpoke","080":"Slowbro","081":"Magnemite","082":"Magneton","083":"Farfetch'd","084":"Doduo","085":"Dodrio","086":"Seel","087":"Dewgong","088":"Grimer","089":"Muk","090":"Shellder","091":"Cloyster","092":"Gastly","093":"Haunter","094":"Gengar","095":"Onix","096":"Drowzee","097":"Hypno","098":"Krabby","099":"Kingler","100":"Voltorb","101":"Electrode","102":"Exeggcute","103":"Exeggutor","104":"Cubone","105":"Marowak","106":"Hitmonlee","107":"Hitmonchan","108":"Lickitung","109":"Koffing","110":"Weezing","111":"Rhyhorn","112":"Rhydon","113":"Chansey","114":"Tangela","115":"Kangaskhan","116":"Horsea","117":"Seadra","118":"Goldeen","119":"Seaking","120":"Staryu","121":"Starmie","122":"Mr. Mime","123":"Scyther","124":"Jynx","125":"Electabuzz","126":"Magmar","127":"Pinsir","128":"Tauros","129":"Magikarp","130":"Gyarados","131":"Lapras","132":"Ditto","133":"Eevee","134":"Vaporeon","135":"Jolteon","136":"Flareon","137":"Porygon","138":"Omanyte","139":"Omastar","140":"Kabuto","141":"Kabutops","142":"Aerodactyl","143":"Snorlax","144":"Articuno","145":"Zapdos","146":"Moltres","147":"Dratini","148":"Dragonair","149":"Dragonite","150":"Mewtwo","151":"Mew","152":"Chikorita","153":"Bayleef","154":"Meganium","155":"Cyndaquil","156":"Quilava","157":"Typhlosion","158":"Totodile","159":"Croconaw","160":"Feraligatr","161":"Sentret","162":"Furret","163":"Hoothoot","164":"Noctowl","165":"Ledyba","166":"Ledian","167":"Spinarak","168":"Ariados","169":"Crobat","170":"Chinchou","171":"Lanturn","172":"Pichu","173":"Cleffa","174":"Igglybuff","175":"Togepi","176":"Togetic","177":"Natu","178":"Xatu","179":"Mareep","180":"Flaaffy","181":"Ampharos","182":"Bellossom","183":"Marill","184":"Azumarill","185":"Sudowoodo","186":"Politoed","187":"Hoppip","188":"Skiploom","189":"Jumpluff","190":"Aipom","191":"Sunkern","192":"Sunflora","193":"Yanma","194":"Wooper","195":"Quagsire","196":"Espeon","197":"Umbreon","198":"Murkrow","199":"Slowking","200":"Misdreavus","201":"Unown","202":"Wobbuffet","203":"Girafarig","204":"Pineco","205":"Forretress","206":"Dunsparce","207":"Gligar","208":"Steelix","209":"Snubbull","210":"Granbull","211":"Qwilfish","212":"Scizor","213":"Shuckle","214":"Heracross","215":"Sneasel","216":"Teddiursa","217":"Ursaring","218":"Slugma","219":"Magcargo","220":"Swinub","221":"Piloswine","222":"Corsola","223":"Remoraid","224":"Octillery","225":"Delibird","226":"Mantine","227":"Skarmory","228":"Houndour","229":"Houndoom","230":"Kingdra","231":"Phanpy","232":"Donphan","233":"Porygon2","234":"Stantler","235":"Smeargle","236":"Tyrogue","237":"Hitmontop","238":"Smoochum","239":"Elekid","240":"Magby","241":"Miltank","242":"Blissey","243":"Raikou","244":"Entei","245":"Suicune","246":"Larvitar","247":"Pupitar","248":"Tyranitar","249":"Lugia","250":"Ho-Oh","251":"Celebi"},"knownCards":[{"key":"en|base|1|alakazam","name":"Alakazam","number":"1","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Alakazam-V1-BS1"},{"key":"en|base|2|blastoise","name":"Blastoise","number":"2","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Blastoise-V1-BS2"},{"key":"en|base|3|chansey","name":"Chansey","number":"3","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Chansey-V1-BS3"},{"key":"en|base|4|charizard","name":"Charizard","number":"4","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Charizard-V1-BS4"},{"key":"en|base|5|clefairy","name":"Clefairy","number":"5","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Clefairy-V1-BS5"},{"key":"en|base|6|gyarados","name":"Gyarados","number":"6","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Gyarados-V1-BS6"},{"key":"en|base|7|hitmonchan","name":"Hitmonchan","number":"7","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Hitmonchan-V1-BS7"},{"key":"en|base|8|machamp","name":"Machamp","number":"8","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Machamp-V1-BS8"},{"key":"en|base|9|magneton","name":"Magneton","number":"9","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Magneton-V1-BS9"},{"key":"en|base|10|mewtwo","name":"Mewtwo","number":"10","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Mewtwo-V1-BS10"},{"key":"en|base|11|nidoking","name":"Nidoking","number":"11","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Nidoking-V1-BS11"},{"key":"en|base|12|ninetales","name":"Ninetales","number":"12","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Ninetales-V1-BS12"},{"key":"en|base|13|poliwrath","name":"Poliwrath","number":"13","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Poliwrath-V1-BS13"},{"key":"en|base|14|raichu","name":"Raichu","number":"14","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Raichu-V1-BS14"},{"key":"en|base|15|venusaur","name":"Venusaur","number":"15","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Venusaur-V1-BS15"},{"key":"en|base|16|zapdos","name":"Zapdos","number":"16","set":"BASE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Zapdos-V1-BS16"},{"key":"en|jungle|1|clefable","name":"Clefable","number":"1","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Clefable-V1-JU1"},{"key":"en|jungle|2|electrode","name":"Electrode","number":"2","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Electrode-V1-JU2"},{"key":"en|jungle|3|flareon","name":"Flareon","number":"3","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Flareon-V1-JU3"},{"key":"en|jungle|4|jolteon","name":"Jolteon","number":"4","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Jolteon-V1-JU4"},{"key":"en|jungle|5|kangaskhan","name":"Kangaskhan","number":"5","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Kangaskhan-V1-JU5"},{"key":"en|jungle|6|mr. mime","name":"Mr. Mime","number":"6","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Mr-Mime-V1-JU6"},{"key":"en|jungle|7|nidoqueen","name":"Nidoqueen","number":"7","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Nidoqueen-V1-JU7"},{"key":"en|jungle|8|pidgeot","name":"Pidgeot","number":"8","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Pidgeot-V1-JU8"},{"key":"en|jungle|9|pinsir","name":"Pinsir","number":"9","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Pinsir-V1-JU9"},{"key":"en|jungle|10|scyther","name":"Scyther","number":"10","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Scyther-V1-JU10"},{"key":"en|jungle|11|snorlax","name":"Snorlax","number":"11","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Snorlax-V1-JU11"},{"key":"en|jungle|12|vaporeon","name":"Vaporeon","number":"12","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Vaporeon-V1-JU12"},{"key":"en|jungle|13|venomoth","name":"Venomoth","number":"13","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Venomoth-V1-JU13"},{"key":"en|jungle|14|victreebel","name":"Victreebel","number":"14","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Victreebel-V1-JU14"},{"key":"en|jungle|15|vileplume","name":"Vileplume","number":"15","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Vileplume-V1-JU15"},{"key":"en|jungle|16|wigglytuff","name":"Wigglytuff","number":"16","set":"JUNGLE","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Wigglytuff-V1-JU16"},{"key":"en|fossil|1|aerodactyl","name":"Aerodactyl","number":"1","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Aerodactyl-V1-FO1"},{"key":"en|fossil|2|articuno","name":"Articuno","number":"2","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Articuno-V1-FO2"},{"key":"en|fossil|3|ditto","name":"Ditto","number":"3","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Ditto-V1-FO3"},{"key":"en|fossil|4|dragonite","name":"Dragonite","number":"4","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Dragonite-V1-FO4"},{"key":"en|fossil|5|gengar","name":"Gengar","number":"5","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Gengar-V1-FO5"},{"key":"en|fossil|6|haunter","name":"Haunter","number":"6","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Haunter-V1-FO6"},{"key":"en|fossil|7|hitmonlee","name":"Hitmonlee","number":"7","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Hitmonlee-V1-FO7"},{"key":"en|fossil|8|hypno","name":"Hypno","number":"8","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Hypno-V1-FO8"},{"key":"en|fossil|9|kabutops","name":"Kabutops","number":"9","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Kabutops-V1-FO9"},{"key":"en|fossil|10|lapras","name":"Lapras","number":"10","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Lapras-V1-FO10"},{"key":"en|fossil|11|magneton","name":"Magneton","number":"11","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Magneton-V1-FO11"},{"key":"en|fossil|12|moltres","name":"Moltres","number":"12","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Moltres-V1-FO12"},{"key":"en|fossil|13|muk","name":"Muk","number":"13","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Muk-V1-FO13"},{"key":"en|fossil|14|raichu","name":"Raichu","number":"14","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Raichu-V1-FO14"},{"key":"en|fossil|15|zapdos","name":"Zapdos","number":"15","set":"FOSSIL","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Zapdos-V1-FO15"},{"key":"en|jungle|51|eevee","name":"Eevee","number":"51","set":"JUNGLE","language":"EN","rarity":"Common","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Eevee-JU51"},{"key":"en|rocket|4|dark charizard","name":"Dark Charizard","number":"4","set":"ROCKET","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Team-Rocket/Dark-Charizard-TR4"},{"key":"en|neo genesis|9|lugia","name":"Lugia","number":"9","set":"NEO GENESIS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Genesis/Lugia-NG9"},{"key":"en|neo revelation|65|shining gyarados","name":"Shining Gyarados","number":"65","set":"NEO REVELATION","language":"EN","rarity":"Shining","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Shining-Gyarados-NR65"},{"key":"en|neo revelation|66|shining magikarp","name":"Shining Magikarp","number":"66","set":"NEO REVELATION","language":"EN","rarity":"Shining","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Revelation/Shining-Magikarp-NR66"},{"key":"en|neo destiny|107|shining charizard","name":"Shining Charizard","number":"107","set":"NEO DESTINY","language":"EN","rarity":"Shining","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Neo-Destiny/Shining-Charizard-NDE107"},{"key":"en|ex crystal guardians|4|charizard","name":"Charizard","number":"4","set":"EX CRYSTAL GUARDIANS","language":"EN","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Crystal-Guardians/Charizard-Delta-Species-CG4"},{"key":"jp|base|002|ivysaur","name":"Ivysaur","number":"002","set":"BASE","language":"JP","rarity":"","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Expansion-Pack/Ivysaur"},{"key":"jp|fossil|094|gengar","name":"Gengar","number":"094","set":"FOSSIL","language":"JP","rarity":"Holo Rare","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Mystery-of-the-Fossils/Gengar"},{"key":"jp|neo revelation|220|swinub","name":"Swinub","number":"220","set":"NEO REVELATION","language":"JP","rarity":"","url":"https://www.cardmarket.com/en/Pokemon/Products/Singles/Awakening-Legends/Swinub-AL"}],"version":"v59"};
let DATA = EMBEDDED_DATA;
let lastBuilt = null;
const APP_VERSION = 'v59';

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
  ['LEGENDARY COLLECTION', ['legendary collection','legendary','lc','l collection']],
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
  'LEGENDARY COLLECTION': {dir:'Legendary-Collection', code:'LC'},
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

function inferLanguageFromKnown(set, number, name, currentLang){
  const n = cleanNumber(number);
  const nm = normalizeName(name);
  if(!n || !nm) return currentLang;

  let matches = (DATA.knownCards || []).filter(c =>
    normalizeName(c.name) === nm &&
    (cleanNumber(c.number) === n || pad3(c.number) === pad3(n))
  );
  if(set && set !== 'AUTO'){
    matches = matches.filter(c => c.set === set);
  }

  const languages = [...new Set(matches.map(c => c.language).filter(Boolean))];
  return languages.length === 1 ? languages[0] : currentLang;
}

function parseQuick(){
  const text = quickInput.value.trim();
  if(!text) return false;

  const lower = text.toLowerCase();
  const langExplicit = /\b(jp|jpn|japanese|japans|en|eng|english)\b/.test(lower);
  let lang = /\b(jp|jpn|japanese|japans)\b/.test(lower)
    ? 'JP'
    : (/\b(en|eng|english)\b/.test(lower) ? 'EN' : langSelect.value);

  let cond = condSelect.value || 'NM';
  if(/\bnm\b/.test(lower)) cond = 'NM';
  else if(/\bgd\b/.test(lower)) cond = 'GD';
  else if(/\bpl\b/.test(lower)) cond = 'PL';
  else if(/\bex\b(?!\s*delta)/.test(lower)) cond = 'EX';

  const set = detectSet(text);
  if(set === 'EX DELTA SPECIES' && !langExplicit) lang = 'EN';

  const cleaned = removeSetWords(text)
    .replace(/\b(jp|jpn|japanese|japans|en|eng|english|nm|ex|gd|pl)\b/gi,' ')
    .replace(/\b(1st|first\s+edition|holo|holorare|holo\s+rare)\b/gi,' ')
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

  if(!langExplicit){
    lang = inferLanguageFromKnown(set, number, name, lang);
  }

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


function legendaryCollectionDirect(lang, number, name, cond){
  if(lang !== 'EN') return null;
  const n = cleanNumber(number);
  const nm = normalizeName(name);
  if(nm === 'charizard' && n === '3'){
    const q = normalizeName(quickInput.value);
    let url = 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Legendary-Collection/Charizard-V1-LC3';
    let note = 'Legendary Collection Charizard holo: V1 / LC3';
    if(q.includes('reverse') || q.includes('rev') || q.includes('rh')){
      url = 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Legendary-Collection/Charizard-V2-LC3';
      note = 'Legendary Collection Charizard reverse holo: V2 / LC3';
    } else if(q.includes('non holo') || q.includes('nonholo') || q.includes('no holo')){
      url = 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Legendary-Collection/Charizard-V3-LC3';
      note = 'Legendary Collection Charizard non-holo: V3 / LC3';
    }
    return {url:withFilters(url, lang, cond), exact:true, note, autoSet:'LEGENDARY COLLECTION', autoName:'Charizard'};
  }
  return null;
}


function baseHitmonchanDirect(lang, number, name, cond){
  if(lang !== 'EN') return null;
  const n = cleanNumber(number);
  const nm = normalizeName(name).replace(/\b(1st|first edition|holo|holorare|holo rare)\b/g,' ').replace(/\s+/g,' ').trim();
  if(nm !== 'hitmonchan' || n !== '7') return null;

  const typed = normalizeName(quickInput.value + ' ' + nameInput.value);
  const firstEdition = /\b(1st|first edition)\b/.test(typed);
  const base = firstEdition
    ? 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Hitmonchan-V2-BS7'
    : 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Hitmonchan-V1-BS7';

  return {
    url: withFilters(base, lang, cond),
    exact: true,
    note: firstEdition ? 'Base Set Hitmonchan #7 · 1st Edition route' : 'Base Set Hitmonchan #7 · Holo route',
    autoSet: 'BASE',
    autoName: 'Hitmonchan'
  };
}

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

function matchingKnownCards(set, number, name){
  const n = cleanNumber(number);
  const nm = normalizeName(name);
  return (DATA.knownCards || []).filter(c =>
    normalizeName(c.name) === nm &&
    (cleanNumber(c.number) === n || pad3(c.number) === pad3(n)) &&
    (!set || set === 'AUTO' || c.set === set)
  );
}

function knownLookup(lang,set,number,name){
  const matches = matchingKnownCards(set, number, name);
  const selectedLanguage = matches.find(c => c.language === lang);
  if(selectedLanguage) return selectedLanguage;

  const languages = [...new Set(matches.map(c => c.language).filter(Boolean))];
  return languages.length === 1 && matches.length === 1 ? matches[0] : null;
}

function findAutoKnown(lang, number, name){
  const matches = matchingKnownCards('AUTO', number, name);
  const selectedLanguageMatches = matches.filter(c => c.language === lang);
  if(selectedLanguageMatches.length) return selectedLanguageMatches;

  const languages = [...new Set(matches.map(c => c.language).filter(Boolean))];
  return languages.length === 1 ? matches : [];
}
function withFilters(url, lang, cond){
  const params = [];
  if(CONDITION_IDS[cond]) params.push(`minCondition=${CONDITION_IDS[cond]}`);
  if(LANGUAGE_IDS[lang]) params.push(`language=${LANGUAGE_IDS[lang]}`);
  if(!params.length) return url;
  return url + (url.includes('?') ? '&' : '?') + params.join('&');
}
function searchUrl(name, number, lang, cond){
  // Cardmarket search werkt betrouwbaarder op naam dan op naam + kaartnummer.
  // Het kaartnummer tonen we in de app zodat je handmatig de juiste variant pakt.
  const q = encodeURIComponent(String(name || '').trim() || 'pokemon');
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
    const lcDirect = legendaryCollectionDirect(lang, number, name, cond);
    if(lcDirect){
      if(lcDirect.autoSet) setSelect.value = lcDirect.autoSet;
      if(lcDirect.autoName) nameInput.value = lcDirect.autoName;
      updateCustomSelects();
      return lcDirect;
    }
    const autoDirect = autoValueDirect(lang, number, name, cond);
    if(autoDirect){
      if(autoDirect.autoSet) setSelect.value = autoDirect.autoSet;
      if(autoDirect.autoName) nameInput.value = autoDirect.autoName;
      updateCustomSelects();
      return autoDirect;
    }
    const matches = findAutoKnown(lang, number, name);
    if(matches.length === 1){
      const exact = matches[0];
      setSelect.value = exact.set;
      langSelect.value = exact.language || lang;
      updateCustomSelects();
      return {
        url: withFilters(exact.url, langSelect.value, cond),
        exact: true,
        note: `Direct: ${exact.set} · ${exact.rarity || 'kaart'} · ${exact.name}`
      };
    }
    if(matches.length > 1){
      const candidateLanguage = [...new Set(matches.map(c => c.language).filter(Boolean))];
      if(candidateLanguage.length === 1) langSelect.value = candidateLanguage[0];
      updateCustomSelects();
      return {
        url: searchUrl(name, number, langSelect.value, cond),
        exact: false,
        candidates: matches,
        note: `Meerdere matches voor ${name} #${number}. Kies hieronder de juiste set.`
      };
    }
    return {url:searchUrl(name, number, lang, cond), exact:false, note:number ? `Nog niet direct in database. Zoek op naam en check nummer ${number}.` : 'Nog niet direct in database.'};
  }

  // v41 special correction: "delta charizard 4" is EX Crystal Guardians CG4, not EX Delta Species DS4.
  if(lang === 'EN' && (set === 'EX DELTA SPECIES' || set === 'EX CRYSTAL GUARDIANS') && cleanNumber(number) === '4' && normalizeName(name) === 'charizard'){
    const url = withFilters('https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Crystal-Guardians/Charizard-Delta-Species-CG4', lang, cond);
    return {url, exact:true, note:'Special: Delta Charizard #4 = EX Crystal Guardians / CG4'};
  }

  if(set === 'LEGENDARY COLLECTION'){
    const lcDirect = legendaryCollectionDirect(lang, number, name, cond);
    if(lcDirect) return lcDirect;
  }

  if(set === 'BASE'){
    const hitmonchanDirect = baseHitmonchanDirect(lang, number, name, cond);
    if(hitmonchanDirect) return hitmonchanDirect;
  }

  const known = knownLookup(lang,set,number,name);
  if(known){
    langSelect.value = known.language || lang;
    updateCustomSelects();
    return {
      url: withFilters(known.url, langSelect.value, cond),
      exact: true,
      note: `Direct: ${known.set} · ${known.rarity || 'kaart'} · ${known.name}`
    };
  }

  // v59 guaranteed WOTC holo fallback for the live test set.
  const directKey = `${String(set).toUpperCase()}|${cleanNumber(number)}|${normalizeName(name)}`;
  const guaranteedDirect = {
    'JUNGLE|12|vaporeon': 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/Vaporeon-V1-JU12',
    'BASE|7|hitmonchan': 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/Hitmonchan-V1-BS7',
    'FOSSIL|5|gengar': 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Gengar-V1-FO5',
    'FOSSIL|4|dragonite': 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Fossil/Dragonite-V1-FO4'
  };
  if(guaranteedDirect[directKey]){
    langSelect.value = 'EN';
    updateCustomSelects();
    return {
      url: withFilters(guaranteedDirect[directKey], 'EN', cond),
      exact: true,
      note: `Directe WOTC holo: ${set} · ${name} #${number}`
    };
  }

  // v56: nooit meer een product-URL gokken.
  // Cardmarket gebruikt per kaart soms V1/V2/V3 of afwijkende setcodes.
  // Alleen geverifieerde database-URL's openen direct; de rest opent veilig zoeken.
  return {
    url: searchUrl(name, number, lang, cond),
    exact: false,
    note: set && set !== 'AUTO'
      ? `Veilige zoekpagina: ${set}. Controleer kaartnummer ${number || '-'}.`
      : `Veilige zoekpagina. Controleer kaartnummer ${number || '-'}.`
  };
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


function candidateButtonsHtml(candidates, cond){
  if(!candidates || !candidates.length) return '';
  return `<div class="candidateList">
    ${candidates.map((c, i) => `
      <button type="button" class="candidateBtn" data-candidate="${i}">
        <span>${c.set}</span>
        <small>${c.name} #${c.number}${c.rarity ? ' · ' + c.rarity : ''}</small>
      </button>
    `).join('')}
  </div>`;
}

function bindCandidateButtons(candidates){
  if(!candidates || !candidates.length) return;
  matchBox.querySelectorAll('[data-candidate]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const c = candidates[Number(btn.dataset.candidate)];
      if(!c) return;
      setSelect.value = c.set;
      langSelect.value = c.language || langSelect.value;
      nameInput.value = c.name;
      numberInput.value = c.number;
      updateCustomSelects();
      const url = withFilters(c.url, langSelect.value, condSelect.value);
      urlBox.value = url;
      openBtn.href = url;
      openBtn.classList.remove('disabled');
      lastBuilt = {url, result:{exact:true, note:`Gekozen: ${c.set} / ${c.name}`}};
      const ok = await copyToClipboard(url);
      setStatus(ok ? `${c.set} gekozen en link gekopieerd.` : `${c.set} gekozen.`, ok ? 'ok' : 'warn');
    });
  });
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
  matchBox.innerHTML = `<b>${r.exact ? 'Directe kaartpagina' : (r.candidates ? 'Kies de juiste set' : 'Zoekpagina')}</b><br>${r.note}<br>${nameInput.value || '-'} · ${numberInput.value || '-'} · ${setSelect.value} · ${langSelect.value}/${condSelect.value}${candidateButtonsHtml(r.candidates, condSelect.value)}`;
  bindCandidateButtons(r.candidates);
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



function closeCustomSelects(){
  // v51: geen dropdowns. Set blijft AUTO/detected; taal/staat zijn vaste knoppen.
}

function updateCustomSelects(){
  const setInfo = document.getElementById('setInfo');
  if(setInfo){
    const set = setSelect.value || 'AUTO';
    if(set === 'AUTO'){
      setInfo.innerHTML = 'Set: <b>AUTO</b> · vul alleen <b>nummer + naam</b>. Ik open veilig zoeken als de set niet exact bekend is.';
    } else {
      setInfo.innerHTML = 'Set gedetecteerd: <b>' + set + '</b> · wijzig door de set in snel zoeken te typen.';
    }
  }
  document.querySelectorAll('[data-choice-target]').forEach(bar => {
    const target = document.getElementById(bar.dataset.choiceTarget);
    if(!target) return;
    bar.querySelectorAll('.choiceBtn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === target.value);
    });
  });
}

function scrollActiveChipIntoView(select){
  // v51: niet nodig.
}

function initCustomSelects(){
  document.querySelectorAll('.hiddenSelect, select').forEach(sel => {
    sel.classList.add('hiddenSelect');
  });

  document.querySelectorAll('[data-choice-target] .choiceBtn').forEach(btn => {
    if(btn._ready) return;
    btn._ready = true;
    btn.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const bar = btn.closest('[data-choice-target]');
      const target = document.getElementById(bar.dataset.choiceTarget);
      if(!target) return;
      target.value = btn.dataset.value;
      updateCustomSelects();
      target.dispatchEvent(new Event('change', {bubbles:true}));
    });
  });

  updateCustomSelects();
}

function manualFieldChanged(){
  // Als je snel alleen nummer + naam invult, mag een oude set uit snelzoeken nooit blijven hangen.
  quickInput.value = '';
  setSelect.value = 'AUTO';
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

  [numberInput,nameInput].forEach(el => {
    el.addEventListener('input', manualFieldChanged);
    el.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); makeLink(true); }});
  });

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
setStatus('Database ingebouwd: 57 kaarten.', 'ok');
renderSaved();
unregisterOldServiceWorkers();
