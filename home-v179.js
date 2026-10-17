'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else {Object.defineProperty(root,'HoloKeepHome',{value:api});api.mount();}
})(globalThis,()=>{
  function model(items,lookup,Insights,Cost,Market){
    const insights=Insights.derive(items,lookup,Cost,Market);
    const seen=new Set(),recent=items.filter(x=>x.listType!=='WISHLIST').map((item,index)=>({item,index}))
      .sort((a,b)=>(Number(b.item.addedAt)||0)-(Number(a.item.addedAt)||0)||a.index-b.index)
      .filter(({item})=>{const key=Market.key(item)+'|'+item.condition;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,4).map(x=>x.item);
    return {summary:insights.summary,attention:insights.attention,recent};
  }
  function artwork(item){
    try{const u=new URL(item.image);if(u.protocol!=='https:'||u.hostname!=='assets.tcgdex.net'||u.search||u.hash)return '';
      if(item.language==='JP'&&!u.pathname.startsWith('/ja/'))return '';
      return /\.(webp|png|jpe?g)$/i.test(u.pathname)?u.href:u.href.replace(/\/$/,'')+'/low.webp';
    }catch{return '';}
  }
  function mount(){
    const $=id=>document.getElementById(id),Market=window.HoloKeepMarket,Cost=window.HoloKeepCostBasis,Insights=window.HoloKeepPortfolioInsights;
    const money=n=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(n);
    const labels={LEGACY_COST_NEEDS_CONFIRMATION:'Oude aankoopprijs bevestigen',PARTIAL_COST:'Aankoopkosten aanvullen',UNKNOWN_COST:'Aankoopprijs toevoegen',MISSING_MARKET_PRICE:'Geen passende marktprijs',UNAVAILABLE_MARKET_PRICE:'Geen passende marktprijs',REFERENCE_ONLY_PRICE:'Marktvergelijking niet meegenomen',STALE_MARKET_PRICE:'Prijs mogelijk verouderd'};
    function render(){
      let items=[];try{const saved=JSON.parse(localStorage.getItem('cardscout_collection_v133')||'[]');if(Array.isArray(saved))items=saved.filter(x=>x&&typeof x==='object');}catch{}
      const cache=Market.read(localStorage),quotes=new Map();
      const lookup=item=>{const ids=typeof CM_SOURCE_SETS!=='undefined'?CM_SOURCE_SETS[item.set]||[]:[];
        const sourceId=item.sourceId||item.source_id||(item.language==='EN'&&ids.length===1&&item.number?ids[0]+'-'+String(item.number).split('/')[0].replace(/^0+(?=\d)/,''):'');
        const identity={...item,sourceId,source_set_id:item.source_set_id||item.sourceSetId||(ids.length===1&&item.language==='EN'?ids[0]:sourceId.slice(0,sourceId.lastIndexOf('-')))},key=Market.key(identity);
        if(!quotes.has(key))quotes.set(key,Market.get({getItem:()=>JSON.stringify({version:176,entries:{[key]:cache.entries[key]}})},identity));return quotes.get(key);};
      const view=model(items,lookup,Insights,Cost,Market),{market,cost}=view.summary,has=market.qty>0;
      $('homeEmpty').hidden=has;$('homeSnapshot').hidden=!has;$('homeAdded').hidden=!view.recent.length;$('homeAttention').hidden=!view.attention.length;
      $('homeQty').textContent=market.qty+(market.qty===1?' kaart':' kaarten');$('homeMarket').textContent=market.priced?money(market.value):'—';
      $('homeCosts').textContent=cost.knownQty?money(cost.cost):'—';$('homeDifference').textContent=cost.comparableQty?(cost.difference<0?'−':'+')+money(Math.abs(cost.difference)):'—';
      $('homePriceCoverage').textContent='Prijs voor '+market.priced+' van '+market.qty;
      $('homeCostCoverage').textContent='Kosten voor '+cost.knownQty+' van '+cost.qty;
      $('homeComparison').textContent=cost.comparableQty?'Vergelijking voor '+cost.comparableQty+' van '+cost.qty:'';
      $('homeNotice').textContent=!market.priced?'Nog geen betrouwbare marktprijzen beschikbaar':!cost.knownQty?'Voeg aankoopprijzen toe om verschillen te vergelijken':'';
      $('homeAttentionCount').textContent=view.attention.length+(view.attention.length===1?' kaart':' kaarten');
      $('homeAttentionReasons').textContent=[...new Set(view.attention.map(x=>labels[x.primary]))].slice(0,2).join(' · ');
      const list=$('homeAddedCards');list.replaceChildren();
      for(const item of view.recent){
        const button=document.createElement('button');button.type='button';button.className='homeAddedCard';button.setAttribute('aria-label',item.name+' in collectie openen');
        const art=document.createElement('span');art.className='homeArt';art.textContent='HK';const url=artwork(item);
        if(url){const img=document.createElement('img');img.alt='';img.loading='lazy';img.decoding='async';img.src=url;img.onerror=()=>img.remove();art.append(img);}
        const text=document.createElement('span'),name=document.createElement('strong'),set=document.createElement('small'),meta=document.createElement('small');
        name.textContent=item.name;set.textContent=window.JPSetCatalog?.identity(item)?.label||item.setName||item.set;meta.textContent=item.language+' · '+item.condition;
        text.append(name,set,meta);button.append(art,text);list.append(button);button.addEventListener('click',()=>{$('navCollection').click();window.cardscoutCollectionUI.openItem(item.uid);});
      }
    }
    $('homeSearch').addEventListener('click',()=>$('navSearch').click());$('homeFirstCard').addEventListener('click',()=>$('navSearch').click());
    $('homeSnapshot').addEventListener('click',()=>$('navCollection').click());$('homeAllCollection').addEventListener('click',()=>$('navCollection').click());
    $('homeAttention').addEventListener('click',()=>{$('navCollection').click();window.cardscoutCollectionUI.openAttention();});
    $('navHome').addEventListener('click',render);$('brandHomeBtn').addEventListener('click',()=>$('navHome').click());
    window.addEventListener('hashchange',()=>{if(document.documentElement.dataset.activeTab==='home')render();});
    window.addEventListener('storage',()=>{if(document.documentElement.dataset.activeTab==='home')render();});
    new MutationObserver(()=>{if(document.documentElement.dataset.activeTab==='home')render();}).observe($('collectionCount'),{childList:true});
    render();if(!document.documentElement.dataset.initialView)$('navHome').click();
  }
  return Object.freeze({model,artwork,mount});
});
