'use strict';
// Isolated, opt-in preview. Not loaded by index.html or the service worker.
// Card identity comes from TCGdex; numeric prices exclusively from the
// checksum-verified, same-origin Cardmarket public guide.
(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports
    ? {feed: require('./cardmarket-feed-v186.js'), history: require('./cardmarket-history-v186.js'),
      expansions: require('./cardmarket-expansions-v186.json').expansions}
    : {feed: root.HoloDexCardmarketFeedV186, history: root.HoloDexCardmarketHistoryV186,
      expansions: root.CardmarketVerifiedExpansionsV187});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else Object.defineProperty(root, 'CardmarketPreviewV187', {value: api});
})(globalThis, deps => {
  const validId = v => typeof v === 'string' && /^[a-zA-Z0-9._-]{2,90}$/.test(v) && v.includes('-');
  const unavailable = reason => Object.freeze({state:'UNAVAILABLE',reason,value:null});
  const fmt = value => new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(value);
  const date = value => new Intl.DateTimeFormat('nl-NL',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));

  function itemFor(card, {condition='NM',qty=1}={}) {
    if (!card || !validId(card.id) || !validId(card.set?.id+'-'+card.localId) ||
      card.id !== card.set.id+'-'+card.localId || typeof card.name !== 'string' || !card.name.trim() ||
      !Number.isSafeInteger(qty) || qty<1 || qty>1000 || !['NM','EX','GD','PL'].includes(condition)) return null;
    return {listType:'OWNED',sourceId:card.id,source_set_id:card.set.id,number:card.localId,
      name:card.name,language:'EN',variant:'NORMAL',edition:'UNLIMITED',condition,qty};
  }

  async function lookup(sourceId,{fetchImpl=globalThis.fetch,cryptoImpl=globalThis.crypto,
    now=Date.now(),signal,condition='NM',qty=1,confirmed=false,basePath='./cardmarket-public-v186/'}={}) {
    // An owned physical edition must be confirmed by its owner. TCGdex's
    // available-variant flags alone do not establish which edition is owned.
    if(confirmed!==true)return {quote:unavailable('EDITION_NOT_CONFIRMED')};
    if (!validId(sourceId) || typeof fetchImpl !== 'function') return {quote:unavailable('IDENTITY')};
    try {
      const response=await fetchImpl('https://api.tcgdex.net/v2/en/cards/'+encodeURIComponent(sourceId),
        {credentials:'omit',headers:{Accept:'application/json'},signal});
      if (!response?.ok) return {quote:unavailable('CARD_IDENTITY_SOURCE')};
      const card=await response.json();
      if (card?.id!==sourceId) return {quote:unavailable('CARD_IDENTITY_SOURCE')};
      const item=itemFor(card,{condition,qty});
      if (!item) return {quote:unavailable('IDENTITY')};
      const quote=await deps.feed.loadQuote({item,card,
        expansions:deps.expansions || globalThis.CardmarketVerifiedExpansionsV187,
        fetchImpl,cryptoImpl,now,signal,basePath});
      return {card,item,quote};
    } catch(error) {
      if (signal?.aborted) return {quote:unavailable('CANCELLED')};
      return {quote:unavailable('CARD_IDENTITY_SOURCE')};
    }
  }

  function cardmarketUrl(quote) {
    return quote?.state==='AVAILABLE' && Number.isSafeInteger(quote.productId) && quote.productId>0
      ? 'https://www.cardmarket.com/en/Pokemon/Products?idProduct='+quote.productId : null;
  }

  function controller({document,storage,fetchImpl,cryptoImpl,now=()=>Date.now()}={}) {
    const node=id=>document.getElementById(id);
    const form=node('lookup-form'),identifier=node('card-id'),condition=node('condition'),qty=node('qty'),confirmed=node('edition-confirm');
    const status=node('status'),result=node('result'),price=node('price'),source=node('source');
    const link=node('product-link'),capture=node('capture'),captureStatus=node('capture-status');
    const chart=node('chart'),chartDetail=node('chart-detail'),chartStatus=node('chart-status');
    let current=null,token=0,pending=null,range='1M';
    const say=(n,s)=>{n.textContent=s;};
    const emptyChart=message=>{chart.replaceChildren();say(chartDetail,'');say(chartStatus,message);};
    const unavailableView=(reason)=>{
      result.hidden=true;capture.disabled=true;link.hidden=true;current=null;
      say(status,'Geen geverifieerde Cardmarket-prijs beschikbaar ('+reason+').');
      emptyChart('Geen prijsgrafiek zonder twee echte meetpunten en volledige dekking.');
    };
    function renderChart(){
      if (!current || current.quote.state!=='AVAILABLE') return emptyChart('Geen geldige bron.');
      const {item,quote}=current;
      const s=deps.history.series(storage,[item],()=>quote,range,now());
      chart.replaceChildren();
      if (s.status!=='AVAILABLE') return emptyChart('Nog geen twee afzonderlijke officiële dagmetingen in deze periode.');
      const points=s.points,values=points.map(p=>p.value),min=Math.min(...values),max=Math.max(...values);
      const ySpan=max-min||1,w=560,h=240,pad=38;
      const xmin=Date.parse(points[0].observedAt),xmax=Date.parse(points.at(-1).observedAt);
      const px=p=>pad+(Date.parse(p.observedAt)-xmin)/(xmax-xmin)*(w-2*pad);
      const py=p=>h-pad-(p.value-min)/ySpan*(h-2*pad);
      chart.setAttribute('viewBox','0 0 '+w+' '+h);
      const svgNS='http://www.w3.org/2000/svg';
      const make=(type,attrs)=>{const e=document.createElementNS(svgNS,type);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
      const axis=make('path',{d:'M'+pad+' '+(h-pad)+'L'+(w-pad)+' '+(h-pad),
        stroke:'#69888c','stroke-width':1,fill:'none'});chart.append(axis);
      for(const [value,y] of [[max,22],[min,h-8]]){
        const t=make('text',{x:pad,y,fill:'#d7e9e5','font-size':13});t.textContent=fmt(value);chart.append(t);
      }
      chart.append(make('path',{d:points.map((p,i)=>(i?'L':'M')+px(p)+' '+py(p)).join(' '),
        fill:'none',stroke:'#58dbb0','stroke-width':3,'stroke-linecap':'round'}));
      const buttons=[],markers=[];
      function select(i,focus=false){const p=points[i];say(chartDetail,date(p.observedAt)+' · '+fmt(p.value)+' · officiële trend (algemeen)');
        markers.forEach((n,j)=>n.setAttribute('stroke-width',i===j?'4':'2'));
        if(focus)buttons[i].focus();}
      points.forEach((p,i)=>{
        const dot=make('circle',{cx:px(p),cy:py(p),r:7,fill:'#12252a',stroke:'#58dbb0','stroke-width':2});
        const hit=make('circle',{cx:px(p),cy:py(p),r:36,fill:'transparent',stroke:'transparent',
          tabindex:0,role:'button','aria-label':date(p.observedAt)+': '+fmt(p.value)});
        hit.addEventListener('click',()=>select(i));hit.addEventListener('focus',()=>select(i));
        hit.addEventListener('keydown',e=>{let next=i;if(e.key==='ArrowRight')next=Math.min(i+1,buttons.length-1);
          else if(e.key==='ArrowLeft')next=Math.max(i-1,0);else if(e.key==='Home')next=0;
          else if(e.key==='End')next=buttons.length-1;else if(e.key!=='Enter'&&e.key!==' ')return;
          e.preventDefault();select(next,true);});
        chart.append(dot,hit);markers.push(dot);buttons.push(hit);});
      say(chartStatus,points.length+' echte meetpunten · '+range+' · verschil '+fmt(s.difference)+
        ' · zonder conditie- of taalspecifieke prijs');select(points.length-1);
    }
    for(const b of document.querySelectorAll('[data-range]')) b.addEventListener('click',()=>{
      range=b.dataset.range;for(const n of document.querySelectorAll('[data-range]'))
        n.setAttribute('aria-pressed',String(n.dataset.range===range));renderChart();
    });
    form.addEventListener('submit',async e=>{
      e.preventDefault();pending?.abort();pending=new AbortController();const own=++token;
      unavailableView('WACHTEN');say(status,'Exacte kaartidentiteit en officiële prijs controleren…');
      const value=Number(qty.value);
      const data=await lookup(identifier.value.trim(),{fetchImpl,cryptoImpl,now:now(),signal:pending.signal,
        qty:value,condition:condition.value,confirmed:confirmed.checked});
      if(own!==token||pending.signal.aborted)return;
      if(data.quote.state!=='AVAILABLE')return unavailableView(data.quote.reason);
      current=data;result.hidden=false;capture.disabled=false;
      say(status,'Geverifieerde product-ID; algemene Cardmarket-trend, geen conditie- of taalprijs.');
      say(price,fmt(data.quote.value));
      say(source,'Cardmarket · EUR · trend · '+date(data.quote.asOf)+' · '+data.card.name+
        ' · '+data.item.sourceId+' · conditie en taal niet verwerkt');
      const href=cardmarketUrl(data.quote);link.href=href;link.hidden=!href;
      say(captureStatus,'Klik zelf op Meetpunt opslaan om deze echte dagwaarde lokaal vast te leggen.');
      renderChart();
    });
    capture.addEventListener('click',()=>{
      if(!current)return;
      const saved=deps.history.capture(storage,[current.item],()=>current.quote,now());
      say(captureStatus,saved.status==='STORED'?'Echte dagwaarde lokaal opgeslagen.':
        saved.status==='DUPLICATE'?'Deze dagwaarde is al opgeslagen.':
          'Geen meetpunt opgeslagen ('+(saved.reason||saved.status)+').');
      renderChart();
    });
    unavailableView('GEEN KAART GEKOZEN');
    return Object.freeze({renderChart});
  }

  return Object.freeze({itemFor,lookup,cardmarketUrl,controller});
});
