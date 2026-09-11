'use strict';
(() => {
  const $=id=>document.getElementById(id);
  // Secondary controls remain intact, but no longer dominate the first screen.
  const preferences=document.createElement('section');
  preferences.className='visiblePreferences';preferences.setAttribute('aria-label','Kaartvoorkeuren');
  $('quickPanel').after(preferences);
  preferences.append(document.querySelector('#manualDetails .filterStrip'),document.querySelector('.searchModeRow'));
  preferences.append($('stampedSetChips'));
  document.querySelector('.searchModeHelp').textContent='Kies de uitvoering van jouw kaart';
  const normalVariant=document.createElement('button');normalVariant.type='button';normalVariant.id='normalVariant';normalVariant.className='searchModeChip';normalVariant.textContent='Normaal';
  $('stampedToggle').before(normalVariant);$('stampedToggle').textContent='Stamped';
  const syncVariant=()=>{const on=$('stampedToggle').getAttribute('aria-pressed')==='true';normalVariant.setAttribute('aria-pressed',String(!on));normalVariant.classList.toggle('active',!on);};
  normalVariant.addEventListener('click',()=>{if($('stampedToggle').getAttribute('aria-pressed')==='true')$('stampedToggle').click();});
  new MutationObserver(syncVariant).observe($('stampedToggle'),{attributes:true,attributeFilter:['aria-pressed']});syncVariant();

  document.querySelector('[data-view="settings"]').append(document.querySelector('.linkDetails'));
  const displayTools=document.createElement('div');displayTools.className='collectionDisplayTools';
  document.querySelector('.collectionToolbar').before(displayTools);
  displayTools.append(document.querySelector('.collectionToolbar'),document.querySelector('.collectionViewSwitch'));
  const cache=new Map(),queue=[];
  let running=0,selectionGeneration=0;
  const normalize=c=>{
    if(c.kind || c.quick || c.url) c=window.CardIdentity.normalize(c);
    const language=c.language||c.lang||'EN';
    const set=typeof CM_SOURCE_SETS!=='undefined'&&CM_SOURCE_SETS[c.set]?c.set:(typeof detectSet==='function'?detectSet(c.set||''):c.set);
    const item={...c,set:set&&set!=='AUTO'?set:c.set,number:typeof cleanNumber==='function'?cleanNumber(c.number):c.number,language,sourceId:c.sourceId||c.source_id||c.catalogId||''};
    const ids=typeof CM_SOURCE_SETS!=='undefined'?CM_SOURCE_SETS[item.set]:null;
    // Curated local aliases can differ from API titles (e.g. rarity labels).
    // A verified set + collector number, rather than that display alias, identifies the artwork.
    if(!item.sourceId&&item.verified&&language==='EN'&&ids?.length===1&&item.number)item.sourceId=ids[0]+'-'+item.number;
    const match=item.sourceId?window.CardCatalog?.byId?.(item.sourceId,language):window.CardCatalog?.find(item);
    const sourceId=item.sourceId||match?.source_id||'';
    const jpCatalogImage=language==='JP'&&sourceId&&match?.source_id===sourceId&&match.language==='JP'&&safeImage(match.image);
    return {...item,sourceId,image:language==='JP'?(jpCatalogImage||''):(match?.image||(safeImage(item.image)?item.image:'')),jpCatalogImage:!!jpCatalogImage};
  };
  function lookup(card){
    const c=normalize(card);
    if(c.kind==='query')return Promise.resolve(null);
    const key=[c.language,c.sourceId,c.set,c.number,c.name].join('|');
    const hit=cache.get(key);if(hit&&hit.expires>Date.now())return hit.result;
    const entry={expires:Infinity,result:null};
    entry.result=new Promise(resolve=>{queue.push(async()=>{let data=null;try{data=await window.cardscoutCollectionUI.lookupCard(c);}catch{}
      const jp=c.language==='JP'&&(!data?.id||data.id===c.sourceId)&&!safeImage(data?.image)?window.JPArtwork?.resolve?.({...c,source_id:c.sourceId}):null;
      if(jp&&safeJpImage(jp.image))data={...(data||{}),id:data?.id||c.sourceId,name:data?.name||c.name,image:jp.image,jpArtwork:jp};
      entry.expires=Date.now()+(data?300000:60000);resolve(data);});pump();});
    cache.set(key,entry);return entry.result;
  }

  function pump(){while(running<4&&queue.length){running++;queue.shift()().finally(()=>{running--;pump();});}}
  function safeImage(value){
    try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='assets.tcgdex.net'?u.href.replace(/\/$/,''):'';}catch{return '';}
  }
  function safeJpImage(value){
    try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='cdn.artofpkm.com'&&/^\/[a-z0-9]+$/.test(u.pathname)&&!u.search&&!u.hash?u.href:'';}catch{return '';}
  }
  function fallback(target){target.classList.remove('artLoading');target.classList.add('artUnavailable');target.textContent='Afbeelding niet beschikbaar';const retry=document.createElement('button');retry.type='button';retry.className='artRetry';retry.textContent='Opnieuw laden';retry.addEventListener('click',event=>{event.stopPropagation();target.classList.remove('artUnavailable');target.classList.add('artLoading');cache.clear();load(pending.get(target),target);});if(!target.closest('button'))target.append(retry);}
  async function load(card,target,hydrated=false){
    const enriched=normalize(card);
    if(enriched.kind==='query'){
      target.classList.remove('artLoading','artUnavailable');target.classList.add('queryArtwork');
      target.setAttribute('aria-label','Zoekopdracht');
      target.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg>';return;
    }
    target.classList.remove('queryArtwork');
    const data=!hydrated&&safeImage(enriched.image)?enriched:await lookup(enriched);
    if(!target.isConnected||pending.get(target)!==card)return;
    if(data&&data!==enriched&&enriched.sourceId&&data.id!==enriched.sourceId){fallback(target);return;}
    if(data&&data!==enriched&&!enriched.sourceId&&enriched.name&&data.name&&typeof cleanCardmarketName==='function'&&cleanCardmarketName(enriched.name,enriched.number).toLowerCase()!==cleanCardmarketName(data.name,data.localId).toLowerCase()){fallback(target);return;}
    let url=safeImage(data?.image),jpArt=data?.jpArtwork||null;
    if(enriched.language==='JP'&&!url){jpArt=jpArt||window.JPArtwork?.resolve?.({...enriched,source_id:enriched.sourceId});url=safeJpImage(jpArt?.image);}
    // Japanese provenance comes from an exact JP catalog record or the JA metadata
    // request above, never from a language substring in an arbitrary saved image.
    const directJp=!!safeJpImage(jpArt?.image)&&url===safeJpImage(jpArt?.image);
    const jpIdentity=enriched.sourceId&&(directJp?jpArt?.source_id===enriched.sourceId:(data===enriched?enriched.jpCatalogImage:data?.id===enriched.sourceId));
    const foreignImage=url&&/^\/(en|fr|de|es|it|pt|zh)(\/|$)/i.test(new URL(url).pathname);
    if(!url||(enriched.language==='JP'&&(!jpIdentity||foreignImage))){fallback(target);return;}
    const render=(source,isDirect)=>{
      const img=new Image();img.alt=card.name||'Kaart';img.decoding='async';
      img.onload=()=>{if(pending.get(target)===card)target.classList.remove('artLoading');};
      let retried=false;img.onerror=()=>{if(pending.get(target)!==card)return;
        if(!isDirect&&!retried&&!/\.(webp|png|jpe?g)$/i.test(source)){retried=true;img.src=source+'/low.webp';return;}
        const fallbackArt=enriched.language==='JP'?window.JPArtwork?.resolve?.({...enriched,source_id:enriched.sourceId}):null,fallbackUrl=safeJpImage(fallbackArt?.image);
        if(!isDirect&&fallbackUrl&&fallbackArt.source_id===enriched.sourceId){jpArt=fallbackArt;render(fallbackUrl,true);return;}
        if(!hydrated){load(card,target,true);return;}fallback(target);
      };
      img.src=isDirect||/\.(webp|png|jpe?g)$/i.test(source)?source:source+'/high.webp';target.replaceChildren(img);
    };
    render(url,directJp);
  }
  const pending=new WeakMap();
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){observer.unobserve(e.target);load(pending.get(e.target),e.target);}}),{rootMargin:'160px'});
  window.CardArtwork={mount(card,target){target.classList.add('cardArtwork','artLoading');target.setAttribute('aria-label','Kaartafbeelding');pending.set(target,normalize(card));observer.observe(target);},lookup};
  window.cardscoutCollectionUI.render();

  function setView(value){
    $('collectionList').dataset.view=value;
    document.querySelectorAll('[data-collection-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.collectionView===value)));
    try{localStorage.setItem('cardscout_collection_view',value);}catch{}
  }
  let initialView='grid';try{initialView=localStorage.getItem('cardscout_collection_view')||'grid';}catch{}
  setView(initialView==='list'?'list':'grid');
  document.querySelectorAll('[data-collection-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.collectionView)));

  function recent(){
    const wrap=$('homeRecentCards');wrap.replaceChildren();
    const rows=typeof readStore==='function'?readStore(STORAGE_RECENT).slice(0,4):[];
    if(!rows.length){const p=document.createElement('p');p.className='recentEmpty';p.textContent='Je volgende vondst begint hier. Zoek bijvoorbeeld op “Bagon 43 Dragon Frontiers”.';wrap.append(p);return;}
    rows.forEach(stored=>{
      const c=window.CardIdentity.normalize(stored);
      const btn=document.createElement('button');btn.type='button';btn.className='recentCard';
      const art=document.createElement('span'),name=document.createElement('b'),meta=document.createElement('small');
      art.className='recentArt';name.textContent=c.name;meta.textContent=[c.kind==='query'?'Zoekopdracht':'',c.number?'#'+c.number:'',c.kind==='card'?c.set:''].filter(Boolean).join(' · ');
      btn.append(art,name,meta);wrap.append(btn);window.CardArtwork.mount(c,art);
      btn.addEventListener('click',async()=>{if(await applyItem(stored,false))void makeLink(false);});
    });
  }
  recent();new MutationObserver(recent).observe($('recentList'),{childList:true});
  async function hydrateRecent(){
    const rows=readStore(STORAGE_RECENT),before=JSON.stringify(rows.map(window.CardIdentity.normalize));
    await Promise.all(rows.map(window.CardIdentity.hydrate));
    if(before!==JSON.stringify(readStore(STORAGE_RECENT).map(window.CardIdentity.normalize)))renderSaved();
  }
  void hydrateRecent();
  window.addEventListener('cardscout:catalog-ready',()=>{renderSaved();void hydrateRecent();});
  $('homeRecentAll').addEventListener('click',()=>$('navRecent').click());
  $('selectedCardEdit').addEventListener('click',()=>{$('manualDetails').open=true;$('manualDetails').scrollIntoView({block:'start',behavior:'smooth'});$('nameInput').focus({preventScroll:true});});

  function clearSelection(){selectionGeneration++;$('selectedCardPanel').hidden=true;document.body.classList.remove('cardDetailVisible');}
  const syncClear=()=>{$('quickClear').hidden=!$('quickInput').value;};
  $('quickClear').addEventListener('click',()=>{
    const prefs=['langSelect','condSelect','editionSelect'].map(id=>[id,$(id).value]);
    $('clearBtn').click();
    prefs.forEach(([id,value])=>$(id).value=value);updateCustomSelects();
    syncClear();$('quickInput').focus();
  });
  $('quickInput').addEventListener('input',syncClear);
  $('clearBtn').addEventListener('click',syncClear);
  syncClear();
  $('quickInput').addEventListener('input',()=>{clearSelection();$('homeRecentPanel').hidden=!!$('quickInput').value.trim();});
  $('clearBtn').addEventListener('click',()=>{clearSelection();$('manualDetails').open=false;$('homeRecentPanel').hidden=false;$('quickInput').focus();});
  window.addEventListener('cardscout:cm-route-state',({detail})=>{
    if(detail.state==='pending'){clearSelection();$('selectedCardRoute').textContent=window.CardmarketUI.copy.PENDING.detail;}
    else if(detail.state!=='ready')clearSelection();
  });
  window.addEventListener('cardscout:cm-route-ready',async({detail})=>{
    syncClear();
    document.body.classList.add('cardDetailVisible');
    const version=++selectionGeneration,c=detail.card;
    $('selectedCardPanel').hidden=false;$('homeRecentPanel').hidden=true;
    $('selectedCardPanel').classList.toggle('querySelection',c.kind==='query');
    $('selectedCardTitle').textContent=c.name||'Geselecteerde kaart';
    $('selectedCardPanel').querySelector('.eyebrow').textContent=c.kind==='query'?'Zoekopdracht':'Geselecteerde kaart';
    $('selectedCardMeta').textContent=[c.set_name||c.set,c.number?'#'+c.number:'',c.language,c.condition?'Staat '+c.condition:'',c.edition==='1ST'?'1st Edition':''].filter(Boolean).join(' · ');
    $('selectedCardRoute').textContent=window.CardmarketUI.copy[window.CardmarketUI.classify(detail.cardmarketUrl)].detail;
    $('selectedCardPrice').textContent=c.kind==='query'?'Zoekopdracht: kies een kaart voor een marktindicatie.':'Marktindicatie ophalen…';
    $('selectedCardArt').replaceChildren();$('selectedCardArt').classList.remove('artUnavailable');
    window.CardArtwork.mount(c,$('selectedCardArt'));
    if(c.kind==='query')return;
    const data=await lookup(c);if(version!==selectionGeneration)return;
    const stamped=$('stampedToggle')?.getAttribute('aria-pressed')==='true';
    const quote=window.cardscoutCollectionUI.priceFrom(data,{variant:stamped?'STAMPED':'NORMAL',edition:$('editionSelect')?.value});
    const currency=new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'});
    $('selectedCardPrice').textContent=quote.price?`${currency.format(quote.price)} · ${quote.source} (algemeen)`:'Geen marktindicatie beschikbaar';
  });

  // Keep keyboard focus within the existing editor and restore it on close.
  const editor=$('collectionEditor');let returnFocus=null;
  const focusable=()=>[...editor.querySelectorAll('button,input,select,a[href]')].filter(el=>!el.disabled&&!el.hidden&&el.getClientRects().length);
  new MutationObserver(()=>{if(!editor.hidden){returnFocus=document.activeElement;focusable()[0]?.focus();}else{const target=returnFocus?.isConnected&&returnFocus.getClientRects().length?returnFocus:$('navCollection');target?.focus({preventScroll:true});}}).observe(editor,{attributes:true,attributeFilter:['hidden']});
  editor.addEventListener('keydown',e=>{if(e.key==='Escape'){$('collectionEditorClose').click();e.preventDefault();}if(e.key==='Tab'){const items=focusable(),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}});
})();
