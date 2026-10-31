'use strict';
const assert=require('node:assert/strict');
module.exports=source=>{
 const patches=[
  [
   "    if(['1ST','SHADOWLESS_1ST'].includes(i.editionScope))return {...entry,reason:'FIRST_EDITION'};\n    if(i.editionScope==='SHADOWLESS')return {...entry,reason:'SPECIAL_VARIANT'};",
   "    if(i.editionScope==='1ST')return {...entry,reason:'FIRST_EDITION'};"
  ],
  [
   "entry.variant!=='NORMAL'||['1ST','SHADOWLESS','SHADOWLESS_1ST'].includes(entry.editionScope)))return null;",
   "entry.variant!=='NORMAL'||entry.editionScope==='1ST'))return null;"
  ],
  [
   "    const reasons={FIRST_EDITION:'Geen passende 1st Edition-prijs',SPECIAL_VARIANT:'Geen passende Shadowless-prijs',STAMPED:'Geen betrouwbare stamped-prijs',FINISH:'Uitvoering niet zeker genoeg voor prijs',IDENTITY:'Kaart niet zeker genoeg voor prijs',SOURCE:'Geen passende marktprijs beschikbaar',NO_PRICE:'Geen marktprijs beschikbaar'};\n    const special=['1ST','SHADOWLESS_1ST'].includes(item.edition)?'FIRST_EDITION':\n      item.edition==='SHADOWLESS'?'SPECIAL_VARIANT':item.variant==='STAMPED'?'STAMPED':null;",
   "    const reasons={FIRST_EDITION:'Geen passende 1st Edition-prijs',STAMPED:'Geen betrouwbare stamped-prijs',FINISH:'Uitvoering niet zeker genoeg voor prijs',IDENTITY:'Kaart niet zeker genoeg voor prijs',SOURCE:'Geen passende marktprijs beschikbaar',NO_PRICE:'Geen marktprijs beschikbaar'};\n    const special=item.edition==='1ST'?'FIRST_EDITION':item.variant==='STAMPED'?'STAMPED':null;"
  ]
 ];
 for(const [current,baseline] of patches){
  assert.equal(source.split(current).length,2,'only the reviewed V208 market guard may differ');
  source=source.replace(current,baseline);
 }
 return source;
};
