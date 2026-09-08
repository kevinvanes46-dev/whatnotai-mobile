'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync('app-v137.js','utf8');
const CACHE='cardscout_cm_route_cache_v146';
function context(options={}){
  const storage=new Map(options.storage || []);
  const calls=[];
  const events=[];
  const c={URL,AbortController,Date,console,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}},
    window:{dispatchEvent:e=>events.push(e)},DATA:JSON.parse(source.match(/const EMBEDDED_DATA = (.*);/)[1]),
    CONDITION_IDS:{NM:1,EX:2},LANGUAGE_IDS:{EN:1,JP:7},updateCustomSelects(){},
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
    setTimeout:options.setTimeout || setTimeout,clearTimeout:options.clearTimeout || clearTimeout,
    fetch:async (...args)=>{calls.push(args);return options.fetch ? options.fetch(...args) : {ok:false,status:404};},
    setStatus(){},addRecent(){},bindCandidateButtons(){},candidateButtonsHtml(){return '';},escapeHtml:s=>s,copyToClipboard:async()=>true,itemFromCurrent:()=>({})};
  for(const key of ['nameInput','numberInput','setSelect','langSelect','condSelect','editionSelect','quickInput','openBtn','urlBox','matchBox']) c[key]={value:'',dataset:{},setAttribute(k,v){this[k]=v;},querySelector(){return this.label ||= {textContent:''};},classList:{values:new Set(),add(x){this.values.add(x);},remove(x){this.values.delete(x);},contains(x){return this.values.has(x);}}};
  vm.createContext(c);
  vm.runInContext(source.match(/const SET_ALIASES = .*;/)[0]+
    source.slice(source.indexOf('function cleanNumber('),source.indexOf('function slugifyName('))+
    source.slice(source.indexOf('function matchingSetAliases('),source.indexOf('function inferLanguageFromKnown('))+
    source.slice(source.indexOf('const AUTO_VALUE_DIRECTS ='),source.indexOf('async function copyToClipboard('))+
    source.slice(source.indexOf('async function makeLink('),source.indexOf('async function applyItem(')),c);
  return {c,storage,calls,events};
}
function fallback(c,card){return {url:c.searchUrl(card.name,card.number,card.language,card.condition,card.set),exact:false};}
function fields(c,card){for(const [k,v] of Object.entries({nameInput:card.name,numberInput:card.number,setSelect:card.set,langSelect:card.language,condSelect:card.condition,editionSelect:card.edition})) c[k].value=v;}
function isFallback(result,name){assert.equal(result.exact,false);const u=new URL(result.url);assert.equal(u.searchParams.get('searchString'),name);assert.deepEqual([...u.searchParams.keys()],['searchString']);}

module.exports={context,fields,fallback,isFallback,source,CACHE};
