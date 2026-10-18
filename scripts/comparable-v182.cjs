'use strict';
// Offline contract prototype. No provider access, production loader or synthetic fallback.
const DAY=86400000;
const fields=['sourceId','language','condition','edition','finish'];
const key=x=>fields.map(k=>x[k]).join('|');
const validIdentity=x=>x&&fields.every(k=>typeof x[k]==='string'&&x[k].length>0)&&['EN','JP'].includes(x.language)&&!fields.some(k=>/UNKNOWN|AUTO|UNSPECIFIED/i.test(x[k]));
function match(identity,series){const matches=series.filter(s=>validIdentity(s)&&key(s)===key(identity));return matches.length===1?matches[0]:null;}
function compare(holdings,series){
 const unavailable=()=>({status:'unavailable',points:[],coverage:0,label:'Geen vergelijkbare metingen'});
 const rows=holdings.filter(x=>x.listType==='OWNED');if(!rows.length)return unavailable();
 const joined=[];
 for(const h of rows){
  if(!validIdentity(h)||!Number.isSafeInteger(h.qty)||h.qty<1)return unavailable();
  const s=match(h,series);if(!s||!['CARDMARKET','TCGPLAYER'].includes(s.provider)||s.currency!==(s.provider==='CARDMARKET'?'EUR':'USD')||!s.metric||!Array.isArray(s.points)||s.points.length<2)return unavailable();
  const dates=new Map();for(const p of s.points){const at=Date.parse(p.observedAt),generated=Date.parse(p.generatedAt);if(!Number.isFinite(at)||!Number.isFinite(generated)||generated<at||!Number.isFinite(p.value)||p.value<=0||dates.has(at))return unavailable();dates.set(at,p.value);}
  joined.push({h,s,dates});
 }
 const first=joined[0].s;if(joined.some(({s})=>s.provider!==first.provider||s.currency!==first.currency||s.metric!==first.metric))return unavailable();
 // Fixed coverage, identical timestamps; never substitute zero or carry stale points forward.
 const times=[...joined[0].dates.keys()].filter(t=>joined.every(x=>x.dates.has(t))).sort((a,b)=>a-b);
 if(times.length<2)return unavailable();
 const points=times.map(t=>({observedAt:new Date(t).toISOString(),value:joined.reduce((sum,x)=>sum+x.h.qty*x.dates.get(t),0)}));
 if(points.some(p=>!Number.isFinite(p.value)))return unavailable();
 return {status:'available',provider:first.provider,currency:first.currency,metric:first.metric,coverage:1,quantities:rows.reduce((n,h)=>n+h.qty,0),points,label:'Vergelijkbare marktwaarde met huidige aantallen; geen historische collectie',sourceLabel:(first.provider==='TCGPLAYER'?'TCGplayer':'Cardmarket')+' · '+first.currency};
}
function today(series,now=new Date(),timeZone='Europe/Amsterdam'){
 if(series.status!=='available'||series.coverage!==1||series.points.length<2)return null;
 const date=d=>new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d));
 const end=series.points.at(-1),t=Date.parse(end.observedAt),age=+now-t;if(age<0||age>DAY||date(t)!==date(now))return null;
 const previous=series.points.filter(p=>{const gap=t-Date.parse(p.observedAt);return gap>=18*3600000&&gap<=30*3600000&&date(p.observedAt)===date(t-DAY);});
 if(previous.length!==1)return null;const start=previous[0];return {absolute:end.value-start.value,percent:(end.value/start.value-1)*100,currency:series.currency,provider:series.provider};
}
module.exports={match,compare,today};
