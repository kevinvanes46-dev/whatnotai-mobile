
'use strict';
(() => {
  const $=id=>document.getElementById(id);
  const KEY='cardscout_collection_v133';
  const PRICE_TTL=12*60*60*1000;
  const API='https://api.tcgdex.net/v2';
  const CONDITIONS=['NM','EX','GD','PL'];
  const LISTS=['OWNED','WISHLIST'];
  const VARIANTS=['NORMAL','STAMPED'];

  const SET_IDS={
    'BASE':['base1'],'JUNGLE':['base2'],'FOSSIL':['base3'],'BASE SET 2':['base4'],'ROCKET':['base5'],
    'GYM HEROES':['gym1'],'GYM CHALLENGE':['gym2'],'NEO GENESIS':['neo1'],'NEO DISCOVERY':['neo2'],'NEO REVELATION':['neo3'],'NEO DESTINY':['neo4'],
    'LEGENDARY COLLECTION':['base6'],'SOUTHERN ISLANDS':['si1'],'WOTC PROMO':['basep'],'EXPEDITION':['ecard1'],'AQUAPOLIS':['ecard2'],'SKYRIDGE':['ecard3'],
    'EX RUBY SAPPHIRE':['ex1'],'EX SANDSTORM':['ex2'],'EX DRAGON':['ex3'],'EX TEAM MAGMA AQUA':['ex4'],'EX HIDDEN LEGENDS':['ex5'],'EX FIRERED LEAFGREEN':['ex6'],
    'EX TEAM ROCKET RETURNS':['ex7'],'EX DEOXYS':['ex8'],'EX EMERALD':['ex9'],'EX UNSEEN FORCES':['ex10'],'EX DELTA SPECIES':['ex11'],'EX LEGEND MAKER':['ex12'],
    'EX HOLON PHANTOMS':['ex13'],'EX CRYSTAL GUARDIANS':['ex14'],'EX DRAGON FRONTIERS':['ex15'],'EX POWER KEEPERS':['ex16'],'LEGENDS AWAKENED':['dp6'],
    'EX TRAINER KIT 2':['tk-ex-p','tk-ex-n','tk2a','tk2b']
  };

  const addBtn=$('collectionAddBtn');
  const listEl=$('collectionList');
  const countEl=$('collectionCount');
  const wishlistCountEl=$('wishlistCount');
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

  const searchEl=$('collectionSearch');
  const conditionFilter=$('collectionConditionFilter');
  const setFilter=$('collectionSetFilter');
  const sortEl=$('collectionSort');
  const quickFilters=$('collectionQuickFilters');

  const editor=$('collectionEditor');
  const editorBackdrop=$('collectionEditorBackdrop');
  const editorClose=$('collectionEditorClose');
  const editorSave=$('collectionEditorSave');
  const editorDelete=$('collectionEditorDelete');
  const editorTitle=$('collectionEditorTitle');
  const editorMeta=$('collectionEditorMeta');
  const editorEyebrow=$('collectionEditorEyebrow');
  const editorQty=$('collectionEditorQty');
  const editorPaid=$('collectionEditorPaid');

  let selected=null;
  let editorMode='add';
  let editingId=null;
  let editorState={list:'OWNED',condition:'NM',variant:'NORMAL'};
  let filterState={list:'ALL',language:'',variant:''};

  function read(){
    try{
      const v=JSON.parse(localStorage.getItem(KEY)||'[]');
      return Array.isArray(v)?v:[];
    }catch(_){return []}
  }
  function write(v){
    try{localStorage.setItem(KEY,JSON.stringify(v));return true}catch(_){return false}
  }
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function eur(v){return Number.isFinite(Number(v))?new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'}).format(Number(v)):'—'}
  function norm(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
  function cleanVisibleCardName(value,number=''){
    let name=String(value||'')
      .replace(/[\u200B-\u200D\u2060\uFEFF\uFFFD]/g,'')
      .replace(/\s+/g,' ')
      .trim()
      .replace(/\s*[\u00b7•]\s*#\s*/g,' #');
    const collector=String(number||'').replace(/[\u200B-\u200D\u2060\uFEFF\uFFFD]/g,'').trim();
    if(collector){
      const escaped=collector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      name=name.replace(new RegExp(`\\s+#\\s*${escaped}\\s*$`,'i'),'').trim();
    }
    return name;
  }
  function visibleCardTitle(item){
    const number=String(item?.number||'').replace(/[\u200B-\u200D\u2060\uFEFF\uFFFD]/g,'').trim();
    const name=cleanVisibleCardName(item?.name,number)||'Onbekende kaart';
    return `${name}${number?' #'+number:''}`;
  }
  function toast(t){const el=$('toast');if(!el)return;el.textContent=t;el.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>el.hidden=true,1800)}
  function uid(){return 'c_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8)}
  function identityKey(x){return [x.listType,x.language,x.set,x.number,norm(x.name),x.variant,x.edition,x.condition].join('|')}

  function normalizeItem(x){
    if(!x||typeof x!=='object')return null;
    x.uid=x.uid||uid();
    x.listType=LISTS.includes(String(x.listType||'').toUpperCase())?String(x.listType).toUpperCase():'OWNED';
    x.condition=CONDITIONS.includes(String(x.condition||'').toUpperCase())?String(x.condition).toUpperCase():'NM';
    x.variant=VARIANTS.includes(String(x.variant||'').toUpperCase())?String(x.variant).toUpperCase():'NORMAL';
    x.language=String(x.language||'EN').toUpperCase()==='JP'?'JP':'EN';
    x.qty=Math.max(1,Number(x.qty)||1);
    x.paidEach=(x.paidEach===null||x.paidEach===''||x.paidEach===undefined)?null:Number(x.paidEach);
    if(!Number.isFinite(x.paidEach))x.paidEach=null;
    x.addedAt=Number(x.addedAt)||Date.now();
    return x;
  }

  function migrate(){
    const arr=read().map(normalizeItem).filter(Boolean);
    write(arr);
  }

  function currentFallback(){
    const name=$('nameInput')?.value?.trim();
    if(!name)return null;
    return {
      card:{
        name,
        set:$('setSelect')?.value||'AUTO',
        set_name:$('setInfo')?.textContent?.replace(/^Set:\s*/,'')||'AUTO',
        number:$('numberInput')?.value?.trim()||'',
        language:langSelect?.value||'EN',
        source:'manual',
        source_id:'',
        url:openBtn?.getAttribute('href')||''
      },
      stamped:false,
      condition:condSelect?.value||'NM',
      edition:editionSelect?.value||'AUTO',
      cardmarketUrl:openBtn?.getAttribute('href')||''
    };
  }

  window.addEventListener('cardscout:card-selected',e=>{
    selected=e.detail||null;
    if(addBtn){
      addBtn.disabled=!selected;
      addBtn.textContent=selected?.stamped?'+ Stamped collectie':'+ Collectie';
    }
  });

  function setEditorChoice(kind,value){
    editorState[kind]=value;
    editor?.querySelectorAll(`[data-editor-${kind}]`).forEach(b=>{
      b.classList.toggle('active',b.dataset[`editor${kind[0].toUpperCase()+kind.slice(1)}`]===value);
    });
  }

  function syncEditorButtons(){
    editor?.querySelectorAll('[data-editor-list]').forEach(b=>b.classList.toggle('active',b.dataset.editorList===editorState.list));
    editor?.querySelectorAll('[data-editor-condition]').forEach(b=>b.classList.toggle('active',b.dataset.editorCondition===editorState.condition));
    editor?.querySelectorAll('[data-editor-variant]').forEach(b=>b.classList.toggle('active',b.dataset.editorVariant===editorState.variant));
    if(editorPaid){
      const wrap=editorPaid.closest('label');
      wrap?.classList.toggle('mutedField',editorState.list==='WISHLIST');
      editorPaid.disabled=editorState.list==='WISHLIST';
    }
  }

  function showEditor(){
    if(!editor||!editorBackdrop)return;
    editor.hidden=false;
    editorBackdrop.hidden=false;
    document.body.classList.add('collectionEditorOpen');
    syncEditorButtons();
  }
  function closeEditor(){
    if(!editor||!editorBackdrop)return;
    editor.hidden=true;
    editorBackdrop.hidden=true;
    document.body.classList.remove('collectionEditorOpen');
    editingId=null;
  }

  function openAddEditor(){
    const sel=selected||currentFallback();
    if(!sel?.card?.name){toast('Kies eerst een kaart');return}
    const c=sel.card;
    editorMode='add';editingId=null;
    editorState={
      list:'OWNED',
      condition:CONDITIONS.includes(sel.condition)?sel.condition:(condSelect?.value||'NM'),
      variant:sel.stamped?'STAMPED':'NORMAL'
    };
    editorTitle.textContent=visibleCardTitle(c);
    editorMeta.textContent=[c.set_name||c.set,c.language||langSelect?.value||'EN'].filter(Boolean).join(' · ');
    editorEyebrow.textContent='Toevoegen';
    editorQty.value='1';
    editorPaid.value='';
    editorDelete.hidden=true;
    editor.dataset.pending=JSON.stringify({
      name:cleanVisibleCardName(c.name,c.number)||c.name,number:String(c.number||''),set:c.set||'AUTO',setName:c.set_name||c.set||'AUTO',
      language:c.language||langSelect?.value||'EN',edition:sel.edition||editionSelect?.value||'AUTO',
      sourceId:c.source_id||'',cardmarketUrl:sel.cardmarketUrl||c.url||openBtn?.getAttribute('href')||''
    });
    showEditor();
  }

  function openEditEditor(item){
    editorMode='edit';editingId=item.uid;
    editorState={list:item.listType,condition:item.condition,variant:item.variant};
    editorTitle.textContent=visibleCardTitle(item);
    editorMeta.textContent=[item.setName||item.set,item.language].filter(Boolean).join(' · ');
    editorEyebrow.textContent=item.listType==='WISHLIST'?'Wishlist bewerken':'Kaart bewerken';
    editorQty.value=String(item.qty||1);
    editorPaid.value=item.paidEach==null?'':String(item.paidEach).replace('.',',');
    editorDelete.hidden=false;
    editor.dataset.pending='';
    showEditor();
  }

  addBtn?.addEventListener('click',openAddEditor);
  editorClose?.addEventListener('click',closeEditor);
  editorBackdrop?.addEventListener('click',closeEditor);
  editor?.querySelectorAll('[data-editor-list]').forEach(b=>b.addEventListener('click',()=>{editorState.list=b.dataset.editorList;syncEditorButtons()}));
  editor?.querySelectorAll('[data-editor-condition]').forEach(b=>b.addEventListener('click',()=>{editorState.condition=b.dataset.editorCondition;syncEditorButtons()}));
  editor?.querySelectorAll('[data-editor-variant]').forEach(b=>b.addEventListener('click',()=>{editorState.variant=b.dataset.editorVariant;syncEditorButtons()}));

  editorSave?.addEventListener('click',()=>{
    const qty=Math.max(1,parseInt(editorQty?.value||'1',10)||1);
    let paid=null;
    if(editorState.list==='OWNED'){
      const raw=String(editorPaid?.value||'').trim();
      if(raw){
        const n=Number(raw.replace(',','.'));
        if(!Number.isFinite(n)||n<0){toast('Controleer aankoopprijs');return}
        paid=n;
      }
    }

    const arr=read().map(normalizeItem).filter(Boolean);

    let priceTargetId=null;
    let shouldRefreshPrice=false;
    if(editorMode==='add'){
      let base;
      try{base=JSON.parse(editor.dataset.pending||'{}')}catch(_){base={}}
      if(!base.name){toast('Kaart ontbreekt');return}
      const item=normalizeItem({
        ...base,uid:uid(),listType:editorState.list,condition:editorState.condition,variant:editorState.variant,
        qty,paidEach:paid,addedAt:Date.now(),price:null,priceUpdated:0,priceSource:''
      });
      const key=identityKey(item);
      const existing=arr.find(x=>identityKey(x)===key);
      if(existing){
        existing.qty+=qty;
        if(existing.paidEach==null&&paid!=null)existing.paidEach=paid;
        priceTargetId=existing.uid;
        shouldRefreshPrice=existing.listType==='OWNED'&&(!existing.priceUpdated||!Number.isFinite(Number(existing.price))||Number(existing.price)<=0);
      }else{
        arr.unshift(item);
        priceTargetId=item.uid;
        shouldRefreshPrice=item.listType==='OWNED';
      }
      write(arr);
      toast(editorState.list==='WISHLIST'?'Toegevoegd aan wishlist':'Toegevoegd aan collectie');
    }else{
      const x=arr.find(x=>x.uid===editingId);
      if(!x)return;
      const previousList=x.listType;
      const previousVariant=x.variant;
      x.listType=editorState.list;
      x.condition=editorState.condition;
      x.variant=editorState.variant;
      x.qty=qty;
      x.paidEach=editorState.list==='OWNED'?paid:null;
      if(previousVariant!==x.variant){x.price=null;x.priceUpdated=0;x.priceSource='';}
      priceTargetId=x.uid;
      shouldRefreshPrice=x.listType==='OWNED'&&(previousList!=='OWNED'||previousVariant!==x.variant||!x.priceUpdated||!Number.isFinite(Number(x.price))||Number(x.price)<=0);
      write(arr);
      toast('Wijzigingen opgeslagen');
    }
    closeEditor();render();
    if(shouldRefreshPrice&&priceTargetId)void refreshOnePrice(priceTargetId);
  });

  editorDelete?.addEventListener('click',()=>{
    if(!editingId)return;
    if(!confirm('Deze kaart verwijderen?'))return;
    const arr=read().map(normalizeItem).filter(Boolean).filter(x=>x.uid!==editingId);
    write(arr);closeEditor();render();toast('Kaart verwijderd');
  });

  function updateSetFilter(arr){
    if(!setFilter)return;
    const current=setFilter.value;
    const sets=[...new Set(arr.map(x=>x.setName||x.set).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'nl'));
    setFilter.innerHTML='<option value="">Alle sets</option>'+sets.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('');
    if(sets.includes(current))setFilter.value=current;
  }

  function filtered(arr){
    const q=norm(searchEl?.value||'');
    const terms=q.split(' ').filter(Boolean);
    let out=arr.filter(x=>{
      if(filterState.list!=='ALL'&&x.listType!==filterState.list)return false;
      if(filterState.language&&x.language!==filterState.language)return false;
      if(filterState.variant&&x.variant!==filterState.variant)return false;
      if(conditionFilter?.value&&x.condition!==conditionFilter.value)return false;
      if(setFilter?.value&&(x.setName||x.set)!==setFilter.value)return false;
      if(terms.length){
        const hay=norm([x.name,x.number,x.setName,x.set,x.language,x.condition,x.variant,x.listType].join(' '));
        if(!terms.every(t=>hay.includes(t)))return false;
      }
      return true;
    });
    const sort=sortEl?.value||'recent';
    if(sort==='name')out.sort((a,b)=>a.name.localeCompare(b.name,'nl'));
    else if(sort==='set')out.sort((a,b)=>(a.setName||a.set).localeCompare(b.setName||b.set,'nl')||a.name.localeCompare(b.name,'nl'));
    else if(sort==='paid-desc')out.sort((a,b)=>(Number(b.paidEach)||-1)-(Number(a.paidEach)||-1));
    else if(sort==='paid-asc')out.sort((a,b)=>(Number(a.paidEach)||1e12)-(Number(b.paidEach)||1e12));
    else out.sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
    return out;
  }

  function render(){
    const arr=read().map(normalizeItem).filter(Boolean);
    const owned=arr.filter(x=>x.listType==='OWNED');
    const wish=arr.filter(x=>x.listType==='WISHLIST');
    const qty=owned.reduce((n,x)=>n+x.qty,0);
    const paid=owned.reduce((sum,x)=>sum+(Number(x.paidEach)||0)*x.qty,0);
    const market=owned.reduce((sum,x)=>sum+(Number(x.price)||0)*x.qty,0);

    if(countEl)countEl.textContent=String(qty);
    if(wishlistCountEl)wishlistCountEl.textContent=String(wish.length);
    if(paidEl)paidEl.textContent=eur(paid);
    if(marketEl)marketEl.textContent=eur(market);

    updateSetFilter(arr);
    const rows=filtered(arr);

    if(!listEl)return;
    if(!arr.length){
      listEl.className='collectionList empty';
      listEl.innerHTML='Nog geen kaarten. Zoek een kaart en tik op <b>+ Collectie</b>.';
      return;
    }
    if(!rows.length){
      listEl.className='collectionList empty';
      listEl.innerHTML='Geen kaarten voor deze filters.';
      return;
    }

    listEl.className='collectionList';
    listEl.innerHTML=rows.map(x=>{
      const shownPrice=Number.isFinite(Number(x.price))&&Number(x.price)>0?Number(x.price):null;
      const isWish=x.listType==='WISHLIST';
      const variant=x.variant==='STAMPED'?'⚡ STAMPED':'Normaal';
      return `<article class="collectionCard collectionCardPro ${isWish?'wishlistCard':''}" data-id="${esc(x.uid)}">
        <button type="button" class="collectionCardMain collectionCardOpen" data-act="edit">
          <div>
            <div class="collectionCardBadges">
              ${isWish?'<span class="wishBadge">♡ Wishlist</span>':'<span class="ownedBadge">✓ In collectie</span>'}
              ${x.variant==='STAMPED'?'<span class="stampBadge">⚡ Stamped</span>':''}
            </div>
            <h3>${esc(visibleCardTitle(x))}</h3>
            <p>${esc(x.setName||x.set)} · ${esc(x.language)}</p>
            <p class="collectionCondition">${isWish?'Gewenste staat':'Gekocht'}: <strong>${esc(x.condition)}</strong></p>
          </div>
          <div class="collectionValue">
            <b>${shownPrice&&!isWish?eur(shownPrice):'—'}</b>
            <small>${isWish?'nog niet gekocht':(shownPrice?esc(x.priceSource||'CM trend'):'—')}</small>
          </div>
        </button>

        <div class="collectionCardRow">
          ${!isWish?`<div class="qtyControl"><button data-act="minus">−</button><span>${x.qty}</span><button data-act="plus">+</button></div>`:'<span class="wishHint">Bewaar voor later</span>'}
          ${!isWish?`<button class="paidBtn" data-act="edit">Betaald: ${x.paidEach!=null?eur(x.paidEach):'invullen'}</button>`:''}
          ${isWish?'<button class="boughtBtn" data-act="bought">Gekocht ✓</button>':''}
          ${x.cardmarketUrl?`<a href="${esc(x.cardmarketUrl)}" target="_blank" rel="noopener">Cardmarket ↗</a>`:''}
          <button class="editMiniBtn" data-act="edit">Bewerk</button>
        </div>
      </article>`;
    }).join('');

    listEl.querySelectorAll('[data-act]').forEach(btn=>btn.addEventListener('click',ev=>{
      if(btn.tagName==='A')return;
      ev.preventDefault();
      const card=btn.closest('.collectionCard');
      const id=card?.dataset.id;
      const arr2=read().map(normalizeItem).filter(Boolean);
      const x=arr2.find(x=>x.uid===id);
      if(!x)return;
      const act=btn.dataset.act;
      if(act==='edit'){openEditEditor(x);return}
      if(act==='plus'){x.qty++;write(arr2);render();return}
      if(act==='minus'){x.qty=Math.max(1,x.qty-1);write(arr2);render();return}
      if(act==='bought'){
        editorMode='edit';editingId=x.uid;
        editorState={list:'OWNED',condition:x.condition,variant:x.variant};
        editorTitle.textContent=visibleCardTitle(x);
        editorMeta.textContent=[x.setName||x.set,x.language].join(' · ');
        editorEyebrow.textContent='Markeer als gekocht';
        editorQty.value='1';editorPaid.value='';editorDelete.hidden=false;
        showEditor();return;
      }
    }));
  }

  function syncQuickFilterButtons(){
    if(!quickFilters)return;
    quickFilters.querySelectorAll('button').forEach(b=>{
      let on=false;
      if(b.dataset.filterList)on=b.dataset.filterList===filterState.list;
      if(b.dataset.filterLanguage)on=b.dataset.filterLanguage===filterState.language;
      if(b.dataset.filterVariant)on=b.dataset.filterVariant===filterState.variant;
      b.classList.toggle('active',on);
    });
  }
  quickFilters?.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
    if(b.dataset.filterList)filterState.list=b.dataset.filterList;
    if(b.dataset.filterLanguage)filterState.language=filterState.language===b.dataset.filterLanguage?'':b.dataset.filterLanguage;
    if(b.dataset.filterVariant)filterState.variant=filterState.variant===b.dataset.filterVariant?'':b.dataset.filterVariant;
    syncQuickFilterButtons();render();
  }));
  searchEl?.addEventListener('input',render);
  conditionFilter?.addEventListener('change',render);
  setFilter?.addEventListener('change',render);
  sortEl?.addEventListener('change',render);

  async function fetchJson(url){
    const c=new AbortController();const t=setTimeout(()=>c.abort(),10000);
    try{
      const r=await fetch(url,{cache:'no-store',signal:c.signal,headers:{Accept:'application/json'}});
      if(!r.ok)throw new Error('HTTP '+r.status);
      return await r.json();
    }finally{clearTimeout(t)}
  }
  async function resolveCard(item){
    const lang=item.language==='JP'?'ja':'en';
    if(item.sourceId){
      try{return await fetchJson(`${API}/${lang}/cards/${encodeURIComponent(item.sourceId)}`)}catch(_){}
    }
    if(item.language==='JP'||!item.number)return null;
    const collector=String(item.number).trim().split('/')[0].replace(/^0+(?=\d)/,'');
    if(!collector)return null;
    for(const sid of (SET_IDS[item.set]||[])){
      try{
        const c=await fetchJson(`${API}/en/cards/${encodeURIComponent(sid+'-'+collector)}`);
        // For English cards the set ID + collector number is the unique identity.
        // Display aliases such as "Charizard Delta Species" must not reject that exact card.
        if(c)return c;
      }catch(_){}
    }
    return null;
  }
  function firstFinite(...values){
    for(const v of values){
      const n=Number(v);
      if(Number.isFinite(n)&&n>0)return n;
    }
    return null;
  }
  function priceFrom(card,item){
    const cm=card?.pricing?.cardmarket;
    if(!cm)return {price:null,updated:0,source:''};
    const updated=Date.parse(cm.updated||'')||Date.now();
    if(item.variant==='STAMPED'){
      const reverse=firstFinite(cm['trend-holo'],cm['avg7-holo'],cm['avg30-holo'],cm['avg-holo'],cm['avg1-holo'],cm['low-holo']);
      return {price:reverse,updated,source:reverse!=null?'CM trend · reverse':''};
    }
    const normal=firstFinite(cm.trend,cm.avg7,cm.avg30,cm.avg,cm.avg1,cm.low);
    return {price:normal,updated,source:normal!=null?'CM trend':''};
  }
  async function refreshOnePrice(uid){
    const initial=read().map(normalizeItem).filter(Boolean).find(x=>x.uid===uid);
    if(!initial||initial.listType!=='OWNED')return;
    if(priceStatus)priceStatus.textContent=`CM-trend ophalen voor ${cleanVisibleCardName(initial.name,initial.number)||'kaart'}…`;
    try{
      const card=await resolveCard(initial);
      if(!card)throw new Error('unresolved');
      const arr=read().map(normalizeItem).filter(Boolean);
      const current=arr.find(x=>x.uid===uid);
      if(!current||current.listType!=='OWNED')return;
      const p=priceFrom(card,current);
      if(p.price===null){
        current.price=null;
        current.priceUpdated=0;
        current.priceSource='';
      }else{
        current.price=p.price;
        current.priceUpdated=p.updated||Date.now();
        current.priceSource=p.source;
      }
      write(arr);render();
      if(priceStatus)priceStatus.textContent=p.price!=null?'CM-trend voor nieuwe kaart bijgewerkt':'Geen betrouwbare CM-trend beschikbaar';
    }catch(_){
      if(priceStatus)priceStatus.textContent='CM-trend voor nieuwe kaart niet beschikbaar';
    }
  }
  async function refreshPrices(force=false){
    const arr=read().map(normalizeItem).filter(Boolean);
    const owned=arr.filter(x=>x.listType==='OWNED');
    if(!owned.length){toast('Collectie is leeg');return}
    if(refreshBtn)refreshBtn.disabled=true;
    if(priceStatus)priceStatus.textContent='Prijsdata ophalen…';
    let changed=0,failed=0;
    for(const x of owned){
      if(!force&&x.priceUpdated&&Date.now()-x.priceUpdated<PRICE_TTL)continue;
      try{
        const card=await resolveCard(x);
        if(!card){failed++;continue}
        const p=priceFrom(card,x);
        if(p.price===null){
          x.price=null;x.priceUpdated=0;x.priceSource='';failed++;
        }else{
          x.price=p.price;x.priceUpdated=p.updated||Date.now();x.priceSource=p.source;changed++;
        }
      }catch(_){failed++}
    }
    write(arr);render();
    if(refreshBtn)refreshBtn.disabled=false;
    if(priceStatus)priceStatus.textContent=`${changed} bijgewerkt${failed?' · '+failed+' zonder prijs':''}`;
    toast('Marktindicatie bijgewerkt');
  }
  refreshBtn?.addEventListener('click',()=>refreshPrices(true));

  exportBtn?.addEventListener('click',()=>{
    const payload={version:137,exportedAt:new Date().toISOString(),collection:read()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download=`cardscout-collectie-${new Date().toISOString().slice(0,10)}.json`;a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  });
  importBtn?.addEventListener('click',()=>importFile?.click());
  importFile?.addEventListener('change',async()=>{
    try{
      const f=importFile.files?.[0];if(!f)return;
      const obj=JSON.parse(await f.text());const arr=Array.isArray(obj)?obj:obj.collection;
      if(!Array.isArray(arr))throw 0;
      write(arr.map(normalizeItem).filter(Boolean));render();toast(`${arr.length} regels geïmporteerd`);
    }catch(_){toast('Ongeldige backup')}
    finally{importFile.value=''}
  });
  clearBtn?.addEventListener('click',()=>{if(confirm('Hele collectie én wishlist wissen?')){write([]);render();toast('Collectie gewist')}});

  $('navCollection')?.addEventListener('click',()=>{
    render();
    const a=read().map(normalizeItem).filter(Boolean).filter(x=>x.listType==='OWNED');
    if(a.some(x=>!x.priceUpdated||Date.now()-x.priceUpdated>PRICE_TTL))refreshPrices(false);
  });

  migrate();
  syncQuickFilterButtons();
  render();
})();
