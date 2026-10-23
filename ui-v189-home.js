'use strict';
// Purely presentational home navigation. No price provider, stored collection,
// account or search-engine changes. All routes use existing app controls.
(() => {
  const home = document.querySelector('.tabView[data-view="home"]');
  const hero = home?.querySelector('.homeHero');
  if (!home || !hero || home.querySelector('.v189-actions')) return;

  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value) node.textContent = value;
    return node;
  };
  const iconPaths = Object.freeze({
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    library: '<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="11" y="4" width="10" height="16" rx="1.5"/><path d="M14 9h4m-4 4h4"/>',
    collection: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    recent: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>'
  });
  const icon = name => {
    const glyph = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    glyph.setAttribute('viewBox', '0 0 24 24');
    glyph.setAttribute('aria-hidden', 'true');
    glyph.innerHTML = iconPaths[name]; // fixed local SVG paths only
    return glyph;
  };
  const go = id => document.getElementById(id)?.click();

  const eyebrow = make('span', 'v189-kicker', 'JOUW POKÉMON WERELD');
  hero.prepend(eyebrow);
  hero.querySelector('h1').textContent = 'Welkom terug.';
  hero.querySelector('p:not(.homeEyebrow)').textContent = 'Ontdek kaarten, volg je collectie en houd je favoriete sets bij.';
  hero.querySelector('#homeSearch')?.setAttribute('aria-label', 'Zoek een Pokémon-kaart');

  const actions = make('section', 'v189-actions');
  actions.setAttribute('aria-label', 'Kies wat je wilt doen');
  actions.append(make('h2', 'v189-section-title', 'Waar wil je beginnen?'));
  const grid = make('div', 'v189-action-grid');
  const choices = [
    ['search', 'Kaart zoeken', 'Naam, set of nummer', () => go('navSearch')],
    ['library', 'Sets ontdekken', 'EN & JP bibliotheek', () => {
      go('navSearch');
      const toggle = document.getElementById('libraryToggle');
      if (toggle && !toggle.disabled && toggle.getAttribute('aria-expanded') !== 'true') toggle.click();
      document.getElementById('libraryBrowser')?.scrollIntoView({block:'start', behavior:'smooth'});
    }],
    ['collection', 'Mijn collectie', 'Je kaarten op één plek', () => go('navCollection')],
    ['recent', 'Recent bekeken', 'Ga verder waar je was', () => go('navRecent')]
  ];
  for (const [symbol, title, description, action] of choices) {
    const button = make('button', 'v189-action');
    button.type = 'button';
    button.append(icon(symbol));
    const copy = make('span', 'v189-action-copy');
    copy.append(make('strong', null, title), make('small', null, description));
    button.append(copy, make('span', 'v189-action-arrow', '↗'));
    button.addEventListener('click', action);
    grid.append(button);
  }
  actions.append(grid);

  const guide = make('details', 'v189-guide');
  const summary = make('summary', null, 'Nieuw hier? Zo werkt het');
  const steps = make('ol');
  for (const label of [
    'Zoek een kaart op naam, set of kaartnummer.',
    'Controleer de juiste kaart, taal en variant op Cardmarket.',
    'Voeg de kaart toe aan je collectie. Je gegevens blijven bewaard op dit toestel; cloudbackup is optioneel.'
  ]) steps.append(make('li', null, label));
  guide.append(summary, steps);
  actions.append(guide);
  hero.after(actions);

  // Existing app handler sends brand taps to search. The logo now means Home.
  document.getElementById('brandHomeBtn')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    go('navHome');
  }, {capture:true});
})();
