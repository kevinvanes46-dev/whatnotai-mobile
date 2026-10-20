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

test('NORMAL removes stale Reverse Holo filter',()=>{
  const filter=load();

  const url=new URL(filter(
    'https://www.cardmarket.com/en/Pokemon/Products/Singles/EX-Deoxys/Rayquaza-DX22?language=1&isReverseHolo=Y',
    false
  ));

  assert.equal(url.searchParams.get('language'),'1');
  assert.equal(url.searchParams.get('isReverseHolo'),null);
});

test('non Cardmarket URL remains untouched',()=>{
  const filter=load();

  assert.equal(
    filter('https://example.com/test?isReverseHolo=Y',true),
    'https://example.com/test?isReverseHolo=Y'
  );
});