'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),sharp=require('sharp');
const out=process.env.JP_ARTWORK_QA_DIR||'artifacts/jp-artwork-v158/live';fs.mkdirSync(out,{recursive:true});
const samples={BASE:['PMCG1-001','PMCG1-002','PMCG1-003'],JUNGLE:['PMCG2-001','PMCG2-002','PMCG2-003'],FOSSIL:['PMCG3-001','PMCG3-002','PMCG3-003'],'NEO GENESIS':['neo1-001','neo1-002','neo1-003'],'NEO DISCOVERY':['neo2-001','neo2-002','neo2-003'],'NEO REVELATION':['neo3-001','neo3-002','neo3-038'],'NEO DESTINY':['neo4-001','neo4-002','neo4-003']};
const context={window:{JPCardmarketTwin:{canonicalSet:card=>card.set}}};vm.createContext(context);vm.runInContext(fs.readFileSync('jp-artwork-v158.js','utf8'),context);const api=context.window.JPArtwork;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function download(set,id){
 const record=api.resolve({source_id:id,source_set_id:id.slice(0,id.lastIndexOf('-')),language:'JP',set});assert.ok(record,id);
 let response,error;for(let attempt=0;attempt<3;attempt++){try{response=await fetch(record.image,{signal:AbortSignal.timeout(60000)});if(response.ok)break;error=new Error(String(response.status));}catch(e){error=e;}await sleep(500*(attempt+1));}
 if(!response?.ok)throw new Error(`${id}: ${error?.message||response?.status}`);const contentType=response.headers.get('content-type')||'',disposition=response.headers.get('content-disposition')||'';assert.match(contentType,/^image\//);
 assert.match(disposition,/filename="[^"]+\.webp"/i,`${id}: ${disposition}`);
 const body=Buffer.from(await response.arrayBuffer()),meta=await sharp(body).metadata();assert.ok(meta.width>=500&&meta.height>=700,`${id}: ${meta.width}x${meta.height}`);assert.ok(meta.height/meta.width>1.35&&meta.height/meta.width<1.5,`${id}: card ratio`);
 const page=await fetch(record.sourceRecord,{signal:AbortSignal.timeout(60000)});assert.equal(page.ok,true,record.sourceRecord);const html=await page.text();assert.ok(html.includes(`<h1 class="font-bold text-2xl md:text-5xl">${record.name}</h1>`),`${id}: source name`);assert.ok(html.includes(`src="${record.image}"`),`${id}: source image`);
 fs.writeFileSync(path.join(out,id+'.webp'),body);return {set,id,name:record.name,image:record.image,sourceRecord:record.sourceRecord,bytes:body.length,width:meta.width,height:meta.height,contentDisposition:disposition};
}
(async()=>{const jobs=Object.entries(samples).flatMap(([set,ids])=>ids.map(id=>[set,id])),results=[];let index=0;await Promise.all(Array.from({length:7},async()=>{while(index<jobs.length){const [set,id]=jobs[index++];results.push(await download(set,id));}}));results.sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));assert.equal(results.length,21);assert.equal(new Set(results.map(row=>row.image)).size,21);console.log('PASS 21/21 live JP images, exact source records and card dimensions');})().catch(error=>{console.error(error);process.exitCode=1;});
