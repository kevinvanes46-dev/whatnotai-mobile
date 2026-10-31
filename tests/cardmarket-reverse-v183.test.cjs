'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('ui-v183-cardmarket.js','utf8');

function load(){
  const context={URL};
  context.window=context;

  vm.runInNewContext(code,context);

  return context.HoloDexCardmarketV183.cardmarketUrl;
}

test('STAMPED adds Reverse Holo and preserves existing Cardmarket filters',()=>{
  const filter=load();

  const url=new URL(filter(
    'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Dragon-Frontiers/Bagon-Delta-Species-DF43?language=1&minCondition=3',
    true
  ));

  assert.equal(url.searchParams.get('language'),'1');
  assert.equal(url.searchParams.get('minCondition'),'3');
  assert.equal(url.searchParams.get('isReverseHolo'),'Y');
});

test('explicit NORMAL replaces stale Reverse Holo filter with N',()=>{
  const filter=load();

  const url=new URL(filter(
    'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Deoxys/Rayquaza-DX22?language=1&isReverseHolo=Y',
    false
  ));

  assert.equal(url.searchParams.get('language'),'1');
  assert.equal(url.searchParams.get('isReverseHolo'),'N');
});

test('non Cardmarket URL remains untouched',()=>{
  const filter=load();

  assert.equal(
    filter('https://example.com/test?isReverseHolo=Y',true),
    'https://example.com/test?isReverseHolo=Y'
  );
});
test('unspecified print preserves routing for every supported condition',()=>{const filter=load();for(const min of ['2','3','4','6','7'])for(const value of [null,'N','Y']){const u=new URL('https://www.cardmarket.com/en/Pokemon/Products/Search?language=1&minCondition='+min+'&isFirstEd=N');if(value)u.searchParams.set('isReverseHolo',value);assert.equal(filter(u.href),u.href);for(const [selection,want] of [[false,'N'],[true,'Y']]){const out=new URL(filter(u.href,selection));assert.equal(out.searchParams.get('isReverseHolo'),want);assert.equal(out.searchParams.get('minCondition'),min);assert.equal(out.searchParams.get('language'),'1');assert.equal(out.searchParams.get('isFirstEd'),'N');}}});
