'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {build, serialize} = require('../scripts/cardmarket-public-v186.cjs');
const {audit, main} = require('../scripts/audit-cardmarket-feed-v186.cjs');

const NOW = Date.parse('2026-10-23T09:00:00Z');
const createdAt = '2026-10-22T02:00:00Z';
const expansions = Object.freeze({base1: 1523, 'sv03.5': 5402});
const catalog = {version:1,createdAt,products:[
  {idProduct:273699,name:'Charizard [Energy Burn | Fire Spin]',categoryName:'Pokémon Single',idExpansion:1523},
  {idProduct:733794,name:'Charizard ex [Brave Wing | Explosive Vortex]',categoryName:'Pokémon Single',idExpansion:5402},
  {idProduct:733795,name:'Sealed',categoryName:'Pokémon Sealed',idExpansion:5402}
]};
const guides = {version:1,createdAt,priceGuides:[
  {idProduct:273699,trend:12.34,'trend-holo':null},
  {idProduct:733794,trend:null,'trend-holo':24.56},
  {idProduct:733795,trend:99,'trend-holo':null}
]};

async function fixture(fn) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'v186-audit-'));
  try {
    const files = serialize(build(catalog,guides,{now:NOW}));
    for (const [name,data] of files) await fs.writeFile(path.join(dir,name),data);
    return await fn(dir);
  } finally {await fs.rm(dir,{recursive:true,force:true});}
}

test('reports only official source coverage; never labels rows as verified card matches', () => fixture(async dir => {
  const report = await audit(dir,expansions,NOW);
  assert.equal(report.matchedSourceProducts,2);
  assert.equal(report.withOrdinaryTrend,1);
  assert.equal(report.withReverseHoloTrend,1);
  assert.deepEqual(report.approvedExpansionSourceCoverage, [
    {tcgdexSetId:'base1',cardmarketExpansionId:1523,sourceProducts:1,withOrdinaryTrend:1,withReverseHoloTrend:0},
    {tcgdexSetId:'sv03.5',cardmarketExpansionId:5402,sourceProducts:1,withOrdinaryTrend:0,withReverseHoloTrend:1}
  ]);
  assert.match(report.assessment,/NOT_VERIFIED_CARD_IDENTITY/);
  assert.equal(report.containsPrices,false);
  assert.doesNotMatch(JSON.stringify(report),/12\.34|24\.56|paidEach|purchase/i);
}));

test('rejects modified source data even if its JSON still parses', () => fixture(async dir => {
  const file = path.join(dir,(273699 % 256).toString(16).padStart(2,'0')+'.json');
  const raw=await fs.readFile(file,'utf8');
  await fs.writeFile(file,raw.replace('12.34','13.34'));
  await assert.rejects(()=>audit(dir,expansions,NOW),/checksum mismatch/);
}));

test('rejects modified manifest counts and stale source dates', () => fixture(async dir => {
  const file=path.join(dir,'manifest.json');
  const doc=JSON.parse(await fs.readFile(file,'utf8'));
  doc.matched++;
  await fs.writeFile(file,JSON.stringify(doc));
  await assert.rejects(()=>audit(dir,expansions,NOW),/count mismatch/);
  doc.matched--;
  await fs.writeFile(file,JSON.stringify(doc));
  await assert.rejects(()=>audit(dir,expansions,NOW+4*86400000),/stale manifest/);
}));

test('rejects duplicate, missing and malformed expansion mappings', () => fixture(async dir => {
  await assert.rejects(()=>audit(dir,{'base1':1523,'other':1523},NOW),/invalid expansion/);
  await assert.rejects(()=>audit(dir,{'__INVALID':1523},NOW),/invalid expansion/);
  await assert.rejects(()=>audit(dir,{},NOW),/invalid expansion/);
}));

test('CLI reads the actual wrapped expansion-registry shape and writes a report once', () => fixture(async dir => {
  const reportFile = path.join(dir, 'audit-report.json');
  await main(['--dir',dir,'--report',reportFile]);
  const report = JSON.parse(await fs.readFile(reportFile,'utf8'));
  assert.equal(report.matchedSourceProducts,2);
  assert.equal(report.approvedExpansionSourceCoverage.length,3);
  await assert.rejects(()=>main(['--dir',dir,'--report',reportFile]),/EEXIST/);
}));
