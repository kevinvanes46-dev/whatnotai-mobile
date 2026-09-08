'use strict';
// Identity is independent of routing success. Reading legacy history never writes storage.
(() => {
  const text=v=>String(v??'').trim();
  const number=v=>text(v).replace(/^0+(?=\d)/,'');
  const name=v=>(typeof cleanCardmarketName==='function'?cleanCardmarketName(v):text(v)).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ');
  const hydrated=new Map(),pending=new Map();
  const locator=raw=>JSON.stringify([raw.language||raw.lang||'EN',raw.source_id||raw.sourceId||raw.catalogId||'',raw.set||'AUTO',number(raw.number),name(raw.name)]);
  function normalize(raw={}){
    const language=raw.language||raw.lang||'EN';
    const source=raw.source_id||raw.sourceId||raw.catalogId||'';
    const set=raw.set||'AUTO';
    const recovered=hydrated.get(locator(raw));
    let match=recovered||null;
    if(raw.kind!=='query'){
      if(source){
        match=window.CardCatalog?.byId?.(source,language)||match;
        const product=language==='EN'&&window.CM_PRODUCT_CATALOG?.[source];
        if(!match&&product)match={source_id:source,name:product.name,number:product.number,set:product.set.name,set_name:product.set.name};
      }else if(set!=='AUTO'&&number(raw.number)&&raw.name){
        match=window.CardCatalog?.find?.({...raw,language})||match;
        if(!match?.source_id&&language==='EN'){
          const matches=Object.values(window.CM_PRODUCT_CATALOG||{}).filter(c=>c.set.name===set&&number(c.number)===number(raw.number)&&name(c.name)===name(raw.name));
          if(matches.length===1)match={...match,source_id:matches[0].id,name:match?.name||matches[0].name,number:matches[0].number,set:matches[0].set.name,set_name:match?.set_name||matches[0].set.name};
        }
      }
    }
    if(match&&recovered)match={...recovered,...match,image:match.image||recovered.image};
    const kind=raw.kind==='query'?'query':source||match||raw.verified?'card':'query';
    const card=kind==='card';
    const condition=raw.condition||raw.cond||'NM',edition=raw.edition||'AUTO',variant=raw.variant||(raw.stamped?'STAMPED':'NORMAL');
    // Source metadata wins over inconsistent saved tuple/image data.
    const value={...raw,kind,source_id:card?(source||match?.source_id||''):'',
      name:match?.name||raw.name||raw.quick||'',number:card?number(match?.number||raw.number):'',
      set:card?(match?.set||set):'AUTO',set_name:card?(match?.set_name||raw.set_name||raw.setName||match?.set||set):'',
      language,lang:language,condition,cond:condition,edition,variant,
      image:card?(match?.image||raw.image||''):'',
      cardmarketUrl:raw.cardmarketUrl||raw.url||'',url:raw.cardmarketUrl||raw.url||''};
    value.sourceId=value.catalogId=value.source_id;
    value.setName=value.set_name;
    if(!card){value.sourceId='';value.catalogId='';value.exact=false;value.url=value.cardmarketUrl='https://www.cardmarket.com/en/Pokemon/Products/Search?searchString='+encodeURIComponent(value.name);}
    return value;
  }
  // Optional metadata recovery for old records. Never mutate localStorage on read.
  async function hydrate(raw){
    const c=normalize(raw),id=locator(raw);
    if(raw.kind==='query'||(!c.source_id&&!(raw.name&&raw.number&&raw.set&&raw.set!=='AUTO')))return c;
    if(c.source_id&&c.set!=='AUTO'&&c.image)return c;
    if(!window.CardArtwork?.lookup)return c;
    const sets=typeof CM_SOURCE_SETS==='undefined'?{}:CM_SOURCE_SETS;
    if(!c.source_id&&sets[raw.set]?.length!==1)return c;
    if(!pending.has(id))pending.set(id,(async()=>{
      const data=await window.CardArtwork.lookup({name:raw.name,number:raw.number,set:raw.set,language:c.language,source_id:c.source_id});
      if(!data?.id)return;
      if(c.source_id ? data.id!==c.source_id : (name(data.name)!==name(raw.name)||number(data.localId)!==number(raw.number)))return;
      const set=!c.source_id?raw.set:(c.set!=='AUTO'?c.set:Object.keys(sets).find(key=>sets[key].includes(data.set?.id)));
      if(!c.source_id&&!sets[set]?.includes(data.set?.id))return;
      hydrated.set(id,{source_id:data.id,name:data.name,number:c.language==='JP'?(raw.number||''):data.localId,set:set||c.set,set_name:data.set?.name||set,image:data.image||''});
    })().catch(()=>{}).finally(()=>pending.delete(id)));
    await pending.get(id);return normalize(raw);
  }
  function key(raw){const c=normalize(raw);return JSON.stringify([c.kind,c.language,c.condition,c.edition,c.variant,c.kind==='card'?(c.source_id||[name(c.name),c.set,c.number]):name(c.quick||c.name)]);}
  window.CardIdentity={normalize,hydrate,key};
})();
