'use strict';
// Production orchestration for the existing v186 official-guide engine.
// No legacy numeric prices, collection writes, cloud writes or inferred history.
(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./cardmarket-feed-v186.js'):root.HoloDexCardmarketFeedV186);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.HoloKeepOfficialMarket=api;
})(globalThis,feed=>{
  const unavailable=reason=>({state:'UNAVAILABLE',value:null,reason});
  const reasons={
    EDITION_UNVERIFIED:'Kies eerst een gecontroleerde Unlimited-uitvoering.',
    SPECIAL_VARIANT:'Deze editie of uitvoering heeft nog geen geverifieerde prijsdekking.',
    JAPANESE_PRODUCT_UNVERIFIED:'Japanse productidentiteit is nog niet onafhankelijk geverifieerd.',
    IDENTITY:'Kaartnaam, set of kaartnummer kon niet exact worden bevestigd.',
    PRODUCT_ID:'Geen geverifieerde Cardmarket-product-ID voor deze uitvoering.',
    EXPANSION_UNVERIFIED:'Deze set heeft nog geen gecontroleerde Cardmarket-prijskoppeling.',
    STALE_SOURCE:'De officiële snapshot is verouderd; er wordt geen actuele prijs getoond.',
    PRICE_MISSING:'De officiële snapshot bevat geen bruikbare trend voor dit product.',
    FETCH_OR_PARSE:'Officiële snapshot niet bereikbaar of ongeldig. Probeer opnieuw wanneer je online bent.',
    CARD_SOURCE:'Kaartidentiteit niet bereikbaar. Probeer opnieuw wanneer je online bent.',
    HASH_MISMATCH:'Broncontrole mislukt; de snapshot is niet gebruikt.',
    FINISH_UNVERIFIED:'Finish of productvariant is niet eenduidig bevestigd.'
  };
  const norm=v=>String(v||'').normalize('NFKC').toLowerCase().trim();
  const number=v=>String(v||'').split('/')[0].replace(/^0+(?=\d)/,'').toUpperCase();
  const observed=new Map();
  const key=i=>JSON.stringify([i.sourceId||i.source_id,i.source_set_id||i.sourceSetId,i.language,norm(i.name),number(i.number),i.variant,i.edition]);
  function cached(item){return observed.get(key(item))||unavailable('NOT_CHECKED');}
  function verifiedCard(item,card,productId){
    const sourceId=item.sourceId||item.source_id,set=item.source_set_id||item.sourceSetId;
    if(item.language==='JP')return {error:'JAPANESE_PRODUCT_UNVERIFIED'};
    if(item.language!=='EN'||card?.id!==sourceId||card?.set?.id!==set||
      norm(card.name)!==norm(item.name)||number(card.localId)!==number(item.number))return {error:'IDENTITY'};
    if(item.variant!=='NORMAL'||item.edition==='1ST')return {error:'SPECIAL_VARIANT'};
    if(item.edition!=='UNLIMITED'&&!(item.edition==='AUTO'&&card.variants?.firstEdition===false))return {error:'EDITION_UNVERIFIED'};
    const variants=card.variants_detailed;
    if(!Array.isArray(variants))return {error:'FINISH_UNVERIFIED'};
    const choices=variants.filter(v=>['holo','normal'].includes(v.type)&&
      (!v.size||v.size==='standard')&&(!v.stamp||(Array.isArray(v.stamp)&&!v.stamp.length))&&
      (!v.subtype||v.subtype==='unlimited')&&(!v.foil||v.foil==='holo')&&
      (v.subtype==='unlimited'||card.variants?.firstEdition===false)&&
      Number.isSafeInteger(v.thirdParty?.cardmarket)&&v.thirdParty.cardmarket>0&&
      (productId==null||v.thirdParty.cardmarket===productId));
    if(choices.length!==1)return {error:'FINISH_UNVERIFIED'};
    const v=choices[0],id=v.thirdParty.cardmarket;
    // The ordinary trend is separate from reverse holo. Other subtypes sharing
    // this product ID cannot establish a unique ordinary print.
    if(variants.some(other=>other!==v&&other.thirdParty?.cardmarket===id&&other.type!=='reverse'))return {error:'FINISH_UNVERIFIED'};
    return {card:{...card,variants:{normal:v.type==='normal',holo:v.type==='holo',reverse:false,firstEdition:false},
      variants_detailed:[v],pricing:{cardmarket:{idProduct:id}}}};
  }
  async function quote(item,{card,productId,fetchImpl=globalThis.fetch,cryptoImpl=globalThis.crypto,now=Date.now(),signal}={}){
    if(item)observed.delete(key(item));
    if(item?.language==='JP')return unavailable('JAPANESE_PRODUCT_UNVERIFIED');
    const sourceId=item?.sourceId||item?.source_id;
    if(typeof sourceId!=='string'||!/^[a-zA-Z0-9._-]{2,90}$/.test(sourceId))return unavailable('IDENTITY');
    let failure='CARD_SOURCE';
    try{
      if(!card){const r=await fetchImpl('https://api.tcgdex.net/v2/en/cards/'+encodeURIComponent(sourceId),
        {credentials:'omit',cache:'no-cache',signal:signal||AbortSignal.timeout(12000)});
        if(!r.ok)return unavailable('CARD_SOURCE');card=await r.json();}
      const checked=verifiedCard(item,card,productId);if(checked.error)return unavailable(checked.error);
      failure='FETCH_OR_PARSE';
      // Only the reviewed expansion allowlist is used, never a majority guess.
      const r=await fetchImpl('./cardmarket-expansions-v186.json',{credentials:'omit',cache:'no-cache',signal});
      if(!r.ok)return unavailable('EXPANSION_UNVERIFIED');const config=await r.json();
      if(config.schema!==186)return unavailable('EXPANSION_UNVERIFIED');
      const result=await feed.loadQuote({item,card:checked.card,expansions:config.expansions,
        basePath:'./cardmarket-public-v193/',fetchImpl,cryptoImpl,now,signal});
      observed.set(key(item),result);return result;
    }catch{return unavailable(failure);}
  }
  function display(q,now=Date.now()){
    if(q?.state!=='AVAILABLE')return {value:null,label:reasons[q?.reason]||'Geen gecontroleerde officiële Cardmarket-prijs beschikbaar.',date:''};
    const age=now-Date.parse(q.asOf);
    if(!Number.isFinite(age)||age>72*3600000||age< -3600000)return display(unavailable('STALE_SOURCE'));
    return {value:q.value,label:'Algemene Cardmarket-marktindicatie — conditie, taal en editie niet verwerkt',
      date:'Cardmarket · EUR · trend · '+q.asOf+' · '+(age<=36*3600000?'Actuele dagsnapshot':'Verouderende dagsnapshot'),condition:''};
  }
  return Object.freeze({quote,verifiedCard,display,cached,reasons});
});
