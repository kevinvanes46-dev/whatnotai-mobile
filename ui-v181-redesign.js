'use strict';
// Presentation adapter: collection and pricing remain owned by the existing modules.
(()=>{
 const $=id=>document.getElementById(id),ui=()=>window.cardscoutCollectionUI;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const button=(text,fn)=>{const b=el('button',text);b.type='button';b.onclick=fn;return b;};
 const money=v=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(v);
 const selection=c=>({card:c,condition:$('condSelect')?.value||'NM',edition:$('editionSelect')?.value||'AUTO',stamped:$('stampedToggle')?.getAttribute('aria-pressed')==='true',cardmarketUrl:''});
 function item(s){const c=s.card;return {name:c.name,number:String(c.number||''),set:c.set,setName:c.set_name||c.setName,sourceId:c.source_id||c.sourceId,source_set_id:c.source_set_id,language:c.language||'EN',condition:s.condition,edition:s.edition,variant:s.stamped?'STAMPED':'NORMAL'};}
 async function quote(s){if(window.HoloKeepMarket.enabled===false)return window.HoloKeepMarket.display();if(s.card.catalogOnly)return {value:null,label:'Catalogusmetadata · geen geverifieerde Cardmarket-prijs',date:''};const data=await window.CardArtwork.lookup(s.card).catch(()=>null),x=item(s);return window.HoloKeepMarket.display(ui().priceFrom(data,x),x);}
 const detail=el('dialog',null,'holoDetail');detail.id='cardSheet';detail.setAttribute('aria-labelledby','cardSheetName');
 detail.innerHTML='<button type="button" id="cardSheetClose" aria-label="Kaartdetail sluiten">Sluiten</button><div id="cardSheetArt" class="holoArt"></div><h2 id="cardSheetName"></h2><p id="cardSheetMeta"></p><strong id="cardSheetPrice"></strong><p id="cardSheetNote" role="status"></p><a id="cardSheetLink" target="_blank" rel="noopener noreferrer">Bekijk op Cardmarket</a><button type="button" id="cardSheetAction"></button>';
 document.body.append(detail);let selected=null,generation=0;
 $('cardSheetClose').onclick=()=>detail.close();
 detail.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const nodes=[...detail.querySelectorAll('button,a[href]')].filter(n=>!n.hidden&&!n.disabled&&n.getClientRects().length);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
 detail.addEventListener('click',e=>{if(e.target===detail){const r=detail.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)detail.close();}});
 async function open(s,uid){const token=++generation,c=s.card,x=item(s);$('cardSheetName').textContent=c.name;
  $('cardSheetMeta').textContent=[x.setName||x.set,x.number&&'#'+x.number,x.language,x.condition,x.variant,x.edition==='1ST'?'1st Edition':''].filter(Boolean).join(' · ');
  $('cardSheetArt').classList.toggle('owned',!!uid);$('cardSheetArt').replaceChildren();window.CardArtwork.mount(c,$('cardSheetArt'));
  $('cardSheetPrice').textContent='';$('cardSheetNote').textContent='Marktindicatie ophalen…';
  let url=s.cardmarketUrl;try{url=url||ui().cardmarketLink(x);const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.hostname!=='www.cardmarket.com')url='';}catch{url='';}
  $('cardSheetLink').hidden=!url;if(url)$('cardSheetLink').href=url;
  $('cardSheetAction').textContent=uid?'Kaart bewerken':'Aan map toevoegen';
  $('cardSheetAction').onclick=()=>{detail.close();uid?ui().openItem(uid):ui().openAddFor(s);};
  if(!detail.open)detail.showModal();$('cardSheetClose').focus();
  // Read-only card context for optional, isolated integrations. No market
  // or collection state is changed by emitting this event.
  document.dispatchEvent(new CustomEvent('holodex:detail-open',{detail:{
   sourceId:x.sourceId,sourceSetId:x.source_set_id,language:x.language,
   variant:x.variant,edition:x.edition,condition:x.condition
  }}));
  const q=await quote(s);if(token!==generation)return;
  $('cardSheetPrice').textContent=q.value!=null?money(q.value):'Geen marktindicatie';
  $('cardSheetNote').textContent=[q.label,q.value!=null?q.condition:'',q.date].filter(Boolean).join(' · ');
 }
 const openButton=button('Bekijk kaart',()=>selected&&open(selected));openButton.id='selectedCardOpen';openButton.hidden=true;$('selectedCardEdit').after(openButton);
 window.addEventListener('cardscout:card-selected',e=>{selected=e.detail;openButton.hidden=!selected?.card||selected.card.kind==='query';});
 // Only rows intersecting the visible results list receive provider lookups. The
 // shared artwork lookup deduplicates/cache-reuses requests, with at most two here.
 let running=0;const queue=[],seen=new WeakMap();
 const searchActive=()=>document.documentElement.dataset.activeTab==='search'&&document.querySelector('[data-view="search"]').classList.contains('active');
 const visibleRow=row=>{if(!searchActive()||!row.isConnected||!$('smartSuggestions').contains(row)||$('smartSuggestions').hidden)return false;const r=row.getBoundingClientRect(),list=$('smartSuggestions').getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>Math.max(0,list.top)&&r.top<Math.min(innerHeight,list.bottom);};
 const fingerprint=s=>JSON.stringify([s.condition,s.edition,s.stamped,s.card.source_id,s.card.language]);
 async function pump(){while(running<2&&queue.length){const {row,s,key}=queue.shift();if(seen.get(row)!==key)continue;if(!visibleRow(row)){seen.delete(row);continue;}running++;quote(s).then(q=>{if(row.isConnected&&seen.get(row)===key){let p=row.querySelector('.suggestionPrice');if(!p){p=el('small',null,'suggestionPrice');row.querySelector('.suggestionMain').append(p);}p.textContent=q.value!=null?money(q.value)+' · '+q.label:q.label;}}).finally(()=>{running--;pump();});}}
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting&&e.target.holoCard&&visibleRow(e.target)){const row=e.target,s=selection(row.holoCard),key=fingerprint(s);if(seen.get(row)===key)continue;seen.set(row,key);queue.push({row,s,key});}pump();},{threshold:0.1});
 const observe=()=>document.querySelectorAll('.suggestion').forEach(row=>observer.observe(row));
 new MutationObserver(observe).observe($('smartSuggestions'),{childList:true});
 new MutationObserver(()=>{if(!searchActive()){for(const {row,key} of queue.splice(0))if(seen.get(row)===key)seen.delete(row);}else{document.querySelectorAll('#smartSuggestions .suggestion').forEach(row=>{observer.unobserve(row);observer.observe(row);});}}).observe(document.documentElement,{attributes:true,attributeFilter:['data-active-tab']});
 document.querySelectorAll('#condSelect,#editionSelect,#langSelect').forEach(n=>n.addEventListener('change',()=>{document.querySelectorAll('.suggestion').forEach(row=>{seen.delete(row);observer.unobserve(row);observer.observe(row);});}));
 $('stampedToggle')?.addEventListener('click',()=>{document.querySelectorAll('.suggestion').forEach(row=>{seen.delete(row);observer.unobserve(row);observer.observe(row);});});
 const home=el('section',null,'holoSets');home.id='homeSets';home.append(el('h3','Bijna compleet'));document.querySelector('[data-view="home"]').append(home);
 const collection=el('section',null,'holoSets');collection.id='collectionSets';collection.append(el('h3','Sets en voortgang'));document.querySelector('[data-view="collection"]').prepend(collection);
 const binder=el('dialog',null,'holoBinder');binder.id='binder';binder.setAttribute('aria-labelledby','binderTitle');document.body.append(binder);let current=null,page=0,filter='all';
 function groups(){const map=new Map();for(const x of ui().items().filter(x=>x.listType==='OWNED')){const id=x.source_set_id||x.sourceId?.slice(0,x.sourceId.lastIndexOf('-'));if(!id||!x.sourceId)continue;const key=x.language+':'+id;if(!map.has(key))map.set(key,{id,language:x.language,name:x.setName||x.set,owned:new Map()});const g=map.get(key);if(!g.owned.has(x.sourceId))g.owned.set(x.sourceId,x);}
  return [...map.values()].map(g=>({...g,cards:window.CardCatalog?.setCards(g.id,g.language)||[]}));}
 function progress(g){const exact=new Set(g.cards.map(c=>c.source_id));return [Array.from(g.owned.keys()).filter(id=>exact.has(id)).length,g.cards.length];}
 function directArt(c,target){
  // Presentation only: never start a price/card-detail request for Home or binder.
  let url=window.HoloKeepHome.artwork({image:c.image,language:c.language});
  if(c.language==='JP'){
   const library=window.RareWorthJPImageLibrary,own=library?.own(c);
   if(own)url=own.image;
   else if(!url&&library?.identity(c)){const exact=library.external(c);try{const u=new URL(exact?.image);if(exact.source_id===c.source_id&&u.protocol==='https:'&&u.hostname==='cdn.artofpkm.com'&&/^\/[a-z0-9]+$/.test(u.pathname)&&!u.search&&!u.hash)url=u.href;}catch{}}
  }
  if(!url){target.textContent='HD';return;}
  const img=el('img');img.alt='';img.loading='lazy';img.decoding='async';img.src=url;img.onerror=()=>{img.remove();target.textContent='HD';};target.append(img);
 }
 function nearlyComplete(list){return list.filter(g=>{const [n,total]=progress(g);return n>0&&n<total;}).sort((a,b)=>{const [an,at]=progress(a),[bn,bt]=progress(b);return bn/bt-an/at||bn-an||String(a.name||a.id).localeCompare(String(b.name||b.id),'nl');});}
 function renderSets(){const list=groups();for(const target of [home,collection]){target.querySelectorAll('.holoSet,.holoEmpty').forEach(n=>n.remove());if(!list.length)target.append(el('p','Voeg je eerste kaart toe om je sets te bekijken.','holoEmpty'));for(const g of (target===home?nearlyComplete(list).slice(0,10):list)){const [owned,total]=progress(g),b=button('',()=>{current=g;page=0;filter='all';renderBinder();binder.showModal();});b.className='holoSet homeStack';const fan=el('span',null,'homeFan');fan.setAttribute('aria-hidden','true');const cards=g.cards.filter(c=>g.owned.has(c.source_id)).slice(0,3);for(let i=0;i<3;i++){const art=el('span',null,'homeFanCard'+(cards[i]?'':' isMissing'));if(cards[i])directArt(cards[i],art);fan.append(art);}b.append(fan);b.append(el('strong',g.name||g.id),el('span',g.language+' · '+(total?owned+' / '+total:'Setinhoud nog niet geladen')));if(total){const p=el('progress');p.max=total;p.value=owned;p.setAttribute('aria-label','Unieke kaarten in bezit');b.append(p);}target.append(b);}if(target===home&&!nearlyComplete(list).length&&list.length)target.append(el('p','Geen onvoltooide sets met bekende setinhoud.','holoEmpty'));}}
 function renderBinder(){
  const g=current; binder.replaceChildren();binder.append(button('Sluiten',()=>binder.close()));
  const title=el('h2',g.name||g.id);title.id='binderTitle';binder.append(title,el('p',g.language+' · '+progress(g).join(' / ')+' unieke kaarten'));
  const ownRows=ui().items().filter(x=>x.listType==='OWNED'&&x.language===g.language),first=c=>ownRows.some(x=>x.sourceId===c.source_id&&x.edition==='1ST');
  const filters=el('div',null,'binderFilters');filters.setAttribute('aria-label','Kaarten filteren');
  for(const [key,label] of [['all','Alle'],['owned','In bezit'],['missing','Ontbreekt'],...(g.cards.some(first)?[['first','1st Ed.']]:[])]){const b=button(label,()=>{filter=key;page=0;renderBinder();binder.querySelector('[data-filter="'+key+'"]').focus();});b.dataset.filter=key;b.setAttribute('aria-pressed',String(key===filter));filters.append(b);}binder.append(filters);
  const cards=g.cards.filter(c=>filter==='all'||(filter==='first'?first(c):(filter==='owned')===g.owned.has(c.source_id)));
  page=Math.min(page,Math.max(0,Math.ceil(cards.length/9)-1));
  const grid=el('div',null,'binderGrid');binder.append(grid);
  let touch=null;grid.addEventListener('touchstart',e=>{const t=e.touches[0];touch=t?{x:t.clientX,y:t.clientY}:null;},{passive:true});grid.addEventListener('touchend',e=>{const t=e.changedTouches[0];if(!touch||!t)return;const dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.abs(dx)<60||Math.abs(dy)>50)return;const next=Math.max(0,Math.min(Math.ceil(cards.length/9)-1,page+(dx<0?1:-1)));if(next!==page){page=next;renderBinder();}},{passive:true});
  for(const c of cards.slice(page*9,page*9+9)){
   const variants=ui().items().filter(x=>x.listType==='OWNED'&&x.sourceId===c.source_id&&x.language===g.language&&(filter!=='first'||x.edition==='1ST')),mine=variants[0];
   const show=x=>{binder.close();open(x?{card:c,condition:x.condition,edition:x.edition,stamped:x.variant==='STAMPED',cardmarketUrl:x.cardmarketUrl}:selection(c),x?.uid);};
   const b=button('',()=>{if(variants.length<2)return show(mine);binder.querySelector('.binderVariants')?.remove();const choices=el('section',null,'binderVariants');choices.append(el('h3','Kies jouw exemplaar'));for(const x of variants)choices.append(button([x.condition,x.variant,x.edition==='1ST'?'1st Edition':'',x.qty+'×'].filter(Boolean).join(' · '),()=>show(x)));binder.append(choices);choices.querySelector('button').focus();});
   b.className='binderSlot '+(mine?'owned':'missing');const art=el('span',null,'binderArt');b.append(art,el('span',c.name),el('small',mine?(variants.length>1?variants.length+' exemplaren':mine.condition+' · '+mine.variant+(mine.edition==='1ST'?' · 1st Ed':'')):'Ontbreekt'));grid.append(b);directArt(c,art);
  }
  if(!cards.length)grid.append(el('p','Geen kaarten in dit filter.','binderEmpty'));
  const nav=el('div',null,'binderControls'),prev=button('Vorige',()=>{page--;renderBinder();}),next=button('Volgende',()=>{page++;renderBinder();});prev.disabled=page===0;next.disabled=(page+1)*9>=cards.length;nav.append(prev,el('span',(page+1)+' / '+Math.max(1,Math.ceil(cards.length/9))),next);binder.append(nav);
  const share=button('Deel leesbare map',()=>{const payload={v:1,set:g.id,language:g.language,owned:[...g.owned.keys()].filter(id=>g.cards.some(c=>c.source_id===id))};const url=new URL('share-v181.html',location.href);url.hash=btoa(JSON.stringify(payload));const field=el('input');field.readOnly=true;field.value=url.href;field.setAttribute('aria-label','Alleen-lezen deellink');share.replaceWith(field);field.select();});binder.append(share);
 }
 window.addEventListener('cardscout:catalog-ready',renderSets);window.addEventListener('storage',renderSets);
 document.querySelectorAll('.navBtn').forEach(b=>b.addEventListener('click',renderSets));
 new MutationObserver(()=>{if($('collectionEditor').hidden)renderSets();}).observe($('collectionEditor'),{attributes:true,attributeFilter:['hidden']});
 const comparison=el('section',null,'homeComparisonPanel');comparison.id='homeComparisonPanel';comparison.append(el('h3','Waardevergelijking'));
 const ranges=el('div',null,'homeRanges');for(const label of ['1W','1M','3M','1J','Alles']){const b=button(label,()=>{});b.disabled=true;ranges.append(b);}comparison.append(ranges,el('p','Nog geen vergelijkbare historische metingen beschikbaar.','homeChartNote'),el('small','Je actuele marktindicatie staat hierboven. Er wordt geen historische waarde geschat.'));$('homeSnapshot').after(comparison);comparison.after(home);
 window.HoloDexRedesign=Object.freeze({open,groups,progress,nearlyComplete});renderSets();observe();
})();
