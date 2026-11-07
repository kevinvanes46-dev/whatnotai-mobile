'use strict';
(function(root){
  function cardmarketUrl(url, reverse){
    if(typeof url!=='string'||!url)return url||'';

    try{
      const u=new URL(url);

      if(
        u.protocol!=='https:' ||
        u.hostname!=='www.cardmarket.com' ||
        !/^\/en\/Pokemon\/Products(?:\/|$)/.test(u.pathname)
      ) return url;

      if(reverse===true){
        u.searchParams.set('isReverseHolo','Y');
      }else if(reverse===false){
        u.searchParams.set('isReverseHolo','N');
      }

      return u.href;
    }catch{
      return url;
    }
  }

  const document=root.document;

  const api={
    cardmarketUrl,
    syncOpen:()=>{},
    syncDetail:()=>{}
  };

  if(!document){
    root.HoloDexCardmarketV183=Object.freeze(api);
    return;
  }

  const $=id=>document.getElementById(id);

  const englishStamped=()=>
    $('langSelect')?.value==='EN' &&
    $('stampedToggle')?.getAttribute('aria-pressed')==='true';

  function syncOpen(){
    const link=$('openBtn');
    if(!link)return;

    const current=link.getAttribute('href')||link.href||'';
    const next=cardmarketUrl(current,englishStamped()?true:undefined);

    if(next&&current!==next){
      link.setAttribute('href',next);
    }
  }

  function detailStamped(){
    const meta=$('cardSheetMeta')?.textContent||'';

    if(!/(?:^| · )EN(?: · |$)/.test(meta))return undefined;
    if(/(?:^| · )(?:STAMPED|REVERSE|REVERSE_HOLO)(?: · |$)/.test(meta))return true;
    if(/(?:^| · )NORMAL(?: · |$)/.test(meta))return false;
    return undefined;
  }

  function syncDetail(){
    const link=$('cardSheetLink');
    if(!link||link.hidden)return;
    if(link.dataset?.cmVariantOwner==='library')return;

    const current=link.getAttribute('href')||link.href||'';
    const next=cardmarketUrl(current,detailStamped());

    if(next&&current!==next){
      link.setAttribute('href',next);
    }
  }

  api.syncOpen=syncOpen;
  api.syncDetail=syncDetail;

  root.HoloDexCardmarketV183=Object.freeze(api);

  const ui=root.cardscoutCollectionUI;

  if(ui&&typeof ui.cardmarketLink==='function'){
    const base=ui.cardmarketLink.bind(ui);

    ui.cardmarketLink=item=>cardmarketUrl(
      base(item),
      item?.language==='EN'?(['STAMPED','REVERSE','REVERSE_HOLO'].includes(item?.variant)?true:item?.variant==='NORMAL'?false:undefined):undefined
    );
  }

  root.addEventListener('cardscout:card-selected',event=>{
    const s=event.detail;
    const language=s?.card?.language||s?.language;

    if(s&&typeof s.cardmarketUrl==='string'){
      s.cardmarketUrl=cardmarketUrl(
        s.cardmarketUrl,
        language==='EN'?(s.stamped===true||['REVERSE','REVERSE_HOLO','STAMPED'].includes(s.variant||s.card?.variant)?true:(s.variant||s.card?.variant)==='NORMAL'?false:undefined):undefined
      );
    }

    if(root.queueMicrotask){
      root.queueMicrotask(syncOpen);
    }else{
      syncOpen();
    }
  });

  $('stampedToggle')?.addEventListener('click',()=>{
    if($('langSelect')?.value==='EN'){const link=$('openBtn');if(link)link.setAttribute('href',cardmarketUrl(link.getAttribute('href'),englishStamped()));}
    if(root.queueMicrotask){
      root.queueMicrotask(syncOpen);
    }else{
      syncOpen();
    }
  });

  $('langSelect')?.addEventListener('change',syncOpen);

  const open=$('openBtn');

  if(open&&root.MutationObserver){
    new root.MutationObserver(syncOpen).observe(open,{
      attributes:true,
      attributeFilter:['href']
    });
  }

  const detail=$('cardSheet');
  const meta=$('cardSheetMeta');
  const detailLink=$('cardSheetLink');

  if(root.MutationObserver){
    if(meta){
      new root.MutationObserver(syncDetail).observe(meta,{
        childList:true,
        characterData:true,
        subtree:true
      });
    }

    if(detailLink){
      new root.MutationObserver(syncDetail).observe(detailLink,{
        attributes:true,
        attributeFilter:['href','hidden']
      });
    }

    if(detail){
      new root.MutationObserver(syncDetail).observe(detail,{
        attributes:true,
        attributeFilter:['open']
      });
    }
  }

  syncOpen();
  syncDetail();

})(typeof window!=='undefined'?window:globalThis);
