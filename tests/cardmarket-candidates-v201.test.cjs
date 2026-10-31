'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const L=require('../library-v185.js'),audit=require('../artifacts/en-cardmarket-audit/v201-primal-clash-candidates.json');
const card=c=>({source_id:c.cardId,source_set_id:'xy5',set_name:'Primal Clash',name:c.name,number:c.number,language:'EN',condition:'NM'});
test('original V201 smoke: 161 singles become candidates; three ambiguous identities do not',()=>{
 let n=0;for(const c of audit.cards){const x=L.safeRoute(card(c));if(c.links.length===1){assert.equal(x.kind,'V201_CANDIDATE',c.cardId);assert.ok(x.url.includes('minCondition=2'));n++;}else assert.notEqual(x.kind,'V201_CANDIDATE');}assert.equal(n,161);
});
test('all 805 condition routes retain audited URL and never claim verification or prices',()=>{
 for(const c of audit.cards.filter(c=>c.links.length===1))for(const [condition,min]of [['NM','2'],['EX','3'],['GD','4'],['PL','6'],['PO','7']]){
 const input={...card(c),condition,edition:'UNLIMITED'},before=JSON.stringify(input),r=L.safeRoute(input),u=new URL(r.url);
 assert.equal(u.origin+u.pathname,c.links[0].url);assert.equal(u.searchParams.get('minCondition'),min);assert.equal(u.searchParams.get('language'),'1');assert.equal(u.searchParams.get('isFirstEd'),'N');assert.equal(u.searchParams.get('isReverseHolo'),'N');assert.equal(u.searchParams.has('idProduct'),false);
 assert.equal(r.exact,false);assert.equal(r.confirmed,false);assert.equal(r.verified,false);assert.equal(r.candidate,true);assert.match(r.note,/minimum/);assert.match(r.note,/niet onafhankelijk geverifieerd/);assert.equal(r.identity.source_id,c.cardId);assert.equal(r.identity.number,c.number);assert.equal('price' in r,false);assert.equal(JSON.stringify(input),before);
 }
});
test('conflicting identity, unsupported editions and prints fail closed for every candidate',()=>{
 for(const c of audit.cards.filter(c=>c.links.length===1))for(const change of [{name:'Wrong'},{number:'999'},{source_id:'xy4-'+c.number},{sourceId:'xy4-'+c.number},{source_set_id:'xy4'},{sourceSetId:'xy4'},{set_name:'Aquapolis'},{setName:'Aquapolis'},{language:'JP'},{edition:'1ST'},{variant:'REVERSE'},{variant:'HOLO'},{variant:'STAMPED'},{size:'jumbo'},{stamp:['promo']},{foil:'cosmos'},{subtype:'shadowless'},{condition:'PSA10'}])assert.equal(L.candidateRoute({...card(c),...change}),null,c.cardId+JSON.stringify(change));
});
test('exceptions are not imported; confirmed routes retain priority; JP delegates',()=>{
 assert.equal(audit.unmappedProducts.length,10);const source=fs.readFileSync('library-v185.js','utf8').split('const primalCandidates=Object.freeze(')[1].split(');')[0];for(const e of audit.unmappedProducts)assert.equal(source.includes(e.id),false);
 for(const c of [{source_id:'ecard2-15',number:'15',name:'Houndoom'},{source_id:'ex1-2',number:'2',name:'Beautifly'}]){const r=L.safeRoute({...c,language:'EN'});assert.equal(r.confirmed,true);assert.equal(r.candidate,undefined);}
 const jp={url:'native-jp',exact:true};assert.equal(L.safeRoute({...card(audit.cards[0]),language:'JP'},()=>jp),jp);
});
test('UI candidate label and observer never describe historical links as exact',()=>{
 const source=fs.readFileSync('ui-library-v185.js','utf8'),route=L.safeRoute(card(audit.cards[0]));
 const ctx={};vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('  function setCardmarketLink('),source.indexOf('  async function resolveCardmarket(')),ctx);
 const link={dataset:{}};ctx.setCardmarketLink(link,route);assert.match(link.textContent,/kandidaat/);assert.match(link.textContent,/niet geverifieerd/);assert.equal(link.dataset.cmEvidence,'V201_CANDIDATE');assert.match(link.title,/minimum/);
 assert.ok(source.includes("CardmarketUI.current='V201_CANDIDATE'"));
});
