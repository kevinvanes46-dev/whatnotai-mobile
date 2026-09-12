'use strict';
// Only exact, catalog-backed Japanese source identities may select artwork.
(() => {
  const data=window.RareWorthJPImageManifest||{catalog:{},images:{}};
  const config={allowExternalBeta:true};
  function identity(card){
    if(!card||(card.language||card.lang)!=='JP')return null;
    const ids=[card.source_id,card.sourceId,card.catalogId].filter(Boolean);
    if(!ids.length||ids.some(id=>id!==ids[0]))return null;
    const id=ids[0],row=data.catalog[id];
    if(!row||(card.source_set_id&&card.source_set_id!==row.sourceSet))return null;
    const set=window.JPSetCatalog?.identity({...card,source_id:id});
    return set&&set.source===row.sourceSet&&set.key===row.set?{id,...row}:null;
  }
  function resolve(sourceId){
    if(typeof sourceId!=='string'||!Object.hasOwn(data.catalog,sourceId)||!Object.hasOwn(data.images,sourceId))return null;
    const row=data.catalog[sourceId],entry=data.images[sourceId];
    if(entry.set!==row.set||entry.sourceSet!==row.sourceSet||entry.src!==`assets/cards/jp/${sourceId}.webp`)return null;
    return Object.freeze({...entry,source_id:sourceId,source_set_id:row.sourceSet,image:entry.src,status:'OWN'});
  }
  function own(card){const row=identity(card);return row?resolve(row.id):null;}
  function external(card){return config.allowExternalBeta?window.JPArtwork?.resolve(card)||null:null;}
  function tcgdex(image){
    try{const url=new URL(image);return url.protocol==='https:'&&url.hostname==='assets.tcgdex.net'&&url.pathname.startsWith('/ja/')&&!url.search&&!url.hash?url.href.replace(/\/$/,''):'';}catch{return '';}
  }
  // The caller must obtain tcgdexId/image from the exact JA catalog/API response.
  function select(card,{tcgdexId,tcgdexImage,skipOwn=false}={}){
    const row=identity(card);if(!row)return {status:'MISSING',image:null};
    const local=!skipOwn&&resolve(row.id);if(local)return local;
    const image=tcgdexId===row.id&&tcgdex(tcgdexImage);
    if(image)return {status:'TCGDEX',source_id:row.id,image};
    const beta=external(card);
    return beta?{...beta,status:'EXTERNAL_BETA'}:{status:'MISSING',source_id:row.id,image:null};
  }
  window.RareWorthJPImageLibrary=Object.freeze({resolve,own,identity,select,external,config});
})();
