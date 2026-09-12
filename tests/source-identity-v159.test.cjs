'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {context}=require('./helpers/cardmarket-harness.cjs');
function setup(){
 const {c}=context();
 vm.runInContext(fs.readFileSync('jp-cardmarket-twin-v157.js','utf8'),c);
 const source=fs.readFileSync('ui-v137-focus.js','utf8');
 // Exercise the production merger with the application's actual name and set helpers.
 const normalize=source.slice(source.indexOf('  function normalize('),source.indexOf('\n  function ',source.indexOf('  function normalize(')+5));
 c.cleanVisibleCardName=c.cleanCardmarketName;
 vm.runInContext(normalize,c);
 vm.runInContext(source.match(/const TCGDEX_SET_IDS = \{[\s\S]*?\n  \};/)[0],c);
 vm.runInContext(source.slice(source.indexOf('  function prioritizeSourceIdentity('),source.indexOf('  function rebuildCatalog(')),c);
 return c.prioritizeSourceIdentity;
}
const fallback={name:'Swinub',language:'JP',set:'NEO REVELATION',number:'220'};
const source={name:'swinub',language:'JP',set:'NEO REVELATION',number:'',source:'tcgdex',source_id:'neo3-038',source_set_id:'neo3'};
test('source identity displaces the equivalent fallback and preserves its verified route only',()=>{
 const merge=setup(),url='https://www.cardmarket.com/en/Pokemon/Products/Singles/Awakening-Legends/Swinub-AL';
 const result=merge([{...fallback,verified:true,direct:true,url},source]);
 assert.equal(result.length,1);assert.equal(result[0].source_id,'neo3-038');assert.equal(result[0].source_set_id,'neo3');assert.equal(result[0].number,'');assert.equal(result[0].url,url);
 assert.equal(source.url,undefined);
});
test('Snubbull across Neo sets and cards across languages remain distinct',()=>{
 const rows=[{...source,name:'Snubbull',source_id:'neo3-048'},{...source,name:'Snubbull',set:'NEO GENESIS',source_id:'neo1-061',source_set_id:'neo1'},{...fallback,language:'EN'}];
 assert.equal(setup()(rows).length,3);
});
test('EN exact number source wins; another collector number is retained',()=>{
 const local={name:'Bulbasaur',language:'EN',set:'BASE',number:'44'};
 const exact={...local,source:'tcgdex',source_id:'base1-44',source_set_id:'base1'};
 const result=setup()([local,exact,{...local,number:'45'}]);
 assert.equal(result.length,2);assert.ok(result.includes(exact));assert.ok(result.some(c=>c.number==='45'));
});
test('fallback without a unique trustworthy counterpart remains usable',()=>{
 const merge=setup();
 assert.equal(merge([fallback])[0],fallback);
 for(const other of [{...source,source_set_id:'neo1'},{...source,source:'unknown'},{...source,set:'NEO GENESIS'}])assert.equal(merge([fallback,other]).length,2);
 assert.equal(merge([fallback,source,{...source,source_id:'neo3-999'}]).length,3);
});
test('edition, stamped and variant distinctions survive source priority',()=>{
 const rows=[fallback,source,{...fallback,edition:'1ST'},{...fallback,stamped:true},{...fallback,variant:'REVERSE'}];
 const result=setup()(rows);assert.equal(result.length,4);
 for(const row of rows.slice(2))assert.ok(result.includes(row));
});
test('exact aliases match only inside the same language, set and variant',()=>{
 assert.equal(setup()([{...fallback,name:'ウリムー'},{...source,aliases:['ウリムー']}]).length,1);
});
