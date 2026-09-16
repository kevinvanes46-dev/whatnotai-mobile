'use strict';
// The reviewed audit is the source of truth. Never derive a product slug from a name.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {normalizeLineEndings}=require('./normalize-line-endings.cjs');
const root=path.resolve(__dirname,'..');
const audit=JSON.parse(fs.readFileSync(path.join(root,'data/jp-cardmarket-audit-v165.json'),'utf8'));
const products=[],ids=new Set(),urls=new Set();
assert.equal(audit.version,165);assert.equal(audit.records.length,780);
for(const row of audit.records){
 assert.ok(!ids.has(row.source_id),'duplicate source ID');ids.add(row.source_id);
 assert.equal(row.language,'JP');
 assert.equal(row.source_id.slice(0,row.source_id.lastIndexOf('-')),row.source_set_id);
 const expansion=audit.expansions[row.source_set_id];
 assert.equal(expansion.set,row.set);assert.equal(expansion.language,'JP');
 assert.equal(expansion.slug,row.cardmarket_expansion_slug);
 assert.ok(['EXACT','SEARCH'].includes(row.route));
 if(row.route!=='EXACT'){assert.equal(row.url,null);assert.equal(row.cardmarket_product_slug,null);continue;}
 assert.match(expansion.slug,/^[A-Za-z0-9-]+$/);assert.match(row.cardmarket_product_slug,/^[A-Za-z0-9-]+$/);
 assert.equal(row.url,'https://www.cardmarket.com/en/Pokemon/Products/Singles/'+expansion.slug+'/'+row.cardmarket_product_slug);
 assert.ok(!urls.has(row.url),'duplicate product');urls.add(row.url);
 assert.ok(row.evidence.some(e=>['cardmarket_indexed_product','baseline_acceptance'].includes(e.kind)&&e.url));
 products.push([row.source_id,row.source_set_id,row.cardmarket_product_slug]);
}
const expansions=Object.fromEntries(Object.entries(audit.expansions).map(([id,e])=>[id,{set:e.set,slug:e.slug}]));
const output="'use strict';\n// Generated from data/jp-cardmarket-audit-v165.json; run node scripts/generate-jp-cardmarket-v165.cjs.\n"+
 'window.JPCardmarketDataV165=Object.freeze({\n  expansions:'+JSON.stringify(expansions)+',\n  products:[\n'+products.map(r=>'    Object.freeze('+JSON.stringify(r)+')').join(',\n')+'\n  ]\n});\nObject.values(window.JPCardmarketDataV165.expansions).forEach(Object.freeze);\nObject.freeze(window.JPCardmarketDataV165.expansions);\nObject.freeze(window.JPCardmarketDataV165.products);\n';
const target=path.join(root,'jp-cardmarket-native-v165.js');
if(process.argv.includes('--check'))assert.equal(normalizeLineEndings(fs.readFileSync(target,'utf8')),normalizeLineEndings(output),'manifest differs from reviewed audit');
else fs.writeFileSync(target,output);
console.log(`v165 manifest: ${products.length} EXACT; ${audit.records.length-products.length} SEARCH`);
