/** CardScout persistent scanner memory v140
 * Stable IndexedDB layer: user-confirmed/corrected scan fingerprints survive app updates.
 * Does not learn from unconfirmed automatic guesses.
 */
(function(global){
'use strict';
const DB_NAME='cardscout-learning';
const DB_VERSION=2;
const EXAMPLES='examples', CARDS='cards', META='meta', CACHE='visionCache';
let dbPromise=null;
const iso=()=>new Date().toISOString();
const text=v=>String(v??'').trim();
const lang=v=>/^(JP|JA)$/i.test(text(v))?'JP':'EN';
const num=v=>text(v).replace(/^#/,'');
function normalizeCard(c){
  if(!c) throw new Error('card required');
  const out={
    name:text(c.name), set:text(c.set).toUpperCase(), number:num(c.number),
    total:c.total==null||c.total===''?null:Number(c.total), language:lang(c.language),
    rarity:text(c.rarity)||null, url:text(c.url||c.cardmarketUrl)||null,
    set_name:text(c.set_name)||null, source:text(c.source)||'user'
  };
  if(!out.name||!out.set||!out.number) throw new Error('name, set and number required');
  out.key=`${out.language.toLowerCase()}|${out.set.toLowerCase()}|${out.number.toLowerCase()}|${out.name.toLowerCase()}`;
  return out;
}
function normalizeFp(fp){
  if(!fp||typeof fp.p!=='string'||typeof fp.d!=='string'||typeof fp.a!=='string'||!Array.isArray(fp.c)) throw new Error('legacy fingerprint required');
  const hex=v=>String(v||'').toLowerCase().replace(/^0x/,'');
  return {p:hex(fp.p),d:hex(fp.d),a:hex(fp.a),c:fp.c.map(Number)};
}
function fingerprintSig(fp){const f=normalizeFp(fp);return [f.p,f.d,f.a,f.c.join(',')].join('|');}
function popBig(v){let n=0;while(v){v&=v-1n;n++;}return n;}
function hexHamming(a,b,bits){try{return popBig(BigInt('0x'+a)^BigInt('0x'+b))/bits;}catch(_){return 1;}}
function legacyDistance(x,y){
  const a=normalizeFp(x),b=normalizeFp(y);
  const pd=hexHamming(a.p,b.p,63),dd=hexHamming(a.d,b.d,64),ad=hexHamming(a.a,b.a,64);
  let ss=0,n=Math.min(a.c.length,b.c.length);if(!n)return 1;
  for(let i=0;i<n;i++){const q=(a.c[i]-b.c[i])/255;ss+=q*q;}
  const cd=Math.min(1,Math.sqrt(ss/n)*3);
  return .45*pd+.25*dd+.12*ad+.18*cd;
}
function reqp(req){return new Promise((res,rej)=>{req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error||new Error('IndexedDB request failed'));});}
function txp(tx){return new Promise((res,rej)=>{tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error||new Error('IndexedDB transaction failed'));tx.onabort=()=>rej(tx.error||new Error('IndexedDB transaction aborted'));});}
function open(){
  if(dbPromise) return dbPromise;
  dbPromise=new Promise((res,rej)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(EXAMPLES)){
        const s=db.createObjectStore(EXAMPLES,{keyPath:'id',autoIncrement:true});
        s.createIndex('cardKey','cardKey',{unique:false}); s.createIndex('kind','kind',{unique:false});
      }
      if(!db.objectStoreNames.contains(CARDS)) db.createObjectStore(CARDS,{keyPath:'key'});
      if(!db.objectStoreNames.contains(META)) db.createObjectStore(META,{keyPath:'key'});
      if(!db.objectStoreNames.contains(CACHE)) db.createObjectStore(CACHE,{keyPath:'key'});
    };
    req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>{db.close();dbPromise=null;};res(db);}; req.onerror=()=>rej(req.error||new Error('Cannot open learning DB')); req.onblocked=()=>rej(new Error('Learning DB upgrade blocked'));
  });
  return dbPromise;
}
async function init(){const db=await open();const tx=db.transaction(META,'readwrite');tx.objectStore(META).put({key:'schema',value:DB_VERSION,updatedAt:iso()});await txp(tx);return stats();}
async function saveExample({card,fp,kind='confirmed',source='user',note=null}){
  const c=normalizeCard(card), f=normalizeFp(fp), db=await open(), stamp=iso(), sig=fingerprintSig(f);
  const tx=db.transaction([EXAMPLES,CARDS],'readwrite'), es=tx.objectStore(EXAMPLES), cs=tx.objectStore(CARDS);
  const old=await reqp(cs.get(c.key));
  const rows=await reqp(es.index('cardKey').getAll(IDBKeyRange.only(c.key)));
  const same=rows.find(r=>{try{return r?.fingerprint&&fingerprintSig(r.fingerprint)===sig;}catch(_){return false;}})||null;
  let confirmations=old?.confirmations||0, corrections=old?.corrections||0;
  if(!same){if(kind==='confirmed')confirmations++;if(kind==='corrected')corrections++;}
  else if(kind==='corrected'&&same.kind!=='corrected'){
    if(same.kind==='confirmed')confirmations=Math.max(0,confirmations-1);
    corrections++;
  }
  cs.put({...c,createdAt:old?.createdAt||stamp,updatedAt:stamp,confirmations,corrections});
  if(!same){
    es.add({schemaVersion:DB_VERSION,representation:'legacy-hash-v1',cardKey:c.key,card:c,fingerprint:f,kind,source,note,createdAt:stamp});
  }else if(kind==='corrected'&&same.kind!=='corrected'){
    es.put({...same,schemaVersion:DB_VERSION,representation:'legacy-hash-v1',card:c,fingerprint:f,kind:'corrected',source,note,createdAt:stamp});
  }
  await txp(tx); if(!same)await pruneCard(c.key,12); return c;
}
async function pruneCard(key,keep){const db=await open(),tx=db.transaction(EXAMPLES,'readwrite'),s=tx.objectStore(EXAMPLES),idx=s.index('cardKey'),rows=await reqp(idx.getAll(IDBKeyRange.only(key)));rows.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));for(const r of rows.slice(keep))s.delete(r.id);await txp(tx);}
async function confirmLegacy(card,fp,source='cardmarket-open'){return saveExample({card,fp,kind:'confirmed',source});}
async function removeExactConflicts(fp,keepCardKey=null){const sig=fingerprintSig(fp),db=await open(),tx=db.transaction(EXAMPLES,'readwrite'),store=tx.objectStore(EXAMPLES),rows=await reqp(store.getAll());let removed=0;for(const r of rows){if(!r?.fingerprint)continue;let same=false;try{same=fingerprintSig(r.fingerprint)===sig;}catch(_){}if(same&&(!keepCardKey||r.cardKey!==keepCardKey)){store.delete(r.id);removed++;}}await txp(tx);return removed;}
async function correctLegacy(card,fp,source='manual-correction',note=null){const c=normalizeCard(card);await removeExactConflicts(fp,c.key);return saveExample({card:c,fp,kind:'corrected',source,note});}
async function rejectLegacy(fp){return removeExactConflicts(fp,null);}
async function matchLegacy(fp,{topK=3,maxDistance=.30}={}){
  const q=normalizeFp(fp),db=await open(),tx=db.transaction(EXAMPLES,'readonly'),rows=await reqp(tx.objectStore(EXAMPLES).getAll());await txp(tx);
  const groups=new Map();
  for(const r of rows){if(r.representation!=='legacy-hash-v1'||!r.fingerprint)continue;let d;try{d=legacyDistance(q,r.fingerprint);}catch(_){continue;}if(d>maxDistance)continue;const g=groups.get(r.cardKey)||{card:r.card,distances:[],lastAt:r.createdAt};g.distances.push(d);if(String(r.createdAt)>String(g.lastAt))g.lastAt=r.createdAt;groups.set(r.cardKey,g);}
  const out=[];for(const [cardKey,g] of groups){g.distances.sort((a,b)=>a-b);const best=g.distances[0],second=g.distances[1];const robust=second==null?best:(best*.7+second*.3);out.push({cardKey,card:g.card,distance:robust,bestDistance:best,support:g.distances.length,lastAt:g.lastAt,source:'learned'});}
  return out.sort((a,b)=>a.distance-b.distance).slice(0,Math.max(1,topK));
}
async function getCard(key){const db=await open(),tx=db.transaction(CARDS,'readonly'),r=await reqp(tx.objectStore(CARDS).get(key));await txp(tx);return r||null;}
async function listCards(){const db=await open(),tx=db.transaction(CARDS,'readonly'),r=await reqp(tx.objectStore(CARDS).getAll());await txp(tx);return r.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));}
async function stats(){const db=await open(),tx=db.transaction([EXAMPLES,CARDS],'readonly'),examples=await reqp(tx.objectStore(EXAMPLES).getAll()),cards=await reqp(tx.objectStore(CARDS).count());await txp(tx);return{schemaVersion:DB_VERSION,learnedCards:cards,examples:examples.length,confirmations:examples.filter(x=>x.kind==='confirmed').length,corrections:examples.filter(x=>x.kind==='corrected').length,legacyExamples:examples.filter(x=>x.representation==='legacy-hash-v1').length};}
async function saveVisionCache(version,refs){const db=await open(),tx=db.transaction(CACHE,'readwrite');tx.objectStore(CACHE).put({key:`legacy-refs:${version}`,version,refs,updatedAt:iso()});await txp(tx);return refs.length;}
async function loadVisionCache(version){const db=await open(),tx=db.transaction(CACHE,'readonly'),row=await reqp(tx.objectStore(CACHE).get(`legacy-refs:${version}`));await txp(tx);return Array.isArray(row?.refs)?row.refs:[];}
async function exportBackup(){const db=await open(),tx=db.transaction([EXAMPLES,CARDS,META],'readonly'),examples=await reqp(tx.objectStore(EXAMPLES).getAll()),cards=await reqp(tx.objectStore(CARDS).getAll()),meta=await reqp(tx.objectStore(META).getAll());await txp(tx);return{app:'CardScout',type:'learning-memory-backup',formatVersion:2,exportedAt:iso(),cards,examples,meta};}
async function downloadBackup(){const data=await exportBackup(),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`cardscout-learning-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function exampleSig(e){const f=e?.fingerprint||{};return [e?.cardKey||'',e?.kind||'',f.p||'',f.d||'',f.a||'',Array.isArray(f.c)?f.c.join(','):''].join('|');}
async function importBackup(payload){const data=typeof payload==='string'?JSON.parse(payload):payload;if(data?.type!=='learning-memory-backup'||!Array.isArray(data.examples))throw new Error('Invalid backup');const db=await open(),tx=db.transaction([EXAMPLES,CARDS],'readwrite'),es=tx.objectStore(EXAMPLES),cs=tx.objectStore(CARDS),existing=await reqp(es.getAll()),seen=new Set(existing.map(exampleSig));for(const c of data.cards||[])if(c?.key)cs.put(c);const touched=new Set();for(const e of data.examples||[]){const x={...e};delete x.id;const sig=exampleSig(x);if(!x.cardKey||!x.fingerprint||seen.has(sig))continue;es.add(x);seen.add(sig);touched.add(x.cardKey);}await txp(tx);for(const key of touched)await pruneCard(key,12);return stats();}
global.CardScoutMemory=Object.freeze({version:'2.0.0',init,confirmLegacy,correctLegacy,rejectLegacy,matchLegacy,getCard,listCards,stats,saveVisionCache,loadVisionCache,exportBackup,downloadBackup,importBackup,legacyDistance,normalizeCard});
})(window);
