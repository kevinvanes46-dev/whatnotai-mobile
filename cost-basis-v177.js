'use strict';
// User-owned weighted costs. No storage, network, price policy or transaction history.
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./market-v176.js'));
  else Object.defineProperty(root,'HoloKeepCostBasis',{value:factory(root.HoloKeepMarket)});
})(globalThis,Market=>{
  const quantity=n=>Number.isSafeInteger(n)&&n>=1;
  const money=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER;
  function basis(item){
    const b=item?.costBasis;
    return quantity(item?.qty)&&b&&b.version===177&&b.method==='WEIGHTED_AVERAGE'&&b.currency==='EUR'&&
      Number.isSafeInteger(b.knownQty)&&b.knownQty>=0&&b.knownQty<=item.qty&&money(b.total)&&
      (b.knownQty!==0||b.total===0)?b:null;
  }
  function state(item){
    if(item?.listType==='WISHLIST')return 'UNKNOWN';
    const b=basis(item);
    return b?(b.knownQty===0?'UNKNOWN':b.knownQty===item.qty?'CONFIRMED':'PARTIAL'):
      item?.paidEach!=null?'LEGACY_UNCONFIRMED':'UNKNOWN';
  }
  function average(item){const b=basis(item);return item?.listType!=='WISHLIST'&&b?.knownQty?b.total/b.knownQty:null;}
  function assign(item,qty,knownQty,total){
    const result={...item,qty,costBasis:{...(basis(item)||{}),version:177,method:'WEIGHTED_AVERAGE',knownQty,total,currency:'EUR'}};
    if(!basis(result))throw new RangeError('Ongeldige kosten of aantallen');
    return result;
  }
  function initialize(item,qty,unitCost=null){
    if(!quantity(qty)||!(unitCost===null||money(unitCost)))throw new RangeError('Controleer aantal en aankoopprijs');
    if(item.listType==='WISHLIST')return {...item,qty};
    return {...assign(item,qty,unitCost===null?0:qty,unitCost===null?0:qty*unitCost),paidEach:unitCost};
  }
  function addPurchase(item,qty,unitCost=null){
    if(!quantity(item.qty)||!quantity(qty)||!(unitCost===null||money(unitCost)))throw new RangeError('Controleer aantal en aankoopprijs');
    if(item.listType==='WISHLIST')return {...item,qty:item.qty+qty};
    const b=basis(item),known=b?.knownQty||0,total=b?.total||0;
    const result=assign(item,item.qty+qty,known+(unitCost===null?0:qty),total+(unitCost===null?0:qty*unitCost));
    // Keep historical paidEach physically intact when adding to unconfirmed legacy.
    if(b||item.paidEach==null)result.paidEach=average(result);
    return result;
  }
  function setAverage(item,qty,unitCost){
    if(!quantity(qty)||!money(unitCost))throw new RangeError('Vul een geldige gemiddelde aankoopprijs in');
    return {...assign(item,qty,qty,qty*unitCost),paidEach:unitCost};
  }
  function confirmLegacy(item){
    if(state(item)!=='LEGACY_UNCONFIRMED'||!money(item.paidEach))throw new RangeError('Controleer de oude aankoopprijs');
    return setAverage(item,item.qty,item.paidEach);
  }
  const clear=item=>assign(item,item.qty,0,0);
  function removeOne(item,choice){
    if(!quantity(item.qty))throw new RangeError('Controleer aantal');
    if(item.qty===1)return {...item};
    const s=state(item),b=basis(item);
    if(s==='LEGACY_UNCONFIRMED')throw new RangeError('Bevestig of negeer eerst de oude aankoopprijs');
    if(s==='PARTIAL'&&!['known','unknown'].includes(choice))throw new RangeError('Kies welk exemplaar je verwijdert');
    if(s==='CONFIRMED'||s==='PARTIAL'&&choice==='known')return assign(item,item.qty-1,b.knownQty-1,b.knownQty===1?0:b.total*((b.knownQty-1)/b.knownQty));
    if(s==='PARTIAL')return assign(item,item.qty-1,b.knownQty,b.total);
    return b?assign(item,item.qty-1,0,0):{...item,qty:item.qty-1};
  }
  function comparison(item,entry){
    const b=basis(item);
    if(item?.listType==='WISHLIST'||!b?.knownQty||!Market.eligible(entry))return null;
    const marketComparable=entry.value*b.knownQty,difference=marketComparable-b.total;
    if(!Number.isFinite(marketComparable)||!Number.isFinite(difference))return null;
    const percentage=b.total>0?difference/b.total*100:null;
    return {comparableQty:b.knownQty,cost:b.total,marketComparable,difference,percentage:Number.isFinite(percentage)?percentage:null};
  }
  function totals(items,lookup){
    const out={qty:0,knownQty:0,cost:0,comparableQty:0,comparableCost:0,marketComparable:0,difference:null,percentage:null};
    for(const item of items){
      if(item.listType==='WISHLIST'||!quantity(item.qty))continue;
      out.qty+=item.qty;const b=basis(item),c=comparison(item,lookup(item));
      if(b?.knownQty){out.knownQty+=b.knownQty;out.cost+=b.total;}
      if(c){out.comparableQty+=c.comparableQty;out.comparableCost+=c.cost;out.marketComparable+=c.marketComparable;}
    }
    if(out.comparableQty){out.difference=out.marketComparable-out.comparableCost;out.percentage=out.comparableCost>0?out.difference/out.comparableCost*100:null;}
    if(!Number.isFinite(out.difference))out.difference=null;
    if(!Number.isFinite(out.percentage))out.percentage=null;
    return out;
  }
  function display(item){
    const s=state(item),b=basis(item);
    return {state:s,average:average(item),knownQty:item.listType==='WISHLIST'?0:b?.knownQty||0,
      label:s==='LEGACY_UNCONFIRMED'?'Oude aankoopprijs · nog niet bevestigd':s==='UNKNOWN'?'Aankoopprijs niet ingevuld':s==='PARTIAL'?'Gem. bekende aankoopprijs':'Gem. aankoopprijs',
      legacy:s==='LEGACY_UNCONFIRMED'&&money(item.paidEach)?item.paidEach:null};
  }
  return Object.freeze({basis,state,average,initialize,addPurchase,addUnknown:(item,qty)=>addPurchase(item,qty,null),confirmLegacy,setAverage,clear,removeOne,comparison,totals,display});
});
