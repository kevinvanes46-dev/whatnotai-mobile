'use strict';
(() => {
  const copy = {
    EXACT: {label:'Open Cardmarket', subtitle:'Direct naar kaart', detail:'Directe Cardmarket-pagina beschikbaar'},
    SEARCH: {label:'Bekijk zoekresultaten', subtitle:'Controleer de juiste kaart', detail:'Zoekresultaten op Cardmarket · controleer de juiste uitvoering'},
    PENDING: {label:'Cardmarket zoeken…', subtitle:'Even geduld', detail:'Cardmarket-link controleren…'},
    UNAVAILABLE: {label:'Cardmarket niet beschikbaar', subtitle:'Kies eerst een kaart', detail:'Geen Cardmarket-link beschikbaar'}
  };
  // Use the engine's product URL validator, without treating unresolved redirects as products.
  function classify(url, state='ready') {
    if(state==='pending')return 'PENDING';
    if(state!=='ready'||!url||url==='#')return 'UNAVAILABLE';
    if(validCardmarketRoute(url))return 'EXACT';
    try {
      const u=new URL(url);
      if(u.protocol==='https:'&&!u.username&&!u.password&&
        (u.hostname==='www.cardmarket.com'||u.hostname==='cardmarket.com'||u.hostname==='prices.pokemontcg.io'))return 'SEARCH';
    } catch(_) {}
    return 'UNAVAILABLE';
  }
  const api=window.CardmarketUI={classify,copy,current:'UNAVAILABLE'};
  function sync() {
    const open=document.getElementById('openBtn');
    const state=classify(open.getAttribute('href'),open.classList.contains('disabled')?(open.dataset.cmState==='pending'?'pending':'idle'):'ready');
    api.current=state;
    for(const id of ['openBtn','resultOpenBtn']) {
      const button=document.getElementById(id);
      button.dataset.cmRoute=state;
      const label=button.querySelector('span'),subtitle=button.querySelector('small');
      if(label&&label.textContent!==copy[state].label)label.textContent=copy[state].label;
      if(subtitle&&subtitle.textContent!==copy[state].subtitle)subtitle.textContent=copy[state].subtitle;
    }
  }
  window.addEventListener('cardscout:cm-route-state',sync);
  window.addEventListener('cardscout:cm-route-ready',sync);
  new MutationObserver(sync).observe(document.getElementById('openBtn'),{attributes:true,attributeFilter:['href','class','data-cm-state']});
  function syncRecent() {
    document.querySelectorAll('#recentList .openMini').forEach(link=>{
      const state=classify(link.getAttribute('href'),link.getAttribute('aria-disabled')==='true'?'pending':'ready');
      link.dataset.cmRoute=state;
      link.title=copy[state].detail;
      link.setAttribute('aria-label',copy[state].label+' · '+copy[state].subtitle);
      const meta=link.closest('.item').querySelector('.recentMeta,.itemMeta');
      if(meta&&/ · (direct|search)$/.test(meta.textContent))meta.textContent=meta.textContent.replace(/ · (direct|search)$/,' · '+copy[state].detail);
    });
  }
  new MutationObserver(syncRecent).observe(document.getElementById('recentList'),{subtree:true,childList:true,attributes:true,attributeFilter:['href','aria-disabled']});
  sync();syncRecent();
})();
