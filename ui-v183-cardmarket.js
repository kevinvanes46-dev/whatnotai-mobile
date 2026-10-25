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

      if(reverse){
        u.searchParams.set('isReverseHolo','Y');
      }else{
        u.searchParams.delete('isReverseHolo');
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
    const next=cardmarketUrl(current,englishStamped());

    if(next&&current!==next){
      link.setAttribute('href',next);
    }
  }

  function detailStamped(){
    const meta=$('cardSheetMeta')?.textContent||'';

    return /(?:^| · )EN(?: · |$)/.test(meta) &&
      /(?:^| · )STAMPED(?: · |$)/.test(meta);
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
      item?.language==='EN' &&
      item?.variant==='STAMPED'
    );
  }

  root.addEventListener('cardscout:card-selected',event=>{
    const s=event.detail;
    const language=s?.card?.language||s?.language;

    if(s&&typeof s.cardmarketUrl==='string'){
      s.cardmarketUrl=cardmarketUrl(
        s.cardmarketUrl,
        language==='EN' &&
        s.stamped===true
      );
    }

    if(root.queueMicrotask){
      root.queueMicrotask(syncOpen);
    }else{
      syncOpen();
    }
  });

  $('stampedToggle')?.addEventListener('click',()=>{
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
