const fs=require('node:fs');
const out='tests/fixtures/artwork-v155';fs.mkdirSync(out,{recursive:true});
const sets=[...Array.from({length:10},(_,i)=>['en','ex'+(i+7)]),...['PMCG1','PMCG2','PMCG3','neo1'].map(id=>['ja',id])];
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(35000)});if(!r.ok)throw Error(r.status+' '+url);return r.json();}
async function job([lang,id]){try{const url=`https://api.tcgdex.net/v2/${lang}/sets/${id}`,set=await get(url);fs.writeFileSync(`${out}/${lang}-${id}-set.json`,JSON.stringify(set,null,2));const cards=[];for(const brief of set.cards.slice(0,3)){try{const card=await get(`https://api.tcgdex.net/v2/${lang}/cards/${brief.id}`);fs.writeFileSync(`${out}/${lang}-${brief.id}.json`,JSON.stringify(card,null,2));cards.push({id:card.id,name:card.name,image:card.image||null});}catch(e){cards.push({id:brief.id,error:e.message});}}console.log(JSON.stringify({lang,id,briefImages:set.cards.filter(c=>c.image).length,total:set.cards.length,cards}));}catch(e){console.log(JSON.stringify({lang,id,error:e.message}));}}
(async()=>{let n=0;await Promise.all(Array.from({length:4},async()=>{while(n<sets.length)await job(sets[n++]);}));})();
