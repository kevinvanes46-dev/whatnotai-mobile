'use strict';
// Read-only, same-origin Cardmarket public guide reader. No third-party browser
// request, no user data, no automatic fallback to any legacy numeric prices.
(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports
    ? require('./cardmarket-price-v186.js') : root.HoloDexCardmarketOfficialV186);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else Object.defineProperty(root, 'HoloDexCardmarketFeedV186', {value: api});
})(globalThis, (engine) => {
  const unavailable = reason => Object.freeze({state: 'UNAVAILABLE', value: null, reason});
  const ID = v => Number.isSafeInteger(v) && v > 0;
  const MAX_MANIFEST = 64000;
  const MAX_SHARD = 1048576;
  const SHA256 = /^[a-f0-9]{64}$/;

  async function loadQuote({item, card, expansions, basePath = './cardmarket-public-v186/',
    fetchImpl = globalThis.fetch, cryptoImpl = globalThis.crypto, now = Date.now(), signal} = {}) {
    const productId = card?.pricing?.cardmarket?.idProduct;
    if (!ID(productId)) return unavailable('PRODUCT_ID');
    if (!engine || typeof engine.quote !== 'function' || typeof fetchImpl !== 'function' ||
      !cryptoImpl?.subtle?.digest || !/^(?:\.\/|\/)[a-zA-Z0-9_/-]+\/$/.test(basePath) || basePath.includes('//')) return unavailable('CONFIG');
    try {
      const read = async (file, maxBytes) => {
        const response = await fetchImpl(basePath + file, {credentials: 'omit', cache: 'no-store', signal});
        if (!response?.ok) throw new Error('FETCH');
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength > maxBytes || !bytes.byteLength) throw new Error('SIZE');
        return bytes;
      };
      const manifestBytes = await read('manifest.json', MAX_MANIFEST);
      const manifest = JSON.parse(new TextDecoder().decode(manifestBytes));
      if (manifest?.schema !== 186 || manifest.source !== engine.SOURCE || manifest.currency !== 'EUR' ||
        manifest.metric !== 'trend' || manifest.shards !== 256 ||
        manifest.scope !== 'GENERAL_PRODUCT_TREND_NOT_CONDITION_SPECIFIC' ||
        !Number.isSafeInteger(manifest.matched) || manifest.matched < 1 ||
        !manifest.checksums || typeof manifest.checksums !== 'object') return unavailable('MANIFEST');
      const shardFile = engine.shardPath(productId);
      const digest = manifest.checksums[shardFile];
      if (!SHA256.test(digest || '')) return unavailable('MANIFEST');
      // Quote validates source timestamp/identity before any price is returned.
      const when = Date.parse(manifest.priceGuideCreatedAt);
      if (!Number.isFinite(when) || now - when > 72 * 3600000 || when - now > 3600000) return unavailable('STALE_SOURCE');
      const shardBytes = await read(shardFile, MAX_SHARD);
      const actual = Array.from(new Uint8Array(await cryptoImpl.subtle.digest('SHA-256', shardBytes)),
        b => b.toString(16).padStart(2, '0')).join('');
      if (actual !== digest) return unavailable('HASH_MISMATCH');
      const shard = JSON.parse(new TextDecoder().decode(shardBytes));
      if (shard?.schema !== 186 || shard.source !== engine.SOURCE ||
        shard.asOf !== manifest.priceGuideCreatedAt || !shard.rows ||
        typeof shard.rows !== 'object' || Array.isArray(shard.rows)) return unavailable('SHARD');
      return engine.quote({item,card,productRow:shard.rows[productId],manifest,expansions,now});
    } catch (_) {
      return unavailable('FETCH_OR_PARSE');
    }
  }
  return Object.freeze({loadQuote});
});
