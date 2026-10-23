'use strict';
(()=>{
  const $=id=>document.getElementById(id),el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
  const button=(text,fn)=>{const b=el('button',text);b.type='button';b.onclick=fn;return b;};
  const search=$('quickInput'),host=el('section',null,'library185');host.setAttribute('aria-label','Kaartbibliotheek');
  const tools=el('div',null,'libraryToolbar'),toggle=button('Ontdek alle sets',()=>{browser.hidden=!browser.hidden;toggle.setAttribute('aria-expanded',String(!browser.hidden));if(!browser.hidden){renderSets();setFilter.focus();}});
  toggle.id='libraryToggle';toggle.setAttribute('aria-expanded','false');tools.append(toggle);
  const status=el('p','Bibliotheek voorbereiden…','libraryStatus');status.id='libraryStatus';status.setAttribute('role','status');
  const more=button('Meer online resultaten',()=>runSearch(true));more.id='libraryMore';more.hidden=true;
  const retry=button('Zoek hele bibliotheek',()=>runSearch(false));retry.id='librarySearch';tools.append(retry);
  const browser=el('section',null,'libraryBrowser');browser.id='libraryBrowser';browser.hidden=true;
  const heading=el('h2','Ontdek je volgende set'),intro=el('p','Van de eerste uitbreidingen tot recente sets. Alleen fysieke kaarten; ontbrekende brondata blijft zichtbaar.');
  const filters=el('div',null,'libraryFilters'),setFilter=el('input');setFilter.type='search';setFilter.placeholder='Zoek een set of serie';setFilter.setAttribute('aria-label','Filter sets');
  const series=el('select');series.setAttribute('aria-label','Filter serie');
  const language=el('select');language.setAttribute('aria-label','Bibliotheektaal');for(const [v,t] of [['EN','Engels'],['JP','Japans']])language.add(new Option(t,v));
  const refreshSets=button('Controleer nieuwe sets',async()=>{refreshSets.disabled=true;count.textContent='Setlijst controleren…';try{const r=await library.discover(language.value);renderSets();count.textContent+=' · '+(r.error?'Offline: eerdere setlijst behouden':r.unclassified?r.unclassified+' nieuwe sets nog niet verifieerbaar':'Setlijst gecontroleerd');}finally{refreshSets.disabled=false;}});
  filters.append(language,series,setFilter,refreshSets);const count=el('p',null,'libraryStatus'),grid=el('div',null,'librarySetGrid'),details=el('section',null,'librarySetDetail');details.id='librarySetDetail';
  const showSets=button('Meer sets tonen',()=>{setLimit+=24;renderSets(false)});browser.append(heading,intro,filters,count,grid,showSets,details);
  host.append(tools,status,more,browser);$('smartSuggestions').before(host);
  const collectionLink=button('Blader door de kaartbibliotheek',()=>{$('navSearch').click();browser.hidden=false;toggle.setAttribute('aria-expanded','true');renderSets();host.scrollIntoView({block:'start'});});collectionLink.className='libraryCollectionLink';$('collectionSets').before(collectionLink);
  let library,snapshot,seq=0,page=1,timer,setLimit=24,detailSeq=0,currentSet=null,cardPage=0,ownership='all';
  const active=()=>document.documentElement.dataset.activeTab==='search';
  const lang=()=>$('langSelect').value==='JP'?'JP':'EN';
  const ownedIds=l=>new Set(window.cardscoutCollectionUI.items().filter(x=>x.language===l&&x.listType==='OWNED').map(x=>x.sourceId));
  function imageCard(c,parent){if(c.image){const img=el('img');img.loading='lazy';img.alt=c.name;const choices=[c.image+'/low.webp',c.image+'/low.png'];let index=0;img.src=choices[index];img.onerror=()=>{if(++index<choices.length)img.src=choices[index];else{img.remove();parent.prepend(el('span','Afbeelding ontbreekt','libraryNoArt'));}};parent.append(img);}else parent.append(el('span','Afbeelding ontbreekt','libraryNoArt'));}
  function setArt(s){
    const art=el('span',null,'librarySetArt');art.setAttribute('aria-hidden','true');
    const words=String(s.name||s.id).match(/[\p{L}\p{N}]+/gu)||[],initials=(words.length>1?words[0][0]+words[1][0]:words[0]?.slice(0,2)||'TC').toUpperCase();
    const fallback=el('span',null,'librarySetArtFallback');fallback.append(el('strong',initials),el('small','Setlogo niet beschikbaar'));art.append(fallback);
    const sources=[HoloDexLibrary.artwork(s.logo),HoloDexLibrary.artwork(s.symbol)].filter(Boolean);
    const choices=[...new Set(sources.flatMap(url=>[url+'.webp',url+'.png']))];
    if(choices.length){const img=el('img');img.alt='';img.loading='lazy';img.decoding='async';let index=0;img.onload=()=>art.classList.add('hasImage');img.onerror=()=>{art.classList.remove('hasImage');if(++index<choices.length)img.src=choices[index];else img.remove();};img.src=choices[index];art.prepend(img);}
    return art;
  }
  function renderSets(reset=true){if(!library)return;if(reset)setLimit=24;const l=language.value,all=library.getSets(l);
    if(series.dataset.language!==l){series.replaceChildren(new Option('Alle series',''));for(const id of [...new Set(all.map(s=>s.series))])series.add(new Option(all.find(s=>s.series===id).seriesName||id,id));series.dataset.language=l;}
    const q=HoloDexLibrary.normalize(setFilter.value),sets=all.filter(s=>(!series.value||s.series===series.value)&&HoloDexLibrary.normalize(s.name+' '+s.id+' '+s.seriesName).includes(q));
    count.textContent=sets.length+' sets · bronmeting '+new Date(snapshot.measuredAt).toLocaleDateString('nl-NL');grid.replaceChildren();
    for(const s of sets.slice(0,setLimit)){const b=button('',()=>openSet(s,l));b.className='librarySet';b.dataset.setId=s.id;
      b.append(setArt(s));
      b.append(el('small',s.seriesName||s.series),el('strong',s.name),el('span',s.id+' · '+l),el('small',s.available?s.available+' kaarten in bronmeting':'Kaartgegevens ontbreken'));grid.append(b);}
    showSets.hidden=sets.length<=setLimit;
  }
  async function openSet(s,l){const token=++detailSeq;details.replaceChildren(el('h3',s.name),el('p','Kaarten laden…'));details.scrollIntoView({block:'start'});try{const result=await library.loadSet(l,s.id);if(token!==detailSeq)return;CardCatalog.importLibrary(result.cards);currentSet={set:s,lang:l,result};cardPage=0;ownership='all';renderCards();}catch(e){if(token!==detailSeq)return;details.append(el('p','Kaartgegevens niet beschikbaar. '+(navigator.onLine?'Probeer opnieuw.':'Je bent offline.')),button('Opnieuw proberen',()=>openSet(s,l)));}}
  function renderCards(){const {set,lang:l,result}=currentSet,mine=ownedIds(l);details.replaceChildren(el('h3',set.name));
    const owned=result.cards.filter(c=>mine.has(c.source_id)).length;
    details.append(el('p',result.cards.length+' beschikbare kaarten · '+owned+' in bezit · '+(result.cards.length-owned)+' niet in bezit binnen deze dekking'));
    details.append(el('p',result.complete&&!result.stale?'Brondekking compleet: '+result.total+' kaartidentiteiten. Uitvoeringen tellen niet apart.':'Onvolledige of verouderde brondekking; geen volledige setvoortgang.', 'libraryStatus'));
    if(result.stale)details.append(el('p','Offline/eerdere cache: '+result.error,'libraryStatus'));
    const filter=el('div',null,'libraryFilters');for(const [key,label] of [['all','Alle kaarten'],['owned','In bezit'],['missing','Ontbreekt']]){const b=button(label,()=>{ownership=key;cardPage=0;renderCards()});b.setAttribute('aria-pressed',String(key===ownership));filter.append(b);}details.append(filter);
    const cards=result.cards.filter(c=>ownership==='all'||(ownership==='owned')===mine.has(c.source_id)),cardGrid=el('div',null,'libraryCardGrid');
    for(const c of cards.slice(cardPage*24,cardPage*24+24)){const b=button('',()=>{const route=l==='JP'?window.JPCardmarketNative?.route(c):HoloDexLibrary.cardmarketRoute(c);window.HoloDexRedesign.open({card:c,condition:$('condSelect').value||'NM',edition:'AUTO',stamped:false,cardmarketUrl:route?.url||''});});b.className='libraryCard';imageCard(c,b);b.append(el('strong',c.name),el('small',(c.number?'#'+c.number+' · ':'')+c.source_id),el('span',mine.has(c.source_id)?'In bezit':'Ontbreekt'));cardGrid.append(b);}details.append(cardGrid);
    if(!cards.length)details.append(el('p','Geen kaarten beschikbaar in dit filter.'));
    const nav=el('div',null,'libraryToolbar'),prev=button('Vorige kaarten',()=>{cardPage--;renderCards()}),next=button('Volgende kaarten',()=>{cardPage++;renderCards()});prev.disabled=cardPage===0;next.disabled=(cardPage+1)*24>=cards.length;nav.append(prev,el('span',(cardPage+1)+' / '+Math.max(1,Math.ceil(cards.length/24))),next);details.append(nav);
  }
  async function runSearch(append=false){if(!library||!active())return;const query=search.value.trim();if(query.length<2){status.textContent='Zoek op naam, nummer of set; kies EN of JP bij de zoekbalk.';more.hidden=true;return;}const token=++seq;if(!append)page=1;else page++;const requestedPage=page,l=lang();status.textContent='Bibliotheek doorzoeken…';more.hidden=true;
    try{const result=await library.search(l,query,requestedPage);if(token!==seq||search.value.trim()!==query||lang()!==l)return;CardCatalog.importLibrary(result.cards);more.hidden=!result.more;
      status.textContent=(result.stale?'Offline: eerder gecachte resultaten. ':result.incomplete?'Brondekking onvolledig. ':'')+(result.cards.length?'Online pagina '+requestedPage+' toegevoegd aan de geladen zoekresultaten.':'Geen extra matches in deze bronaanvraag.')+(result.more?' Meer resultaten beschikbaar.':' Niet alle Pokémon-kaarten zijn in de bron beschikbaar.');
    }catch(e){if(token!==seq)return;page=append?Math.max(1,page-1):1;status.textContent=navigator.onLine?'Online bibliotheek niet beschikbaar; de geladen basis blijft doorzoekbaar.':'Offline: alleen eerder geladen kaarten zijn doorzoekbaar.';}}
  search.addEventListener('input',()=>{clearTimeout(timer);++seq;more.hidden=true;timer=setTimeout(()=>runSearch(false),500)});
  $('langSelect').addEventListener('change',()=>{++seq;language.value=lang();renderSets();clearTimeout(timer);timer=setTimeout(()=>runSearch(false),500)});
  document.addEventListener('holodex:detail-open',()=>{const link=$('cardSheetLink');if(!link||link.hidden)return;const searchLink=new URL(link.href).pathname.endsWith('/Search');link.textContent=searchLink?'Zoek op Cardmarket · controleer set en nummer':'Bekijk kaart op Cardmarket';});
  for(const n of [language,series,setFilter])n.addEventListener(n===setFilter?'input':'change',()=>renderSets());
  (async()=>{try{const r=await fetch('catalog-sets-v185.json');if(!r.ok)throw Error('snapshot');snapshot=await r.json();library=HoloDexLibrary.create({fetch:window.fetch.bind(window),storage:localStorage,snapshot,legacyCard:c=>window.CardCatalog.normalizeLibrary(c),translateQuery:q=>window.JPSetCatalog.searchName(q)});window.HoloDexLibraryUI={library};CardCatalog.importLibrary(library.restore());language.value=lang();renderSets();status.textContent='Zoek in de uitgebreide EN/JP-bibliotheek, of ontdek een set.';}catch{status.textContent='Setbibliotheek niet beschikbaar; de bestaande zoekfunctie blijft werken.';toggle.disabled=true;retry.disabled=true;}})();
})();
