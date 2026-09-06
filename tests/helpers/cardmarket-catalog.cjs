'use strict';
// Deterministic representative mocked catalog; external services are never contacted.
const rows=[
 ['BASE','Base Set','base1','Bulbasaur','46'],['JUNGLE','Jungle','base2','Oddish','58'],['FOSSIL','Fossil','base3','Ekans','46'],
 ['NEO GENESIS','Neo Genesis','neo1','Cyndaquil','57'],['NEO DISCOVERY','Neo Discovery','neo2','Dunsparce','54'],
 ['NEO REVELATION','Neo Revelation','neo3','Remoraid','50'],['NEO DESTINY','Neo Destiny','neo4','Unown T','88'],
 ['EXPEDITION','Expedition Base Set','ecard1','Bulbasaur','94'],['AQUAPOLIS','Aquapolis','ecard2','Oddish','99'],['SKYRIDGE','Skyridge','ecard3','Snorlax','100'],
 ['EX RUBY SAPPHIRE','EX Ruby & Sapphire','ex1','Aron','49'],['EX SANDSTORM','EX Sandstorm','ex2','Sandshrew','75'],
 ['EX DRAGON','EX Dragon','ex3','Bagon','50'],['EX TEAM MAGMA AQUA','EX Team Magma vs Team Aqua','ex4','Cubone','51'],
 ['EX HIDDEN LEGENDS','EX Hidden Legends','ex5','Gulpin','62'],['EX FIRERED LEAFGREEN','EX FireRed & LeafGreen','ex6','Charmander','57'],
 ['EX TEAM ROCKET RETURNS','EX Team Rocket Returns','ex7','Dratini','53'],['EX DEOXYS','EX Deoxys','ex8','Bagon','52'],
 ['EX EMERALD','EX Emerald','ex9','Gulpin','56'],['EX UNSEEN FORCES','EX Unseen Forces','ex10','Eevee','55'],
 ['EX DELTA SPECIES','EX Delta Species','ex11','Azumarill Δ','19'],['EX HOLON PHANTOMS','EX Holon Phantoms','ex13','Mewtwo','12'],
 ['EX CRYSTAL GUARDIANS','EX Crystal Guardians','ex14','Igglybuff','21'],['EX DRAGON FRONTIERS','EX Dragon Frontiers','ex15','Bagon Delta Species','43'],
 ['EX POWER KEEPERS','EX Power Keepers','ex16','Duskull','50']
];
const cards=rows.map(([set,set_name,setId,name,number])=>({set,set_name,source_id:`${setId}-${number}`,name,number,language:'EN',source:'tcgdex',condition:'NM',edition:'AUTO',verified:false,direct:false,url:''}));
cards.push({...cards[0],name:'ピカチュウ δ',number:'58',source_id:'base1-58',language:'JP'});
function productUrl(card){
 // The two expected regression URLs are test fixtures, never runtime mappings.
 if(card.source_id==='ex11-19')return 'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Delta-Species/Azumarill-Delta-Species-DS19';
 if(card.source_id==='ex15-43')return 'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Bagon-Delta-Species-DF43';
 return 'https://www.cardmarket.com/en/Pokemon/Products/Singles/'+card.set_name.replace(/[^a-z0-9]+/gi,'-')+'/'+card.name.replace(/[^a-z0-9]+/gi,'-')+'-'+card.number;
}
function apiResponse(card,url=productUrl(card)){
 return {id:card.source_id,name:card.name,number:card.number,set:{id:card.source_id.split('-')[0],name:card.set_name.replace(/^EX /,'')},cardmarket:{url}};
}
module.exports={cards,productUrl,apiResponse};
