'use strict';
(function initDutchJungle(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) root.HoloKeepDutchJungle = api;
})(typeof window === 'object' ? window : globalThis, () => {
  const CARDMARKET = 'https://www.cardmarket.com/en/Pokemon/Products';
  const LEGACY_OWNED_KEY = 'holokeep_nl_jungle_beurs_v241';
  const CONDITION = Object.freeze({NM: '2', EX: '3', GD: '4', LP: '5', PL: '6', PO: '7'});
  const CONFIRMED = Object.freeze({
    '7': ['Nidoqueen', 'Nidoqueen-V1-JU7'],
    '12': ['Vaporeon', 'Vaporeon-V1-JU12'],
    '13': ['Venomoth', 'Venomoth-V1-JU13'],
    '26': ['Scyther', 'Scyther-V2-JU26'],
    '49': ['Bellsprout', 'Bellsprout-JU49'],
    '51': ['Eevee', 'Eevee-JU51'],
    '56': ['Meowth', 'Meowth-V1-JU56'],
    '60': ['Pikachu', 'Pikachu-JU60']
  });
  const LIVE = Object.freeze({
    '1': ['Clefable', 'Clefable-V1-JU1'], '2': ['Electrode', 'Electrode-V1-JU2'],
    '3': ['Flareon', 'Flareon-V1-JU3'], '4': ['Jolteon', 'Jolteon-V1-JU4'],
    '5': ['Kangaskhan', 'Kangaskhan-V1-JU5'], '6': ['Mr. Mime', 'Mr-Mime-V1-JU6'],
    '7': ['Nidoqueen', 'Nidoqueen-V1-JU7'], '8': ['Pidgeot', 'Pidgeot-V1-JU8'],
    '9': ['Pinsir', 'Pinsir-V1-JU9'], '10': ['Scyther', 'Scyther-V1-JU10'],
    '11': ['Snorlax', 'Snorlax-V1-JU11'], '12': ['Vaporeon', 'Vaporeon-V1-JU12'],
    '13': ['Venomoth', 'Venomoth-V1-JU13'], '14': ['Victreebel', 'Victreebel-V1-JU14'],
    '15': ['Vileplume', 'Vileplume-V1-JU15'], '16': ['Wigglytuff', 'Wigglytuff-V1-JU16'],
    '17': ['Clefable', 'Clefable-V2-JU17'], '18': ['Electrode', 'Electrode-V2-JU18'],
    '19': ['Flareon', 'Flareon-V2-JU19'], '52': ['Exeggcute', 'Exeggcute-JU52']
  });
  const CATALOG = Object.freeze(['Clefable', 'Electrode', 'Flareon', 'Jolteon', 'Kangaskhan', 'Mr. Mime',
    'Nidoqueen', 'Pidgeot', 'Pinsir', 'Scyther', 'Snorlax', 'Vaporeon', 'Venomoth', 'Victreebel', 'Vileplume',
    'Wigglytuff', 'Clefable', 'Electrode', 'Flareon', 'Jolteon', 'Kangaskhan', 'Mr. Mime', 'Nidoqueen',
    'Pidgeot', 'Pinsir', 'Scyther', 'Snorlax', 'Vaporeon', 'Venomoth', 'Victreebel', 'Vileplume', 'Wigglytuff',
    'Butterfree', 'Dodrio', 'Exeggutor', 'Fearow', 'Gloom', 'Lickitung', 'Marowak', 'Nidorina', 'Parasect',
    'Persian', 'Primeape', 'Rapidash', 'Rhydon', 'Seaking', 'Tauros', 'Weepinbell', 'Bellsprout', 'Cubone',
    'Eevee', 'Exeggcute', 'Goldeen', 'Jigglypuff', 'Mankey', 'Meowth', 'Nidoran♀', 'Oddish', 'Paras', 'Pikachu',
    'Rhyhorn', 'Spearow', 'Venonat', 'Poké Ball']);
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const sameName = (a, b) => normalize(a) === normalize(b) &&
    ['♀', '♂'].every(sign => String(a).includes(sign) === String(b).includes(sign));
  const validNumber = n => /^[1-9]\d?$/.test(n) && Number(n) <= 64;

  function buildRoute(card, options, language) {
    const n = String(card?.number || ''), name = String(card?.name || '');
    if (!validNumber(n) || !name.trim() || card.source_id !== 'base2-' + n ||
        (card.source_set_id && card.source_set_id !== 'base2') ||
        !sameName(name, CATALOG[Number(n) - 1])) return {url: '', exact: false, verified: ''};
    const live = LIVE[n], confirmed = CONFIRMED[n], known = live || confirmed;
    if (known && !sameName(name, known[0])) return {url: '', exact: false, verified: ''};
    const slug = known?.[1];
    const url = new URL(slug
      ? CARDMARKET + '/Singles/Jungle/' + slug
      : CARDMARKET + '/Search?searchString=' + encodeURIComponent(name + ' JU' + n));
    url.searchParams.set('language', language);
    url.searchParams.set('minCondition', CONDITION[options.condition] || CONDITION.NM);
    if (options.edition === '1ST') url.searchParams.set('isFirstEd', 'Y');
    if (options.edition === 'UNLIMITED') url.searchParams.set('isFirstEd', 'N');
    return {url: url.href, exact: Boolean(slug), verified: live ? 'live' : confirmed ? 'collector' : ''};
  }

  function routeFor(card, options = {}) {
    return buildRoute(card, options, '12');
  }

  function englishRouteFor(card, options = {}) {
    return buildRoute(card, options, '1');
  }

  return Object.freeze({routeFor, englishRouteFor, LIVE, CONFIRMED, CATALOG, LEGACY_OWNED_KEY});
});
