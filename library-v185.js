'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HoloDexLibrary=api;})(globalThis,()=>{
  const API='https://api.tcgdex.net/v2',TTL=7*86400000,PREFIX='holodex_library_v185_';
  const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
  const validId=s=>typeof s==='string'&&s.length>0&&s.length<100&&!/[\s/\\?#]/.test(s);
  const artwork=s=>{try{const u=new URL(s);return u.protocol==='https:'&&u.hostname==='assets.tcgdex.net'?u.href:'';}catch{return '';}};
  const exactLinks=Object.freeze({
    'me02-001':['Oddish','001','Phantasmal Flames','Oddish-PFL001'],
    'me02-039':['Cresselia','039','Phantasmal Flames','Cresselia-PFL039'],
    'xy4-23':['Manectric EX','23','Phantom Forces','Manectric-EX-PHF23']
  });
  const exactSets=Object.freeze({'me02':'Phantasmal-Flames','xy4':'Phantom-Forces'});
  const normalizedNumber=s=>String(s||'').replace(/^0+(?=\d)/,'');
  const searchLink=name=>'https://www.cardmarket.com/en/Pokemon/Products/Search?searchString='+encodeURIComponent(name);
  // Personally checked by the user, 2026-10-25. No product-ID inference.
  const confirmedLinks=Object.freeze({
    'ecard2-15':['Houndoom','15','Houndoom-V3-AQ15'],
    'ecard2-1':['Ampharos','1','Ampharos-V2-AQ1']
  });
  // Official product pages supplied as independently checked by the user, 2026-10-27.
  const rubyLinks=Object.freeze({'ex1-2':['Beautifly','2','Beautifly-RS2','HOLO'],'ex1-21':['Seaking','21','Seaking-RS21','NORMAL']});
  function confirmedRoute(card={}){
    const ruby=rubyLinks[card.source_id||card.sourceId];
    if(ruby){
      const edition=String(card.edition||'AUTO').toUpperCase(),variant=String(card.variant||'NORMAL').toUpperCase();
      if(card.language!=='EN'||normalize(card.name)!==normalize(ruby[0])||String(card.number)!==ruby[1]||
        (card.source_set_id&&card.source_set_id!=='ex1')||
        [card.set_name,card.setName,card.set].filter(Boolean).some(value=>!['ex ruby sapphire','ruby sapphire'].includes(normalize(value)))||
        (card.subtype&&card.subtype!=='unlimited')||!['AUTO','UNLIMITED'].includes(edition)||
        !['NORMAL','REVERSE','REVERSE_HOLO',ruby[3]].includes(variant)||
        !['','M','MT','MINT','NM','EX','GD','LP','PL','PO'].includes(String(card.condition||'').toUpperCase()))return null;
      const url=new URL(offerUrl('https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Ruby-Sapphire/'+ruby[2],card));
      url.searchParams.set('isReverseHolo',['REVERSE','REVERSE_HOLO'].includes(variant)?'Y':'N');
      if(edition==='UNLIMITED')url.searchParams.set('isFirstEd','N');
      return {url:url.href,exact:true,confirmed:true};
    }
    const id=card.source_id||card.sourceId,known=confirmedLinks[id];
    if(!known||card.language!=='EN'||normalize(card.name)!==normalize(known[0])||
      String(card.number)!==known[1]||(card.source_set_id&&card.source_set_id!=='ecard2')||
      (card.set_name&&normalize(card.set_name)!=='aquapolis')||
      !['','AUTO','UNLIMITED'].includes(String(card.edition||'').toUpperCase())||
      !['','NORMAL','REVERSE','REVERSE_HOLO','STAMPED'].includes(String(card.variant||'').toUpperCase())||
      !['','M','MT','MINT','NM','EX','GD','LP','PL','PO'].includes(String(card.condition||'').toUpperCase()))return null;
    const url=new URL('https://www.cardmarket.com/en/Pokemon/Products/Singles/Aquapolis/'+known[2]);
    const variant=String(card.variant||'').toUpperCase();
    if(variant)url.searchParams.set('isReverseHolo',variant==='NORMAL'?'N':'Y');
    return {url:offerUrl(url.href,card),exact:true,confirmed:true};
  }
  // A name shared by different collector numbers cannot independently confirm
  // a legacy product ID: the public product index contains no collector number.
  function ambiguousLegacy(card={},catalog={}){
    const row=catalog?.[card.source_id||card.sourceId];
    if(!row)return false;
    return Object.values(catalog).some(other=>other.set?.id===row.set?.id&&
      normalize(other.name)===normalize(row.name)&&normalizedNumber(other.number)!==normalizedNumber(row.number));
  }
  // Codes evidenced by the independently checked product URLs above and the
  // user's verified Base Set example (Blastoise-V1-BS2); never derive a code.
  const searchSets=Object.freeze({base1:['BS','Base Set','BASE'],ecard2:['AQ','Aquapolis','AQUAPOLIS'],
    me02:['PFL','Phantasmal Flames'],xy4:['PHF','Phantom Forces']});
  // Snapshot bundled application constants, never card flags/URLs from storage.
  const curatedCards=typeof EMBEDDED_DATA==='object'?JSON.parse(JSON.stringify(EMBEDDED_DATA.knownCards||[])):[];
  const curatedSets=typeof CM_SOURCE_SETS==='object'?JSON.parse(JSON.stringify(CM_SOURCE_SETS)):{};
  const curatedLabels=typeof EMBEDDED_DATA==='object'?JSON.parse(JSON.stringify(EMBEDDED_DATA.sets||{})):{};
  function curatedRoute(card){
    if(card.language!=='EN')return null;
    if(card.subtype&&!['unlimited'].includes(card.subtype))return null;
    const edition=String(card.edition||'AUTO').toUpperCase(),variant=String(card.variant||'NORMAL').toUpperCase();
    if(!['AUTO','UNLIMITED','1ST'].includes(edition)||!['NORMAL','HOLO','REVERSE','REVERSE_HOLO','STAMPED'].includes(variant))return null;
    const cardName=value=>normalize(String(value||'').replace(/[δΔ]/g,' Delta Species '));
    const matches=curatedCards.filter(row=>{
      const ids=curatedSets[row.set]||[],labels=[row.set,row.set_name].map(normalize);
      if(!row.verified||!row.direct||row.language!=='EN'||normalizedNumber(row.number)!==normalizedNumber(card.number)||
        ![row.name,...(row.aliases||[])].some(name=>cardName(name)===cardName(card.name)))return false;
      if(!card.source_id&&!card.source_set_id&&!card.set&&!card.set_name)return false;
      if(card.source_id&&!ids.some(id=>card.source_id===id+'-'+card.number))return false;
      if(card.source_set_id&&!ids.includes(card.source_set_id))return false;
      if(card.set&&!labels.includes(normalize(card.set))&&!ids.some(id=>card.set==='TCGDEX EN '+id))return false;
      if(card.set_name&&!labels.includes(normalize(card.set_name)))return false;
      if(variant==='HOLO'&&!/holo/i.test(row.rarity||''))return false;
      if(edition==='1ST'&&!ids.some(id=>/^(base[1235]|gym[12]|neo[1-4])$/.test(id)))return false;
      if(['REVERSE','REVERSE_HOLO','STAMPED'].includes(variant)&&!ids.some(id=>/^(ecard\d|ex\d+|dp\d|pl\d|hgss\d|col1|lc)$/.test(id)))return false;
      try{const u=new URL(row.url);return u.protocol==='https:'&&u.hostname==='www.cardmarket.com'&&/^\/en\/Pokemon\/Products\/Singles\/[^/]+\/[^/]+$/.test(u.pathname)&&!u.search&&!u.hash;}catch{return false;}
    });
    if(matches.length!==1)return null;
    const url=new URL(offerUrl(matches[0].url,card));
    if(url.pathname.endsWith('/Search'))return null;
    if(edition!=='AUTO')url.searchParams.set('isFirstEd',edition==='1ST'?'Y':'N');
    if(['REVERSE','REVERSE_HOLO','STAMPED'].includes(variant))url.searchParams.set('isReverseHolo','Y');
    return {url:url.href,exact:true,kind:'EXACT',curated:true};
  }
  function safeRoute(input={},jpRoute){
    const card={...input,source_id:input.source_id||input.sourceId,set_name:input.set_name||input.setName};
    if(card.language==='JP')return jpRoute?jpRoute(card):{url:'',exact:false,kind:'UNAVAILABLE'};
    const name=String(card.name||'').trim();
    if(!name)return {url:'',exact:false,kind:'UNAVAILABLE'};
    const confirmed=confirmedRoute(card);if(confirmed)return {...confirmed,kind:'EXACT'};
    const curated=curatedRoute(card);if(curated)return curated;
    const number=String(card.number||''),sourceSet=card.source_id?.slice(0,card.source_id.lastIndexOf('-'));
    const setId=card.source_set_id||sourceSet||Object.keys(searchSets).find(id=>searchSets[id].slice(1).some(label=>normalize(label)===normalize(card.set_name||card.set)));
    const set=searchSets[setId];
    const consistent=card.language==='EN'&&set&&/^(?:\d+|H\d+)$/i.test(number)&&
      (!card.source_id||card.source_id===setId+'-'+number)&&
      (!card.set_name||set.slice(1).some(label=>normalize(label)===normalize(card.set_name)));
    if(consistent){
      const exact=cardmarketRoute({...card,source_set_id:setId,set_name:set[1]});
      const variant=String(card.variant||'').toUpperCase(),edition=String(card.edition||'').toUpperCase();
      if(exact.exact&&(exact.confirmed||(!variant&&!edition)))return {...exact,kind:'EXACT'};
    }
    const knownSet=Object.keys(curatedSets).find(key=>curatedSets[key].includes(setId));
    const label=curatedLabels[knownSet]?.label;
    const searchName=typeof cleanCardmarketName==='function'?cleanCardmarketName(name,number):name;
    // Cardmarket does not reliably interpret set labels/codes and collector numbers as search terms.
    const query=searchName;
    const url=new URL(searchLink(query));
    const conditions={M:1,MT:1,MINT:1,NM:2,EX:3,GD:4,LP:5,PL:6,PO:7};
    if(card.language==='EN')url.searchParams.set('language','1');
    const condition=conditions[String(card.condition||'NM').toUpperCase()];
    if(condition)url.searchParams.set('minCondition',condition);
    if(card.edition==='1ST')url.searchParams.set('isFirstEd','Y');
    if(card.edition==='UNLIMITED')url.searchParams.set('isFirstEd','N');
    if(['REVERSE','REVERSE_HOLO','STAMPED'].includes(card.variant))url.searchParams.set('isReverseHolo','Y');
    else if(card.variant==='NORMAL')url.searchParams.set('isReverseHolo','N');
    const identity={name,number,set:card.set_name||label||card.set||set?.[1]||'',source_id:card.source_id||'',source_set_id:setId||'',language:card.language||''};
    return {url:url.href,exact:false,kind:'BROAD_SEARCH',identity,note:'Exacte link niet geverifieerd · controleer '+[identity.set,number&&'#'+number,card.variant||'uitvoering'].filter(Boolean).join(' · ')};
  }
  // Values verified against Cardmarket's public product filter form (2026-10-24).
  // Its website uses numeric values; the authenticated API uses different codes.
  function offerUrl(url,card={}){
    const u=new URL(url),condition=String(card.condition||'NM').toUpperCase();
    if(u.protocol!=='https:'||u.hostname!=='www.cardmarket.com')return '';
    if(u.pathname.endsWith('/Search'))return searchLink(card.name||u.searchParams.get('searchString')||'Pokemon');
    const conditions={M:1,MT:1,MINT:1,NM:2,EX:3,GD:4,LP:5,PL:6,PO:7};
    if(!conditions[condition])return searchLink(card.name||'Pokemon');
    u.searchParams.set('minCondition',conditions[condition]);
    if(card.language==='EN')u.searchParams.set('language','1');
    else if(card.language==='JP')u.searchParams.set('language','7');
    else u.searchParams.delete('language');
    return u.href;
  }
  function cardmarketRoute(card={},legacyCatalog){
    const confirmed=confirmedRoute(card);if(confirmed)return confirmed;
    const name=String(card.name||'').trim();
    if(!name)return {url:'',exact:false};
    if(!['','M','MT','MINT','NM','EX','GD','LP','PL','PO'].includes(String(card.condition||'').toUpperCase()))return {url:searchLink(name),exact:false};
    if(card.language==='EN'&&card.source_id===card.source_set_id+'-'+card.number){
      const known=exactLinks[card.source_id];
      if(known&&name===known[0]&&card.number===known[1]&&card.set_name===known[2])
        return {url:offerUrl('https://www.cardmarket.com/en/Pokemon/Products/Singles/'+exactSets[card.source_set_id]+'/'+known[3]+'?language=1',card),exact:true};
    }
    // Cardmarket's full-text search often rejects combined name + set + number.
    // A broad search is labeled as such, never called an exact listing.
    return {url:searchLink(name),exact:false};
  }
  function cardmarketOptions(card={},detail={},index={},legacyCatalog){
    if(!['','M','MT','MINT','NM','EX','GD','LP','PL','PO'].includes(String(card.condition||'').toUpperCase()))return [];
    if(card.language!=='EN'||!card.source_set_id||card.source_id!==card.source_set_id+'-'+card.number||
      index?.schema!==191||index.source!=='CARDMARKET_OFFICIAL_PRODUCT_CATALOG'||index.count<70000||
      !index.rows||typeof index.rows!=='object')return [];
    const detailMatches=detail?.id===card.source_id&&detail.localId===card.number&&
      detail.set?.id===card.source_set_id&&normalize(detail.name)===normalize(card.name)&&
      Array.isArray(detail.variants_detailed);
    const choices=new Map();
    for(const variant of detailMatches?detail.variants_detailed:[]){
      const id=variant?.thirdParty?.cardmarket,product=index.rows[id];
      const expansion={base1:1523,'sv03.5':5402,me02:6299}[card.source_set_id];
      if(!Number.isSafeInteger(id)||id<=0||!Array.isArray(product)||!Number.isSafeInteger(product[0])||
        product[0]!==expansion||!['normal','holo','reverse'].includes(variant.type)||
        (variant.size&&variant.size!=='standard')||
        (variant.stamp&&(!Array.isArray(variant.stamp)||variant.stamp.some(s=>s!=='1st-edition')))||
        typeof product[1]!=='string'||normalize(product[1].split(' [')[0])!==normalize(card.name))continue;
      const attacks=product[1].match(/ \[([^\]]+)\]$/)?.[1];
      if(attacks&&Array.isArray(detail.attacks)&&
        normalize(attacks.split(' | ').join(' '))!==normalize(detail.attacks.map(a=>a.name).join(' ')))continue;
      const parts=[String(variant.type||'').replace('reverse','Reverse holo').replace('normal','Normaal').replace('holo','Holo')];
      if(variant.subtype)parts.push(String(variant.subtype));
      if(Array.isArray(variant.stamp)&&variant.stamp.length)parts.push(variant.stamp.join(', '));
      if(variant.foil)parts.push(String(variant.foil));
      const label=parts.filter(Boolean).join(' · ');
      const key=JSON.stringify([id,variant.type,variant.subtype||'',variant.stamp||[],variant.foil||'']);
      const url=new URL('https://www.cardmarket.com/en/Pokemon/Products?idProduct='+id+'&language=1');
      if(variant.type==='reverse')url.searchParams.set('isReverseHolo','Y');
      else if(detail.variants?.reverse===true||detail.variants_detailed.some(v=>v.type==='reverse'))url.searchParams.set('isReverseHolo','N');
      if(variant.stamp?.includes('1st-edition'))url.searchParams.set('isFirstEd','Y');
      else if(['unlimited','shadowless'].includes(variant.subtype))url.searchParams.set('isFirstEd','N');
      if(!choices.has(key))choices.set(key,{id,labels:[label],url:url.href,variant});
    }
    if(!choices.size&&!detailMatches&&!ambiguousLegacy(card,legacyCatalog)){
      // v152 identities are accepted only after *independent* matching against
      // the official Cardmarket product catalog and the expansion's majority.
      const row=legacyCatalog?.[card.source_id],p=index.rows[row?.product];
      if(row&&row.id===card.source_id&&row.set?.id===card.source_set_id&&
        normalize(row.name)===normalize(card.name)&&normalizedNumber(row.number)===normalizedNumber(card.number)&&
        Number.isSafeInteger(row.product)&&row.product>0&&Array.isArray(p)&&
        typeof p[1]==='string'&&normalize(p[1].split(' [')[0])===normalize(card.name)){
        const counts=new Map();
        for(const value of Object.values(legacyCatalog)){
          if(value.set?.id!==card.source_set_id)continue;
          const expansion=index.rows[value.product]?.[0];
          if(Number.isSafeInteger(expansion))counts.set(expansion,(counts.get(expansion)||0)+1);
        }
        const top=[...counts].sort((a,b)=>b[1]-a[1])[0];
        if(top&&top[0]===p[0])choices.set(row.product,{id:row.product,
          labels:['Bekend product · uitvoering controleren'],
          url:'https://www.cardmarket.com/en/Pokemon/Products?idProduct='+row.product+'&language=1'});
      }
    }
    return [...choices.values()].map(c=>({id:c.id,label:c.labels.join(' / '),url:offerUrl(c.url,card),...(c.variant?{variant:c.variant}:{})}));
  }
  function cards(data,set,language){
    const seen=new Set();return (Array.isArray(data)?data:[]).flatMap(c=>{
      if(!validId(c?.localId)||c.id!==set.id+'-'+c.localId||!String(c.name||'').trim()||seen.has(c.id))return [];
      seen.add(c.id);return [{source:'tcgdex',source_id:c.id,source_set_id:set.id,language,name:c.name,number:c.localId,
        set:'TCGDEX '+language+' '+set.id,set_name:set.name,source_set_name:set.name,image:artwork(c.image),
        key:'library|'+language+'|'+c.id,verified:false,direct:false,url:'',catalogOnly:true}];
    });
  }
  function create({fetch:request,storage,now=Date.now,snapshot,legacyCard=c=>c,translateQuery=q=>q}){
    const inflight=new Map(),sets=new Map(),state=new Map();
    for(const language of ['EN','JP'])sets.set(language,(snapshot.languages[language]||[]).filter(s=>validId(s.id)&&s.name&&s.series!=='tcgp'));
    const code=lang=>{if(!['EN','JP'].includes(lang))throw Error('Onbekende taal');return lang==='JP'?'ja':'en';};
    function read(key){try{const x=JSON.parse(storage.getItem(PREFIX+key));return x&&Number.isFinite(x.savedAt)&&x.savedAt<=now()&&x.value?x:null;}catch{return null;}}
    function write(key,value){try{storage.setItem(PREFIX+key,JSON.stringify({savedAt:now(),value}));return true;}catch{return false;}}
    async function json(path){const response=await request(API+'/'+path,{signal:AbortSignal.timeout(15000),cache:'no-cache',headers:{Accept:'application/json'}});if(!response.ok)throw Error('HTTP '+response.status);return response.json();}
    async function once(key,fn){if(!inflight.has(key))inflight.set(key,Promise.resolve().then(fn).finally(()=>inflight.delete(key)));return inflight.get(key);}
    function getSets(lang){code(lang);return sets.get(lang);}
    function convert(raw,set,lang){return cards(raw,set,lang).map(c=>legacyCard(c));}
    async function loadSet(lang,id,{refresh=false}={}){code(lang);const set=getSets(lang).find(s=>s.id===id);if(!set)throw Error('Set niet ontdekt');const key=lang+'-set-'+id;
      return once(key,async()=>{const cached=read(key);const old=cached&&Array.isArray(cached.value.cards)?cached.value:null;
        if(old&&!refresh&&now()-cached.savedAt<TTL){const result={...old,cards:convert(old.cards,set,lang),cached:true,stale:false};state.set(key,result);return result;}
        try{const data=await json(code(lang)+'/sets/'+encodeURIComponent(id));if(data?.id!==id||!Array.isArray(data.cards))throw Error('Ongeldige setrespons');
          const accepted=cards(data.cards,set,lang);if(!accepted.length&&old?.cards.length)throw Error('Lege respons; eerdere kaarten behouden');
          const total=Number.isSafeInteger(data.cardCount?.total)&&data.cardCount.total>=0?data.cardCount.total:null;
          const complete=total!==null&&accepted.length===total&&data.cards.length===accepted.length;
          // An incomplete refresh must never discard previously validated identities.
          const merged=new Map((old?.cards||[]).map(c=>[c.id,c]));for(const c of accepted)merged.set(c.source_id,{id:c.source_id,localId:c.number,name:c.name,image:c.image});
          const raw=complete?accepted.map(c=>({id:c.source_id,localId:c.number,name:c.name,image:c.image})):[...merged.values()];
          const value={cards:raw,total,complete,received:accepted.length};const persisted=write(key,value);
          const result={...value,cards:convert(raw,set,lang),cached:false,stale:false,persisted};state.set(key,result);return result;
        }catch(error){if(old){const result={...old,cards:convert(old.cards,set,lang),cached:true,stale:true,error:error.message};state.set(key,result);return result;}throw error;}
      });
    }
    async function discover(lang){const key=lang+'-sets';code(lang);const previous=getSets(lang);try{const data=await json(code(lang)+'/sets');if(!Array.isArray(data)||!data.length)throw Error('Ongeldige setlijst');
      const next=previous.map(s=>{const live=data.find(x=>x.id===s.id);return live?{...s,name:live.name||s.name,logo:artwork(live.logo),cardCount:live.cardCount||s.cardCount}:s;});
      const extra=data.filter(s=>validId(s.id)&&s.name&&!previous.some(x=>x.id===s.id));
      let index=0,unclassified=0;await Promise.all(Array.from({length:Math.min(4,extra.length)},async()=>{while(index<extra.length){const s=extra[index++];try{const d=await json(code(lang)+'/sets/'+encodeURIComponent(s.id));if(d.id!==s.id||!d.serie?.id)throw Error('Serie ontbreekt');if(d.serie.id==='tcgp')continue;next.push({...s,logo:artwork(s.logo),series:d.serie.id,seriesName:d.serie.name||d.serie.id,available:cards(d.cards,s,lang).length});}catch{unclassified++;}}}));
      sets.set(lang,next);write(key,next);return {sets:next,unclassified};
    }catch(error){return {sets:previous,error:error.message};}}
    function restore(){const restored=[];for(const lang of ['EN','JP']){const meta=read(lang+'-sets');if(Array.isArray(meta?.value))sets.set(lang,meta.value.filter(s=>validId(s.id)&&s.name&&s.series&&s.series!=='tcgp'));
      for(const s of getSets(lang)){const cached=read(lang+'-set-'+s.id);if(Array.isArray(cached?.value?.cards))restored.push(...convert(cached.value.cards,s,lang));}}
      return restored;
    }
    async function search(lang,query,page=1){code(lang);if(!Number.isSafeInteger(page)||page<1)throw Error('Ongeldige pagina');const q=normalize(query);if(q.length<2)return {cards:[],more:false};
      const set=getSets(lang).map(s=>({set:s,alias:[s.name,s.id].map(normalize).sort((a,b)=>b.length-a.length).find(a=>a&&(' '+q+' ').includes(' '+a+' '))})).filter(x=>x.alias).sort((a,b)=>b.alias.length-a.alias.length)[0];
      if(set){const loaded=await loadSet(lang,set.set.id);const rest=(' '+q+' ').replace(' '+set.alias+' ',' ').trim().split(' ').filter(Boolean);const matches=loaded.cards.filter(c=>rest.every(t=>normalize(c.name+' '+c.number+' '+(c.search_aliases||[]).join(' ')).includes(t)));return {cards:matches.slice((page-1)*80,page*80),more:matches.length>page*80,stale:loaded.stale,incomplete:!loaded.complete,total:matches.length};}
      const terms=query.trim().split(/\s+/),number=terms.find(t=>/^(?:\d+|(?:TG|GG|SH|SL|AR|RT)\d+)$/i.test(t));
      const name=terms.filter(t=>t!==number).join(' '),params=new URLSearchParams({'pagination:page':String(page),'pagination:itemsPerPage':'80'});
      if(name)params.set('name',lang==='JP'?translateQuery(name):name);if(number)params.set('localId','eq:'+number);
      const key=lang+'-query-'+params;
      const cached=read(key);if(cached&&now()-cached.savedAt<TTL)return {...cached.value,cards:cached.value.cards.map(legacyCard),cached:true};
      try{const data=await once(key,()=>json(code(lang)+'/cards?'+params));if(!Array.isArray(data))throw Error('Ongeldige zoekrespons');let accepted=[];
        for(const set of getSets(lang))accepted.push(...convert(data.filter(c=>c?.id===set.id+'-'+c.localId),set,lang));
        const result={cards:accepted,more:data.length===80,incomplete:accepted.length!==data.length};write(key,result);return result;
      }catch(error){if(cached)return {...cached.value,cards:cached.value.cards.map(legacyCard),stale:true,error:error.message};throw error;}
    }
    return {getSets,loadSet,discover,search,state,restore};
  }
  return Object.freeze({create,cards,normalize,artwork,cardmarketRoute,cardmarketOptions,offerUrl,ambiguousLegacy,confirmedRoute,safeRoute,TTL});
});
