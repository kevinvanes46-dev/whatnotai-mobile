/* Brand presentation only. Storage, backend names and routing remain independent. */
(() => {
  'use strict';
  if ('RareWorthBrand' in window) return;
  const brand = Object.freeze({
    name: 'HoloDex',
    shortName: 'HoloDex',
    tagline: 'Je kaarten. Goed bewaard.',
    appTitle: 'HoloDex · Zoek. Bewaar. Check.',
    version: 'v185',
    status: 'Beta'
  });
  Object.defineProperty(window, 'RareWorthBrand', {value: brand, enumerable: true});
  function apply() {
    document.title = brand.appTitle;
    const copy = {
      '.brandText strong': brand.name,
      '.brandText small': brand.tagline,
      '.onboardingBrand strong': brand.name,
      '#onboardingTitle': `Welkom bij ${brand.name}`,
      '[data-view="settings"] .screenIntro .eyebrow': brand.name,
      '[data-view="scan"] .screenIntro p': `Maak een foto. ${brand.name} doet de rest automatisch.`,
      '.aboutCard b': `Over ${brand.name}`,
      '.aboutCard small:first-of-type': brand.tagline,
      '.aboutMeta span': `${brand.version} · ${brand.status}`
    };
    for (const [selector, text] of Object.entries(copy)) {
      for (const node of document.querySelectorAll(selector)) node.textContent = text;
    }
    document.querySelector('.aboutCard')?.setAttribute('aria-label', `Over ${brand.name}`);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, {once: true});
  else apply();
})();
