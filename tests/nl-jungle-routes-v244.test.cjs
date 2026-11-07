'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('../nl-jungle-v242.js');

const BASE = 'https://www.cardmarket.com/en/Pokemon/Products/Singles/Jungle/';
const NAMES = {1: 'Clefable', 2: 'Electrode', 3: 'Flareon', 4: 'Jolteon', 5: 'Kangaskhan', 6: 'Mr. Mime',
  7: 'Nidoqueen', 8: 'Pidgeot', 9: 'Pinsir', 10: 'Scyther', 11: 'Snorlax', 12: 'Vaporeon', 13: 'Venomoth',
  14: 'Victreebel', 15: 'Vileplume', 16: 'Wigglytuff', 17: 'Clefable', 18: 'Electrode', 19: 'Flareon',
  52: 'Exeggcute'};
const SLUGS = {1: 'Clefable-V1-JU1', 2: 'Electrode-V1-JU2', 3: 'Flareon-V1-JU3', 4: 'Jolteon-V1-JU4',
  5: 'Kangaskhan-V1-JU5', 6: 'Mr-Mime-V1-JU6', 7: 'Nidoqueen-V1-JU7', 8: 'Pidgeot-V1-JU8', 9: 'Pinsir-V1-JU9',
  10: 'Scyther-V1-JU10', 11: 'Snorlax-V1-JU11', 12: 'Vaporeon-V1-JU12', 13: 'Venomoth-V1-JU13',
  14: 'Victreebel-V1-JU14', 15: 'Vileplume-V1-JU15', 16: 'Wigglytuff-V1-JU16', 17: 'Clefable-V2-JU17',
  18: 'Electrode-V2-JU18', 19: 'Flareon-V2-JU19', 52: 'Exeggcute-JU52'};
const card = (n, name = NAMES[n]) => ({source_id: 'base2-' + n, source_set_id: 'base2', number: String(n), name});

test('live-verified Jungle cards 1-19 and 52 get exact pages for NL and EN', () => {
  for (const n of Object.keys(SLUGS)) {
    const nl = new URL(api.routeFor(card(n), {condition: 'NM'}).url);
    const en = new URL(api.englishRouteFor(card(n), {condition: 'NM'}).url);
    assert.equal(nl.origin + nl.pathname, BASE + SLUGS[n]);
    assert.equal(en.origin + en.pathname, BASE + SLUGS[n]);
    assert.equal(nl.searchParams.get('language'), '12');
    assert.equal(en.searchParams.get('language'), '1');
    assert.equal(api.routeFor(card(n), {}).verified, 'live');
    assert.equal(api.routeFor(card(n), {}).exact, true);
  }
});

test('earlier collector-confirmed pages are preserved', () => {
  const expected = {7: 'Nidoqueen-V1-JU7', 12: 'Vaporeon-V1-JU12', 13: 'Venomoth-V1-JU13', 26: 'Scyther-V2-JU26',
    49: 'Bellsprout-JU49', 51: 'Eevee-JU51', 56: 'Meowth-V1-JU56', 60: 'Pikachu-JU60'};
  const names = {26: 'Scyther', 49: 'Bellsprout', 51: 'Eevee', 56: 'Meowth', 60: 'Pikachu'};
  for (const [n, slug] of Object.entries(expected)) {
    const r = api.routeFor(card(n, NAMES[n] || names[n]), {});
    assert.equal(new URL(r.url).pathname, '/en/Pokemon/Products/Singles/Jungle/' + slug);
    assert.equal(r.exact, true);
  }
  assert.equal(api.routeFor(card(26, 'Scyther'), {}).verified, 'collector');
  for (const n of [7, 12, 13]) assert.equal(api.CONFIRMED[n][1], api.LIVE[n][1]);
});

test('holo (1-16) and non-holo (17-19) duplicates never share a page', () => {
  for (const [a, b] of [[1, 17], [2, 18], [3, 19]]) {
    assert.equal(NAMES[a], NAMES[b]);
    assert.notEqual(api.routeFor(card(a), {}).url.split('?')[0], api.routeFor(card(b), {}).url.split('?')[0]);
    assert.match(api.routeFor(card(a), {}).url, /-V1-JU\d+\?/);
    assert.match(api.routeFor(card(b), {}).url, /-V2-JU\d+\?/);
  }
});

test('NM=2 and EX=3, and reverse-holo is never added', () => {
  assert.equal(new URL(api.routeFor(card(52), {condition: 'NM'}).url).searchParams.get('minCondition'), '2');
  assert.equal(new URL(api.routeFor(card(52), {condition: 'EX'}).url).searchParams.get('minCondition'), '3');
  assert.equal(new URL(api.englishRouteFor(card(52), {condition: 'EX'}).url).searchParams.get('minCondition'), '3');
  assert.equal(new URL(api.routeFor(card(52), {}).url).searchParams.get('minCondition'), '2');
  assert.equal(new URL(api.routeFor(card(52), {edition: 'UNLIMITED'}).url).searchParams.get('isReverseHolo'), null);
});

test('wrong set, source id, number or name never yields a Jungle link', () => {
  const bad = [
    {...card(52), source_set_id: 'base1'},
    {...card(52), source_id: 'base1-52'},
    {...card(60, 'Pikachu'), source_id: 'base1-60', source_set_id: 'base1'},
    {...card(52), source_id: 'base2-51'},
    card(52, 'Wrong Name'),
    card(1, 'Electrode'),
    card(17, 'Flareon'),
    {...card(52), number: '65'},
    {...card(52), number: '0'},
    {...card(52), name: ''},
    null
  ];
  for (const c of bad) {
    for (const r of [api.routeFor(c, {}), api.englishRouteFor(c, {})]) {
      assert.equal(r.url, '', JSON.stringify(c));
      assert.equal(r.exact, false);
    }
  }
});

test('cards without live verification are labelled as search, never exact', () => {
  const unverified = [20, 21, 27, 33, 64];
  const names = {20: 'Jolteon', 21: 'Kangaskhan', 27: 'Snorlax', 33: 'Butterfree', 64: 'Poké Ball'};
  for (const n of unverified) {
    const r = api.routeFor(card(n, names[n]), {});
    assert.equal(r.exact, false);
    assert.equal(r.verified, '');
    assert.equal(new URL(r.url).pathname, '/en/Pokemon/Products/Search');
    assert.equal(new URL(r.url).searchParams.get('language'), '12');
  }
});

// Independent copy of the Jungle (base2) catalogue as served by the EN library, number 1-64.
const JUNGLE = ['Clefable', 'Electrode', 'Flareon', 'Jolteon', 'Kangaskhan', 'Mr. Mime', 'Nidoqueen', 'Pidgeot',
  'Pinsir', 'Scyther', 'Snorlax', 'Vaporeon', 'Venomoth', 'Victreebel', 'Vileplume', 'Wigglytuff', 'Clefable',
  'Electrode', 'Flareon', 'Jolteon', 'Kangaskhan', 'Mr. Mime', 'Nidoqueen', 'Pidgeot', 'Pinsir', 'Scyther',
  'Snorlax', 'Vaporeon', 'Venomoth', 'Victreebel', 'Vileplume', 'Wigglytuff', 'Butterfree', 'Dodrio',
  'Exeggutor', 'Fearow', 'Gloom', 'Lickitung', 'Marowak', 'Nidorina', 'Parasect', 'Persian', 'Primeape',
  'Rapidash', 'Rhydon', 'Seaking', 'Tauros', 'Weepinbell', 'Bellsprout', 'Cubone', 'Eevee', 'Exeggcute',
  'Goldeen', 'Jigglypuff', 'Mankey', 'Meowth', 'Nidoran♀', 'Oddish', 'Paras', 'Pikachu', 'Rhyhorn', 'Spearow',
  'Venonat', 'Poké Ball'];

test('catalogue has exactly 64 Jungle identities matching the independent copy', () => {
  assert.equal(JUNGLE.length, 64);
  assert.deepEqual([...api.CATALOG], JUNGLE);
});

test('all 64 cards: correct identity gives a Jungle-only route for NL and EN', () => {
  JUNGLE.forEach((name, i) => {
    const n = i + 1, c = card(n, name);
    for (const [fn, lang] of [['routeFor', '12'], ['englishRouteFor', '1']]) {
      for (const [cond, min] of [['NM', '2'], ['EX', '3']]) {
        const r = api[fn](c, {condition: cond});
        const u = new URL(r.url);
        assert.equal(u.origin, 'https://www.cardmarket.com', name);
        assert.ok(u.pathname.startsWith('/en/Pokemon/Products/Singles/Jungle/') ||
          (u.pathname === '/en/Pokemon/Products/Search' && u.searchParams.get('searchString') === name + ' JU' + n), '#' + n);
        assert.equal(u.searchParams.get('language'), lang);
        assert.equal(u.searchParams.get('minCondition'), min);
        assert.equal(r.exact, Boolean(api.LIVE[n] || api.CONFIRMED[n]), '#' + n);
      }
    }
  });
});

test('all 64 cards: wrong name, number, set or source_id never yields a link', () => {
  JUNGLE.forEach((name, i) => {
    const n = i + 1;
    const other = JUNGLE[(i + 7) % 64] === name ? 'Wrong Card' : JUNGLE[(i + 7) % 64];
    const bad = [
      card(n, other), card(n, 'Wrong Name'), card(n, ''),
      {...card(n, name), source_set_id: 'base1'}, {...card(n, name), source_set_id: 'base3'},
      {...card(n, name), source_id: 'base1-' + n}, {...card(n, name), source_id: 'base2-' + (n % 64 + 1)},
      {...card(n, name), source_id: undefined}, {...card(n, name), number: String(n % 64 + 1)},
      {...card(n, name), number: '0'}, {...card(n, name), number: '65'}
    ];
    for (const c of bad) {
      for (const fn of ['routeFor', 'englishRouteFor']) {
        const r = api[fn](c, {});
        assert.equal(r.url, '', `#${n} ${fn} ${JSON.stringify(c)}`);
        assert.equal(r.exact, false);
      }
    }
  });
});

test('explicit wrong names at #20, #33 and #64 are refused, even for search-only cards', () => {
  for (const [n, wrong] of [[20, 'Flareon'], [20, 'Jolteon X'], [33, 'Dodrio'], [33, 'Butterfree EX'], [64, 'Poke Ball Deluxe'], [64, 'Oddish']]) {
    for (const fn of ['routeFor', 'englishRouteFor']) assert.equal(api[fn](card(n, wrong), {}).url, '', n + ' ' + wrong);
  }
  assert.notEqual(api.routeFor(card(64, 'Poke Ball'), {}).url, '');
  assert.notEqual(api.routeFor(card(20, 'Jolteon'), {}).url, '');
  assert.notEqual(api.routeFor(card(33, 'butterfree'), {}).url, '');
});
