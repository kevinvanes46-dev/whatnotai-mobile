'use strict';
const fs=require('node:fs'),{execFileSync}=require('node:child_process');
const files=()=>execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean).sort();
const pattern=/rare\s?worth/i;
function lines(file){const b=fs.readFileSync(file);return b.includes(0)?[]:b.toString('utf8').split(/\r\n?|\n/);}
function productionSnapshot(){
  return Object.fromEntries(files().filter(f=>! /^(tests|docs|scripts|data|\.github)\//.test(f)&&! /\.(md|patch)$/i.test(f)).map(f=>[f,lines(f).filter(s=>pattern.test(s)).map(s=>s.trim())]).filter(([,v])=>v.length));
}
function inventory(){
  return files().filter(f=>f!=='docs/BRAND-V172.md').flatMap(file=>{
    const content=lines(file),numbers=content.flatMap((s,i)=>pattern.test(s)?[i+1]:[]),pathMatch=pattern.test(file);
    if(!numbers.length&&!pathMatch)return [];
    const text=numbers.map(n=>content[n-1]).join('\n'),categories=new Set();
    if(/^(tests|docs)\//.test(file)||/\.md$/i.test(file))categories.add('H');
    if(/\.github\/|github\.com|github\.io|whatnotai-mobile/.test(file+' '+text))categories.add('F');
    if(/supabase|migration|rareworth_(?:snapshot|collection_snapshots|save_collection|get_collection)/i.test(file+' '+text))categories.add('D');
    if(/(?:Storage|STORAGE|rareworth_(?:cloud_sync|device_id|account_enabled|guest_session|onboarding))/.test(text))categories.add('C');
    if(/RareWorth[A-Z]|rareworth-shell|rareworth_/.test(text))categories.add('B');
    if(pathMatch||/icon-rareworth/.test(text))categories.add('E');
    if(/^(sw\.js|manifest\.json|pwa-v169\.js|index\.html)$/.test(file))categories.add('G');
    if(/^(index\.html|brand-v172\.js|ui-v150-experience\.js|manifest\.json|icon-rareworth\.svg)$/.test(file))categories.add('A');
    if(!categories.size)categories.add('H');
    return [`| ${file} | ${[...categories].sort().join(', ')} | ${numbers.join(', ')||'—'} | ${pathMatch?'yes':'no'} |`];
  }).join('\n');
}
module.exports={productionSnapshot,inventory};
