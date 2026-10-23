'use strict';
// Read-only quotation contract for Cardmarket's official daily public price guide.
// Intentionally NOT wired to v185 production: a new price source needs full UX,
// history, storage and PWA review before its global market policy is enabled.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else Object.defineProperty(root, 'HoloDexCardmarketOfficialV186', {value: api});
})(globalThis, () => {
  const SOURCE = 'CARDMARKET_PUBLIC_GUIDE';
  const iso = v => typeof v === 'string' && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v;
  const id = v => Number.isSafeInteger(v) && v > 0;
  const norm = v => String(v || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  const collector = v => String(v || '').split('/')[0].replace(/^0+(?=\d)/, '').toUpperCase();
  const unavailable = reason => Object.freeze({state: 'UNAVAILABLE', value: null, reason});

  function quote({item, card, productRow, manifest, expansions, now = Date.now()} = {}) {
    // The numeric TCGdex price is never read. Only its Cardmarket product ID is
    // a provisional cross-reference, verified against the official catalog.
    if (manifest?.schema !== 186 || manifest.source !== SOURCE || manifest.currency !== 'EUR' || manifest.metric !== 'trend' || !iso(manifest.priceGuideCreatedAt)) return unavailable('SOURCE');
    const age = now - Date.parse(manifest.priceGuideCreatedAt);
    if (age < -3600000 || age > 72 * 3600000) return unavailable('STALE_SOURCE');
    if (!item || !card || !productRow || !expansions || typeof expansions !== 'object') return unavailable('IDENTITY');
    const language = item.language === 'JP' ? 'ja' : item.language === 'EN' ? 'en' : null;
    const sourceId = String(item.sourceId || item.source_id || '');
    const sourceSet = String(item.source_set_id || item.sourceSetId || sourceId.slice(0, sourceId.lastIndexOf('-')));
    const number = collector(item.number);
    if (!language || !sourceId || !sourceSet || !number ||
      norm(card.id) !== norm(sourceId) || norm(card.set?.id) !== norm(sourceSet) ||
      norm(sourceId.slice(0, sourceSet.length + 1)) !== norm(sourceSet + '-') ||
      collector(card.localId) !== number || collector(sourceId.slice(sourceSet.length + 1)) !== number ||
      norm(card.name) !== norm(item.name)) return unavailable('IDENTITY');
    // The official catalog names Japanese singles in Latin script, while
    // TCGdex names may be Japanese. Expansion + a provisional product ID alone
    // cannot prove the exact print/number. Wait for reviewed JP aliases.
    if (language === 'ja') return unavailable('JAPANESE_PRODUCT_UNVERIFIED');
    const productId = card.pricing?.cardmarket?.idProduct;
    if (!id(productId)) return unavailable('PRODUCT_ID');
    const approvedExpansion = expansions[sourceSet.toLowerCase()];
    if (!Array.isArray(productRow) || productRow.length !== 5 || productRow[0] !== productId) return unavailable('PRODUCT_ID_MISMATCH');
    if (!id(approvedExpansion) || productRow[1] !== approvedExpansion) return unavailable('EXPANSION_UNVERIFIED');
    if (typeof productRow[2] !== 'string' || !productRow[2].trim()) return unavailable('PRODUCT_NAME');
    if (language === 'en' && norm(productRow[2].split(' [')[0]) !== norm(item.name)) return unavailable('PRODUCT_NAME');
    if (item.variant !== 'NORMAL' || item.edition === '1ST') return unavailable('SPECIAL_VARIANT');
    if (item.edition !== 'UNLIMITED' && !(item.edition === 'AUTO' && card.variants?.firstEdition === false)) return unavailable('EDITION_UNVERIFIED');
    const v = card.variants;
    if (!v || v.reverse !== false || typeof v.normal !== 'boolean' || typeof v.holo !== 'boolean' || v.normal === v.holo) return unavailable('FINISH_UNVERIFIED');
    const finish = v.holo ? 'holo' : 'non-foil';
    // Cardmarket treats regular holo as a *rarity* and Reverse Holo as a
    // separate listing attribute. A TCGdex `variants.holo` flag refers to
    // regular holo rarity, so it DOES NOT justify selecting `trend-holo`.
    // Only use the ordinary product trend for explicit non-reverse cards.
    if (card.variants_detailed != null) {
      if (!Array.isArray(card.variants_detailed) || card.variants_detailed.some(detail =>
        !detail || typeof detail !== 'object' ||
        (detail.stamp != null && !Array.isArray(detail.stamp)) ||
        (Array.isArray(detail.stamp) && detail.stamp.some(stamp => stamp !== '1st-edition')) ||
        (detail.type && detail.type !== (v.holo ? 'holo' : 'normal')))) return unavailable('FINISH_UNVERIFIED');
    }
    const value = productRow[3];
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 10000000) return unavailable('PRICE_MISSING');
    return Object.freeze({state: 'AVAILABLE', source: SOURCE, currency: 'EUR', metric: 'trend',
      productId, finish, priceField: 'trend', value, asOf: manifest.priceGuideCreatedAt, quality: 'GENERAL_MARKET',
      conditionSpecific: false, languageSpecific: false});
  }

  // Shard filenames derive only from a validated Cardmarket product ID.
  function shardPath(productId) {
    if (!id(productId)) return null;
    return (productId % 256).toString(16).padStart(2, '0') + '.json';
  }
  return Object.freeze({SOURCE, quote, shardPath});
});
