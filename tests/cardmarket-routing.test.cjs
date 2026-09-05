'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const source = fs.readFileSync('app-v137.js','utf8');
const baseline = execFileSync('git',['show','80cbcfc:app-v137.js'],{encoding:'utf8',maxBuffer:2000000});
const embedded = s => JSON.parse(s.match(/const EMBEDDED_DATA = (.*);/)[1]);
function context(s, data){
  const c = {URL, DATA:data, CONDITION_IDS:{NM:1},LANGUAGE_IDS:{EN:1,JP:7},updateCustomSelects(){}};
  for(const key of ['nameInput','numberInput','setSelect','langSelect','condSelect','editionSelect','quickInput']) c[key]={value:''};
  vm.createContext(c);
  vm.runInContext(s.slice(s.indexOf('function cleanNumber('),s.indexOf('function slugifyName(')) + s.slice(s.indexOf('const AUTO_VALUE_DIRECTS ='),s.indexOf('async function copyToClipboard(')),c);
  return c;
}
const c=context(source,embedded(source));
function route(name,number,set,lang='EN',edition='1ST'){
  for(const [key,value] of Object.entries({nameInput:name,numberInput:number,setSelect:set,langSelect:lang,condSelect:'NM',editionSelect:edition})) c[key].value=value;
  return c.buildUrl();
}
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
function search(result,expected){
  assert.equal(result.exact,false);
  const u=new URL(result.url);
  assert.equal(u.pathname,'/en/Pokemon/Products/Search');
  assert.equal(u.searchParams.get('searchString'),expected);
  for(const k of ['minCondition','language','isFirstEd']) assert.equal(u.searchParams.has(k),false);
}
test('Charizard Delta Species CG4 direct',()=>{
  assert.equal(new URL(route('Charizard','4','EX CRYSTAL GUARDIANS').url).pathname,'/en/Pokemon/Products/Singles/EX-Crystal-Guardians/Charizard-Delta-Species-CG4');
});
test('Duskull online fallback',()=>search(route('Duskull','50','EX POWER KEEPERS'),'Duskull EX Power Keepers 50'));
test('Igglybuff online fallback',()=>search(route('Igglybuff','21','EX CRYSTAL GUARDIANS'),'Igglybuff EX Crystal Guardians 21'));
test('Team Rocket search-only',()=>search(route('Dark Raticate','51','ROCKET'),'Dark Raticate Team Rocket 51'));
test('JP broad fallback',()=>search(route('ピカチュウ','25','EX POWER KEEPERS','JP'),'ピカチュウ'));
test('Cached compact query ignored, invisible characters and duplicate number removed',()=>{
  const u=new URL(c.searchUrl('Du\u200bskull\ufffd #050/108','050','EN','NM','EX POWER KEEPERS','Duskull PK50'));
  assert.equal(u.searchParams.get('searchString'),'Duskull EX Power Keepers 50');
});
test('Generic filter guard',()=>{
  const u=new URL(c.withFilters('https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=Duskull&language=1&minCondition=1&isFirstEd=Y','EN','NM'));
  assert.equal([...u.searchParams.keys()].join(','),'searchString');
});
test('Direct URL and offer filters preserved',()=>{
  const url='https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Crystal-Guardians/Charizard-Delta-Species-CG4?foo=bar';
  assert.equal(c.withFilters(url,'EN','NM','1ST'),url+'&minCondition=1&language=1&isFirstEd=Y');
});
test('All existing direct mappings unchanged (EN, JP and specials)',()=>{
  const old=context(baseline,embedded(baseline));
  for(const card of c.DATA.knownCards){
    for(const ctx of [c,old]) for(const [k,v] of Object.entries({nameInput:card.name,numberInput:card.number,setSelect:card.set,langSelect:card.language,condSelect:'NM',editionSelect:'1ST'})) ctx[k].value=v;
    const before=old.buildUrl();
    if(before.exact) assert.equal(c.buildUrl().url,before.url,card.key);
  }
  assert.deepEqual(embedded(source),embedded(baseline));
});
test('Collection v133 and selected final URL persistence contract unchanged',()=>{
  for(const file of ['ui-v137-collection.js','ui-v137-focus.js']) assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),execFileSync('git',['show',`80cbcfc:${file}`],{encoding:'utf8',maxBuffer:2000000}));
  const collection=fs.readFileSync('ui-v137-collection.js','utf8');
  assert.ok(collection.includes("const KEY='cardscout_collection_v133'"));
  assert.ok(collection.includes("cardmarketUrl:sel.cardmarketUrl||c.url||openBtn?.getAttribute('href')||''"));
});
function valid(url){try{const u=new URL(url);return u.protocol==='https:' && u.hostname==='www.cardmarket.com' && /^\/en\/Pokemon\/Products\/Singles\/[^/]+\/[^/]+$/.test(u.pathname) && !/[\s\p{Cf}\uFFFD]/u.test(url);}catch{return false;}}
for(const [label,data] of [['embedded',embedded(source)],['cards.json',JSON.parse(fs.readFileSync('cards.json','utf8'))]]){
  const count={direct:0,fallback:0,malformed:0};
  for(const card of data.knownCards){if(card.url){count[valid(card.url)?'direct':'malformed']++;}else count[card.direct?'malformed':'fallback']++;}
  console.log('AUDIT '+label+' '+JSON.stringify(count));
}
const urls=[...new Set(source.slice(source.indexOf('const AUTO_VALUE_DIRECTS ='),source.indexOf('async function copyToClipboard(')).match(/https:\/\/www\.cardmarket\.com\/en\/Pokemon\/Products\/Singles\/[^'"`\s]+/g))];
console.log('AUDIT routing literals '+JSON.stringify({direct:urls.filter(valid).length,malformed:urls.filter(u=>!valid(u)).length}));
console.log(`${passed} tests passed`);
