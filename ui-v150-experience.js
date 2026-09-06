'use strict';
(() => {
  const $=id=>document.getElementById(id);
  // Secondary controls remain intact, but no longer dominate the first screen.
  const preferences=document.createElement('section');
  preferences.className='visiblePreferences';preferences.setAttribute('aria-label','Kaartvoorkeuren');
  $('quickPanel').after(preferences);
  preferences.append(document.querySelector('#manualDetails .filterStrip'),document.querySelector('.searchModeRow'));
  $('manualDetails').append($('stampedSetChips'));
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
  const normalize=c=>({...c,language:c.language||c.lang||'EN',sourceId:c.sourceId||c.source_id||''});
  function lookup(card){
    const c=normalize(card);
    const key=[c.language,c.sourceId,c.set,c.number].join('|');
    if(cache.has(key))return cache.get(key);
    const result=new Promise(resolve=>{queue.push(async()=>{try{resolve(await window.cardscoutCollectionUI.lookupCard(c));}catch{resolve(null);}});pump();});
    cache.set(key,result);result.then(data=>{if(!data)cache.delete(key);});return result;
  }
  function pump(){while(running<4&&queue.length){running++;queue.shift()().finally(()=>{running--;pump();});}}
  function safeImage(value){
    try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='assets.tcgdex.net'?u.href.replace(/\/$/,''):'';}catch{return '';}
  }
  function fallback(target){target.classList.remove('artLoading');target.classList.add('artUnavailable');target.textContent='Afbeelding niet beschikbaar';const retry=document.createElement('button');retry.type='button';retry.className='artRetry';retry.textContent='Opnieuw laden';retry.addEventListener('click',event=>{event.stopPropagation();target.classList.remove('artUnavailable');target.classList.add('artLoading');load(pending.get(target),target);});if(!target.closest('button'))target.append(retry);}
  async function load(card,target){
    let data=card.image?card:await lookup(card);
    if(!data?.image)data=await lookup(card);
    if(!target.isConnected||pending.get(target)!==card)return;
    const url=safeImage(data?.image);
    if(!url||(card.language==='JP'&&!url.includes('/ja/'))){fallback(target);return;}
    const img=new Image();img.alt=card.name||'Kaart';img.decoding='async';
    img.onload=()=>{if(pending.get(target)===card)target.classList.remove('artLoading');};
    let retried=false;img.onerror=()=>{if(pending.get(target)!==card)return;if(!retried&&!/\.(webp|png|jpe?g)$/i.test(url)){retried=true;img.src=url+'/low.webp';return;}fallback(target);};
    img.src=/\.(webp|png|jpe?g)$/i.test(url)?url:url+'/high.webp';
    target.replaceChildren(img);
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
    rows.forEach(c=>{
      const btn=document.createElement('button');btn.type='button';btn.className='recentCard';
      const art=document.createElement('span'),name=document.createElement('b'),meta=document.createElement('small');
      art.className='recentArt';name.textContent=c.name;meta.textContent=[c.number?'#'+c.number:'',c.set].filter(Boolean).join(' · ');
      btn.append(art,name,meta);wrap.append(btn);window.CardArtwork.mount(c,art);
      btn.addEventListener('click',()=>{applyItem(c,false);void makeLink(false);});
    });
  }
  recent();new MutationObserver(recent).observe($('recentList'),{childList:true});
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
    if(detail.state==='pending'){clearSelection();$('selectedCardRoute').textContent='Cardmarket-link controleren…';}
    else if(detail.state!=='ready')clearSelection();
  });
  window.addEventListener('cardscout:cm-route-ready',async({detail})=>{
    syncClear();
    document.body.classList.add('cardDetailVisible');
    const version=++selectionGeneration,c=detail.card;
    $('selectedCardPanel').hidden=false;$('homeRecentPanel').hidden=true;
    $('selectedCardTitle').textContent=c.name||'Geselecteerde kaart';
    $('selectedCardMeta').textContent=[c.set_name||c.set,c.number?'#'+c.number:'',c.language,c.condition?'Staat '+c.condition:'',c.edition==='1ST'?'1st Edition':''].filter(Boolean).join(' · ');
    $('selectedCardRoute').textContent=(detail.cardmarketUrl.includes('/Products/Singles/')||detail.cardmarketUrl.includes('idProduct='))?'Directe Cardmarket-pagina beschikbaar':'Zoekresultaten op Cardmarket · controleer de juiste uitvoering';
    $('selectedCardPrice').textContent='Marktindicatie ophalen…';
    $('selectedCardArt').replaceChildren();$('selectedCardArt').classList.remove('artUnavailable');
    window.CardArtwork.mount(c,$('selectedCardArt'));
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
