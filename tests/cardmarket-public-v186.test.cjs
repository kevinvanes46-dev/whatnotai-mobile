'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const engine = require('../scripts/cardmarket-public-v186.cjs');
const {run} = require('../scripts/build-cardmarket-public-v186.cjs');

const NOW = Date.parse('2026-10-23T09:00:00Z');
const catalog = () => ({version:1,createdAt:'2026-10-21T13:49:03+0200',products:[
  {idProduct:273699,name:'Charizard [Energy Burn | Fire Spin]',categoryName:'Pokémon Single',idExpansion:1523},
  {idProduct:733794,name:'Charizard ex [Brave Wing | Explosive Vortex]',categoryName:'Pokémon Single',idExpansion:5402},
  {idProduct:719448,name:'Charizard ex [Brave Wing | Explosive Vortex]',categoryName:'Pokémon Single',idExpansion:5328},
  {idProduct:111,name:'Sealed Booster',categoryName:'Pokémon Sealed',idExpansion:100}
]});
const prices = () => ({version:1,createdAt:'2026-10-22T02:45:11+0200',priceGuides:[
  {idProduct:273699,trend:150,'trend-holo':220,avg7:140},
  {idProduct:733794,trend:175,'trend-holo':280},
  {idProduct:719448,trend:null,'trend-holo':null},
  {idProduct:111,trend:17,'trend-holo':19},
  {idProduct:999999,trend:10000,'trend-holo':10000}
]});

test('joins official product IDs, never card names or unmatched/sealed price rows', () => {
  const built = engine.build(catalog(),prices(),{now:NOW});
  assert.equal(built.manifest.matched,2);
  assert.equal(built.manifest.source,'CARDMARKET_PUBLIC_GUIDE');
  assert.equal(built.manifest.currency,'EUR');
  assert.equal(built.manifest.scope,'GENERAL_PRODUCT_TREND_NOT_CONDITION_SPECIFIC');
  assert.deepEqual(built.shards[273699 % 256][273699],[273699,1523,'Charizard [Energy Burn | Fire Spin]',150,220]);
  assert.deepEqual(built.shards[733794 % 256][733794],[733794,5402,'Charizard ex [Brave Wing | Explosive Vortex]',175,280]);
  assert.equal(built.shards[719448 % 256][719448],undefined);
  assert.equal(built.shards[111 % 256][111],undefined);
  assert.equal(built.shards[999999 % 256][999999],undefined);
});

test('missing or negative trend remains missing; never substitutes low, avg7 or 30-day values', () => {
  const source = prices();
  source.priceGuides[0] = {idProduct:273699,trend:-1,'trend-holo':null,low:2,avg7:300,avg30:400};
  source.priceGuides[1] = {idProduct:733794,trend:null,'trend-holo':279,avg7:1000};
  const result = engine.build(catalog(),source,{now:NOW});
  assert.equal(result.manifest.matched,1);
  assert.deepEqual(result.shards[733794 % 256][733794],[733794,5402,'Charizard ex [Brave Wing | Explosive Vortex]',null,279]);
});

test('stale, future, malformed and abnormally small upstreams fail closed', () => {
  assert.throws(()=>engine.build(catalog(),prices(),{now:NOW+4*86400000}),/stale/);
  assert.throws(()=>engine.build(catalog(),prices(),{now:NOW-7*86400000}),/future/);
  assert.throws(()=>engine.build({...catalog(),createdAt:'bogus'},prices(),{now:NOW}),/createdAt/);
  assert.throws(()=>engine.build(catalog(),{...prices(),priceGuides:[]},{now:NOW}),/invalid schema/);
  assert.throws(()=>engine.build(catalog(),prices(),{now:NOW,minimumProducts:100}),/source coverage/);
});

test('duplicate product and guide IDs fail, with no fabricated entries', () => {
  const duplicateProduct = catalog(); duplicateProduct.products.push({...duplicateProduct.products[0]});
  assert.throws(()=>engine.build(duplicateProduct,prices(),{now:NOW}),/duplicate product ID/);
  const duplicateGuide = prices(); duplicateGuide.priceGuides.push({...duplicateGuide.priceGuides[0]});
  assert.throws(()=>engine.build(catalog(),duplicateGuide,{now:NOW}),/duplicate guide ID/);
});

test('published shards have checksums and source dates, not user data', () => {
  const files = engine.serialize(engine.build(catalog(),prices(),{now:NOW}));
  assert.equal(files.size,257);
  const manifest = JSON.parse(files.get('manifest.json'));
  assert.equal(manifest.priceGuideCreatedAt,'2026-10-22T00:45:11.000Z');
  assert.equal(manifest.catalogCreatedAt,'2026-10-21T11:49:03.000Z');
  const file = (273699 % 256).toString(16).padStart(2,'0')+'.json';
  const body = files.get(file);
  assert.equal(manifest.checksums[file],crypto.createHash('sha256').update(body).digest('hex'));
  assert.equal(JSON.parse(body).rows[273699][3],150);
  assert.doesNotMatch(body,/paidEach|costBasis|collection|TCGPLAYER/i);
});

test('offline importer stages new directory; refuses overwrite and keeps source files untouched',async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(),'holodex-v186-test-'));
  try {
    const from = path.join(root,'source.json'),to = path.join(root,'prices.json'),out = path.join(root,'build');
    await fs.writeFile(from,JSON.stringify(catalog()));
    await fs.writeFile(to,JSON.stringify(prices()));
    const manifest=await run(['--catalog',from,'--prices',to,'--out',out]);
    assert.equal(manifest.matched,2);
    assert.equal((await fs.readdir(out)).length,257);
    await assert.rejects(()=>run(['--catalog',from,'--prices',to,'--out',out]),/EEXIST/);
    assert.equal(JSON.parse(await fs.readFile(from,'utf8')).products.length,4);
    assert.equal(JSON.parse(await fs.readFile(to,'utf8')).priceGuides.length,5);
    const invalid = path.join(root,'bad');
    const malformed = path.join(root,'malformed.json');
    await fs.writeFile(malformed, '{bad');
    await assert.rejects(()=>run(['--catalog',from,'--prices',malformed,'--out',invalid]),/JSON/);
    await assert.rejects(()=>fs.stat(invalid),/ENOENT/);
  } finally {await fs.rm(root,{recursive:true,force:true});}
});
