'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const MANIFEST='data/jp-image-manifest-v161.json';
function loadCatalog(root=ROOT){
  const c={window:{}};vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(root,'jp-set-catalog-v160.js'),'utf8'),c);
  const records=[],catalog=Object.create(null),sets=c.window.JPSetCatalog.sets;
  for(const set of sets){
    const file=JSON.parse(fs.readFileSync(path.join(root,`tests/fixtures/jp-sets-v160/${set.source}.json`),'utf8'));
    if(file.id!==set.source)throw Error(`Wrong source set: ${set.source}`);
    for(const card of file.cards){
      if(!new RegExp(`^${set.source}-[0-9]{3}$`).test(card.id)||catalog[card.id])throw Error(`Invalid/duplicate catalog ID: ${card.id}`);
      catalog[card.id]={set:set.key,sourceSet:set.source};
      records.push({source_id:card.id,source_set_id:set.source,set:set.key,display_set:set.label,name:card.name,tcgdex_image:card.image||null});
    }
  }
  if(records.length!==780)throw Error(`Expected 780 v160 records, got ${records.length}`);
  return {records,catalog,sets};
}
function readManifest(root=ROOT){return JSON.parse(fs.readFileSync(path.join(root,MANIFEST),'utf8'));}
function validateEntry(id,entry,catalog){
  if(!Object.hasOwn(catalog,id))throw Error(`Unknown source_id: ${id}`);
  if(!entry||entry.set!==catalog[id].set||entry.sourceSet!==catalog[id].sourceSet)throw Error(`Wrong set/source combination: ${id}`);
  if(entry.src!==`assets/cards/jp/${id}.webp`)throw Error(`Wrong image path: ${id}`);
}
function writeAtomic(filename,content){
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const temp=filename+`.${process.pid}.tmp`;
  try{fs.writeFileSync(temp,content,{flag:'wx'});fs.renameSync(temp,filename);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
}
function generate(root=ROOT,manifest=readManifest(root)){
  const {records,catalog,sets}=loadCatalog(root);
  for(const [id,entry] of Object.entries(manifest)){
    validateEntry(id,entry,catalog);
    if(!fs.statSync(path.join(root,entry.src)).isFile())throw Error(`Missing own file: ${id}`);
  }
  const images=Object.fromEntries(Object.entries(manifest).sort(([a],[b])=>a.localeCompare(b,'en')));
  const c={window:{RareWorthJPImageManifest:{catalog,images}},URL};vm.createContext(c);
  for(const file of ['jp-set-catalog-v160.js','jp-artwork-v158.js','jp-image-library-v161.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
  const inventory=records.map(({tcgdex_image,...row})=>{
    const result=c.window.RareWorthJPImageLibrary.select({...row,language:'JP'},{tcgdexId:row.source_id,tcgdexImage:tcgdex_image});
    return {...row,image_status:result.status,image:result.image||null};
  });
  const coverage=sets.map(set=>{
    const rows=inventory.filter(row=>row.source_set_id===set.source);
    const counts=Object.fromEntries(['OWN','TCGDEX','EXTERNAL_BETA','MISSING'].map(status=>[status,rows.filter(row=>row.image_status===status).length]));
    return {source:set.source,label:set.label,total:rows.length,...counts,coverage:((rows.length-counts.MISSING)/rows.length*100).toFixed(2)};
  });
  const totals={total:inventory.length};for(const status of ['OWN','TCGDEX','EXTERNAL_BETA','MISSING'])totals[status]=coverage.reduce((n,row)=>n+row[status],0);
  const report=['# JP image coverage — v161','','Generated from all 780 frozen v160 JP source records. No remote images downloaded.','',
    'Statuses describe configured exact-identity sources, not a live HTTP/image availability audit. TCGDEX requires an image in the v160 source record; no guessed URLs. EXTERNAL_BETA is enabled for this report. Runtime HTTP failures can still end at “Afbeelding niet beschikbaar”.','',
    '| Source set | Display set | Total | OWN | TCGDEX | EXTERNAL_BETA | MISSING | Coverage |',
    '|---|---|---:|---:|---:|---:|---:|---:|',
    ...coverage.map(r=>`| ${r.source} | ${r.label} | ${r.total} | ${r.OWN} | ${r.TCGDEX} | ${r.EXTERNAL_BETA} | ${r.MISSING} | ${r.coverage}% |`),
    `| **Total** | | **${totals.total}** | **${totals.OWN}** | **${totals.TCGDEX}** | **${totals.EXTERNAL_BETA}** | **${totals.MISSING}** | **${((totals.total-totals.MISSING)/totals.total*100).toFixed(2)}%** |`,'',
    'Coverage = (OWN + TCGDEX + EXTERNAL_BETA) / total. Counts are mutually exclusive in resolver priority order.','',
    'See assets/cards/jp/README.md for batch import, authorization, file naming and beta configuration.',''].join('\n');
  writeAtomic(path.join(root,MANIFEST),JSON.stringify(images,null,2)+'\n');
  writeAtomic(path.join(root,'jp-image-manifest-v161.js'),"'use strict';\n// Generated; edit through scripts/import-jp-images-v161.cjs.\nwindow.RareWorthJPImageManifest="+JSON.stringify({catalog,images})+';\n');
  writeAtomic(path.join(root,'data/jp-image-inventory-v161.json'),JSON.stringify(inventory,null,2)+'\n');
  writeAtomic(path.join(root,'JP-IMAGE-COVERAGE-V161.md'),report);
  return {totals,coverage};
}
module.exports={ROOT,MANIFEST,loadCatalog,readManifest,validateEntry,writeAtomic,generate};
