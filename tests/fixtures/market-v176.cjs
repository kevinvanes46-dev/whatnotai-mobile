'use strict';
// Frozen contract fixture. Synthetic prices are not a catalog coverage estimate.
const now=Date.parse('2026-10-10T12:00:00Z');
const item={uid:'market-test',image:'https://assets.tcgdex.net/en/base/base1/4',sourceId:'base1-4',source_set_id:'base1',name:'Charizard',number:'4',set:'BASE',setName:'Base Set',language:'EN',variant:'NORMAL',edition:'AUTO',condition:'EX',qty:2,paidEach:7,addedAt:1,listType:'OWNED',price:9,priceUpdated:1,priceSource:'CM trend',future:{keep:['all',1]}};
const card={id:'base1-4',localId:'4',name:'Charizard',set:{id:'base1'},variants:{normal:false,holo:true,reverse:false,firstEdition:true},variants_detailed:[{type:'holo'}],pricing:{cardmarket:{unit:'EUR',idProduct:273699,updated:'2026-10-10T08:00:00Z','trend-holo':25,'avg7-holo':24,'avg30-holo':23}}};
module.exports={now,item,card};
