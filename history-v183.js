'use strict';
// Local observations only. No provider requests, collection writes or cloud data.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else Object.defineProperty(root,'HoloDexHistory',{value:api});
})(globalThis,()=>{
  const KEY='holokeep_value_history_v183',VERSION=183,DAY=86400000;
  const LIMITS=Object.freeze({cohorts:8,points:400,holdings:1000,bytes:1048576});
  const RANGES=Object.freeze({'1W':7,'1M':30,'3M':90,'1J':365,Alles:Infinity});
  const iso=(v,now)=>typeof v==='string'&&/^\d{4}-\d\d-\d\dT/.test(v)&&Number.isFinite(Date.parse(v))&&Date.parse(v)<=now&&new Date(v).toISOString()===v;
  const positive=v=>typeof v==='number'&&Number.isFinite(v)&&v>0;
  const fingerprint=c=>JSON.stringify([c.provider,c.currency,c.metric,c.holdings]);
  const unavailable=reason=>({status:'UNAVAILABLE',reason,points:[]});
  function candidate(items,storage,Market,now=Date.now()){
    if(!Array.isArray(items)||items.length>LIMITS.holdings||!items.every(x=>x&&['OWNED','WISHLIST'].includes(x.listType)))return unavailable('HOLDINGS');
    const own=items.filter(x=>x.listType==='OWNED');if(!own.length)return unavailable('EMPTY');
    const rows=new Map();let observedAt=null,metric=null;
    for(const item of own){
      if(!Number.isSafeInteger(item.qty)||item.qty<1||!['NM','EX','GD','PL'].includes(item.condition))return unavailable('HOLDINGS');
      const e=Market.get(storage,item);
      // eligible alone is not an identity proof. get + all captured metadata are checked.
      if(!e||!Market.eligible(e)||Market.freshness(e,now)!=='CURRENT'||e.quality!=='GENERAL_MARKET'||e.language!=='EN'||e.source!=='TCGDEX_CARDMARKET'||e.currency!=='EUR'||e.variant!=='NORMAL'||!['UNLIMITED'].includes(e.editionScope)||!Number.isSafeInteger(e.productId)||e.productId<1)return unavailable('PRICE');
      if(!iso(e.sourceUpdatedAt,now)||!iso(e.fetchedAt,now)||Date.parse(e.fetchedAt)<Date.parse(e.sourceUpdatedAt))return unavailable('TIMESTAMP');
      if(!['trend','avg7','avg30'].includes(e.metric)||!['holo','non-foil'].includes(e.finish)||e.metricField!==e.metric+(e.finish==='holo'?'-holo':''))return unavailable('METRIC');
      const identity=Market.identity(item);
      if(!identity.sourceId||!identity.sourceSetId||!identity.number||!identity.name||!identity.sourceId.startsWith(identity.sourceSetId+'-')||identity.sourceId.slice(identity.sourceSetId.length+1).replace(/^0+(?=\d)/,'').toUpperCase()!==identity.number)return unavailable('IDENTITY');
      if(observedAt&&observedAt!==e.sourceUpdatedAt)return unavailable('TIMESTAMP_MIX');
      if(metric&&metric!==e.metric)return unavailable('METRIC_MIX');
      observedAt=e.sourceUpdatedAt;metric=e.metric;
      const holding={...identity,condition:item.condition,finish:e.finish,productId:e.productId,metricField:e.metricField,quality:e.quality};
      const id=JSON.stringify(holding),previous=rows.get(id);
      if(previous&&previous.price!==e.value)return unavailable('CONFLICT');
      rows.set(id,{holding,qty:(previous?.qty||0)+item.qty,price:e.value});
    }
    const sorted=[...rows].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([,v])=>v);
    if(sorted.some(r=>!Number.isSafeInteger(r.qty)))return unavailable('QUANTITY');
    const holdings=sorted.map(r=>({...r.holding,qty:r.qty})),prices=sorted.map(r=>r.price);
    const value=sorted.reduce((sum,r)=>sum+r.qty*r.price,0);if(!positive(value))return unavailable('VALUE');
    const cohort={provider:'TCGDEX_CARDMARKET',currency:'EUR',metric,holdings};
    return {status:'VALID',cohort:{...cohort,fingerprint:fingerprint(cohort)},point:{observedAt,generatedAt:new Date(now).toISOString(),value,prices}};
  }
  function validCohort(c,now,startedAt){
    if(!c||c.provider!=='TCGDEX_CARDMARKET'||c.currency!=='EUR'||!['trend','avg7','avg30'].includes(c.metric)||!Array.isArray(c.holdings)||!c.holdings.length||c.holdings.length>LIMITS.holdings||c.fingerprint!==fingerprint(c))return false;
    if(!c.holdings.every(h=>h&&h.language==='EN'&&h.variant==='NORMAL'&&['UNLIMITED'].includes(h.editionScope)&&['NM','EX','GD','PL'].includes(h.condition)&&['holo','non-foil'].includes(h.finish)&&h.quality==='GENERAL_MARKET'&&h.metricField===c.metric+(h.finish==='holo'?'-holo':'')&&Number.isSafeInteger(h.productId)&&h.productId>0&&Number.isSafeInteger(h.qty)&&h.qty>0&&typeof h.name==='string'&&h.name.length&&typeof h.sourceId==='string'&&typeof h.sourceSetId==='string'&&h.sourceId.startsWith(h.sourceSetId+'-')&&h.sourceId.slice(h.sourceSetId.length+1).replace(/^0+(?=\d)/,'').toUpperCase()===h.number))return false;
    if(!Array.isArray(c.points)||c.points.length>LIMITS.points||!Array.isArray(c.conflicts)||c.conflicts.length>LIMITS.points)return false;
    if(!c.conflicts.every(t=>iso(t,now))||new Set(c.conflicts).size!==c.conflicts.length)return false;
    let last=0;
    return c.points.every(p=>{
      if(!p||!iso(p.observedAt,now)||!iso(p.generatedAt,now)||p.generatedAt<p.observedAt||p.generatedAt<startedAt||!positive(p.value)||!Array.isArray(p.prices)||p.prices.length!==c.holdings.length||!p.prices.every(positive)||c.conflicts.includes(p.observedAt))return false;
      const t=Date.parse(p.observedAt);if(t<=last)return false;last=t;
      return p.value===p.prices.reduce((n,v,i)=>n+v*c.holdings[i].qty,0);
    });
  }
  function read(storage,now=Date.now()){
    try{
      const raw=storage.getItem(KEY);if(raw===null)return {status:'NEW',data:{version:VERSION,startedAt:new Date(now).toISOString(),cohorts:[]}};
      if(raw.length*2>LIMITS.bytes)return unavailable('CORRUPT');
      const data=JSON.parse(raw);
      if(data?.version!==VERSION||!iso(data.startedAt,now)||!Array.isArray(data.cohorts)||data.cohorts.length>LIMITS.cohorts||!data.cohorts.every(c=>validCohort(c,now,data.startedAt))||new Set(data.cohorts.map(c=>c.fingerprint)).size!==data.cohorts.length)return unavailable('CORRUPT');
      return {status:'OK',data};
    }catch{return unavailable('STORAGE');}
  }
  // Browser callers serialize this read/modify/write with an origin-scoped Web Lock.
  const priceIdentity=h=>JSON.stringify([h.sourceId,h.sourceSetId,h.number,h.name,h.language,h.variant,h.editionScope,h.finish,h.productId,h.metricField]);
  function conflictsWith(c,sample){
    const p=c.points.find(p=>p.observedAt===sample.point.observedAt);
    const incoming=new Map(sample.cohort.holdings.map((h,i)=>[priceIdentity(h),sample.point.prices[i]]));
    const overlap=c.holdings.some(h=>incoming.has(priceIdentity(h)));
    return overlap&&(c.conflicts.includes(sample.point.observedAt)||!!p&&c.holdings.some((h,i)=>incoming.has(priceIdentity(h))&&incoming.get(priceIdentity(h))!==p.prices[i]));
  }
  function capture(storage,items,Market,now=Date.now()){

    const saved=read(storage,now);if(!saved.data)return saved;
    const sample=candidate(items,storage,Market,now);if(sample.status!=='VALID')return sample;
    const data=saved.data;let c=data.cohorts.find(c=>c.fingerprint===sample.cohort.fingerprint);
    if(!c){c={...sample.cohort,points:[],conflicts:[]};data.cohorts.push(c);}
    const p=sample.point,old=c.points.find(x=>x.observedAt===p.observedAt);
    const conflicting=data.cohorts.filter(other=>conflictsWith(other,sample));
    if(conflicting.length){
      for(const other of new Set([...conflicting,c])){
        other.points=other.points.filter(x=>x.observedAt!==p.observedAt);
        if(!other.conflicts.includes(p.observedAt))other.conflicts.push(p.observedAt);
        other.conflicts=other.conflicts.sort().slice(-LIMITS.points);
      }
      data.cohorts=data.cohorts.filter(x=>x!==c).concat(c).slice(-LIMITS.cohorts);
      const encoded=JSON.stringify(data);
      if(encoded.length*2>LIMITS.bytes)return unavailable('LIMIT');
      try{storage.setItem(KEY,encoded);}catch{return unavailable('STORAGE');}
      return unavailable('CONFLICT');
    }
    if(c.conflicts.includes(p.observedAt))return unavailable('CONFLICT');
    if(old){
      if(JSON.stringify(old.prices)===JSON.stringify(p.prices)&&old.value===p.value)return {status:'DUPLICATE',fingerprint:c.fingerprint};
      c.points=c.points.filter(x=>x.observedAt!==p.observedAt);c.conflicts.push(p.observedAt);
    }else{
      const latest=[...c.points.map(p=>p.observedAt),...c.conflicts].sort().at(-1);
      if(latest&&p.observedAt<latest)return unavailable('OLDER_SOURCE');
      // Start with today's real observation; never import an old series or synthesize dates.
      c.points.push(p);
    }
    c.points=c.points.slice(-LIMITS.points);c.conflicts=c.conflicts.slice(-LIMITS.points);
    data.cohorts=data.cohorts.filter(x=>x!==c).concat(c).slice(-LIMITS.cohorts);
    let encoded=JSON.stringify(data);
    while(encoded.length*2>LIMITS.bytes){
      if(data.cohorts.length>1)data.cohorts.shift();
      else if(c.points.length>1)c.points.shift();
      else return unavailable('LIMIT');
      encoded=JSON.stringify(data);
    }
    try{storage.setItem(KEY,encoded);}catch{return unavailable('STORAGE');}
    return old?unavailable('CONFLICT'):{status:'STORED',fingerprint:c.fingerprint};
  }
  function series(storage,items,Market,range='1M',now=Date.now()){
    if(!Object.hasOwn(RANGES,range))return unavailable('RANGE');
    const saved=read(storage,now);if(!saved.data)return saved;
    // Compatibility/coverage must hold now as well, not only at the last saved point.
    const sample=candidate(items,storage,Market,now);if(sample.status!=='VALID')return sample;
    const c=saved.data.cohorts.find(c=>c.fingerprint===sample.cohort.fingerprint);if(!c||c.conflicts.includes(sample.point.observedAt))return unavailable('INSUFFICIENT');
    if(saved.data.cohorts.some(other=>conflictsWith(other,sample)))return unavailable('CONFLICT');
    const cutoff=now-RANGES[range]*DAY;
    const points=c.points.filter(p=>Date.parse(p.observedAt)>=cutoff&&Date.parse(p.observedAt)<=now);
    if(points.length<2)return unavailable('INSUFFICIENT');
    return {status:'AVAILABLE',provider:c.provider,currency:c.currency,metric:c.metric,coverage:1,fingerprint:c.fingerprint,quantities:c.holdings.reduce((n,h)=>n+h.qty,0),points:points.map(({observedAt,value})=>({observedAt,value})),difference:points.at(-1).value-points[0].value,label:'Cardmarket · EUR · Algemene marktindicatie; conditie niet verwerkt'};
  }
  return Object.freeze({KEY,VERSION,LIMITS,RANGES,candidate,read,capture,series});
});
