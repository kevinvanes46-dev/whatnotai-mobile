'use strict';
// Derived views only: callers supply validated observations; no persistence or I/O.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else Object.defineProperty(root,'HoloKeepPortfolioInsights',{value:api});
})(globalThis,()=>{
  const priority=Object.freeze(['LEGACY_COST_NEEDS_CONFIRMATION','PARTIAL_COST','UNKNOWN_COST','MISSING_MARKET_PRICE','UNAVAILABLE_MARKET_PRICE','REFERENCE_ONLY_PRICE','STALE_MARKET_PRICE']);
  function derive(items,lookup,Cost,Market,now=Date.now()){
    const entries=new Map(items.map(item=>[item,lookup(item)]));
    const owned=items.filter(i=>i.listType!=='WISHLIST'&&Number.isSafeInteger(i.qty)&&i.qty>0);
    const rows=owned.map((item,index)=>{
      const entry=entries.get(item),eligible=Market.eligible(entry),costState=Cost.state(item),comparison=Cost.comparison(item,entry),flags=[];
      if(costState==='LEGACY_UNCONFIRMED')flags.push('LEGACY_COST_NEEDS_CONFIRMATION');
      if(costState==='PARTIAL')flags.push('PARTIAL_COST');
      if(costState==='UNKNOWN')flags.push('UNKNOWN_COST');
      if(!entry)flags.push('MISSING_MARKET_PRICE');
      else if(entry.quality==='REFERENCE_ONLY')flags.push('REFERENCE_ONLY_PRICE');
      else if(!eligible)flags.push('UNAVAILABLE_MARKET_PRICE');
      if(eligible&&Market.freshness(entry,now)!=='CURRENT')flags.push('STALE_MARKET_PRICE');
      const positionValue=eligible?entry.value*item.qty:null;
      return {item,index,entry,costState,comparison,positionValue:Number.isFinite(positionValue)?positionValue:null,average:Cost.average(item),flags,primary:flags[0]||null};
    });
    const byItem=new Map(rows.map(r=>[r.item,r]));
    const counters=Object.fromEntries(priority.map(p=>[p,rows.filter(r=>r.flags.includes(p)).length]));
    const seen=new Set();
    const attention=rows.filter(r=>r.primary).sort((a,b)=>priority.indexOf(a.primary)-priority.indexOf(b.primary)||a.index-b.index).filter(r=>{
      const key=r.item.uid||r.item;if(seen.has(key))return false;seen.add(key);return true;
    });
    const rank=(predicate,value,direction)=>rows.filter(predicate).sort((a,b)=>direction*(value(a)-value(b))||a.index-b.index);
    return {summary:{market:Market.totals(owned,i=>entries.get(i),now),cost:Cost.totals(owned,i=>entries.get(i))},rows,byItem,counters,attention,
      mostValuable:rank(r=>r.positionValue!==null,r=>r.positionValue,-1),
      positive:rank(r=>r.comparison?.difference>0,r=>r.comparison.difference,-1),
      negative:rank(r=>r.comparison?.difference<0,r=>r.comparison.difference,1)};
  }
  function matches(row,filter){
    if(!filter)return true;if(!row)return false;
    switch(filter){
      case 'with-price':return row.positionValue!==null;
      case 'without-price':return row.positionValue===null;
      case 'complete':return row.costState==='CONFIRMED';
      case 'incomplete':return row.costState!=='CONFIRMED';
      case 'legacy':return row.costState==='LEGACY_UNCONFIRMED';
      case 'stale':return row.flags.includes('STALE_MARKET_PRICE');
      case 'attention':return !!row.primary;
      default:return true;
    }
  }
  function sort(items,mode,insights){
    const numeric={
      'value-desc':[r=>r?.positionValue,-1],'value-asc':[r=>r?.positionValue,1],
      'positive':[r=>r?.comparison?.difference>0?r.comparison.difference:null,-1],
      'negative':[r=>r?.comparison?.difference<0?r.comparison.difference:null,1],
      'paid-desc':[r=>r?.average,-1],'paid-asc':[r=>r?.average,1]
    };
    const compare=(a,b)=>{
      if(numeric[mode]){const [get,direction]=numeric[mode],x=get(insights.byItem.get(a)),y=get(insights.byItem.get(b));
        return x==null?(y==null?0:1):y==null?-1:direction*(x-y);}
      if(mode==='name')return String(a.name||'').localeCompare(String(b.name||''),'nl');
      if(mode==='set')return String(a.setName||a.set||'').localeCompare(String(b.setName||b.set||''),'nl')||String(a.name||'').localeCompare(String(b.name||''),'nl');
      return (Number(b.addedAt)||0)-(Number(a.addedAt)||0);
    };
    return items.map((item,index)=>({item,index})).sort((a,b)=>compare(a.item,b.item)||a.index-b.index).map(r=>r.item);
  }
  return Object.freeze({derive,matches,sort,priority});
});
