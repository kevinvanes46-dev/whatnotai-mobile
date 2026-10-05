'use strict';
// Reverse only the two reviewed manifest labels and the presentation-only JP label.
// Everything else must still match the pre-rebrand engine/storage baseline exactly.
module.exports=(file,code)=>{
code=require('./coverage-scope-v174.cjs')(file,code);
return file==='manifest.json'
  ?code.replace('"name": "HoloKeep — Pokémon TCG"','"name": "RareWorth — Pokémon TCG"').replace('"short_name": "HoloKeep"','"short_name": "RareWorth"')
  :file==='ui-v150-experience.js'?code.replace("target.textContent=window.RareWorthBrand.name+' · JP'","target.textContent='RareWorth · JP'"):code;
};
