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
  const detail=document.createElement('div');detail.className='homeHistoryDetail';detail.id='homeHistoryPointDetail';detail.setAttribute('role','status');detail.hidden=true;
  if(note){note.before(stage);stage.append(grid,badge,note,axis);stage.after(summary,detail);}
  let selectedAt=null;
  let active='1M',queued=false,writeRequested=false,writeFailure=null;
  const money=value=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(value);
  const date=value=>new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
  function items(){
    // Do not silently drop corrupt collection rows from a full-coverage snapshot.
    try{const raw=JSON.parse(root.localStorage.getItem('cardscout_collection_v133')||'[]'),rows=root.cardscoutCollectionUI.items();return Array.isArray(raw)&&raw.length===rows.length?rows:null;}catch{return null;}
  }
  function draw(series){
    const restoreFocus=stage.contains(document.activeElement);
    stage.querySelector('svg')?.remove();stage.querySelector('.homeChartY')?.remove();
    summary.textContent='';delete summary.dataset.direction;detail.hidden=true;detail.textContent='';stage.dataset.state=series.status;
    const available=series.status==='AVAILABLE';note.hidden=available;grid.hidden=available;
    if(!available){
      selectedAt=null;badge.textContent='Geen betrouwbare historie';from.textContent=active;to.textContent='';
      note.textContent=`Voor ${labels[active]} zijn nog geen volledig vergelijkbare historische metingen beschikbaar.`;
      foot.textContent=writeFailure?'Lokale historie kan momenteel niet worden opgeslagen. Je collectie blijft beschikbaar.':'Lokale historie vanaf je eerste geldige meting. Alleen volledig vergelijkbare bronmetingen tellen mee; ontbrekende dagen worden niet ingevuld.';
      return;
    }
    const points=series.points,times=points.map(p=>Date.parse(p.observedAt)),values=points.map(p=>p.value),lo=Math.min(...values),hi=Math.max(...values),span=times.at(-1)-times[0];
    const metric={trend:'Trend',avg7:'7-daags gemiddelde',avg30:'30-daags gemiddelde'}[series.metric];
    const difference=values.at(-1)-values[0],percent=difference/values[0]*100;
    const direction=difference>0?'positive':difference<0?'negative':'flat';
    const signedMoney=new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',signDisplay:'exceptZero'});
    const signedPercent=new Intl.NumberFormat('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2,signDisplay:'exceptZero'});
    summary.dataset.direction=direction;
    summary.textContent='Begin '+money(values[0])+' → Eind '+money(values.at(-1))+' · '+({positive:'Stijging',negative:'Daling',flat:'Ongewijzigd'}[direction])+' '+signedMoney.format(difference)+(Number.isFinite(percent)?' ('+signedPercent.format(percent)+'%)':' (percentage niet beschikbaar)');
    const y=v=>hi===lo?100:176-(v-lo)/(hi-lo)*152,x=t=>24+(t-times[0])/span*272;
    const make=(tag,attrs={})=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));return el;};
    const svg=make('svg',{viewBox:'0 0 320 200',role:'group','aria-label':'Cardmarket EUR marktindicaties. Gebruik de pijltoetsen voor echte meetpunten.'});
    const yLabels=document.createElement('div');yLabels.className='homeChartY';
    for(const [label,value] of (hi===lo?[['Waarde',lo]]:[['Hoog',hi],['Laag',lo]])){
      const el=document.createElement('span');el.textContent=money(value);el.setAttribute('aria-label',label+' '+money(value));yLabels.append(el);
    }
    yLabels.dataset.flat=String(hi===lo);stage.insertBefore(yLabels,axis);
    for(const value of (hi===lo?[lo]:[hi,lo]))svg.append(make('line',{x1:24,x2:296,y1:y(value),y2:y(value),class:'homeChartGuide'}));
    // One vertex per actual observation. No smoothing, interpolation or inferred points.
    svg.append(make('polyline',{points:points.map((p,i)=>x(times[i])+','+y(p.value)).join(' '),class:'homeObservedLine'}));
    const nodes=[];
    function activate(i,focus=false){
      selectedAt=points[i].observedAt;
      nodes.forEach((node,n)=>{node.setAttribute('tabindex',n===i?'0':'-1');node.setAttribute('aria-pressed',String(n===i));});
      detail.hidden=false;detail.dataset.observedAt=selectedAt;
      detail.textContent=date(selectedAt)+' · '+money(values[i])+' · Cardmarket · '+series.currency+' · '+metric;
      if(focus)nodes[i].focus();
    }
    points.forEach((p,i)=>{
      const node=make('g',{role:'button',tabindex:'-1','aria-label':date(p.observedAt)+' · '+money(p.value)+' · Cardmarket · '+series.currency+' · '+metric,'aria-describedby':'homeHistoryPointDetail',class:'homeHistoryPoint'});
      node.append(make('rect',{x:x(times[i])-24,y:y(p.value)-24,width:48,height:48,fill:'transparent'}),make('circle',{cx:x(times[i]),cy:y(p.value),r:4}));
      node.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')activate(i);});
      node.addEventListener('click',()=>activate(i));node.addEventListener('focus',()=>activate(i));
      node.addEventListener('keydown',e=>{
        const next={ArrowRight:Math.min(i+1,points.length-1),ArrowDown:Math.min(i+1,points.length-1),ArrowLeft:Math.max(i-1,0),ArrowUp:Math.max(i-1,0),Home:0,End:points.length-1,Enter:i,' ':i}[e.key];
        if(next!==undefined){e.preventDefault();activate(next,true);}
      });
      nodes.push(node);svg.append(node);
    });
    stage.insertBefore(svg,axis);badge.textContent='Cardmarket · EUR';
    const sameDay=times.at(-1)-times[0]<86400000;
    const shortDate=value=>new Intl.DateTimeFormat('nl-NL',sameDay?{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}:{day:'numeric',month:'short',year:'2-digit'}).format(new Date(value));
    from.textContent=shortDate(points[0].observedAt);to.textContent=shortDate(points.at(-1).observedAt);
    const selected=points.findIndex(p=>p.observedAt===selectedAt);activate(selected<0?points.length-1:selected,restoreFocus);
    foot.textContent=metric+' · Algemene marktindicatie; conditie niet verwerkt. Zelfde collectie en aantallen, 100% prijsdekking. '+points.length+' echte metingen. Tik op een punt of gebruik de pijltoetsen voor details. Geen historische aankoopwaarde; lijnen verbinden uitsluitend meetpunten.';
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
