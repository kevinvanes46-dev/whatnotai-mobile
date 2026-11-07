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
  const reviewedExpansions=Object.freeze({base1:1523,'sv03.5':5402,me02:6299});
  // Stored records and UI adapters use both naming conventions. Contradictions
  // must never be hidden by choosing one alias before resolving a direct link.
  function consistentIdentity(card={}){
    for(const [a,b] of [['source_id','sourceId'],['source_set_id','sourceSetId'],['set_name','setName']]){
      if(card[a]&&card[b]&&String(card[a])!==String(card[b]))return false;
    }
    const id=card.source_id||card.sourceId,set=card.source_set_id||card.sourceSetId;
    if(id&&set&&id!==set+'-'+card.number)return false;
    if(card.size&&card.size!=='standard')return false;
    if(card.stamp&&(!Array.isArray(card.stamp)||card.stamp.length))return false;
    if(card.foil&&!['holo'].includes(card.foil))return false;
    if(card.subtype&&card.subtype!=='unlimited')return false;
    return true;
  }
  // Personally checked by the user, 2026-10-25. No product-ID inference.
  const confirmedLinks=Object.freeze({
    'ecard2-15':['Houndoom','15','Houndoom-V3-AQ15'],
    'ecard2-1':['Ampharos','1','Ampharos-V2-AQ1']
  });
  const promoLinks=Object.freeze({
    'basep-7':['Jigglypuff','7','Wizards Black Star Promos','Jigglypuff-WP7']
  });
  const pidgeottoSetNames=Object.freeze(['base set','base','tcgdex en base1']);
  function isPidgeotto(card={}){
    return consistentIdentity(card)&&(card.source_id||card.sourceId)==='base1-22'&&
      (!card.source_set_id||card.source_set_id==='base1')&&
      (!card.sourceSetId||card.sourceSetId==='base1')&&card.language==='EN'&&
      normalize(card.name)==='pidgeotto'&&String(card.number)==='22'&&
      ![card.set_name,card.setName,card.set].filter(Boolean).some(value=>!pidgeottoSetNames.includes(normalize(value)));
  }
  function cardmarketPrintChoices(card={}){
    if(!isPidgeotto(card))return [];
    return [
      {label:'Unlimited',edition:'UNLIMITED'},
      {label:'Shadowless',edition:'SHADOWLESS'},
      {label:'Shadowless · 1st Edition',edition:'1ST'}
    ];
  }
  // Official product pages supplied as independently checked by the user, 2026-10-27.
  const rubyLinks=Object.freeze({'ex1-2':['Beautifly','2','Beautifly-RS2','HOLO'],'ex1-21':['Seaking','21','Seaking-RS21','NORMAL']});
  // Browser-verified V203 owners; TCGdex letters are source IDs, not printed numbers.
  const v203VerifiedProducts=Object.freeze({
    'exu-W':{letter:'W',printedNumber:'W-28',productId:276635},
    'exu-V':{letter:'V',printedNumber:'V-28',productId:276636},
    'exu-X':{letter:'X',printedNumber:'X-28',productId:276637}
  });
  const v203RejectedOwners=Object.freeze({'exu-L':276635,'exu-M':276636,'exu-N':276637});
  function confirmedRoute(card={}){
    if(!consistentIdentity(card))return null;
    const sourceId=card.source_id||card.sourceId,verified=v203VerifiedProducts[sourceId];
    if(isPidgeotto(card)){
      const edition=String(card.edition||'AUTO').toUpperCase();
      const prints={
        UNLIMITED:{slug:'Pidgeotto-V1-BS22',firstEdition:'N'},
        SHADOWLESS:{slug:'Pidgeotto-V2-BS22',firstEdition:'N'},
        SHADOWLESS_1ST:{slug:'Pidgeotto-V2-BS22',firstEdition:'Y'},
        '1ST':{slug:'Pidgeotto-V2-BS22',firstEdition:'Y'}
      };
      const print=prints[edition],variant=String(card.variant||'NORMAL').toUpperCase();
      if(!print||!['NORMAL',''].includes(variant)||
        !['','M','MT','MINT','NM','EX','GD','LP','PL','PO'].includes(String(card.condition||'').toUpperCase()))return null;
      const url=new URL(offerUrl('https://www.cardmarket.com/en/Pokemon/Products/Singles/Base-Set/'+print.slug,card));
      url.searchParams.set('isFirstEd',print.firstEdition);
      url.searchParams.set('isReverseHolo','N');
      return {url:url.href,exact:true,confirmed:true,evidence:'USER_PROVIDED_CARDMARKET_PRODUCT',print:edition};
    }
    const promo=promoLinks[sourceId];
    if(promo){
      const setNames=[card.set_name,card.setName,card.set].filter(Boolean).map(normalize);
      if(card.language!=='EN'||normalize(card.name)!==normalize(promo[0])||String(card.number)!==promo[1]||
        (card.source_set_id&&card.source_set_id!=='basep')||(card.sourceSetId&&card.sourceSetId!=='basep')||
        setNames.some(value=>!['wizards black star promos','wotc promo','tcgdex en basep'].includes(value))||
        !['','AUTO','UNLIMITED'].includes(String(card.edition||'').toUpperCase())||
        !['','NORMAL'].includes(String(card.variant||'NORMAL').toUpperCase())||
        !['','M','MT','MINT','NM','EX','GD','LP','PL','PO'].includes(String(card.condition||'').toUpperCase()))return null;
      return {url:offerUrl('https://www.cardmarket.com/en/Pokemon/Products/Singles/Wizards-Black-Star-Promos/'+promo[3],card),
        exact:true,confirmed:true,evidence:'USER_PROVIDED_CARDMARKET_PRODUCT'};
    }
    if(verified){
      const edition=String(card.edition||'AUTO').toUpperCase(),variant=String(card.variant||'NORMAL').toUpperCase();
      const setNames=[card.set_name,card.setName,card.set].filter(Boolean).map(normalize);
      if(card.language!=='EN'||card.source_set_id!=='exu'||String(card.number)!==verified.letter||
        !['unown','unown '+verified.letter].includes(normalize(card.name))||
        setNames.some(value=>!['unseen forces unown collection','unseen forces','ex unseen forces','tcgdex en exu'].includes(value))||
        (card.subtype&&card.subtype!=='unlimited')||!['AUTO','UNLIMITED'].includes(edition)||
        !['','NORMAL'].includes(variant)||
        !['','M','MT','MINT','NM','EX','GD','LP','PL','PO'].includes(String(card.condition||'').toUpperCase()))return null;
      const url=new URL(offerUrl('https://www.cardmarket.com/en/Pokemon/Products?idProduct='+verified.productId,card));
      url.searchParams.set('isReverseHolo','N');
      url.searchParams.set('isFirstEd','N');
      return {url:url.href,exact:true,confirmed:true,evidence:'V203_USER_BROWSER_VERIFIED',printedNumber:verified.printedNumber};
    }
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
  const searchSets=Object.freeze({base1:['BS','Base Set','BASE'],basep:['WP','Wizards Black Star Promos','WOTC Promo'],ecard2:['AQ','Aquapolis','AQUAPOLIS'],
    me02:['PFL','Phantasmal Flames'],xy4:['PHF','Phantom Forces']});
  // Snapshot bundled application constants, never card flags/URLs from storage.
  const curatedCards=typeof EMBEDDED_DATA==='object'?JSON.parse(JSON.stringify(EMBEDDED_DATA.knownCards||[])):[];
  const curatedSets=typeof CM_SOURCE_SETS==='object'?JSON.parse(JSON.stringify(CM_SOURCE_SETS)):{};
  const curatedLabels=typeof EMBEDDED_DATA==='object'?JSON.parse(JSON.stringify(EMBEDDED_DATA.sets||{})):{};
  const curatedByNumber=new Map();
  for(const row of curatedCards){const key=normalizedNumber(row.number);if(!curatedByNumber.has(key))curatedByNumber.set(key,[]);curatedByNumber.get(key).push(row);}
  function curatedRoute(card){
    if(!consistentIdentity(card))return null;
    if(card.language!=='EN')return null;
    if(card.subtype&&!['unlimited'].includes(card.subtype))return null;
    const edition=String(card.edition||'AUTO').toUpperCase(),variant=String(card.variant||'NORMAL').toUpperCase();
    if(!['AUTO','UNLIMITED','1ST'].includes(edition)||!['NORMAL','HOLO','REVERSE','REVERSE_HOLO','STAMPED'].includes(variant))return null;
    const cardName=value=>normalize(String(value||'').replace(/[δΔ]/g,' Delta Species '));
    const matches=(curatedByNumber.get(normalizedNumber(card.number))||[]).filter(row=>{
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
  // V201: audited historical candidates, never live-verified identities.
  // Source audit blob: 721c12ffacb18995c86c807469c895a8cc8a36f3. Multi-version and unmapped records excluded.
  const primalCandidates=Object.freeze({"xy5-1":["Weedle","1","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Weedle-PRC1"],"xy5-2":["Kakuna","2","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Kakuna-PRC2"],"xy5-3":["Beedrill","3","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Beedrill-PRC3"],"xy5-4":["Tangela","4","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Tangela-PRC4"],"xy5-5":["Tangrowth","5","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Tangrowth-PRC5"],"xy5-6":["Treecko","6","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Treecko-PRC6"],"xy5-7":["Grovyle","7","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Grovyle-PRC7"],"xy5-8":["Sceptile","8","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Sceptile-PRC8"],"xy5-9":["Sceptile","9","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Sceptile-PRC9"],"xy5-10":["Lotad","10","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Lotad-PRC10"],"xy5-11":["Lombre","11","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Lombre-PRC11"],"xy5-12":["Ludicolo","12","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Ludicolo-PRC12"],"xy5-13":["Surskit","13","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Surskit-PRC13"],"xy5-14":["Masquerain","14","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Masquerain-PRC14"],"xy5-15":["Shroomish","15","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Shroomish-PRC15"],"xy5-16":["Breloom","16","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Breloom-PRC16"],"xy5-17":["Volbeat","17","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Volbeat-PRC17"],"xy5-18":["Illumise","18","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Illumise-PRC18"],"xy5-19":["Trevenant EX","19","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Trevenant-EX-PRC19"],"xy5-21":["Ninetales","21","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Ninetales-PRC21"],"xy5-22":["Slugma","22","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Slugma-PRC22"],"xy5-23":["Magcargo","23","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Magcargo-PRC23"],"xy5-24":["Magcargo","24","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Magcargo-PRC24"],"xy5-25":["Torchic","25","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Torchic-PRC25"],"xy5-26":["Torchic","26","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Torchic-PRC26"],"xy5-27":["Combusken","27","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Combusken-PRC27"],"xy5-28":["Blaziken","28","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Blaziken-PRC28"],"xy5-29":["Camerupt EX","29","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Camerupt-EX-PRC29"],"xy5-30":["Horsea","30","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Horsea-PRC30"],"xy5-31":["Seadra","31","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Seadra-PRC31"],"xy5-32":["Staryu","32","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Staryu-PRC32"],"xy5-33":["Mudkip","33","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Mudkip-PRC33"],"xy5-34":["Marshtomp","34","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Marshtomp-PRC34"],"xy5-35":["Swampert","35","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Swampert-PRC35"],"xy5-36":["Swampert","36","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Swampert-PRC36"],"xy5-37":["Ludicolo","37","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Ludicolo-PRC37"],"xy5-38":["Wailord EX","38","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Wailord-EX-PRC38"],"xy5-39":["Barboach","39","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Barboach-PRC39"],"xy5-40":["Whiscash","40","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Whiscash-PRC40"],"xy5-41":["Whiscash","41","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Whiscash-PRC41"],"xy5-42":["Corphish","42","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Corphish-PRC42"],"xy5-43":["Feebas","43","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Feebas-PRC43"],"xy5-44":["Milotic","44","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Milotic-PRC44"],"xy5-45":["Spheal","45","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Spheal-PRC45"],"xy5-46":["Spheal","46","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Spheal-PRC46"],"xy5-47":["Sealeo","47","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Sealeo-PRC47"],"xy5-48":["Walrein","48","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Walrein-PRC48"],"xy5-49":["Clamperl","49","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Clamperl-PRC49"],"xy5-50":["Huntail","50","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Huntail-PRC50"],"xy5-51":["Gorebyss","51","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Gorebyss-PRC51"],"xy5-52":["Gorebyss","52","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Gorebyss-PRC52"],"xy5-53":["Kyogre","53","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Kyogre-PRC53"],"xy5-54":["Kyogre EX","54","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Kyogre-EX-V1-PRC54"],"xy5-56":["Manaphy","56","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Manaphy-PRC56"],"xy5-57":["Chinchou","57","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Chinchou-PRC57"],"xy5-58":["Lanturn","58","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Lanturn-PRC58"],"xy5-59":["Electrike","59","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Electrike-PRC59"],"xy5-60":["Electrike","60","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Electrike-PRC60"],"xy5-61":["Manectric","61","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Manectric-PRC61"],"xy5-62":["Tynamo","62","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Tynamo-PRC62"],"xy5-63":["Eelektrik","63","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Eelektrik-PRC63"],"xy5-64":["Eelektrik","64","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Eelektrik-PRC64"],"xy5-65":["Eelektross","65","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Eelektross-PRC65"],"xy5-66":["Nidoran♀","66","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Nidoran-PRC66"],"xy5-67":["Nidorina","67","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Nidorina-PRC67"],"xy5-68":["Nidoqueen","68","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Nidoqueen-PRC68"],"xy5-69":["Nidoqueen","69","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Nidoqueen-PRC69"],"xy5-70":["Tentacool","70","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Tentacool-PRC70"],"xy5-71":["Tentacool","71","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Tentacool-PRC71"],"xy5-72":["Tentacruel","72","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Tentacruel-PRC72"],"xy5-73":["Starmie","73","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Starmie-PRC73"],"xy5-74":["Rhyhorn","74","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Rhyhorn-PRC74"],"xy5-75":["Rhydon","75","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Rhydon-PRC75"],"xy5-76":["Rhyperior","76","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Rhyperior-PRC76"],"xy5-77":["Rhyperior","77","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Rhyperior-PRC77"],"xy5-78":["Nosepass","78","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Nosepass-PRC78"],"xy5-79":["Meditite","79","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Meditite-PRC79"],"xy5-80":["Medicham","80","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Medicham-PRC80"],"xy5-81":["Medicham","81","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Medicham-PRC81"],"xy5-82":["Trapinch","82","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Trapinch-PRC82"],"xy5-83":["Solrock","83","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Solrock-PRC83"],"xy5-84":["Groudon","84","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Groudon-PRC84"],"xy5-85":["Groudon EX","85","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Groudon-EX-PRC85"],"xy5-87":["Hippopotas","87","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Hippopotas-PRC87"],"xy5-88":["Hippowdon","88","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Hippowdon-PRC88"],"xy5-89":["Drilbur","89","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Drilbur-PRC89"],"xy5-90":["Diggersby","90","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Diggersby-PRC90"],"xy5-91":["Sharpedo EX","91","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Sharpedo-EX-PRC91"],"xy5-92":["Crawdaunt","92","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Crawdaunt-PRC92"],"xy5-93":["Aggron EX","93","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Aggron-EX-V1-PRC93"],"xy5-94":["M Aggron EX","94","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/MAggron-EX-PRC94"],"xy5-95":["Probopass","95","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Probopass-PRC95"],"xy5-96":["Excadrill","96","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Excadrill-PRC96"],"xy5-97":["Excadrill","97","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Excadrill-PRC97"],"xy5-98":["Honedge","98","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Honedge-PRC98"],"xy5-99":["Doublade","99","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Doublade-PRC99"],"xy5-100":["Aegislash","100","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Aegislash-PRC100"],"xy5-101":["Mr. Mime","101","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Mr-Mime-PRC101"],"xy5-102":["Marill","102","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Marill-PRC102"],"xy5-103":["Azumarill","103","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Azumarill-PRC103"],"xy5-104":["Azumarill","104","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Azumarill-PRC104"],"xy5-105":["Gardevoir EX","105","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Gardevoir-EX-PRC105"],"xy5-106":["M Gardevoir EX","106","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/MGardevoir-EX-PRC106"],"xy5-107":["Kingdra","107","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Kingdra-PRC107"],"xy5-108":["Kingdra","108","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Kingdra-PRC108"],"xy5-109":["Vibrava","109","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Vibrava-PRC109"],"xy5-110":["Flygon","110","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Flygon-PRC110"],"xy5-111":["Zigzagoon","111","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Zigzagoon-PRC111"],"xy5-112":["Linoone","112","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Linoone-PRC112"],"xy5-113":["Skitty","113","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Skitty-PRC113"],"xy5-114":["Delcatty","114","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Delcatty-PRC114"],"xy5-115":["Spinda","115","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Spinda-PRC115"],"xy5-116":["Bidoof","116","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Bidoof-PRC116"],"xy5-117":["Bidoof","117","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Bidoof-PRC117"],"xy5-118":["Bibarel","118","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Bibarel-PRC118"],"xy5-119":["Bouffalant","119","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Bouffalant-PRC119"],"xy5-120":["Bunnelby","120","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Bunnelby-PRC120"],"xy5-121":["Bunnelby","121","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Bunnelby-PRC121"],"xy5-122":["Acro Bike","122","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Acro-Bike-PRC122"],"xy5-123":["Aggron Spirit Link","123","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Aggron-Spirit-Link-PRC123"],"xy5-124":["Archie's Ace in the Hole","124","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Archies-Ace-in-the-Hole-PRC124"],"xy5-125":["Dive Ball","125","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Dive-Ball-PRC125"],"xy5-126":["Energy Retrieval","126","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Energy-Retrieval-PRC126"],"xy5-127":["Escape Rope","127","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Escape-Rope-PRC127"],"xy5-128":["Exp. Share","128","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Exp-Share-PRC128"],"xy5-129":["Fresh Water Set","129","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Fresh-Water-Set-PRC129"],"xy5-130":["Gardevoir Spirit Link","130","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Gardevoir-Spirit-Link-PRC130"],"xy5-131":["Groudon Spirit Link","131","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Groudon-Spirit-Link-PRC131"],"xy5-132":["Kyogre Spirit Link","132","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Kyogre-Spirit-Link-PRC132"],"xy5-133":["Maxie's Hidden Ball Trick","133","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Maxies-Hidden-Ball-Trick-PRC133"],"xy5-134":["Professor Birch's Observations","134","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Professor-Birchs-Observations-PRC134"],"xy5-135":["Rare Candy","135","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Rare-Candy-PRC135"],"xy5-136":["Repeat Ball","136","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Repeat-Ball-PRC136"],"xy5-137":["Rough Seas","137","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Rough-Seas-PRC137"],"xy5-138":["Scorched Earth","138","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Scorched-Earth-PRC138"],"xy5-139":["Shrine of Memories","139","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Shrine-of-Memories-PRC139"],"xy5-140":["Silent Lab","140","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Silent-Lab-PRC140"],"xy5-141":["Teammates","141","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Teammates-PRC141"],"xy5-142":["Weakness Policy","142","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Weakness-Policy-PRC142"],"xy5-143":["Shield Energy","143","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Shield-Energy-PRC143"],"xy5-144":["Wonder Energy","144","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Wonder-Energy-PRC144"],"xy5-145":["Trevenant EX","145","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Trevenant-EX-PRC145"],"xy5-146":["Camerupt EX","146","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Camerupt-EX-PRC146"],"xy5-147":["Wailord EX","147","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Wailord-EX-PRC147"],"xy5-148":["Kyogre EX","148","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Kyogre-EX-V2-PRC148"],"xy5-149":["Primal Kyogre EX","149","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Primal-Kyogre-EX-V2-PRC149"],"xy5-150":["Groudon EX","150","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Groudon-EX-PRC150"],"xy5-151":["Primal Groudon EX","151","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Primal-Groudon-EX-V2-PRC151"],"xy5-152":["Sharpedo EX","152","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Sharpedo-EX-PRC152"],"xy5-153":["Aggron EX","153","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Aggron-EX-V2-PRC153"],"xy5-154":["M Aggron EX","154","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/MAggron-EX-PRC154"],"xy5-155":["Gardevoir EX","155","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Gardevoir-EX-PRC155"],"xy5-156":["M Gardevoir EX","156","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/MGardevoir-EX-PRC156"],"xy5-157":["Archie's Ace in the Hole","157","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Archies-Ace-in-the-Hole-PRC157"],"xy5-158":["Maxie's Hidden Ball Trick","158","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Maxies-Hidden-Ball-Trick-PRC158"],"xy5-159":["Professor Birch's Observations","159","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Professor-Birchs-Observations-PRC159"],"xy5-160":["Teammates","160","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Teammates-PRC160"],"xy5-161":["Dive Ball","161","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Dive-Ball-PRC161"],"xy5-162":["Enhanced Hammer","162","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Enhanced-Hammer-PRC162"],"xy5-163":["Switch","163","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Switch-PRC163"],"xy5-164":["Weakness Policy","164","https://www.cardmarket.com/en/Pokemon/Products/Singles/Primal-Clash/Weakness-Policy-PRC164"]});
  const primalCandidatePaths=new Set(Object.values(primalCandidates).map(r=>new URL(r[2]).pathname));
  function candidateUrl(url){try{const u=new URL(url);return u.origin==='https://www.cardmarket.com'&&primalCandidatePaths.has(u.pathname);}catch{return false;}}
  function candidateRoute(input={}){
    if(!consistentIdentity(input))return null;
    const card={...input,source_id:input.source_id||input.sourceId,source_set_id:input.source_set_id||input.sourceSetId},row=primalCandidates[card.source_id];
    if(!row||card.language!=='EN'||card.source_set_id!=='xy5'||String(card.number)!==row[1]||normalize(card.name)!==normalize(row[0]))return null;
    if([card.set_name,card.setName,card.set].filter(Boolean).some(v=>!['primal clash','tcgdex en xy5'].includes(normalize(v))))return null;
    const edition=String(card.edition||'AUTO').toUpperCase(),variant=String(card.variant||'NORMAL').toUpperCase();
    // No evidence for special finishes: keep their existing search fallback.
    if(!['AUTO','UNLIMITED'].includes(edition)||variant!=='NORMAL'||card.foil)return null;
    if(!['NM','EX','GD','PL','PO'].includes(String(card.condition||'NM').toUpperCase()))return null;
    const url=new URL(offerUrl(row[2],card));url.searchParams.set('isReverseHolo','N');if(edition==='UNLIMITED')url.searchParams.set('isFirstEd','N');
    return {url:url.href,exact:false,confirmed:false,verified:false,candidate:true,kind:'V201_CANDIDATE',
      evidence:'third-party historical listing-page extraction',sourceGitBlob:'721c12ffacb18995c86c807469c895a8cc8a36f3',
      identity:{source_id:card.source_id,source_set_id:'xy5',name:row[0],number:row[1],set:'Primal Clash',language:'EN'},
      note:'Historische kandidaatlink · niet onafhankelijk geverifieerd. Controleer kaart, set, nummer en uitvoering. Conditie is een minimum.'};
  }
  function safeRoute(input={},jpRoute){
    const consistentInput=consistentIdentity(input);
    const card={...input,source_id:input.source_id||input.sourceId,source_set_id:input.source_set_id||input.sourceSetId,set_name:input.set_name||input.setName};
    if(card.language==='JP')return jpRoute?jpRoute(card):{url:'',exact:false,kind:'UNAVAILABLE'};
    const name=String(card.name||'').trim();
    if(!name)return {url:'',exact:false,kind:'UNAVAILABLE'};
    const confirmed=consistentInput&&confirmedRoute(card);if(confirmed)return {...confirmed,kind:'EXACT'};
    const curated=consistentInput&&curatedRoute(card);if(curated)return curated;
    const number=String(card.number||''),sourceSet=card.source_id?.slice(0,card.source_id.lastIndexOf('-'));
    const setId=card.source_set_id||sourceSet||Object.keys(searchSets).find(id=>searchSets[id].slice(1).some(label=>normalize(label)===normalize(card.set_name||card.set)));
    const set=searchSets[setId];
    const consistent=card.language==='EN'&&set&&/^(?:\d+|H\d+)$/i.test(number)&&
      (!card.source_id||card.source_id===setId+'-'+number)&&
      (!card.set_name||set.slice(1).some(label=>normalize(label)===normalize(card.set_name)));
    if(consistent&&consistentInput){
      const exact=cardmarketRoute({...card,source_set_id:setId,set_name:set[1]});
      const variant=String(card.variant||'').toUpperCase(),edition=String(card.edition||'').toUpperCase();
      if(exact.exact&&(exact.confirmed||(!variant&&!edition)))return {...exact,kind:'EXACT'};
    }
    if(consistentInput){const candidate=candidateRoute(card);if(candidate)return candidate;}
    const knownSet=Object.keys(curatedSets).find(key=>curatedSets[key].includes(setId));
    const label=curatedLabels[knownSet]?.label;
    const searchName=typeof cleanCardmarketName==='function'?cleanCardmarketName(name,number):name;
    // Cardmarket does not reliably interpret set labels/codes and collector numbers as search terms.
    const query=searchName;
    const url=new URL(searchLink(query));
    // HOLOKEEP_V200_TARGETED_CARDMARKET_SEARCH
    // Search is NOT proof of an exact product. Cardmarket itself documents
    // searches such as "Charizard bs4" (collector set code + number).
    // Every mapping below is explicit; source IDs are not Cardmarket codes.
    // Unknown series use name + number; conflicting identities use name only.
    const v200TargetedSearch = (()=>{
      const clean=typeof cleanCardmarketName==='function'
        ?cleanCardmarketName(name,number):name;
      const plain=String(clean||name||'').trim();
      const id=String(card.source_id||card.sourceId||'');
      const sid=String(card.source_set_id||card.sourceSetId||setId||'');
      const n=String(number||'').trim();
      const i=id.lastIndexOf('-');
      if(card.language!=='EN'||!plain||!id||!sid||i<1||
        id.slice(0,i)!==sid||
        id.slice(i+1).replace(/^0+(?=\d)/,'')!==n.replace(/^0+(?=\d)/,'')||
        !/^(?:[A-Za-z]{0,4}\d+[A-Za-z]?|\d+[A-Za-z]?)$/.test(n))return plain;
      // Small independently reviewed code allowlist. Never infer codes from
      // TCGdex set IDs or an old Cardmarket majority-vote heuristic.
      const known={
        base1:['BS',['Base Set']],basep:['WP',['Wizards Black Star Promos','WOTC Promo']],base2:['JU',['Jungle']],
        base3:['FO',['Fossil']],base4:['B2',['Base Set 2']],
        base5:['TR',['Team Rocket']],
        gym1:['G1',['Gym Heroes']],gym2:['G2',['Gym Challenge']],
        neo1:['N1',['Neo Genesis']],neo2:['N2',['Neo Discovery']],
        neo3:['N3',['Neo Revelation']],neo4:['N4',['Neo Destiny']],
        ecard1:['EX',['Expedition Base Set']],
        ecard2:['AQ',['Aquapolis']],ecard3:['SK',['Skyridge']],
        ex1:['RS',['Ruby & Sapphire','EX Ruby & Sapphire']],
        ex2:['SS',['Sandstorm','EX Sandstorm']],
        ex3:['DR',['Dragon','EX Dragon']],
        ex4:['MA',['Team Magma vs Team Aqua','EX Team Magma vs Team Aqua']],
        ex5:['HL',['Hidden Legends','EX Hidden Legends']],
        xy4:['PHF',['Phantom Forces']],
        me02:['PFL',['Phantasmal Flames']]
      };
      const entry=known[sid];
      const normalized=v=>String(v||'').normalize('NFKC').toLowerCase()
        .replace(/[^a-z0-9]+/g,' ').trim();
      const supplied=[card.set_name,card.setName]
        .filter(Boolean);
      // A set mismatch must never select a misleading targeted code.
      if(entry&&supplied.some(label=>!entry[1].some(x=>normalized(x)===normalized(label))))return plain;
      // Conflicting set metadata is not silently normalized away.
      if(card.set&&String(card.set).startsWith('TCGDEX EN ')&&
        String(card.set)!=='TCGDEX EN '+sid)return plain;
      const needle=entry?entry[0]+n:n;
      return plain+' '+needle.toLowerCase();
    })();
    url.searchParams.set('searchString',v200TargetedSearch);
    // END_HOLOKEEP_V200_TARGETED_CARDMARKET_SEARCH
    const conditions={M:1,MT:1,MINT:1,NM:2,EX:3,GD:4,LP:5,PL:6,PO:7};
    if(card.language==='EN')url.searchParams.set('language','1');
    const condition=conditions[String(card.condition||'NM').toUpperCase()];
    if(condition)url.searchParams.set('minCondition',condition);
    if(card.edition==='1ST')url.searchParams.set('isFirstEd','Y');
    if(card.edition==='UNLIMITED')url.searchParams.set('isFirstEd','N');
    if(['REVERSE','REVERSE_HOLO','STAMPED'].includes(card.variant))url.searchParams.set('isReverseHolo','Y');
    else if(card.variant==='NORMAL')url.searchParams.set('isReverseHolo','N');
    const identity={name,number,set:card.set_name||label||card.set||set?.[1]||'',source_id:card.source_id||'',source_set_id:setId||'',language:card.language||''};
    return {url:url.href,exact:false,kind:'BROAD_SEARCH',identity,note:'Exacte link niet geverifieerd · controleer '+[identity.set,number&&'#'+number,card.edition&&card.edition!=='AUTO'?card.edition:'',card.variant||'uitvoering'].filter(Boolean).join(' · ')};
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
    if(consistentIdentity(card)&&card.language==='EN'&&card.source_id===card.source_set_id+'-'+card.number){
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
      const expansion=reviewedExpansions[card.source_set_id];
      if(v203RejectedOwners[card.source_id]===id)continue;
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
      // Old IDs remain candidates only within an explicitly reviewed expansion.
      // A majority of old mappings cannot establish an independent set identity.
      const row=legacyCatalog?.[card.source_id],p=index.rows[row?.product];
      if(row&&row.id===card.source_id&&row.set?.id===card.source_set_id&&
        normalize(row.name)===normalize(card.name)&&normalizedNumber(row.number)===normalizedNumber(card.number)&&
        Number.isSafeInteger(row.product)&&row.product>0&&Array.isArray(p)&&
        typeof p[1]==='string'&&normalize(p[1].split(' [')[0])===normalize(card.name)){
        if(reviewedExpansions[card.source_set_id]===p[0])choices.set(row.product,{id:row.product,
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
  return Object.freeze({create,cards,normalize,artwork,cardmarketRoute,cardmarketOptions,offerUrl,ambiguousLegacy,confirmedRoute,cardmarketPrintChoices,candidateRoute,candidateUrl,safeRoute,TTL});
});
