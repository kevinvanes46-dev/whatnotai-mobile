'use strict';
// Offline, read-only projection of Cardmarket's official public Pokémon product catalog.
// No price fields, history, accounts, or user collection information are imported.
// Usage: node scripts/build-cardmarket-product-index-v191.cjs --catalog /path/products_singles_6.json
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

function build(doc){
  if(doc?.version!==1||!Array.isArray(doc.products)||doc.products.length<70000||
    typeof doc.createdAt!=='string'||!Number.isFinite(Date.parse(doc.createdAt.replace(/([+-]\d{2})(\d{2})$/,'$1:$2'))))throw Error('Invalid official catalog');
  const rows={};
  for(const p of doc.products){
    if(p?.categoryName!=='Pokémon Single')continue;
    if(!Number.isSafeInteger(p.idProduct)||p.idProduct<=0||!Number.isSafeInteger(p.idExpansion)||p.idExpansion<=0||typeof p.name!=='string'||!p.name.trim())throw Error('Invalid product identity');
    if(Object.hasOwn(rows,p.idProduct))throw Error('Duplicate product ID');
    // Cardmarket's public catalog labels cards as "Name [Attack | Attack]".
    // Retaining the full text allows clients to independently check the card name.
    rows[p.idProduct]=[p.idExpansion,p.name];
  }
  if(Object.keys(rows).length<70000)throw Error('Unexpectedly sparse Pokémon catalog');
  return {schema:191,source:'CARDMARKET_OFFICIAL_PRODUCT_CATALOG',createdAt:doc.createdAt,
    count:Object.keys(rows).length,rows};
}
function run(args=process.argv.slice(2)){
  if(args.length!==2||args[0]!=='--catalog')throw Error('Supply an explicitly downloaded official catalog via --catalog');
  const source=path.resolve(args[1]);
  const data=build(JSON.parse(fs.readFileSync(source,'utf8')));
  const out=path.resolve(__dirname,'..','cardmarket-product-index-v191.json');
  // The index is generated, never downloaded into the PWA from an unaudited host.
  fs.writeFileSync(out,JSON.stringify(data)+'\n',{flag:'w'});
  process.stdout.write(`Official Cardmarket IDs: ${data.count}; sha256 ${crypto.createHash('sha256').update(fs.readFileSync(out)).digest('hex')}\n`);
}
if(require.main===module){try{run()}catch(e){process.stderr.write(e.message+'\n');process.exitCode=1;}}
module.exports={build,run};
