'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
const read=f=>fs.readFileSync(f,'utf8').replace(/\r\n?/g,'\n'),base='67235a8da9e697f5f51dc754f8b66ede67d41cd9';
function v180MarketProjection(source){
 const patches=[
  [
   "    if(['1ST','SHADOWLESS_1ST'].includes(i.editionScope))return {...entry,reason:'FIRST_EDITION'};\n    if(i.editionScope==='SHADOWLESS')return {...entry,reason:'SPECIAL_VARIANT'};",
   "    if(i.editionScope==='1ST')return {...entry,reason:'FIRST_EDITION'};"
  ],
  [
   "entry.variant!=='NORMAL'||['1ST','SHADOWLESS','SHADOWLESS_1ST'].includes(entry.editionScope)))return null;",
   "entry.variant!=='NORMAL'||entry.editionScope==='1ST'))return null;"
  ],
  [
   "    const reasons={FIRST_EDITION:'Geen passende 1st Edition-prijs',SPECIAL_VARIANT:'Geen passende Shadowless-prijs',STAMPED:'Geen betrouwbare stamped-prijs',FINISH:'Uitvoering niet zeker genoeg voor prijs',IDENTITY:'Kaart niet zeker genoeg voor prijs',SOURCE:'Geen passende marktprijs beschikbaar',NO_PRICE:'Geen marktprijs beschikbaar'};\n    const special=['1ST','SHADOWLESS_1ST'].includes(item.edition)?'FIRST_EDITION':\n      item.edition==='SHADOWLESS'?'SPECIAL_VARIANT':item.variant==='STAMPED'?'STAMPED':null;",
   "    const reasons={FIRST_EDITION:'Geen passende 1st Edition-prijs',STAMPED:'Geen betrouwbare stamped-prijs',FINISH:'Uitvoering niet zeker genoeg voor prijs',IDENTITY:'Kaart niet zeker genoeg voor prijs',SOURCE:'Geen passende marktprijs beschikbaar',NO_PRICE:'Geen marktprijs beschikbaar'};\n    const special=item.edition==='1ST'?'FIRST_EDITION':item.variant==='STAMPED'?'STAMPED':null;"
  ]
 ];
 for(const [current,baseline] of patches){
  assert.equal(source.split(current).length,2,'only the reviewed V208 market guard may differ');
  source=source.replace(current,baseline);
 }
 return source;
}
test('v180 financial, search, backend and catalog engines remain byte-exact outside the reviewed V208 print guard',()=>{for(const f of ['market-v176.js','cost-basis-v177.js','portfolio-insights-v178.js','beta-search-v180.js','home-v179.js','cloud-sync-v170.js','supabase-config-v170.js','supabase-client-v170.js','cloud-adapter-v170.js','account-ui-v170.js','app-v137.js','cards.json']){const current=f==='market-v176.js'?v180MarketProjection(read(f)):read(f);assert.equal(require('./library-scope-v185.cjs')(f,current),cp.execFileSync('git',['show',base+':'+f],{encoding:'utf8',maxBuffer:32e6}).replace(/\r\n?/g,'\n'),f);}});
test('only exact reviewed integration patches alter existing UI engines',()=>{for(const f of ['ui-v137-collection.js','ui-v137-focus.js','ui-v150-experience.js','index.html','brand-v172.js','sw.js'])assert.equal(require('./integration-scope-v181.cjs')(f,read(f)),cp.execFileSync('git',['show',base+':'+f],{encoding:'utf8',maxBuffer:32e6}).replace(/\r\n?/g,'\n'),f);});
test('NO_GO_SHARED_HISTORY: production imports no history or TCGCSV modules',()=>{for(const f of ['index.html','sw.js','ui-v181-redesign.js','share-v181.js'])assert.doesNotMatch(read(f),/price-history|price-data|TCGCSV|Vandaag gestegen|data-card-range|loadSetHistory/);assert.doesNotMatch(read('ui-v181-redesign.js'),/quote\.price|\.price\s*\?/);});
test('share loads only isolated read-only code and never reads or writes private storage',()=>{assert.deepEqual([...read('share-v181.html').matchAll(/<script src="([^"]+)"/g)].map(x=>x[1]),['share-v181.js']);assert.doesNotMatch(read('share-v181.js'),/localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker|setItem|supabase|costBasis|paidEach/);});
test('fonts are local, included and covered by SIL Open Font License',()=>{for(const font of ['geist-400','geist-600','unbounded-700','unbounded-800']){const f='assets/fonts/'+font+'.woff2';assert.equal(fs.readFileSync(f).subarray(0,4).toString(),'wOF2');assert.ok(read('sw.js').includes(f));}for(const f of ['Geist-OFL.txt','Unbounded-OFL.txt'])assert.match(read('assets/fonts/'+f),/SIL OPEN FONT LICENSE Version 1\.1/);assert.doesNotMatch(read('style-v181-holo.css'),/https?:\/\//);});
test('existing baseline test cases retained without count reduction',()=>{const files=cp.execFileSync('git',['ls-tree','-r','--name-only',base,'tests'],{encoding:'utf8'}).trim().split('\n').filter(f=>f.endsWith('.test.cjs'));for(const f of files){const previous=cp.execFileSync('git',['show',base+':'+f],{encoding:'utf8'});assert.ok((read(f).match(/\btest\(/g)||[]).length>=(previous.match(/\btest\(/g)||[]).length,f);}});
