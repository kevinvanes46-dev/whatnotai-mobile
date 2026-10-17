'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else Object.defineProperty(root,'HoloDexSearch',{value:api});})(globalThis,()=>{
  const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  // Search hints only. Never change source identity, collector number or routing.
  function create(cards,pokedex,jp,sets){
    const byName=new Map(Object.entries(pokedex||{}).map(([number,name])=>[normalize(name),number]));
    const hints=new WeakMap();
    for(const card of cards){
      if(!jp.identity(card))continue;
      const names=[card.name,...jp.searchAliases(card.name)].map(name=>normalize(name).replace(/^(dark|light|shining) /,''));
      const numbers=[...new Set(names.map(name=>byName.get(name)).filter(Boolean))];
      if(numbers.length===1)hints.set(card,numbers[0]);
    }
    const aliases=jp.sets.flatMap(set=>[set.label,set.source,set.key,...(sets[set.key]?.aliases||[])].map(alias=>({key:set.key,alias:normalize(alias)}))).filter(x=>x.alias).sort((a,b)=>b.alias.length-a.alias.length);
    return Object.freeze({number:card=>hints.get(card)||'',set:query=>aliases.find(x=>(' '+normalize(query)+' ').includes(' '+x.alias+' '))||null});
  }
  return Object.freeze({create,normalize});
});
