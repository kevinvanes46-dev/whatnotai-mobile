'use strict';
// Read-only integrity and source-coverage audit of a staged official Cardmarket
// public guide. This never estimates card prices or joins user collections.

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const SOURCE = 'CARDMARKET_PUBLIC_GUIDE';
const SHARDS = 256;
const SHA256 = /^[a-f0-9]{64}$/;
const isId = x => Number.isSafeInteger(x) && x > 0;
const validPrice = x => typeof x === 'number' && Number.isFinite(x) && x > 0 && x <= 10000000;

async function audit(dir, expansions, now = Date.now()) {
  if (!dir || !expansions || typeof expansions !== 'object' || Array.isArray(expansions)) throw new Error('invalid input');
  const pairs = Object.entries(expansions);
  if (!pairs.length || pairs.some(([key, value]) => !/^[a-z0-9.\-]+$/.test(key) || !isId(value)) ||
    new Set(pairs.map(([, value]) => value)).size !== pairs.length) throw new Error('invalid expansion mapping');

  const manifestBytes = await fs.readFile(path.join(dir, 'manifest.json'));
  if (manifestBytes.byteLength > 64000 || !manifestBytes.byteLength) throw new Error('invalid manifest size');
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  const created = Date.parse(manifest.priceGuideCreatedAt);
  if (manifest.schema !== 186 || manifest.source !== SOURCE || manifest.currency !== 'EUR' ||
    manifest.metric !== 'trend' || manifest.shards !== SHARDS ||
    manifest.scope !== 'GENERAL_PRODUCT_TREND_NOT_CONDITION_SPECIFIC' ||
    !isId(manifest.matched) || !Number.isFinite(created) ||
    new Date(created).toISOString() !== manifest.priceGuideCreatedAt ||
    now - created > 72 * 3600000 || created - now > 3600000 ||
    !manifest.checksums || typeof manifest.checksums !== 'object' ||
    Array.isArray(manifest.checksums) || Object.keys(manifest.checksums).length !== SHARDS) {
    throw new Error('invalid or stale manifest');
  }

  const approved = new Map(pairs.map(([key, value]) => [value, {
    tcgdexSetId: key, cardmarketExpansionId: value, sourceProducts: 0,
    withOrdinaryTrend: 0, withReverseHoloTrend: 0
  }]));
  let count = 0, ordinary = 0, reverseHolo = 0;
  const seen = new Set();
  for (let i = 0; i < SHARDS; i++) {
    const name = i.toString(16).padStart(2, '0') + '.json';
    const expected = manifest.checksums[name];
    if (!SHA256.test(expected || '')) throw new Error('invalid shard checksum manifest');
    const bytes = await fs.readFile(path.join(dir, name));
    if (!bytes.length || bytes.byteLength > 1048576 ||
      crypto.createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error('shard checksum mismatch');
    const shard = JSON.parse(bytes.toString('utf8'));
    if (shard.schema !== 186 || shard.source !== SOURCE ||
      shard.asOf !== manifest.priceGuideCreatedAt || !shard.rows ||
      typeof shard.rows !== 'object' || Array.isArray(shard.rows)) throw new Error('invalid shard');
    for (const [key, row] of Object.entries(shard.rows)) {
      const productId = Number(key);
      if (!isId(productId) || String(productId) !== key || productId % SHARDS !== i ||
        seen.has(productId) || !Array.isArray(row) || row.length !== 5 ||
        row[0] !== productId || !isId(row[1]) ||
        typeof row[2] !== 'string' || !row[2].trim() ||
        !(validPrice(row[3]) || row[3] === null) ||
        !(validPrice(row[4]) || row[4] === null) ||
        (row[3] === null && row[4] === null)) throw new Error('invalid product row');
      seen.add(productId);
      count++;
      if (validPrice(row[3])) ordinary++;
      if (validPrice(row[4])) reverseHolo++;
      const set = approved.get(row[1]);
      if (set) {
        set.sourceProducts++;
        if (validPrice(row[3])) set.withOrdinaryTrend++;
        if (validPrice(row[4])) set.withReverseHoloTrend++;
      }
    }
  }
  if (count !== manifest.matched) throw new Error('source product count mismatch');
  return Object.freeze({
    schema: 186, source: SOURCE, generatedAt: new Date(now).toISOString(),
    catalogCreatedAt: manifest.catalogCreatedAt, priceGuideCreatedAt: manifest.priceGuideCreatedAt,
    matchedSourceProducts: count, withOrdinaryTrend: ordinary,
    withReverseHoloTrend: reverseHolo, approvedExpansionSourceCoverage: [...approved.values()],
    assessment: 'SOURCE_COVERAGE_ONLY_NOT_VERIFIED_CARD_IDENTITY_OR_CONDITION_PRICES',
    containsPrices: false, containsPersonalData: false
  });
}

async function main(args = process.argv.slice(2)) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--dir', '--expansions', '--report'].includes(args[i]) || !args[i + 1] || options[args[i]]) throw new Error('use --dir, --expansions, --report');
    options[args[i].slice(2)] = args[i + 1];
  }
  if (!options.dir) throw new Error('--dir is required');
  const file = options.expansions || path.resolve(__dirname, '..', 'cardmarket-expansions-v186.json');
  const config = JSON.parse(await fs.readFile(file, 'utf8'));
  if (config?.schema !== 186 || !config.expansions || typeof config.expansions !== 'object') {
    throw new Error('unsupported expansion registry');
  }
  const report = JSON.stringify(await audit(options.dir, config.expansions), null, 2) + '\n';
  if (options.report) await fs.writeFile(options.report, report, {flag: 'wx'});
  else process.stdout.write(report);
}

if (require.main === module) main().catch(error => {
  process.stderr.write(`Cardmarket audit rejected: ${error.message}\n`);
  process.exitCode = 1;
});

module.exports = Object.freeze({audit, main});
