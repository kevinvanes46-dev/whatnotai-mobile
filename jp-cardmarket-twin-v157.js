'use strict';
(() => {
  // Existing TCGdex source-set mapping, shared with the search catalog.
  const sourceSets={'BASE':['PMCG1'],'JUNGLE':['PMCG2'],'FOSSIL':['PMCG3'],'ROCKET':['PMCG4'],'GYM HEROES':['PMCG5'],'GYM CHALLENGE':['PMCG6'],'NEO GENESIS':['neo1'],'NEO DISCOVERY':['neo2'],'NEO REVELATION':['neo3'],'NEO DESTINY':['neo4']};
  const nameKey=value=>String(value||'').normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
  function canonicalSet(card) {
    if((card.language||card.lang)!=='JP')return '';
    const id=card.source_id||card.sourceId||'';
    const source=id.slice(0,id.lastIndexOf('-'));
    const set=Object.keys(sourceSets).find(key=>sourceSets[key].includes(source));
    // Japanese Gym expansions do not partition cards like the western expansions.
    if(!set||set.startsWith('GYM ')||(card.source_set_id&&card.source_set_id!==source))return '';
    if(card.set&&card.set!=='AUTO'&&card.set!==set)return '';
    return set;
  }
  function counterpart(card) {
    const set=canonicalSet(card),name=nameKey(card.name);
    // A shared EN/JA source ID is not a cross-language identity or a verified alias.
    if(!set||!name||!/[a-z]/i.test(name)||/[^\p{Script=Latin}\p{N}\p{P}\p{Z}\p{S}]/u.test(name))return null;
    const selected=window.CardCatalog?.byId?.(card.source_id||card.sourceId,'JP');
    if(selected&&(canonicalSet(selected)!==set||nameKey(selected.name)!==name))return null;
    const products=Object.values(window.CM_PRODUCT_CATALOG||{}).filter(p=>p.set?.name===set);
    const catalog=(window.CardCatalog?.marketplaceCards?.()||[]).filter(c=>c.language==='EN'&&c.set===set);
    const rows=[...products.map(p=>({source_id:p.id,name:p.name,number:p.number,set})),...catalog];
    const matches=rows.filter(c=>nameKey(c.name)===name);
    const ids=new Set(matches.map(c=>c.source_id));
    if(ids.size!==1)return null;
    const id=[...ids][0],match=matches[0];
    if(!id||!match.number||!CM_SOURCE_SETS[set]?.some(s=>id===s+'-'+match.number))return null;
    // Reject disagreements between the bundled product data and the current EN catalog.
    if(rows.some(c=>c.source_id===id&&(nameKey(c.name)!==name||String(c.number)!==String(match.number))))return null;
    return {source_id:id,name:match.name,number:String(match.number),set,language:'EN'};
  }
  const engine=resolveFinalCardmarketRoute;
  function fallback(card) {
    return {url:card.name?.trim()?searchUrl(card.name,'','JP',card.condition,card.set):'',exact:false,note:'Geen unieke, betrouwbare marketplace-tegenhanger'};
  }
  resolveFinalCardmarketRoute=function(card) {
    if((card.language||card.lang)!=='JP')return engine(card);
    // Preserve existing explicitly verified JP product routes.
    if(card.verified&&card.direct&&validCardmarketRoute(card.url))return engine(card);
    const twin=counterpart(card);
    if(!twin)return fallback(card);
    const finish=route=>{
      if(!route?.exact||!validCardmarketRoute(route.url))return fallback(card);
      const productUrl=new URL(route.url);
      for(const key of ['language','minCondition','isFirstEd'])productUrl.searchParams.delete(key);
      // Only routing uses the counterpart. No autoName/autoSet or EN identity escapes.
      return {url:withFilters(productUrl.href,'JP',card.condition,card.edition),exact:true,note:'Direct: unieke marketplace-tegenhanger',marketplaceTwin:{...twin}};
    };
    const route=engine({...twin,condition:card.condition,edition:card.edition});
    return route&&typeof route.then==='function'?route.then(finish):finish(route);
  };
  window.JPCardmarketTwin={sourceSets,canonicalSet,counterpart};
})();
