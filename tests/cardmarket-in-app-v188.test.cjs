'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs');
const panel=require('../ui-v188-official-cardmarket.js');
const server=require('../scripts/serve-holodex-official-v188.cjs');
const good={sourceId:'base1-4',sourceSetId:'base1',language:'EN',variant:'NORMAL',
  edition:'AUTO',condition:'NM'};

test('v188 is available only on explicitly opted-in localhost, never on live HoloDex',()=>{
  for(const uri of ['https://holodex.example/?cardmarketPreview=v188',
    'http://127.0.0.1:8766/','http://localhost:8766/?cardmarketPreview=maybe',
    'http://evil.test/?cardmarketPreview=v188','file:///index.html?cardmarketPreview=v188'])
    assert.equal(panel.previewAllowed(uri),false,uri);
  assert.equal(panel.previewAllowed('http://127.0.0.1:8766/?cardmarketPreview=v188'),true);
  assert.equal(panel.previewAllowed('http://localhost:8766/?cardmarketPreview=v188'),true);
});
test('fail closed for unsupported edition, language, variant and ambiguous identity',()=>{
  assert.equal(panel.eligible(good),null);
  for(const input of [{...good,language:'JP'},{...good,variant:'STAMPED'},
    {...good,edition:'1ST'},{...good,edition:'FIRST_EDITION'},
    {...good,sourceId:'123'},{...good,sourceSetId:'base2'},
    {...good,sourceId:'base1-4',sourceSetId:undefined},
    {...good,condition:'UNKNOWN'}])
    assert.equal(typeof panel.eligible(input),'string',JSON.stringify(input));
});
test('local v188 server exposes only known public files and exact official shards',()=>{
  for(const file of ['index.html','ui-v188-official-cardmarket.js','style-v188-official-cardmarket.css',
    'cardmarket-public-v186/manifest.json','cardmarket-public-v186/ff.json'])
    assert.match(server.fileFor('/'+file),new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replaceAll('/','[\\\\/]')+'$'));
  for(const file of ['/docs/BRAND-V172.md','/.git/config','/AGENTS.md','/scripts/.env',
    '/tests/cardmarket-preview-v187.test.cjs','/cardmarket-public-v186/secret.json',
    '/%2e%2e/AGENTS.md','/cardmarket-public-v186/00.json/../00.json'])
    assert.equal(server.fileFor(file),null,file);
});
test('production loader and worker unchanged; v188 only appends to loopback response',async()=>{
  assert.doesNotMatch(fs.readFileSync('index.html','utf8'),/ui-v188-official-cardmarket/);
  assert.doesNotMatch(fs.readFileSync('sw.js','utf8'),/ui-v188-official-cardmarket/);
  const http=server.serve();await new Promise(resolve=>http.listen(0,'127.0.0.1',resolve));
  try{
    const origin='http://127.0.0.1:'+http.address().port;
    const html=await (await fetch(origin+'/?cardmarketPreview=v188')).text();
    assert.match(html,/ui-v188-official-cardmarket\.js\?build=188-local-preview/);
    assert.match(html,/style-v188-official-cardmarket\.css\?build=188-local-preview/);
    for(const path of ['/.git/config','/scripts/.env','/AGENTS.md']){
      const r=await fetch(origin+path);assert.equal(r.status,404,path);
    }
  }finally{await new Promise(resolve=>http.close(resolve));}
});
test('detail opener emits exact context but never enables legacy numeric market',()=>{
  const ui=fs.readFileSync('ui-v181-redesign.js','utf8');
  assert.match(ui,/holodex:detail-open/);
  assert.match(ui,/sourceId:x\.sourceId,sourceSetId:x\.source_set_id/);
  assert.doesNotMatch(ui,/HoloKeepMarket\.enabled\s*=\s*true/);
  const host=fs.readFileSync('ui-v188-official-cardmarket.js','utf8');
  assert.doesNotMatch(host,/tcgcsv|pricecharting|HoloKeepMarket\.enabled\s*=/i);
});
test('v188 detail controls never collide with existing app element IDs',()=>{
  const existing=new Set([...fs.readFileSync('index.html','utf8').matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));
  const controls=[...fs.readFileSync('ui-v188-official-cardmarket.js','utf8').matchAll(/\sid=\\?"([^"\\]+)\\?"/g)].map(m=>m[1]);
  assert.ok(controls.length>12);
  assert.equal(new Set(controls).size,controls.length);
  assert.ok(controls.every(id=>id.startsWith('cm188-')));
  assert.ok(controls.every(id=>!existing.has(id)));
  assert.ok(existing.has('status'),'existing app status remains independent');
});
