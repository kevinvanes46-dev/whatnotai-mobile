'use strict';
// Presentation adapter: collection and pricing remain owned by the existing modules.
(()=>{
 const $=id=>document.getElementById(id),ui=()=>window.cardscoutCollectionUI;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const button=(text,fn)=>{const b=el('button',text);b.type='button';b.onclick=fn;return b;};
 const money=v=>new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(v);
 const selection=c=>({card:c,condition:$('condSelect')?.value||'NM',edition:$('editionSelect')?.value||'AUTO',stamped:$('stampedToggle')?.getAttribute('aria-pressed')==='true',cardmarketUrl:''});
 function item(s){const c=s.card;return {name:c.name,number:String(c.number||''),set:c.set,setName:c.set_name||c.setName,sourceId:c.source_id||c.sourceId,source_set_id:c.source_set_id,language:c.language||'EN',condition:s.condition,edition:s.edition,variant:s.stamped?'STAMPED':'NORMAL'};}
 async function quote(s){const data=await window.CardArtwork.lookup(s.card).catch(()=>null),x=item(s);return window.HoloKeepMarket.display(ui().priceFrom(data,x),x);}
 const detail=el('dialog',null,'holoDetail');detail.id='cardSheet';detail.setAttribute('aria-labelledby','cardSheetName');
 detail.innerHTML='<button type="button" id="cardSheetClose" aria-label="Kaartdetail sluiten">Sluiten</button><div id="cardSheetArt" class="holoArt"></div><h2 id="cardSheetName"></h2><p id="cardSheetMeta"></p><strong id="cardSheetPrice"></strong><p id="cardSheetNote" role="status"></p><a id="cardSheetLink" target="_blank" rel="noopener noreferrer">Bekijk op Cardmarket</a><button type="button" id="cardSheetAction"></button>';
 document.body.append(detail);let selected=null,generation=0;
 $('cardSheetClose').onclick=()=>detail.close();
 detail.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const nodes=[...detail.querySelectorAll('button,a[href]')].filter(n=>!n.hidden&&!n.disabled&&n.getClientRects().length);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
 detail.addEventListener('click',e=>{if(e.target===detail){const r=detail.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)detail.close();}});
 async function open(s,uid){const token=++generation,c=s.card,x=item(s);$('cardSheetName').textContent=c.name;
  $('cardSheetMeta').textContent=[x.setName||x.set,x.number&&'#'+x.number,x.language,x.condition,x.variant,x.edition==='1ST'?'1st Edition':''].filter(Boolean).join(' · ');
  $('cardSheetArt').replaceChildren();window.CardArtwork.mount(c,$('cardSheetArt'));
  $('cardSheetPrice').textContent='';$('cardSheetNote').textContent='Marktindicatie ophalen…';
  let url=s.cardmarketUrl;try{url=url||ui().cardmarketLink(x);const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.hostname!=='www.cardmarket.com')url='';}catch{url='';}
  $('cardSheetLink').hidden=!url;if(url)$('cardSheetLink').href=url;
  $('cardSheetAction').textContent=uid?'Kaart bewerken':'Aan map toevoegen';
  $('cardSheetAction').onclick=()=>{detail.close();uid?ui().openItem(uid):ui().openAddFor(s);};
  if(!detail.open)detail.showModal();$('cardSheetClose').focus();
  const q=await quote(s);if(token!==generation)return;
  $('cardSheetPrice').textContent=q.value!=null?money(q.value):'Geen marktindicatie';
  $('cardSheetNote').textContent=[q.label,q.value!=null?q.condition:'',q.date].filter(Boolean).join(' · ');
 }
 const openButton=button('Bekijk kaart',()=>selected&&open(selected));openButton.id='selectedCardOpen';openButton.hidden=true;$('selectedCardEdit').after(openButton);
 window.addEventListener('cardscout:card-selected',e=>{selected=e.detail;openButton.hidden=!selected?.card||selected.card.kind==='query';});
 // Only rows intersecting the visible results list receive provider lookups. The
 // shared artwork lookup deduplicates/cache-reuses requests, with at most two here.
 let running=0;const queue=[],seen=new WeakMap();
 const fingerprint=s=>JSON.stringify([s.condition,s.edition,s.stamped,s.card.source_id,s.card.language]);
 async function pump(){while(running<2&&queue.length){const {row,s,key}=queue.shift();if(!row.isConnected||seen.get(row)!==key)continue;running++;quote(s).then(q=>{if(row.isConnected&&seen.get(row)===key){let p=row.querySelector('.suggestionPrice');if(!p){p=el('small',null,'suggestionPrice');row.querySelector('.suggestionMain').append(p);}p.textContent=q.value!=null?money(q.value)+' · '+q.label:q.label;}}).finally(()=>{running--;pump();});}}
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting&&e.target.holoCard){const row=e.target,s=selection(row.holoCard),key=fingerprint(s);if(seen.get(row)===key)continue;seen.set(row,key);queue.push({row,s,key});}pump();},{threshold:0.1});
 const observe=()=>document.querySelectorAll('.suggestion').forEach(row=>observer.observe(row));
 new MutationObserver(observe).observe($('smartSuggestions'),{childList:true});
 document.querySelectorAll('#condSelect,#editionSelect,#langSelect').forEach(n=>n.addEventListener('change',()=>{document.querySelectorAll('.suggestion').forEach(row=>{seen.delete(row);observer.unobserve(row);observer.observe(row);});}));
 $('stampedToggle')?.addEventListener('click',()=>{document.querySelectorAll('.suggestion').forEach(row=>{seen.delete(row);observer.unobserve(row);observer.observe(row);});});
 const home=el('section',null,'holoSets');home.id='homeSets';home.append(el('h3','Jouw sets'));document.querySelector('[data-view="home"]').append(home);
 const collection=el('section',null,'holoSets');collection.id='collectionSets';collection.append(el('h3','Sets en voortgang'));document.querySelector('[data-view="collection"]').prepend(collection);
 const binder=el('dialog',null,'holoBinder');binder.id='binder';binder.setAttribute('aria-labelledby','binderTitle');document.body.append(binder);let current=null,page=0;
 function groups(){const map=new Map();for(const x of ui().items().filter(x=>x.listType==='OWNED')){const id=x.source_set_id||x.sourceId?.slice(0,x.sourceId.lastIndexOf('-'));if(!id||!x.sourceId)continue;const key=x.language+':'+id;if(!map.has(key))map.set(key,{id,language:x.language,name:x.setName||x.set,owned:new Map()});const g=map.get(key);if(!g.owned.has(x.sourceId))g.owned.set(x.sourceId,x);}
  return [...map.values()].map(g=>({...g,cards:window.CardCatalog?.setCards(g.id,g.language)||[]}));}
 function progress(g){const exact=new Set(g.cards.map(c=>c.source_id));return [Array.from(g.owned.keys()).filter(id=>exact.has(id)).length,g.cards.length];}
 function renderSets(){const list=groups();for(const target of [home,collection]){target.querySelectorAll('.holoSet,.holoEmpty').forEach(n=>n.remove());if(!list.length)target.append(el('p','Voeg je eerste kaart toe om je sets te bekijken.','holoEmpty'));for(const g of list){const [owned,total]=progress(g),b=button('',()=>{current=g;page=0;renderBinder();binder.showModal();});b.className='holoSet';b.append(el('strong',g.name||g.id),el('span',g.language+' · '+(total?owned+' / '+total:'Setinhoud nog niet geladen')));if(total){const p=el('progress');p.max=total;p.value=owned;p.setAttribute('aria-label','Unieke kaarten in bezit');b.append(p);}target.append(b);}}}
 function renderBinder(){const g=current; binder.replaceChildren();binder.append(button('Sluiten',()=>binder.close()));const title=el('h2',g.name||g.id);title.id='binderTitle';binder.append(title,el('p',g.language+' · '+progress(g).join(' / ')+' unieke kaarten'));
  const grid=el('div',null,'binderGrid');for(const c of g.cards.slice(page*9,page*9+9)){const mine=g.owned.get(c.source_id),b=button('',()=>{binder.close();const s=mine?{card:c,condition:mine.condition,edition:mine.edition,stamped:mine.variant==='STAMPED',cardmarketUrl:mine.cardmarketUrl}:selection(c);open(s,mine?.uid);});b.className='binderSlot '+(mine?'owned':'missing');const art=el('span',null,'binderArt');window.CardArtwork.mount(c,art);b.append(art,el('span',c.name),el('small',mine?'In bezit'+(mine.edition==='1ST'?' · 1st Ed':''):'Ontbreekt'));grid.append(b);}binder.append(grid);
  const nav=el('div',null,'binderControls'),prev=button('Vorige',()=>{page--;renderBinder();}),next=button('Volgende',()=>{page++;renderBinder();});prev.disabled=page===0;next.disabled=(page+1)*9>=g.cards.length;nav.append(prev,el('span',(page+1)+' / '+Math.max(1,Math.ceil(g.cards.length/9))),next);binder.append(nav);
  const share=button('Deel leesbare map',()=>{const payload={v:1,set:g.id,language:g.language,owned:[...g.owned.keys()].filter(id=>g.cards.some(c=>c.source_id===id))};const url=new URL('share-v181.html',location.href);url.hash=btoa(JSON.stringify(payload));const field=el('input');field.readOnly=true;field.value=url.href;field.setAttribute('aria-label','Alleen-lezen deellink');share.replaceWith(field);field.select();});binder.append(share);
 }
 window.addEventListener('cardscout:catalog-ready',renderSets);window.addEventListener('storage',renderSets);
 document.querySelectorAll('.navBtn').forEach(b=>b.addEventListener('click',renderSets));
 new MutationObserver(()=>{if($('collectionEditor').hidden)renderSets();}).observe($('collectionEditor'),{attributes:true,attributeFilter:['hidden']});
 window.HoloDexRedesign=Object.freeze({open,groups,progress});renderSets();observe();
})();
