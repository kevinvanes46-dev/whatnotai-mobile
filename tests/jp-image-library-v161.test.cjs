'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),os=require('node:os');
const {loadCatalog,validateEntry,generate,ROOT}=require('../scripts/jp-image-tools-v161.cjs');
const {importImages}=require('../scripts/import-jp-images-v161.cjs');
const {catalog,records}=loadCatalog();
const card=id=>({source_id:id,source_set_id:catalog[id].sourceSet,set:catalog[id].set,language:'JP'});
const entry=id=>({src:`assets/cards/jp/${id}.webp`,...catalog[id]});
function setup(images={}){
  const c={window:{RareWorthJPImageManifest:{catalog,images}},URL};vm.createContext(c);
  for(const file of ['jp-set-catalog-v160.js','jp-artwork-v158.js','jp-image-library-v161.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
  return c.window.RareWorthJPImageLibrary;
}
test('exact OWN wins; names alone, unknown IDs and wrong identities fail closed',()=>{
  const id='PMCG1-035',api=setup({[id]:entry(id),'PMCG1-999':entry(id)});
  assert.equal(api.resolve(id).status,'OWN');assert.equal(api.resolve('PMCG1-999'),null);
  assert.equal(api.resolve('pmcg1-035'),null);assert.equal(api.resolve('Pikachu'),null);
  const original={...card(id),condition:'EX',edition:'1ST',variant:'REVERSE'},before=JSON.stringify(original);
  assert.equal(api.select(original,{tcgdexId:id,tcgdexImage:'https://assets.tcgdex.net/ja/base/PMCG1/035'}).status,'OWN');
  assert.equal(JSON.stringify(original),before);
  for(const invalid of [{language:'JP',name:'Pikachu'},{...card(id),language:'EN'},{...card(id),set:'JUNGLE'},{...card(id),source_set_id:'PMCG2'},{...card(id),sourceId:'PMCG2-024'}])assert.equal(api.own(invalid),null);
  assert.equal(setup({[id]:{...entry(id),set:'JUNGLE'}}).resolve(id),null);
  assert.equal(setup({[id]:{...entry(id),src:'https://example.com/wrong.webp'}}).resolve(id),null);
  assert.throws(()=>validateEntry('PMCG1-999',entry(id),catalog),/Unknown/);
  assert.throws(()=>validateEntry(id,{...entry(id),sourceSet:'PMCG2'},catalog),/Wrong set\/source/);
});
test('TCGDEX → EXTERNAL_BETA → MISSING with switch and exact JA provenance',()=>{
  const api=setup(),id='neo3-038',image='https://assets.tcgdex.net/ja/neo/neo3/038';
  assert.equal(api.select(card(id),{tcgdexId:id,tcgdexImage:image}).status,'TCGDEX');
  for(const opts of [{},{tcgdexId:'neo1-027',tcgdexImage:image},{tcgdexId:id,tcgdexImage:'https://assets.tcgdex.net/en/neo/neo3/038'}])assert.equal(api.select(card(id),opts).status,'EXTERNAL_BETA');
  assert.equal(api.select(card(id)).image,'https://cdn.artofpkm.com/ki7p3hj3p3phx6tjwmi4av5x0tm6');
  assert.equal(api.select(card('PMCG5-036')).status,'MISSING');
  api.config.allowExternalBeta=false;assert.equal(api.select(card(id)).status,'MISSING');assert.equal(api.external(card(id)),null);
  assert.equal(api.select(card(id),{tcgdexId:id,tcgdexImage:image}).status,'TCGDEX');
});
test('four Pikachu identities and one record in every source set stay separate',()=>{
  const ids=['PMCG1-035','PMCG2-024','PMCG5-036','neo1-036'];
  for(const set of new Set(records.map(row=>row.source_set_id)))ids.push(records.find(row=>row.source_set_id===set).source_id);
  const api=setup(Object.fromEntries(ids.map(id=>[id,entry(id)])));
  assert.equal(new Set(ids.slice(0,4).map(id=>api.own(card(id)).image)).size,4);
  for(const id of ids){const own=api.own(card(id));assert.equal(own.source_id,id);assert.equal(own.source_set_id,catalog[id].sourceSet);assert.equal(own.set,catalog[id].set);}
});
function workspace(t){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'rw-v161-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  fs.mkdirSync(path.join(root,'data'));fs.writeFileSync(path.join(root,'data/jp-image-manifest-v161.json'),'{}');
  fs.mkdirSync(path.join(root,'tests/fixtures'),{recursive:true});
  fs.cpSync(path.join(ROOT,'tests/fixtures/jp-sets-v160'),path.join(root,'tests/fixtures/jp-sets-v160'),{recursive:true});
  for(const file of ['jp-set-catalog-v160.js','jp-artwork-v158.js','jp-image-library-v161.js'])fs.copyFileSync(path.join(ROOT,file),path.join(root,file));
  const folder=path.join(root,'input');fs.mkdirSync(folder);return {root,folder};
}
test('batch importer validates pixels and IDs, reports duplicates and never overwrites',async t=>{
  const sharp=require(require.resolve('sharp',{paths:[path.join(ROOT,'scripts')]})),{root,folder}=workspace(t);
  const png=await sharp({create:{width:16,height:24,channels:3,background:'#3377dd'}}).png().toBuffer();
  fs.writeFileSync(path.join(folder,'PMCG1-035.png'),png);
  fs.writeFileSync(path.join(folder,'PMCG1-999.png'),png);
  fs.writeFileSync(path.join(folder,'PMCG9-001.png'),png);
  // Keep case-only filenames apart on case-insensitive filesystems (Windows).
  const lowercaseFolder=path.join(root,'input-lowercase');fs.mkdirSync(lowercaseFolder);
  fs.writeFileSync(path.join(lowercaseFolder,'pmcg1-035.png'),png);
  fs.writeFileSync(path.join(folder,'neo1-036.png'),'broken');
  fs.writeFileSync(path.join(folder,'PMCG2-024.jpg'),png); // extension differs from decoded format
  fs.writeFileSync(path.join(folder,'PMCG5-036.png'),png.subarray(0,45)); // truncated data
  fs.writeFileSync(path.join(folder,'neo3-038.png'),png);
  fs.writeFileSync(path.join(folder,'neo3-038.webp'),png); // duplicate identity: neither wins
  let report=await importImages(folder,{root});assert.equal(report.imported.length,1);assert.equal(report.imported[0].source_id,'PMCG1-035');assert.equal(report.duplicates.length,2);
  const lowercaseReport=await importImages(lowercaseFolder,{root});
  assert.equal(lowercaseReport.imported.length,0);assert.equal(lowercaseReport.duplicates.length,0);assert.equal(lowercaseReport.rejected.length,1);
  assert.equal(lowercaseReport.rejected[0].file,'pmcg1-035.png');assert.match(lowercaseReport.rejected[0].reason,/Unknown source_id/);
  assert.equal(report.rejected.length+lowercaseReport.rejected.length,6);
  assert.equal(report.coverage.totals.OWN,1);assert.equal(report.coverage.totals.EXTERNAL_BETA,412);
  const dest=path.join(root,'assets/cards/jp/PMCG1-035.webp'),before=fs.readFileSync(dest);
  assert.equal((await sharp(before).metadata()).format,'webp');
  fs.rmSync(folder,{recursive:true});fs.mkdirSync(folder);
  fs.writeFileSync(path.join(folder,'PMCG1-035.png'),png);fs.writeFileSync(path.join(folder,'PMCG2-024.png'),png);
  report=await importImages(folder,{root});assert.equal(report.imported.length,0);assert.equal(report.duplicates.length,2);assert.deepEqual(fs.readFileSync(dest),before);
  const snapshot=fs.readFileSync(path.join(root,'jp-image-manifest-v161.js'),'utf8');generate(root);assert.equal(fs.readFileSync(path.join(root,'jp-image-manifest-v161.js'),'utf8'),snapshot);
  fs.writeFileSync(path.join(root,'.jp-image-import-v161.lock'),'');await assert.rejects(importImages(folder,{root}),/EEXIST/);
});
test('one batch accepts hundreds of authorized test images and all supported formats',async t=>{
  const sharp=require(require.resolve('sharp',{paths:[path.join(ROOT,'scripts')]})),{root,folder}=workspace(t),formats=['png','jpeg','webp'];
  // Synthetic color rectangles are test-only, never production card artwork.
  for(let i=0;i<240;i++){
    const format=formats[i%formats.length];const buffer=await sharp({create:{width:16+i,height:24,channels:3,background:'#8844aa'}})[format]().toBuffer();
    fs.writeFileSync(path.join(folder,records[i].source_id+'.'+(format==='jpeg'&&i%2?'jpg':format)),buffer);
  }
  const report=await importImages(folder,{root});assert.equal(report.imported.length,240);assert.equal(report.rejected.length,0);assert.equal(report.duplicates.length,0);
  assert.equal(report.coverage.totals.OWN,240);assert.equal(report.coverage.totals.total,780);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root,'data/jp-image-inventory-v161.json'))).length,780);
});
