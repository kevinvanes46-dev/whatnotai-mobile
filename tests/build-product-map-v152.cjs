'use strict';
// Rebuild only after running the live catalog and product audits; prices are never bundled.
const fs=require('node:fs');
const rows=JSON.parse(fs.readFileSync('artifacts/links-v152/catalog.json'));
const audited=JSON.parse(fs.readFileSync('artifacts/links-v152/product-audit.json'));
const byId=new Map(rows.filter(x=>x.lang==='en').map(x=>[x.source_id,x]));
const products={};
for(const record of audited){
 if(record.lang!=='en'||!record.product||!record.identityMatch)continue;
 const row=byId.get(record.id);if(!row)throw Error('Missing catalog identity: '+record.id);
 products[record.id]={id:record.id,name:row.name,number:row.number,set:{id:row.id,name:row.set},product:record.product};
}
fs.writeFileSync('cardmarket-products-v152.js','// Product identities checked against TCGdex on 2026-09-06; no prices are bundled.\nwindow.CM_PRODUCT_CATALOG='+JSON.stringify(products)+';\n');
console.log(Object.keys(products).length+' product routes generated');
