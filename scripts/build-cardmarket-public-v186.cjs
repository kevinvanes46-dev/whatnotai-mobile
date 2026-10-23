'use strict';
// Usage: node scripts/build-cardmarket-public-v186.cjs --out /path/new-output
// Or add --catalog /path/catalog.json --prices /path/prices.json for offline testing.
// Source data is retrieved only from Cardmarket's officially published downloads.

const fs = require('node:fs/promises');
const path = require('node:path');
const {URLS, build, serialize} = require('./cardmarket-public-v186.cjs');

async function run(args = process.argv.slice(2), fetchImpl = fetch) {
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--out', '--catalog', '--prices'].includes(args[i]) || !args[i + 1]) throw new Error('use --out, --catalog and --prices');
    opts[args[i].slice(2)] = args[i + 1];
  }
  if (!opts.out || Boolean(opts.catalog) !== Boolean(opts.prices)) throw new Error('output required; supply both offline files or neither');
  const out = path.resolve(opts.out);
  if (out === path.parse(out).root || out === process.cwd() || path.basename(out) === '.' || path.basename(out) === '..') {
    throw new Error('unsafe output target');
  }
  // Validate both downloads *before* creating a publishable output directory.
  // A new directory is mandatory. Never replace or clean old user/release data.
  {
    async function read(which) {
      if (opts[which]) return JSON.parse(await fs.readFile(opts[which], 'utf8'));
      const response = await fetchImpl(URLS[which], {headers: {'Accept': 'application/json'}, signal: AbortSignal.timeout(60000)});
      if (!response.ok) throw new Error(`${which}: HTTP ${response.status}`);
      const len = Number(response.headers.get('content-length'));
      if (len && len > 35000000) throw new Error(`${which}: oversized source`);
      const raw = await response.text();
      if (raw.length > 35000000) throw new Error(`${which}: oversized payload`);
      return JSON.parse(raw);
    }
    const [catalog, prices] = await Promise.all([read('catalog'), read('prices')]);
    const result = build(catalog, prices, {
      minimumProducts: opts.catalog ? 0 : 70000,
      minimumGuides: opts.prices ? 0 : 70000
    });
    const files = serialize(result);
    await fs.mkdir(out, {recursive: false});
    for (const [name, data] of files) await fs.writeFile(path.join(out, name), data, {flag: 'wx'});
    return result.manifest;
  }
}

if (require.main === module) run().then(
  m => process.stdout.write(`Cardmarket v186 staged: ${m.matched} products, ${m.priceGuideCreatedAt}\n`),
  e => {process.stderr.write(`Import not published: ${e.message}\n`);process.exitCode = 1;}
);
module.exports = {run};
