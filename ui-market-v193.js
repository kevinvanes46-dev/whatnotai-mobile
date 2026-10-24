'use strict';
// Local-only coverage summary: never transmits collection identifiers.
(()=>{
  const section=document.createElement('section');section.className='holoSets';
  const title=document.createElement('h3');title.textContent='Officiële Cardmarket-marktindicatie';
  const note=document.createElement('p');note.textContent='Alleen afzonderlijk gecontroleerde kaarten uit deze sessie. Algemene producttrend; conditie, taal en editie niet verwerkt. Open een kaart voor broncontrole.';
  const button=document.createElement('button');button.type='button';button.textContent='Toon gecontroleerde prijsdekking';
  const result=document.createElement('p');result.setAttribute('role','status');result.id='officialPortfolio193';
  section.append(title,note,button,result);document.querySelector('[data-view="collection"]').append(section);
  button.onclick=()=>{
    const items=window.cardscoutCollectionUI.items().filter(x=>x.listType==='OWNED');
    let total=0,covered=0;const dates=new Set();
    for(const item of items){const q=HoloKeepOfficialMarket.cached(item),shown=HoloKeepOfficialMarket.display(q);
      if(shown.value!=null&&Number.isSafeInteger(item.qty)&&item.qty>0){total+=shown.value*item.qty;covered++;dates.add(q.asOf);}
    }
    const unknown=items.length-covered,money=new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR'});
    result.textContent=covered?`${unknown?'Gedekt subtotaal':'Marktindicatie'}: ${money.format(total)} · ${covered}/${items.length} collectieregels gedekt · ${unknown} zonder waarde. Cardmarket · EUR · trend · ${[...dates].join(', ')}.`:
      `Geen marktindicatie · ${unknown}/${items.length} collectieregels zonder actuele gecontroleerde prijs in deze sessie.`;
  };
})();
