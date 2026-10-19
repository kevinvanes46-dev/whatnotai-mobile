'use strict';
(function(root){
  const document=root.document,History=root.HoloDexHistory,Market=root.HoloKeepMarket;
  if(!document||root.HoloDexComparisonV183)return;
  const panel=document.getElementById('homeComparisonPanel');if(!panel)return;
  const labels={'1W':'de afgelopen week','1M':'de afgelopen maand','3M':'de afgelopen 3 maanden','1J':'het afgelopen jaar',Alles:'de volledige periode'};
  const buttons=[...panel.querySelectorAll('.homeRanges button')],note=panel.querySelector('.homeChartNote'),foot=panel.querySelector('small');
  const stage=document.createElement('div');stage.className='homeChartStage';stage.setAttribute('aria-label','Waardevergelijking');
  const grid=document.createElement('div');grid.className='homeChartGrid';grid.setAttribute('aria-hidden','true');
  const badge=document.createElement('span');badge.className='homeChartBadge';
  const axis=document.createElement('div');axis.className='homeChartAxis';
  const from=document.createElement('span'),to=document.createElement('span');from.className='homeChartFrom';axis.append(from,to);
  const summary=document.createElement('p');summary.className='homeChartSummary';summary.setAttribute('role','status');
  if(note){note.before(stage);stage.append(grid,badge,note,axis);stage.after(summary);}
  let active='1M',queued=false,writeRequested=false,writeFailure=null;
  const money=value=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(value);
  const date=value=>new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
  function items(){
    // Do not silently drop corrupt collection rows from a full-coverage snapshot.
    try{const raw=JSON.parse(root.localStorage.getItem('cardscout_collection_v133')||'[]'),rows=root.cardscoutCollectionUI.items();return Array.isArray(raw)&&raw.length===rows.length?rows:null;}catch{return null;}
  }
  function draw(series){
    stage.querySelector('svg')?.remove();summary.textContent='';stage.dataset.state=series.status;
    const available=series.status==='AVAILABLE';note.hidden=available;grid.hidden=available;
    if(!available){
      badge.textContent='Geen betrouwbare historie';from.textContent=active;to.textContent='';
      note.textContent=`Voor ${labels[active]} zijn nog geen volledig vergelijkbare historische metingen beschikbaar.`;
      foot.textContent=writeFailure?'Lokale historie kan momenteel niet worden opgeslagen. Je collectie blijft beschikbaar.':'Lokale historie vanaf je eerste geldige meting. Alleen volledig vergelijkbare bronmetingen tellen mee; ontbrekende dagen worden niet ingevuld.';
      return;
    }
    const points=series.points,times=points.map(p=>Date.parse(p.observedAt)),values=points.map(p=>p.value),lo=Math.min(...values),hi=Math.max(...values),span=times.at(-1)-times[0];
    const y=v=>hi===lo?80:140-(v-lo)/(hi-lo)*120,x=t=>16+(t-times[0])/span*288;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 320 160');svg.setAttribute('role','img');svg.setAttribute('aria-label','Cardmarket EUR marktindicaties voor dezelfde collectie en aantallen');
    // Only actual observations are plotted. Straight segments connect samples, never inferred values.
    const line=document.createElementNS(svg.namespaceURI,'polyline');line.setAttribute('points',points.map((p,i)=>x(times[i])+','+y(p.value)).join(' '));line.setAttribute('class','homeObservedLine');svg.append(line);
    for(let i=0;i<points.length;i++){const dot=document.createElementNS(svg.namespaceURI,'circle');dot.setAttribute('cx',x(times[i]));dot.setAttribute('cy',y(values[i]));dot.setAttribute('r','2.5');const title=document.createElementNS(svg.namespaceURI,'title');title.textContent=date(points[i].observedAt)+' · '+money(values[i]);dot.append(title);svg.append(dot);}
    stage.insertBefore(svg,axis);badge.textContent='Cardmarket · EUR';from.textContent=date(points[0].observedAt);to.textContent=date(points.at(-1).observedAt);
    summary.textContent=money(values[0])+' → '+money(values.at(-1))+' · Verschil '+money(series.difference);
    const metric={trend:'Trend',avg7:'7-daags gemiddelde',avg30:'30-daags gemiddelde'}[series.metric];
    foot.textContent=metric+' · Algemene marktindicatie; conditie niet verwerkt. Zelfde collectie en aantallen, 100% prijsdekking. '+points.length+' echte metingen. Geen historische aankoopwaarde; lijnen verbinden uitsluitend meetpunten.';
  }
  function render(){
    for(const button of buttons){button.disabled=false;button.dataset.range=button.textContent.trim();button.setAttribute('aria-pressed',String(button.textContent.trim()===active));}
    let result={status:'UNAVAILABLE'};try{if(History&&Market)result=History.series(root.localStorage,items(),Market,active);}catch{writeFailure='STORAGE';}
    if(writeFailure)result={status:'UNAVAILABLE'};
    draw(result);
  }
  function schedule(capture=true){
    writeRequested=writeRequested||capture;if(queued)return;queued=true;
    Promise.resolve().then(async()=>{
      const write=writeRequested;writeRequested=false;
      try{
        if(write&&History&&Market){
          if(!root.navigator?.locks?.request)writeFailure='LOCK_UNAVAILABLE';
          else await root.navigator.locks.request(History.KEY,()=>{const result=History.capture(root.localStorage,items(),Market);writeFailure=['STORAGE','CORRUPT','LIMIT'].includes(result.reason)?result.reason:null;});
        }
      }catch{writeFailure='STORAGE';}
      finally{queued=false;render();if(writeRequested)schedule();}
    });
  }
  function select(label){if(!Object.hasOwn(labels,label))return;active=label;render();}
  for(const button of buttons){button.type='button';button.addEventListener('click',()=>select(button.textContent.trim()));}
  // Existing refreshOnePrice always renders collectionCount after Market.put.
  // Observe that lifecycle, never wrap Market.put or Storage and never request prices.
  const count=document.getElementById('collectionCount');if(count)new MutationObserver(()=>schedule()).observe(count,{childList:true,subtree:true,characterData:true});
  root.addEventListener('storage',e=>{if(e.key===History?.KEY)schedule(false);else if(e.key===Market?.KEY||e.key==='cardscout_collection_v133'||e.key===null)schedule();});
  root.addEventListener('hashchange',()=>schedule());root.addEventListener('pageshow',()=>schedule());
  document.querySelectorAll('.navBtn').forEach(b=>b.addEventListener('click',()=>schedule()));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule();});
  Object.defineProperty(root,'HoloDexComparisonV183',{value:Object.freeze({range:()=>active,select}),configurable:false,writable:false});
  render();schedule();
})(typeof window!=='undefined'?window:globalThis);
