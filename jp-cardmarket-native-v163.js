'use strict';
(()=>{
  // Explicit source-set -> Japanese Cardmarket expansion; never a Western set alias.
  // Add products only after verifying the exact JP source record and product page.
  const expansions={
    PMCG1:{set:'BASE',slug:'Expansion-Pack'},
    PMCG2:{set:'JUNGLE',slug:'Pokemon-Jungle'},
    PMCG5:{set:'JP GYM 1',slug:'Leaders-Stadium'},
    neo1:{set:'NEO GENESIS',slug:'Gold-Silver-to-a-New-World'},
    neo3:{set:'NEO REVELATION',slug:'Awakening-Legends'}
  };
  // Four Pikachu product identities supplied in the v163 acceptance criteria.
  // Snubbull pages checked on Cardmarket; Swinub also preserves the bundled JP route.
  // Full evidence URLs and extension rules: QA-JP-NATIVE-V163.md.
  const products=[
    ['PMCG1-035','PMCG1','Pikachu'],
    ['PMCG2-024','PMCG2','Pikachu'],
    ['neo1-036','neo1','Pikachu-GSNW'],
    ['PMCG5-036','PMCG5','Lt-Surges-Pikachu-LST'],
    ['neo1-061','neo1','Snubbull-GSNW'],
    ['neo3-048','neo3','Snubbull-AL'],
    ['neo3-038','neo3','Swinub-AL']
  ];
  function createResolver(sets,rows){
    const byId=new Map(),productCounts=new Map();
    for(const row of rows){
      const matches=byId.get(row[0])||[];matches.push([...row]);byId.set(row[0],matches);
      const key=sets[row[1]]?.slug+'/'+row[2];productCounts.set(key,(productCounts.get(key)||0)+1);
    }
    return function resolve(card={}){
      if((card.language||card.lang)!=='JP'||(card.language&&card.lang&&card.language!==card.lang))return null;
      const id=card.source_id||card.sourceId||card.catalogId||'';
      if([card.source_id,card.sourceId,card.catalogId].some(value=>value&&value!==id))return null;
      const matches=byId.get(id);if(matches?.length!==1)return null;
      const [,source,product]=matches[0],expansion=sets[source],identity=window.JPSetCatalog?.identity(card);
      if(!identity||identity.source!==source||id.slice(0,id.lastIndexOf('-'))!==source||!expansion||identity.key!==expansion.set)return null;
      if(productCounts.get(expansion.slug+'/'+product)!==1)return null;
      if(card.set&&card.set!=='AUTO'&&card.set!==expansion.set)return null;
      const current=window.CardCatalog?.byId?.(id,'JP');
      if(current&&window.JPSetCatalog.identity(current)?.source!==source)return null;
      if(!/^[A-Za-z0-9-]+$/.test(expansion.slug)||!/^[A-Za-z0-9-]+$/.test(product))return null;
      const pathname=`/en/Pokemon/Products/Singles/${expansion.slug}/${product}`;
      return {pathname,source_id:id,source_set_id:source,expansion:expansion.slug};
    };
  }
  const resolve=createResolver(expansions,products);
  function route(card={}){
    const product=resolve(card);
    if(!product){
      const name=window.JPCardmarketTwin?.counterpart?.(card)?.name||card.name||'';
      return {url:name.trim()?searchUrl(name,'','JP',card.condition,card.set):'',exact:false,note:'Geen bewezen uniek Japans Cardmarket-product'};
    }
    // Empty language deliberately omits language=7; the product itself is Japanese.
    return {url:withFilters('https://www.cardmarket.com'+product.pathname,'',card.condition,card.edition||'AUTO'),exact:true,note:'Direct: gecontroleerd Japans product',jpCardmarket:{...product}};
  }
  const previous=resolveFinalCardmarketRoute;
  resolveFinalCardmarketRoute=card=>(card.language||card.lang)==='JP'?route(card):previous(card);
  window.JPCardmarketNative={resolve,route,createResolver};
})();
