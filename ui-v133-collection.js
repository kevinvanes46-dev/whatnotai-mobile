
'use strict';
(() => {
  const $=id=>document.getElementById(id);
  const KEY='cardscout_collection_v133';
  const PRICE_TTL=12*60*60*1000;
  const API='https://api.tcgdex.net/v2';
  const SET_IDS={
    'BASE':['base1'],'JUNGLE':['base2'],'FOSSIL':['base3'],'BASE SET 2':['base4'],'ROCKET':['base5'],
    'GYM HEROES':['gym1'],'GYM CHALLENGE':['gym2'],'NEO GENESIS':['neo1'],'NEO DISCOVERY':['neo2'],'NEO REVELATION':['neo3'],'NEO DESTINY':['neo4'],
    'LEGENDARY COLLECTION':['base6'],'SOUTHERN ISLANDS':['si1'],'WOTC PROMO':['basep'],'EXPEDITION':['ecard1'],'AQUAPOLIS':['ecard2'],'SKYRIDGE':['ecard3'],
    'EX RUBY SAPPHIRE':['ex1'],'EX SANDSTORM':['ex2'],'EX DRAGON':['ex3'],'EX TEAM MAGMA AQUA':['ex4'],'EX HIDDEN LEGENDS':['ex5'],'EX FIRERED LEAFGREEN':['ex6'],
    'EX TEAM ROCKET RETURNS':['ex7'],'EX DEOXYS':['ex8'],'EX EMERALD':['ex9'],'EX UNSEEN FORCES':['ex10'],'EX DELTA SPECIES':['ex11'],'EX LEGEND MAKER':['ex12'],
    'EX HOLON PHANTOMS':['ex13'],'EX CRYSTAL GUARDIANS':['ex14'],'EX DRAGON FRONTIERS':['ex15'],'EX POWER KEEPERS':['ex16'],'LEGENDS AWAKENED':['dp6'],
    'EX TRAINER KIT 2':['tk-ex-p','tk-ex-n','tk2a','tk2b']
  };
  let selected=null;
  const addBtn=$('collectionAddBtn');
  const list=$('collectionList');
  const countEl=$('collectionCount');
  const paidEl=$('collectionPaid');
  const marketEl=$('collectionMarket');
  const priceStatus=$('collectionPriceStatus');
  const refreshBtn=$('collectionRefreshBtn');
  const exportBtn=$('collectionExportBtn');
  const importBtn=$('collectionImportBtn');
  const importFile=$('collectionImportFile');
  const clearBtn=$('collectionClearBtn');
  const openBtn=$('openBtn');
  const langSelect=$('langSelect'), condSelect=$('condSelect'), editionSelect=$('editionSelect');

  function read(){ try{const v=JSON.parse(localStorage.getItem(KEY)||'[]'); return Array.isArray(v)?v:[]}catch(_){return []} }
  function write(v){ try{localStorage.setItem(KEY,JSON.stringify(v)); return true}catch(_){return false} }
  function esc(v){return String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function eur(v){return Number.isFinite(Number(v))?new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(Number(v)):'—'}
  function norm(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
  function toast(t){const el=$('toast'); if(!el)return; el.textContent=t; el.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>el.hidden=true,1800)}
  function itemKey(x){return [x.language,x.set,x.number,norm(x.name),x.variant||'NORMAL',x.edition||'AUTO',x.condition||'NM'].join('|')}

  window.addEventListener('cardscout:card-selected',e=>{
    selected=e.detail||null;
    if(addBtn){ addBtn.disabled=!selected; addBtn.textContent=selected?.stamped?'+ Stamped collectie':'+ Collectie'; }
  });

  function currentFallback(){
    const name=$('nameInput')?.value?.trim(); if(!name)return null;
    const set=$('setSelect')?.value||'AUTO'; const number=$('numberInput')?.value?.trim()||'';
    return {card:{name,set,number,language:langSelect?.value||'EN',source:'manual',source_id:'',url:openBtn?.getAttribute('href')||''},stamped:false,condition:condSelect?.value||'NM',edition:editionSelect?.value||'AUTO',cardmarketUrl:openBtn?.getAttribute('href')||''};
  }

  function addSelected(){
    const sel=selected||currentFallback(); if(!sel?.card?.name){toast('Kies eerst een kaart');return}
    const c=sel.card; const variant=sel.stamped?'STAMPED':'NORMAL';
    const item={
      name:c.name,number:String(c.number||''),set:c.set||'AUTO',setName:c.set_name||c.set||'AUTO',language:c.language||langSelect?.value||'EN',
      condition:sel.condition||condSelect?.value||'NM',edition:sel.edition||editionSelect?.value||'AUTO',variant,qty:1,paidEach:null,
      sourceId:c.source_id||'',cardmarketUrl:sel.cardmarketUrl||c.url||openBtn?.getAttribute('href')||'',addedAt:Date.now(),price:null,priceReference:null,priceUpdated:0,priceSource:''
    };
    item.id=itemKey(item);
    const arr=read(); const hit=arr.find(x=>x.id===item.id); if(hit)hit.qty=(Number(hit.qty)||1)+1; else arr.unshift(item);
    write(arr); render(); toast(hit?'Aantal +1':'Toegevoegd aan collectie');
  }
  addBtn?.addEventListener('click',addSelected);

  function total(arr,field){return arr.reduce((sum,x)=>sum+(Number(x[field])||0)*(Number(x.qty)||1),0)}
  function render(){
    const arr=read();
    const qty=arr.reduce((n,x)=>n+(Number(x.qty)||1),0); countEl&&(countEl.textContent=String(qty));
    const paid=arr.reduce((sum,x)=>sum+(Number(x.paidEach)||0)*(Number(x.qty)||1),0); paidEl&&(paidEl.textContent=eur(paid));
    const market=arr.reduce((sum,x)=>sum+(Number(x.price)||Number(x.priceReference)||0)*(Number(x.qty)||1),0); marketEl&&(marketEl.textContent=eur(market));
    if(!list)return;
    if(!arr.length){list.className='collectionList empty';list.innerHTML='Nog geen kaarten. Zoek een kaart en tik op <b>+ Collectie</b>.';return}
    list.className='collectionList';
    list.innerHTML=arr.map((x,i)=>{
      const shownPrice=Number(x.price)||Number(x.priceReference)||null;
      const approx=x.variant==='STAMPED'||(!x.price&&x.priceReference);
      const variant=x.variant==='STAMPED'?'⚡ STAMPED':(x.variant||'NORMAL');
      return `<article class="collectionCard" data-i="${i}">
        <div class="collectionCardMain"><div><h3>${esc(x.name)}${x.number?' · #'+esc(x.number):''}</h3><p>${esc(x.setName||x.set)} · ${esc(x.language)} · ${esc(x.condition)} · ${esc(variant)}</p></div>
        <div class="collectionValue"><b>${shownPrice?(approx?'~':'')+eur(shownPrice):'—'}</b><small>${x.variant==='STAMPED'?'CM basisindicatie':(x.priceSource||'prijs nog laden')}</small></div></div>
        <div class="collectionCardRow"><div class="qtyControl"><button data-act="minus">−</button><span>${Number(x.qty)||1}</span><button data-act="plus">+</button></div>
        <button class="paidBtn" data-act="paid">Betaald: ${x.paidEach!=null?eur(x.paidEach):'invullen'}</button>
        ${x.cardmarketUrl?`<a href="${esc(x.cardmarketUrl)}" target="_blank" rel="noopener">Cardmarket ↗</a>`:''}
        <button class="removeBtn" data-act="remove">×</button></div>
      </article>`
    }).join('');
    list.querySelectorAll('[data-act]').forEach(btn=>btn.addEventListener('click',()=>{
      const card=btn.closest('.collectionCard'); const idx=Number(card?.dataset.i); const arr2=read(); const x=arr2[idx]; if(!x)return;
      const act=btn.dataset.act;
      if(act==='plus')x.qty=(Number(x.qty)||1)+1;
      if(act==='minus'){x.qty=Math.max(1,(Number(x.qty)||1)-1)}
      if(act==='remove'){arr2.splice(idx,1)}
      if(act==='paid'){const val=prompt('Aankoopprijs per kaart in euro (bijv. 12,50):',x.paidEach??''); if(val!==null){const n=Number(String(val).replace(',','.')); if(Number.isFinite(n)&&n>=0)x.paidEach=n;}}
      write(arr2); render();
    }));
  }

  async function fetchJson(url){const c=new AbortController();const t=setTimeout(()=>c.abort(),10000);try{const r=await fetch(url,{cache:'no-store',signal:c.signal,headers:{Accept:'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}}
  async function resolveCard(item){
    const lang=item.language==='JP'?'ja':'en';
    if(item.sourceId){try{return await fetchJson(`${API}/${lang}/cards/${encodeURIComponent(item.sourceId)}`)}catch(_){}}
    if(item.language==='JP'||!item.number)return null;
    for(const sid of (SET_IDS[item.set]||[])){
      try{const c=await fetchJson(`${API}/en/cards/${encodeURIComponent(sid+'-'+item.number)}`); if(c&&norm(c.name)===norm(item.name))return c}catch(_){}
    }
    return null;
  }
  function priceFrom(card,item){
    const cm=card?.pricing?.cardmarket; if(!cm)return {price:null,reference:null,updated:0,source:''};
    const normal=Number(cm.trend??cm.avg7??cm.avg??cm.low);
    if(item.variant==='STAMPED'){
      return {price:null,reference:Number.isFinite(normal)?normal:null,updated:Date.parse(cm.updated||'')||Date.now(),source:'CM basis'};
    }
    const p=Number.isFinite(normal)?normal:null;
    return {price:p,reference:null,updated:Date.parse(cm.updated||'')||Date.now(),source:'CM trend'};
  }
  async function refreshPrices(force=false){
    const arr=read(); if(!arr.length){toast('Collectie is leeg');return}
    refreshBtn&&(refreshBtn.disabled=true); priceStatus&&(priceStatus.textContent='Prijzen ophalen…');
    let changed=0,failed=0;
    for(let i=0;i<arr.length;i++){
      const x=arr[i]; if(!force&&x.priceUpdated&&Date.now()-x.priceUpdated<PRICE_TTL)continue;
      try{const card=await resolveCard(x); if(!card){failed++;continue} const p=priceFrom(card,x); x.price=p.price; x.priceReference=p.reference; x.priceUpdated=p.updated||Date.now(); x.priceSource=p.source; changed++;}
      catch(_){failed++;}
    }
    write(arr); render(); refreshBtn&&(refreshBtn.disabled=false);
    priceStatus&&(priceStatus.textContent=`${changed} bijgewerkt${failed?' · '+failed+' zonder prijs':''}`);
    toast('Marktindicatie bijgewerkt');
  }
  refreshBtn?.addEventListener('click',()=>refreshPrices(true));

  exportBtn?.addEventListener('click',()=>{
    const payload={version:133,exportedAt:new Date().toISOString(),collection:read()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`cardscout-collectie-${new Date().toISOString().slice(0,10)}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  });
  importBtn?.addEventListener('click',()=>importFile?.click());
  importFile?.addEventListener('change',async()=>{try{const f=importFile.files?.[0];if(!f)return;const obj=JSON.parse(await f.text());const arr=Array.isArray(obj)?obj:obj.collection;if(!Array.isArray(arr))throw 0;write(arr);render();toast(`${arr.length} regels geïmporteerd`)}catch(_){toast('Ongeldige backup')}finally{importFile.value=''}});
  clearBtn?.addEventListener('click',()=>{if(confirm('Hele collectie wissen?')){write([]);render();toast('Collectie gewist')}});

  // Refresh stale prices quietly when the user opens the collection tab.
  document.getElementById('navCollection')?.addEventListener('click',()=>{render();const a=read();if(a.some(x=>!x.priceUpdated||Date.now()-x.priceUpdated>PRICE_TTL))refreshPrices(false)});
  render();
})();
