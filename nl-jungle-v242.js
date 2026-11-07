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
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const validNumber = n => /^[1-9]\d?$/.test(n) && Number(n) <= 64;

  function routeFor(card, options = {}, router) {
    const n = String(card?.number || ''), name = String(card?.name || '');
    if (!validNumber(n) || !name.trim()) return {url: '', exact: false};
    const identityMatches = card.source_id === 'base2-' + n &&
      (!card.source_set_id || card.source_set_id === 'base2');
    let url = '', exact = false;
    const confirmed = CONFIRMED[n];
    if (identityMatches && confirmed && normalize(name) === normalize(confirmed[0])) {
      url = CARDMARKET + '/Singles/Jungle/' + confirmed[1];
      exact = true;
    } else if (identityMatches && router && typeof router.safeRoute === 'function') {
      const result = router.safeRoute({
        source_id: card.source_id, source_set_id: 'base2', set_name: 'Jungle',
        name, number: n, language: 'EN', condition: 'NM'
      });
      if (result?.exact && typeof result.url === 'string') {
        try {
          const candidate = new URL(result.url);
          if (candidate.protocol === 'https:' && candidate.hostname === 'www.cardmarket.com' &&
              (/^\/en\/Pokemon\/Products\/Singles\/Jungle\//.test(candidate.pathname) ||
               (candidate.pathname === '/en/Pokemon/Products' && /^[1-9]\d*$/.test(candidate.searchParams.get('idProduct') || '')))) {
            url = candidate.href;
            exact = true;
          }
        } catch { /* A malformed candidate is not an exact route. */ }
      }
    }
    if (!url) url = CARDMARKET + '/Search?searchString=' + encodeURIComponent(name + ' JU' + n);
    const result = new URL(url);
    result.searchParams.set('language', '12');
    result.searchParams.set('minCondition', CONDITION[options.condition] || CONDITION.NM);
    result.searchParams.delete('isReverseHolo');
    result.searchParams.delete('isFirstEd');
    if (options.edition === '1ST') result.searchParams.set('isFirstEd', 'Y');
    if (options.edition === 'UNLIMITED') result.searchParams.set('isFirstEd', 'N');
    return {url: result.href, exact};
  }

  // The English route always remains distinct from the Dutch URL.
  function englishRouteFor(card, options = {}, router) {
    const n = String(card?.number || ''), name = String(card?.name || '');
    if (!validNumber(n) || !name.trim() || card.source_id !== 'base2-' + n ||
        (card.source_set_id && card.source_set_id !== 'base2')) return {url: '', exact: false};
    let found;
    try {
      found = router?.safeRoute?.({
        source_id: card.source_id, source_set_id: 'base2', set_name: 'Jungle',
        name, number: n, language: 'EN', condition: 'NM'
      });
    } catch { /* Fall back to a clearly labeled English search. */ }
    let url;
    try {
      const candidate = new URL(found?.url || '');
      if (candidate.protocol === 'https:' && candidate.hostname === 'www.cardmarket.com' &&
          candidate.pathname.startsWith('/en/Pokemon/Products/')) url = candidate;
    } catch { /* Ignore invalid URLs. */ }
    const exact = Boolean(url && found?.exact);
    if (!url) url = new URL(CARDMARKET + '/Search?searchString=' + encodeURIComponent(name + ' JU' + n));
    url.searchParams.set('language', '1');
    url.searchParams.set('minCondition', CONDITION[options.condition] || CONDITION.NM);
    url.searchParams.delete('isReverseHolo');
    url.searchParams.delete('isFirstEd');
    if (options.edition === '1ST') url.searchParams.set('isFirstEd', 'Y');
    if (options.edition === 'UNLIMITED') url.searchParams.set('isFirstEd', 'N');
    return {url: url.href, exact};
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
        const route = routeFor(c, {condition: condition.value, edition: edition.value}, root.HoloDexLibrary);
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
        const link = el('a', '', route.exact ? '🇳🇱 NL · kaartpagina' : '🇳🇱 NL · zoekresultaten');
        link.href = route.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        content.append(link);
        const englishRoute = englishRouteFor(c, {condition: condition.value, edition: edition.value}, root.HoloDexLibrary);
        const enLink = el('a', '', englishRoute.exact ? '🇬🇧 EN · kaartpagina' : '🇬🇧 EN · zoekresultaten');
        enLink.href = englishRoute.url;
        enLink.target = '_blank';
        enLink.rel = 'noopener noreferrer';
        enLink.style.marginLeft = '12px';
        content.append(enLink);
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
  return Object.freeze({routeFor, englishRouteFor, mount});
});
