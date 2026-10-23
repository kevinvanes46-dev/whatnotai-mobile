'use strict';
// v188 is an explicit localhost-only bridge into the real HoloDex card sheet.
// It never modifies the existing market engine, search links or collection.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else {Object.defineProperty(root,'HoloDexOfficialPanelV188',{value:api});api.mount(root);}
})(globalThis,()=>{
  const id=/^[a-zA-Z0-9._-]{2,90}$/;
  const confirmedEdition=e=>!['1ST','FIRST','FIRST_EDITION','1ST_EDITION'].includes(String(e||'').toUpperCase());
  function previewAllowed(address){
    try {const u=new URL(address);return u.protocol==='http:'&&
      (u.hostname==='127.0.0.1'||u.hostname==='localhost')&&
      u.searchParams.get('cardmarketPreview')==='v188';}catch{return false;}
  }
  function eligible(s){
    if(s?.language!=='EN')return 'Alleen gecontroleerde Engelse kaarten worden ondersteund.';
    if(s?.variant!=='NORMAL'||!confirmedEdition(s?.edition))return 'Stamped of 1st Edition: geen juiste geverifieerde productprijs.';
    if(!['NM','EX','GD','PL'].includes(s?.condition))return 'Conditie onbekend.';
    if(typeof s?.sourceId!=='string'||!id.test(s.sourceId)||!s.sourceId.includes('-')||
       typeof s?.sourceSetId!=='string'||!id.test(s.sourceSetId)||
       !s.sourceId.startsWith(s.sourceSetId+'-'))return 'Exacte kaart-ID ontbreekt.';
    return null;
  }

  function panel(document,s){
    const section=document.createElement('section');section.id='cm188';section.className='cm188';
    section.setAttribute('aria-label','Officiële Cardmarket-dagwaarde (lokale proef)');
    // All markup is constant; card identifiers are assigned with .value, not HTML.
    section.innerHTML=`<h3>Officiële Cardmarket-prijs <small>v188 · lokale proef</small></h3>
      <p class="cm188-note">Deze prijs is de <strong>algemene producttrend</strong> in euro, niet de specifieke NM/EX/GD/PL-, taal- of editieprijs. Geen schattingen of nepgeschiedenis.</p>
      <button id="cm188-open" type="button">Open betrouwbare prijscontrole</button>
      <div id="cm188-body" hidden>
        <form id="cm188-lookup-form">
          <input id="cm188-card-id" type="hidden"><input id="cm188-condition" type="hidden"><input id="cm188-qty" type="hidden" value="1">
          <label class="cm188-confirm"><input id="cm188-edition-confirm" type="checkbox" required>
          <span>Ik bevestig: <strong>Engels, Unlimited, normale Holo/Non-Foil</strong>; geen 1st Edition, Reverse Holo of STAMPED.</span></label>
          <button id="cm188-check" type="submit">Controleer officiële dagwaarde</button>
        </form>
        <p id="cm188-status" role="status" aria-live="polite">Geen controle gestart.</p>
        <div id="cm188-result" hidden>
          <strong id="cm188-price" class="cm188-price"></strong><p id="cm188-source"></p>
          <a id="cm188-product-link" target="_blank" rel="noopener noreferrer" hidden>Bekijk gecontroleerd product op Cardmarket</a>
          <button type="button" id="cm188-capture" disabled>Meetpunt lokaal opslaan</button>
          <p id="cm188-capture-status" role="status" aria-live="polite"></p>
        </div>
        <h4>Echte prijsgeschiedenis</h4>
        <div class="cm188-ranges" aria-label="Grafiekperiode">
          <button type="button" data-range="1W" aria-pressed="false">1W</button>
          <button type="button" data-range="1M" aria-pressed="true">1M</button>
          <button type="button" data-range="3M" aria-pressed="false">3M</button>
          <button type="button" data-range="1J" aria-pressed="false">1J</button>
          <button type="button" data-range="Alles" aria-pressed="false">Alles</button>
        </div>
        <p id="cm188-chart-status" role="status"></p>
        <svg id="cm188-chart" role="group" aria-label="Echte Cardmarket-meetpunten; gebruik pijltoetsen"></svg>
        <p id="cm188-chart-detail" role="status" aria-live="polite"></p>
        <p class="cm188-note">Grafiek pas vanaf twee verschillende échte officiële publicatiedagen. Meetpunten blijven uitsluitend lokaal.</p>
      </div>`;
    section.querySelector('#cm188-card-id').value=s.sourceId;
    section.querySelector('#cm188-condition').value=s.condition;
    return section;
  }

  function mount(root){
    if(!previewAllowed(root.location?.href)||!root.document)return false;
    const document=root.document;
    let current=null,sequence=0,loading=null;
    const dependencies=[['cardmarket-price-v186.js','HoloDexCardmarketOfficialV186'],
      ['cardmarket-feed-v186.js','HoloDexCardmarketFeedV186'],
      ['cardmarket-history-v186.js','HoloDexCardmarketHistoryV186'],
      ['cardmarket-preview-v187.js','CardmarketPreviewV187']];
    function script(src){return new Promise((resolve,reject)=>{
      const node=document.createElement('script');node.src=src;node.onload=resolve;
      node.onerror=()=>reject(new Error('Lokaal bronbestand ontbreekt: '+src));
      document.head.append(node);
    });}
    async function prepare(){
      if(loading)return loading;
      loading=(async()=>{
        for(const [src,api] of dependencies)if(!root[api])await script(src);
        const response=await root.fetch('cardmarket-expansions-v186.json',{credentials:'omit',cache:'no-store'});
        if(!response.ok)throw Error('Gecontroleerde setconfiguratie ontbreekt.');
        const body=await response.json();
        if(body?.schema!==186||!body.expansions||typeof body.expansions!=='object'||
           Array.isArray(body.expansions)||!Object.keys(body.expansions).length)throw Error('Setconfiguratie ongeldig.');
        root.CardmarketVerifiedExpansionsV187=Object.freeze(body.expansions);
        if(!root.CardmarketPreviewV187?.controller)throw Error('Prijscontrole ontbreekt.');
      })();
      try{await loading;}catch(e){loading=null;throw e;}
    }
    document.addEventListener('holodex:detail-open',e=>{
      const request=++sequence;
      current?.controller?.dispose();current?.section.remove();current=null;
      const modal=document.getElementById('cardSheet');
      if(!modal)return;
      const selection=e.detail;
      const blocked=eligible(selection);
      const section=panel(document,selection||{});
      modal.querySelector('#cardSheetAction')?.before(section);
      current={section,controller:null};
      if(blocked){
        section.querySelector('#cm188-open').disabled=true;
        const note=document.createElement('p');note.setAttribute('role','status');note.textContent=blocked;section.append(note);
        return;
      }
      section.querySelector('#cm188-open').addEventListener('click',async()=>{
        const open=section.querySelector('#cm188-open');open.disabled=true;open.textContent='Broncontrole laden…';
        try{
          await prepare();
          if(request!==sequence||current?.section!==section)return;
          const body=section.querySelector('#cm188-body');body.hidden=false;open.hidden=true;
          // Scoped facade prevents collisions with existing app IDs, notably
          // #status, and confines range controls to this one detail panel.
          const scoped={getElementById:id=>section.querySelector('#cm188-'+id),
            querySelectorAll:q=>section.querySelectorAll(q),
            createElementNS:(namespace,tag)=>document.createElementNS(namespace,tag)};
          current.controller=root.CardmarketPreviewV187.controller({document:scoped,storage:root.localStorage,
            fetchImpl:root.fetch.bind(root),cryptoImpl:root.crypto});
          section.querySelector('#cm188-edition-confirm').focus();
        }catch(error){
          if(request!==sequence)return;
          open.textContent='Opnieuw proberen';open.disabled=false;
          const note=section.querySelector('#cm188-error')||document.createElement('p');
          note.id='cm188-error';note.setAttribute('role','alert');
          note.textContent='Officiële controle niet beschikbaar: '+error.message;section.append(note);
        }
      });
    });
    return true;
  }
  return Object.freeze({previewAllowed,eligible,panel,mount});
});
