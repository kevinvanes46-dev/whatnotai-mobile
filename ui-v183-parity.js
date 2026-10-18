'use strict';
(function(root){
  const document=root.document;
  if(!document)return;

  const panel=document.getElementById('homeComparisonPanel');
  if(!panel)return;

  const labels={
    '1W':'de afgelopen week',
    '1M':'de afgelopen maand',
    '3M':'de afgelopen 3 maanden',
    '1J':'het afgelopen jaar',
    'Alles':'de volledige periode'
  };

  const buttons=[...panel.querySelectorAll('.homeRanges button')];
  const note=panel.querySelector('.homeChartNote');
  const foot=panel.querySelector('small');

  let active='1M';

  const stage=document.createElement('div');
  stage.className='homeChartStage';
  stage.setAttribute('aria-label','Waardevergelijking');

  const grid=document.createElement('div');
  grid.className='homeChartGrid';
  grid.setAttribute('aria-hidden','true');

  const badge=document.createElement('span');
  badge.className='homeChartBadge';
  badge.textContent='Geen betrouwbare historie';

  const axis=document.createElement('div');
  axis.className='homeChartAxis';

  const from=document.createElement('span');
  from.className='homeChartFrom';

  const to=document.createElement('span');
  to.textContent='Nu';

  axis.append(from,to);

  if(note){
    note.before(stage);
    stage.append(grid,badge,note,axis);
  }

  function select(label){
    if(!labels[label])return;

    active=label;

    for(const button of buttons){
      const selected=button.textContent.trim()===label;
      button.disabled=false;
      button.dataset.range=button.textContent.trim();
      button.setAttribute('aria-pressed',selected?'true':'false');
    }

    from.textContent=label;

    if(note){
      note.textContent=
        `Voor ${labels[label]} zijn nog geen volledig vergelijkbare historische metingen beschikbaar.`;
    }
  }

  for(const button of buttons){
    button.disabled=false;
    button.type='button';

    button.addEventListener('click',()=>{
      select(button.textContent.trim());
    });
  }

  if(foot){
    foot.textContent=
      'De grafiek wordt pas getekend wanneer minimaal twee volledig vergelijkbare marktmetingen beschikbaar zijn. Er wordt geen historische waarde geschat.';
  }

  select(active);

  Object.defineProperty(root,'HoloDexComparisonV183',{
    value:Object.freeze({
      range:()=>active,
      select
    }),
    configurable:false,
    writable:false
  });
})(typeof window!=='undefined'?window:globalThis);