'use strict';
// HoloKeep v242: separate EN/NL Jungle links. Does not migrate or modify collection data.
(function initDutchJungle(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) {
    root.HoloKeepDutchJungle = api;
    api.mount(root);
  }
})(typeof window === 'object' ? window : globalThis, () => {
  const CARDMARKET = 'https://www.cardmarket.com/en/Pokemon/Products';
  const OWNED_KEY = 'holokeep_nl_jungle_beurs_v241';
  const CONDITION = Object.freeze({NM: '2', EX: '3', GD: '4', LP: '5', PL: '6', PO: '7'});
  // These eight exact Jungle pages were supplied by the collector.
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
  // Pages opened live on 2026-11-07 (HTTP 200, final URL unchanged, heading "<name> (JU <n>)",
  // only Dutch NM-or-better offers). Numbers 20-64 except the collector pages are not live verified.
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
  // Jungle (base2) identity per number, as served by the existing EN catalogue (library-v185 / TCGdex).
  const CATALOG = Object.freeze(['Clefable', 'Electrode', 'Flareon', 'Jolteon', 'Kangaskhan', 'Mr. Mime',
    'Nidoqueen', 'Pidgeot', 'Pinsir', 'Scyther', 'Snorlax', 'Vaporeon', 'Venomoth', 'Victreebel', 'Vileplume',
    'Wigglytuff', 'Clefable', 'Electrode', 'Flareon', 'Jolteon', 'Kangaskhan', 'Mr. Mime', 'Nidoqueen',
    'Pidgeot', 'Pinsir', 'Scyther', 'Snorlax', 'Vaporeon', 'Venomoth', 'Victreebel', 'Vileplume', 'Wigglytuff',
    'Butterfree', 'Dodrio', 'Exeggutor', 'Fearow', 'Gloom', 'Lickitung', 'Marowak', 'Nidorina', 'Parasect',
    'Persian', 'Primeape', 'Rapidash', 'Rhydon', 'Seaking', 'Tauros', 'Weepinbell', 'Bellsprout', 'Cubone',
    'Eevee', 'Exeggcute', 'Goldeen', 'Jigglypuff', 'Mankey', 'Meowth', 'Nidoran♀', 'Oddish', 'Paras', 'Pikachu',
    'Rhyhorn', 'Spearow', 'Venonat', 'Poké Ball']);
  const sameName = (a, b) => normalize(a) === normalize(b) &&
    ['♀', '♂'].every(sign => String(a).includes(sign) === String(b).includes(sign));
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const validNumber = n => /^[1-9]\d?$/.test(n) && Number(n) <= 64;

  function routeFor(card, options = {}) {
    return buildRoute(card, options, '12');
  }

  // Fails closed: wrong set, id or name never yields a Jungle link. Only the two tables
  // above may produce an exact page; everything else is a labelled, unverified search.
  function buildRoute(card, options, language) {
    const n = String(card?.number || ''), name = String(card?.name || '');
    if (!validNumber(n) || !name.trim()) return {url: '', exact: false, verified: ''};
    if (card.source_id !== 'base2-' + n || (card.source_set_id && card.source_set_id !== 'base2')) {
      return {url: '', exact: false, verified: ''};
    }
    if (!sameName(name, CATALOG[Number(n) - 1])) return {url: '', exact: false, verified: ''};
    const live = LIVE[n], confirmed = CONFIRMED[n], known = live || confirmed;
    if (known && !sameName(name, known[0])) return {url: '', exact: false, verified: ''};
    let url, exact = false, verified = '';
    if (known) {
      url = CARDMARKET + '/Singles/Jungle/' + known[1];
      exact = true;
      verified = live ? 'live' : 'collector';
    } else {
      url = CARDMARKET + '/Search?searchString=' + encodeURIComponent(name + ' JU' + n);
    }
    const result = new URL(url);
    result.searchParams.set('language', language);
    result.searchParams.set('minCondition', CONDITION[options.condition] || CONDITION.NM);
    if (options.edition === '1ST') result.searchParams.set('isFirstEd', 'Y');
    if (options.edition === 'UNLIMITED') result.searchParams.set('isFirstEd', 'N');
    return {url: result.href, exact, verified};
  }

  // The English route always remains distinct from the Dutch URL.
  function englishRouteFor(card, options = {}) {
    return buildRoute(card, options, '1');
  }

  function mount(root) {
    const doc = root.document;
    const toggle = doc.getElementById('libraryToggle');
    const host = doc.querySelector('.library185');
    if (!toggle || !host || doc.getElementById('nlJungleToggle')) return false;
    const el = (tag, cls, txt) => {
      const node = doc.createElement(tag);
      if (cls) node.className = cls;
      if (txt) node.textContent = txt;
      return node;
    };
    const style = el('style');
    style.textContent = `
      #nlJunglePanel{padding:16px;margin:12px 0;background:#101d25;color:#f1f5fa;border:1px solid #46636a;border-radius:16px}
      #nlJunglePanel h2{font-size:1.25rem;margin:0 0 6px}
      #nlJunglePanel p{color:#c5d6dd;margin:8px 0}
      #nlJunglePanel .nlJControls{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
      #nlJunglePanel input[type=search],#nlJunglePanel select{background:#1d3039;color:#fff;border:1px solid #68818a;border-radius:8px;padding:10px;min-width:0;max-width:100%;font:inherit}
      #nlJunglePanel input[type=search]{flex:1 1 170px}
      #nlJunglePanel .nlJGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,245px),1fr));gap:10px}
      #nlJunglePanel .nlJCard{display:flex;gap:10px;align-items:flex-start;background:#1b3037;border:1px solid #35555f;border-radius:12px;padding:10px}
      #nlJunglePanel .nlJCard img{width:65px;height:91px;object-fit:contain}
      #nlJunglePanel .nlJInfo{min-width:0;flex:1}
      #nlJunglePanel .nlJInfo strong,#nlJunglePanel .nlJInfo small{display:block}
      #nlJunglePanel .nlJInfo small{color:#c7d3dc;margin:3px 0 8px}
      #nlJunglePanel .nlJInfo a{display:inline-block;color:#93e6cf;font-weight:650;line-height:1.4;margin-top:7px}
      #nlJunglePanel .nlJInfo label{display:flex;align-items:center;gap:7px;font-size:.95rem}
      #nlJunglePanel .nlJInfo input{width:19px;height:19px;accent-color:#4bcbb2}
      #nlJungleToggle{margin-left:8px}
    `;
    doc.head.append(style);
    const button = el('button', '', '🇳🇱 Jungle beurslijst');
    button.type = 'button';
    button.id = 'nlJungleToggle';
    button.setAttribute('aria-expanded', 'false');
    toggle.after(button);
    const panel = el('section');
    panel.id = 'nlJunglePanel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Nederlandse Jungle beurschecklist');
    panel.append(el('h2', '', '🇳🇱 Jungle · 64 kaarten'));
    panel.append(el('p', '', 'NL (taalcode 12) en EN (taalcode 1) blijven allebei beschikbaar. Kaartnamen en afbeeldingen komen uit de bestaande EN-catalogus.'));
    panel.append(el('p', '', 'Let op: Cardmarket kan eigen opgeslagen filters toepassen nadat de pagina is geopend. Controleer daar de kaarttaal voordat je koopt.'));
    const info = el('p', '', 'Open deze lijst één keer online om Jungle te laden.');
    info.setAttribute('role', 'status');
    panel.append(info);
    const controls = el('div', 'nlJControls');
    const search = el('input');
    search.type = 'search';
    search.placeholder = 'Zoek naam of nummer';
    search.setAttribute('aria-label', 'Zoek binnen Nederlandse Jungle');
    const condition = el('select');
    condition.setAttribute('aria-label', 'Minimale kaartconditie');
    for (const value of Object.keys(CONDITION)) condition.add(new Option(value + ' of beter', value));
    const edition = el('select');
    edition.setAttribute('aria-label', 'Editie');
    for (const [value, label] of [['AUTO', 'Alle edities'], ['1ST', '1st Edition'], ['UNLIMITED', 'Unlimited']]) edition.add(new Option(label, value));
    const view = el('select');
    view.setAttribute('aria-label', 'Toon bezit of ontbrekende kaarten');
    for (const [value, label] of [['all', 'Alle kaarten'], ['missing', 'Ontbreekt'], ['owned', 'In bezit']]) view.add(new Option(label, value));
    controls.append(search, condition, edition, view);
    panel.append(controls);
    const grid = el('div', 'nlJGrid');
    panel.append(grid);
    panel.append(el('p', '', 'Beurschecklist wordt alleen op dit apparaat opgeslagen, los van Mijn collectie. Geen prijzen zonder verifieerbare bron.'));
    host.append(panel);

    let cards = [], loading = false;
    let owned;
    try {
      const source = JSON.parse(root.localStorage.getItem(OWNED_KEY) || '[]');
      owned = new Set(Array.isArray(source) ? source.map(String).filter(validNumber) : []);
    } catch { owned = new Set(); }
    const saveOwned = () => {
      try { root.localStorage.setItem(OWNED_KEY, JSON.stringify([...owned].sort((a, b) => Number(a) - Number(b)))); }
      catch { info.textContent = 'Opslaan op dit apparaat is niet beschikbaar.'; }
    };
    const render = () => {
      if (!cards.length) return;
      const q = normalize(search.value);
      const shown = cards.filter(c => (!q || normalize(c.name + ' ' + c.number + ' JU' + c.number).includes(q)) &&
        (view.value === 'all' || (view.value === 'owned') === owned.has(String(c.number))));
      info.textContent = owned.size + ' van 64 in bezit · ' + shown.length + ' zichtbaar' +
        (cards.length !== 64 ? ' · bron leverde slechts ' + cards.length + ' kaarten' : '');
      grid.replaceChildren();
      for (const c of shown) {
        const row = el('article', 'nlJCard');
        if (c.image) {
          const image = el('img');
          image.loading = 'lazy';
          image.alt = c.name;
          image.src = c.image + '/low.webp';
          image.onerror = () => image.remove();
          row.append(image);
        }
        const content = el('div', 'nlJInfo');
        content.append(el('strong', '', '#' + c.number + ' · ' + c.name));
        const route = routeFor(c, {condition: condition.value, edition: edition.value});
        const owner = el('label');
        const check = el('input');
        check.type = 'checkbox';
        check.checked = owned.has(String(c.number));
        check.onchange = () => {
          if (check.checked) owned.add(String(c.number));
          else owned.delete(String(c.number));
          saveOwned();
          render();
        };
        owner.append(check, doc.createTextNode('In bezit'));
        content.append(owner);
        const label = (flag, r) => flag + (r.exact ? ' · kaartpagina' : ' · zoekresultaten (niet live geverifieerd)');
        if (route.url) {
          const link = el('a', '', label('🇳🇱 NL', route));
          link.href = route.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          content.append(link);
        } else content.append(el('small', '', 'Geen betrouwbare Cardmarket-link voor deze kaart'));
        const englishRoute = englishRouteFor(c, {condition: condition.value, edition: edition.value});
        if (englishRoute.url) {
          const enLink = el('a', '', label('🇬🇧 EN', englishRoute));
          enLink.href = englishRoute.url;
          enLink.target = '_blank';
          enLink.rel = 'noopener noreferrer';
          enLink.style.marginLeft = '12px';
          content.append(enLink);
        }
        row.append(content);
        grid.append(row);
      }
    };
    for (const control of [search, condition, edition, view]) control.addEventListener(control === search ? 'input' : 'change', render);
    button.onclick = async () => {
      panel.hidden = !panel.hidden;
      button.setAttribute('aria-expanded', String(!panel.hidden));
      if (panel.hidden || cards.length || loading) return;
      const library = root.HoloDexLibraryUI?.library;
      if (!library) {
        info.textContent = 'De bibliotheek start nog op. Probeer het over een paar seconden opnieuw.';
        return;
      }
      loading = true;
      info.textContent = 'Jungle-kaarten laden…';
      try {
        const result = await library.loadSet('EN', 'base2');
        cards = (result.cards || []).filter(c => c.source_set_id === 'base2' && validNumber(String(c.number)) &&
          c.source_id === 'base2-' + c.number).sort((a, b) => Number(a.number) - Number(b.number));
        if (!cards.length) throw Error('Geen kaarten gevonden');
        render();
      } catch {
        info.textContent = 'Kan de set niet laden. Open de bibliotheek één keer met internet en probeer opnieuw.';
      } finally { loading = false; }
    };
    return true;
  }
  return Object.freeze({routeFor, englishRouteFor, mount, LIVE, CONFIRMED, CATALOG});
});
