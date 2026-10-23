'use strict';
// Local history of *actual* Cardmarket daily snapshots only. Never backfills,
// interpolates, imports old TCGdex prices, or writes collection/cloud records.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else Object.defineProperty(root, 'HoloDexCardmarketHistoryV186', {value: api});
})(globalThis, () => {
  const KEY = 'holodex_cardmarket_history_v186';
  const VERSION = 186, DAY = 86400000;
  const MAX_BYTES = 1048576, MAX_HOLDINGS = 1000, MAX_COHORTS = 8, MAX_POINTS = 400;
  const RANGES = Object.freeze({'1W':7,'1M':30,'3M':90,'1J':365,'Alles':Infinity});
  const source = 'CARDMARKET_PUBLIC_GUIDE';
  const unavailable = reason => ({status:'UNAVAILABLE',reason,points:[]});
  const positive = x => typeof x === 'number' && Number.isFinite(x) && x > 0 && x <= 10000000;
  const iso = (x, now) => typeof x === 'string' && Number.isFinite(Date.parse(x)) && new Date(x).toISOString() === x && Date.parse(x) <= now;
  const finger = rows => JSON.stringify([source,'EUR','trend',rows]);
  const canOwn = x => x && (x.listType === 'OWNED' || x.listType === 'WISHLIST');

  function observe(items, lookup, now = Date.now()) {
    if (!Array.isArray(items) || !items.every(canOwn) || items.length > MAX_HOLDINGS || typeof lookup !== 'function') return unavailable('HOLDINGS');
    const own = items.filter(x => x.listType === 'OWNED');
    if (!own.length) return unavailable('EMPTY');
    const rows = new Map();
    let asOf = null;
    for (const item of own) {
      if (!Number.isSafeInteger(item.qty) || item.qty < 1 || !['NM','EX','GD','PL'].includes(item.condition) ||
        item.language !== 'EN' || item.variant !== 'NORMAL' || item.edition !== 'UNLIMITED' ||
        typeof item.sourceId !== 'string' || !item.sourceId || typeof item.name !== 'string' || !item.name) return unavailable('IDENTITY');
      const q = lookup(item);
      if (q?.state !== 'AVAILABLE' || q.source !== source || q.currency !== 'EUR' || q.metric !== 'trend' ||
        q.quality !== 'GENERAL_MARKET' || q.conditionSpecific !== false || q.languageSpecific !== false ||
        !Number.isSafeInteger(q.productId) || q.productId < 1 || !['holo','non-foil'].includes(q.finish) || !positive(q.value) ||
        !iso(q.asOf, now) || now - Date.parse(q.asOf) > 72 * 3600000) return unavailable('PRICE');
      if (asOf !== null && asOf !== q.asOf) return unavailable('MIXED_DATES');
      asOf = q.asOf;
      const identity = [item.sourceId, item.source_set_id || item.sourceSetId, item.number, item.name,
        item.language, item.variant, item.edition, item.condition, q.productId, q.finish];
      if (typeof identity[1] !== 'string' || !item.sourceId.startsWith(identity[1]+'-') ||
        !identity[2] || String(identity[2]).split('/')[0].replace(/^0+(?=\d)/,'').toUpperCase() !==
          item.sourceId.slice(identity[1].length+1).replace(/^0+(?=\d)/,'').toUpperCase()) return unavailable('IDENTITY');
      const key = JSON.stringify(identity);
      const previous = rows.get(key);
      if (previous && previous.price !== q.value) return unavailable('CONFLICT');
      const qty = (previous?.qty || 0) + item.qty;
      if (!Number.isSafeInteger(qty)) return unavailable('QUANTITY');
      rows.set(key, {identity,qty,price:q.value});
    }
    const sorted = [...rows.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([,r])=>r);
    const holdings = sorted.map(({identity,qty})=>({identity,qty}));
    const prices = sorted.map(r=>r.price);
    const value = sorted.reduce((n,r)=>n+r.qty*r.price,0);
    if (!Number.isFinite(value) || value <= 0 || value > 10000000000) return unavailable('VALUE');
    return {status:'VALID',fingerprint:finger(holdings),holdings,
      point:{observedAt:asOf,recordedAt:new Date(now).toISOString(),value,prices}};
  }

  function validCohort(c, now) {
    if (!c || !Array.isArray(c.holdings) || !c.holdings.length || c.holdings.length > MAX_HOLDINGS ||
      c.fingerprint !== finger(c.holdings) || !Array.isArray(c.points) || c.points.length > MAX_POINTS ||
      !Array.isArray(c.conflicts) || c.conflicts.length > MAX_POINTS || !c.conflicts.every(t=>iso(t,now))) return false;
    if (!c.holdings.every(h=>Array.isArray(h.identity) && h.identity.length===10 && h.identity.every(x=>typeof x==='string'||Number.isSafeInteger(x)) &&
      Number.isSafeInteger(h.qty) && h.qty>0)) return false;
    let previous = -Infinity;
    return c.points.every(p => {
      if (!iso(p?.observedAt,now) || !iso(p?.recordedAt,now) || p.recordedAt < p.observedAt ||
        Date.parse(p.observedAt) <= previous || c.conflicts.includes(p.observedAt) ||
        !Array.isArray(p.prices) || p.prices.length !== c.holdings.length || !p.prices.every(positive) ||
        typeof p.value !== 'number' || !Number.isFinite(p.value) || p.value <= 0 ||
        Math.abs(p.value - p.prices.reduce((n,x,i)=>n+x*c.holdings[i].qty,0)) > 0.000001) return false;
      previous=Date.parse(p.observedAt);
      return true;
    });
  }

  function read(storage, now = Date.now()) {
    try {
      const raw = storage.getItem(KEY);
      if (raw === null) return {status:'NEW',data:{version:VERSION,cohorts:[]}};
      if (raw.length*2 > MAX_BYTES) return unavailable('CORRUPT');
      const data = JSON.parse(raw);
      if (data?.version !== VERSION || !Array.isArray(data.cohorts) || data.cohorts.length > MAX_COHORTS ||
        !data.cohorts.every(c=>validCohort(c,now)) ||
        new Set(data.cohorts.map(c=>c.fingerprint)).size !== data.cohorts.length) return unavailable('CORRUPT');
      return {status:'OK',data};
    } catch (_) {return unavailable('STORAGE');}
  }

  function capture(storage,items,lookup,now = Date.now()) {
    const saved = read(storage,now);
    if (!saved.data) return saved;
    const next = observe(items,lookup,now);
    if (next.status !== 'VALID') return next;
    const data=saved.data;
    let cohort=data.cohorts.find(c=>c.fingerprint===next.fingerprint);
    if (!cohort) {
      cohort={fingerprint:next.fingerprint,holdings:next.holdings,points:[],conflicts:[]};
      data.cohorts.push(cohort);
    }
    const p=next.point;
    if (cohort.conflicts.includes(p.observedAt)) return unavailable('CONFLICT');
    const old=cohort.points.find(x=>x.observedAt===p.observedAt);
    if (old && JSON.stringify(old.prices)===JSON.stringify(p.prices) && old.value===p.value) return {status:'DUPLICATE'};
    if (old) {
      // Two different prices for one official publication timestamp are not a
      // real trend. Invalidate that point, don't replace it with invented data.
      cohort.points=cohort.points.filter(x=>x!==old);
      cohort.conflicts.push(p.observedAt);
    } else {
      const latest=[...cohort.points.map(x=>x.observedAt),...cohort.conflicts].sort().at(-1);
      if (latest && p.observedAt <= latest) return unavailable('OLDER_SOURCE');
      cohort.points.push(p);
    }
    cohort.points=cohort.points.slice(-MAX_POINTS);
    data.cohorts=data.cohorts.slice(-MAX_COHORTS);
    const encoded=JSON.stringify(data);
    if (encoded.length*2 > MAX_BYTES) return unavailable('LIMIT');
    try {storage.setItem(KEY,encoded);} catch (_) {return unavailable('STORAGE');}
    return old ? unavailable('CONFLICT') : {status:'STORED'};
  }

  function series(storage,items,lookup,range='1M',now=Date.now()) {
    if (!Object.hasOwn(RANGES,range)) return unavailable('RANGE');
    const saved=read(storage,now);
    if (!saved.data) return saved;
    const current=observe(items,lookup,now);
    if (current.status!=='VALID') return current;
    const cohort=saved.data.cohorts.find(c=>c.fingerprint===current.fingerprint);
    if (!cohort || cohort.conflicts.includes(current.point.observedAt)) return unavailable('INSUFFICIENT');
    const start=now-RANGES[range]*DAY;
    const points=cohort.points.filter(p=>Date.parse(p.observedAt)>=start && Date.parse(p.observedAt)<=now);
    if (points.length<2) return unavailable('INSUFFICIENT');
    return {status:'AVAILABLE',source,currency:'EUR',metric:'trend',
      label:'Cardmarket algemene trend · EUR · conditie en taal niet verwerkt',
      points:points.map(p=>({observedAt:p.observedAt,value:p.value})),
      difference:points.at(-1).value-points[0].value};
  }
  return Object.freeze({KEY,VERSION,RANGES,observe,read,capture,series});
});
