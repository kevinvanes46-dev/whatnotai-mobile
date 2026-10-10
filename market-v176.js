'use strict';
// Derived, local market observations only. Never writes collection or cloud data.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else Object.defineProperty(root,'HoloKeepMarket',{value:api});
})(globalThis,()=>{
  const KEY='holokeep_market_cache_v176',TTL=12*60*60*1000;
  const QUALITY=Object.freeze(['CONDITION_AWARE','GENERAL_MARKET','REFERENCE_ONLY','UNAVAILABLE']);
  const text=v=>String(v??'').trim();
  const collector=v=>text(v).split('/')[0].replace(/^0+(?=\d)/,'').toUpperCase();
  const name=v=>text(v).normalize('NFKC').toLowerCase().replace(/δ|delta species/gi,'').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
  function identity(item){
    const sourceId=text(item.sourceId||item.source_id);
    return {sourceId,sourceSetId:text(item.source_set_id||item.sourceSetId)||sourceId.slice(0,sourceId.lastIndexOf('-')),
      language:text(item.language).toUpperCase(),number:collector(item.number),name:name(item.name),
      variant:text(item.variant||'NORMAL').toUpperCase(),editionScope:text(item.edition||'AUTO').toUpperCase()};
  }
  function key(item){const i=identity(item);return JSON.stringify([i.sourceId,i.sourceSetId,i.language,i.number,i.name,i.variant,i.editionScope]);}
  function validateIdentity(card,item,requestedLanguage){
    const i=identity(item),expected=i.language==='JP'?'ja':i.language==='EN'?'en':'';
    if(!expected||requestedLanguage!==expected||!i.sourceId||!i.sourceSetId||!i.number)return false;
    if(card?.id!==i.sourceId||card?.set?.id!==i.sourceSetId||collector(card?.localId)!==i.number)return false;
    if(!i.sourceId.startsWith(i.sourceSetId+'-')||collector(i.sourceId.slice(i.sourceSetId.length+1))!==i.number)return false;
    if(!i.name||name(card?.name)!==i.name)return false;
    if(card.language&&![expected,i.language.toLowerCase()].includes(text(card.language).toLowerCase()))return false;
    return true;
  }
  function finish(card){
    const flags=card?.variants;
    if(!flags||typeof flags!=='object')return null;
    const possible=['normal','holo','reverse'].filter(k=>flags[k]===true);
    // NORMAL in the collection is not a finish selector. All alternatives count.
    if(possible.length!==1||possible[0]==='reverse')return null;
    if(['normal','holo','reverse'].some(k=>typeof flags[k]!=='boolean'))return null;
    for(const detail of card.variants_detailed||[]){
      if((detail.stamp||[]).includes('1st-edition'))continue;
      if(detail.type&&detail.type!==possible[0])return null;
      if((detail.stamp||[]).length)return null;
    }
    return possible[0]==='holo'?'holo':'non-foil';
  }
  function metric(cm,print){
    const suffix=print==='holo'?'-holo':'';
    for(const metric of ['trend','avg7','avg30']){
      const value=cm?.[metric+suffix];
      if(typeof value==='number'&&Number.isFinite(value)&&value>0)return {metric,metricField:metric+suffix,value};
    }
    return null;
  }
  function timestamp(value,now){
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(value))return null;
    const time=Date.parse(value);return Number.isFinite(time)&&time>0&&time<=now?new Date(time).toISOString():null;
  }
  function observe(card,item,{requestedLanguage,now=Date.now()}={}){
    const i=identity(item);
    const entry={...i,source:'TCGDEX_CARDMARKET',finish:null,metric:null,metricField:null,value:null,currency:null,
      quality:'UNAVAILABLE',reason:'NO_PRICE',sourceUpdatedAt:null,fetchedAt:new Date(now).toISOString()};
    if(!validateIdentity(card,item,requestedLanguage))return {...entry,reason:'IDENTITY'};
    if(i.editionScope==='1ST')return {...entry,reason:'FIRST_EDITION'};
    if(i.variant==='STAMPED')return {...entry,reason:'STAMPED'};
    if(i.variant!=='NORMAL')return {...entry,reason:'FINISH'};
    entry.finish=finish(card);
    if(!entry.finish)return {...entry,reason:'FINISH'};
    const cm=card?.pricing?.cardmarket;
    if(!cm)return entry;
    if(cm.unit!=='EUR'||!Number.isInteger(cm.idProduct)||cm.idProduct<=0)return {...entry,reason:'SOURCE'};
    const selected=metric(cm,entry.finish);
    if(!selected)return entry;
    // No condition-specific or Japanese market-language proof exists in this adapter.
    return {...entry,...selected,currency:'EUR',productId:cm.idProduct,sourceUpdatedAt:timestamp(cm.updated,now),
      quality:i.language==='JP'?'REFERENCE_ONLY':'GENERAL_MARKET',reason:null};
  }
  function freshness(entry,now=Date.now()){
    const at=timestamp(entry?.sourceUpdatedAt,now);if(!at)return 'UNKNOWN';
    const age=now-Date.parse(at);return age<=36*3600000?'CURRENT':age<=72*3600000?'STALE':'OLD';
  }
  function eligible(entry){return !!entry&&entry.source==='TCGDEX_CARDMARKET'&&entry.currency==='EUR'&&
    ['GENERAL_MARKET','CONDITION_AWARE'].includes(entry.quality)&&typeof entry.value==='number'&&Number.isFinite(entry.value)&&entry.value>0;}
  function read(storage){
    try{const c=JSON.parse(storage.getItem(KEY));if(c?.version===176&&c.entries&&typeof c.entries==='object'&&!Array.isArray(c.entries))return c;}catch(_){}
    return {version:176,entries:{}};
  }
  function get(storage,item){
    const entry=read(storage).entries[key(item)];
    if(!entry||key({...entry,edition:entry.editionScope})!==key(item)||entry.source!=='TCGDEX_CARDMARKET'||!QUALITY.includes(entry.quality))return null;
    // This version never creates condition-aware quotes. Reject incompatible cache claims.
    if(entry.quality==='CONDITION_AWARE'||(entry.quality==='GENERAL_MARKET'&&entry.language!=='EN'))return null;
    if(!Number.isFinite(Date.parse(entry.fetchedAt)))return null;
    if(entry.quality!=='UNAVAILABLE'&&(!['trend','avg7','avg30'].includes(entry.metric)||entry.currency!=='EUR'||
      !['non-foil','holo'].includes(entry.finish)||typeof entry.value!=='number'||!Number.isFinite(entry.value)||entry.value<=0||
      entry.variant!=='NORMAL'||entry.editionScope==='1ST'))return null;
    return entry;
  }
  function put(storage,item,entry){
    const cache=read(storage),previous=get(storage,item);
    // A lagging response may update the fetch throttle, never regress a known quote.
    if(previous&&eligible(previous)&&eligible(entry)&&previous.sourceUpdatedAt&&
      (!entry.sourceUpdatedAt||Date.parse(previous.sourceUpdatedAt)>Date.parse(entry.sourceUpdatedAt)))entry={...previous,fetchedAt:entry.fetchedAt};
    cache.entries[key(item)]=entry;
    const keys=Object.keys(cache.entries).sort((a,b)=>Date.parse(cache.entries[b]?.fetchedAt||0)-Date.parse(cache.entries[a]?.fetchedAt||0));
    for(const k of keys.slice(2000))delete cache.entries[k];
    storage.setItem(KEY,JSON.stringify(cache));return entry;
  }
  function due(entry,now=Date.now()){const at=Date.parse(entry?.fetchedAt);return !Number.isFinite(at)||at>now||now-at>=TTL;}
  function display(entry,item,{now=Date.now(),failed=false}={}){
    const reasons={FIRST_EDITION:'Geen passende 1st Edition-prijs',STAMPED:'Geen betrouwbare stamped-prijs',FINISH:'Uitvoering niet zeker genoeg voor prijs',IDENTITY:'Kaart niet zeker genoeg voor prijs',SOURCE:'Geen passende marktprijs beschikbaar',NO_PRICE:'Geen marktprijs beschikbaar'};
    const special=item.edition==='1ST'?'FIRST_EDITION':item.variant==='STAMPED'?'STAMPED':null;
    const legacy=!special&&!entry&&typeof item.price==='number'&&Number.isFinite(item.price)&&item.price>0;
    const value=special?null:entry?.value??(legacy?item.price:null);
    const labels={trend:'Cardmarket trend',avg7:'Cardmarket · 7-daags gemiddelde',avg30:'Cardmarket · 30-daags gemiddelde'};
    const state=freshness(entry,now);
    let date='Actualiteit onbekend';
    if(entry?.sourceUpdatedAt&&state!=='UNKNOWN')date='Bijgewerkt '+new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(entry.sourceUpdatedAt));
    if(state==='STALE')date+=' · Prijs mogelijk verouderd';
    if(state==='OLD')date+=' · Laatst bekende prijs';
    return {value,label:special?reasons[special]:legacy?'Oudere prijs · opnieuw controleren':entry?.quality==='REFERENCE_ONLY'?'Marktvergelijking · niet meegenomen in totaal':eligible(entry)?'Algemene marktindicatie':reasons[entry?.reason]||reasons.NO_PRICE,
      metric:value&&!legacy?labels[entry?.metric]||'':'',condition:value&&!legacy?'Conditie niet verwerkt':'',
      date:failed?'Vernieuwen mislukt · '+date:date,state,legacy};
  }
  function totals(items,lookup,now=Date.now()){
    const result={qty:0,priced:0,paidQty:0,value:0,paid:0,outdated:0};
    for(const item of items){
      if(item.listType==='WISHLIST')continue;
      const qty=Math.max(1,Number(item.qty)||1),entry=lookup(item);result.qty+=qty;
      if(eligible(entry)){result.priced+=qty;result.value+=entry.value*qty;if(freshness(entry,now)!=='CURRENT')result.outdated+=qty;}
      if(typeof item.paidEach==='number'&&Number.isFinite(item.paidEach)&&item.paidEach>=0){result.paidQty+=qty;result.paid+=item.paidEach*qty;}
    }
    return result;
  }
  return Object.freeze({KEY,TTL,QUALITY,identity,key,validateIdentity,finish,metric,observe,freshness,eligible,read,get,put,due,display,totals});
});
