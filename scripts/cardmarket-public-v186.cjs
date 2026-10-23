'use strict';
// Cardmarket's public downloadable Pokémon data, NOT an API or a price estimate.
// This module never uses TCGdex pricing fields and never reads user collections.

const crypto = require('node:crypto');

const VERSION = 186;
const SHARDS = 256;
const SOURCE = 'CARDMARKET_PUBLIC_GUIDE';
const URLS = Object.freeze({
  catalog: 'https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_6.json',
  prices: 'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json'
});

const isId = value => Number.isSafeInteger(value) && value > 0;
const validPrice = value => typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 10000000;

function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:Z|[+-]\d{2}:?\d{2})$/.test(value)) return null;
  const date = Date.parse(value);
  return Number.isFinite(date) ? new Date(date).toISOString() : null;
}

function assertDocument(doc, label, key, now, maxAgeMs) {
  if (!doc || doc.version !== 1 || !Array.isArray(doc[key]) || !doc[key].length) {
    throw new Error(`${label}: invalid schema`);
  }
  const updated = parseDate(doc.createdAt);
  if (!updated) throw new Error(`${label}: invalid createdAt`);
  const age = now - Date.parse(updated);
  if (age < -3600000 || age > maxAgeMs) throw new Error(`${label}: missing, future or stale source date`);
  return updated;
}

function build(catalog, prices, options = {}) {
  const now = options.now ?? Date.now();
  const maxAgeMs = options.maxAgeMs ?? 72 * 3600000;
  const catalogMaxAgeMs = options.catalogMaxAgeMs ?? 21 * 86400000;
  const minimumProducts = options.minimumProducts ?? 0;
  const minimumGuides = options.minimumGuides ?? 0;
  const catalogAt = assertDocument(catalog, 'catalog', 'products', now, catalogMaxAgeMs);
  const priceAt = assertDocument(prices, 'price guide', 'priceGuides', now, maxAgeMs);
  if (catalog.products.length < minimumProducts || prices.priceGuides.length < minimumGuides) {
    throw new Error('unexpectedly low source coverage');
  }

  const products = new Map();
  for (const row of catalog.products) {
    if (!isId(row?.idProduct)) throw new Error('catalog contains invalid product ID');
    if (products.has(row.idProduct)) throw new Error(`duplicate product ID: ${row.idProduct}`);
    products.set(row.idProduct, row);
  }
  const shards = Array.from({ length: SHARDS }, () => ({}));
  const guideIds = new Set();
  let matched = 0;
  for (const row of prices.priceGuides) {
    if (!isId(row?.idProduct)) throw new Error('price guide contains invalid product ID');
    if (guideIds.has(row.idProduct)) throw new Error(`duplicate guide ID: ${row.idProduct}`);
    guideIds.add(row.idProduct);
    const product = products.get(row.idProduct);
    if (!product || product.categoryName !== 'Pokémon Single' || !isId(product.idExpansion) ||
      typeof product.name !== 'string' || !product.name.trim()) continue;
    const trend = validPrice(row.trend) ? row.trend : null;
    const holo = validPrice(row['trend-holo']) ? row['trend-holo'] : null;
    if (trend === null && holo === null) continue;
    const id = row.idProduct;
    // Include the ID inside each row too. The client verifies that both the
    // lookup key and payload identify the same official Cardmarket product.
    shards[id % SHARDS][id] = [id, product.idExpansion, product.name, trend, holo];
    matched++;
  }
  if (!matched) throw new Error('no matched Pokémon price records');
  const manifest = {
    schema: VERSION, source: SOURCE, currency: 'EUR', metric: 'trend',
    priceGuideCreatedAt: priceAt, catalogCreatedAt: catalogAt,
    matched, shards: SHARDS,
    // The source is a product-level guide; it has no NM/EX, language, stamped,
    // reverse-holo, 1st Edition or graded condition proof.
    scope: 'GENERAL_PRODUCT_TREND_NOT_CONDITION_SPECIFIC'
  };
  return { manifest, shards };
}

function serialize(result) {
  const files = new Map();
  const checksums = {};
  for (let index = 0; index < SHARDS; index++) {
    const name = index.toString(16).padStart(2, '0') + '.json';
    const data = JSON.stringify({schema: VERSION, source: SOURCE, asOf: result.manifest.priceGuideCreatedAt, rows: result.shards[index]});
    files.set(name, data);
    checksums[name] = crypto.createHash('sha256').update(data).digest('hex');
  }
  files.set('manifest.json', JSON.stringify({...result.manifest, checksums}));
  return files;
}

module.exports = Object.freeze({VERSION, SHARDS, SOURCE, URLS, parseDate, validPrice, build, serialize});
