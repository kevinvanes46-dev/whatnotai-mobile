'use strict';
// Bump this version when the shell changes. Never cache remote card data/artwork.
const CACHE = 'rareworth-shell-v174';
const SCOPE = new URL('./', self.registration.scope);
const INDEX = new URL('index.html', SCOPE).href;
const ASSETS = [
  'index.html',
  'cards.json?build=174-en-dp-pop-coverage',
  'brand-v172.js?build=174-en-dp-pop-coverage',
  'manifest.json?build=173-holokeep-rebrand',
  'icon-rareworth.svg?build=173-holokeep-rebrand',
  'icon-rareworth-180.png?build=173-holokeep-rebrand',
  'icon-rareworth-192.png', 'icon-rareworth-512.png',
  'style-v137-product.css?build=168-product-shell-cleanup',
  'style-v148-polish.css?build=168-product-shell-cleanup',
  'style-v150-minimal.css?build=168-product-shell-cleanup',
  'style-v153-mobile.css?build=168-product-shell-cleanup',
  'cardmarket-products-v152.js?build=152-links-controls',
  'card-identity-v154.js?build=164-jp-set-display-restore',
  'app-v137.js?build=174-en-dp-pop-coverage',
  'jp-cardmarket-twin-v157.js?build=162-jp-cardmarket-routing',
  'jp-artwork-v158.js?build=158-jp-artwork',
  'cardmarket-ui-v156.js?build=156-jp-routing-ui',
  'jp-set-catalog-v160.js?build=160-jp-set-coverage',
  'jp-cardmarket-native-v165.js?build=165-full-jp-cardmarket',
  'jp-cardmarket-native-v163.js?build=165-full-jp-cardmarket',
  'jp-image-manifest-v161.js?build=161-jp-image-library',
  'jp-image-library-v161.js?build=161-jp-image-library',
  'ui-v137-focus.js?build=174-en-dp-pop-coverage',
  'ui-v137-collection.js?build=174-en-dp-pop-coverage',
  'ui-v150-experience.js?build=173-holokeep-rebrand',
  'ui-v154-keyboard.js?build=154-keyboard',
  'ui-v153-mobile.js?build=154-keyboard',
  'cloud-sync-v170.js?build=170b-account-cloud-sync',
  'supabase-config-v170.js?build=170b-account-cloud-sync',
  'supabase-client-v170.js?build=170b-account-cloud-sync',
  'cloud-adapter-v170.js?build=170b-account-cloud-sync',
  'account-ui-v170.js?build=170b-account-cloud-sync',
  'account-v170.css?build=170b-account-cloud-sync',
  'onboarding-v171.js?build=171-1-launch-gate',
  'onboarding-v171.css?build=171-1-launch-gate',
  'pwa-v169.js?build=169-pwa-foundation'
];
const LOCAL_ASSETS = new Set(ASSETS.filter(file => file !== 'index.html')
  .map(file => new URL(file, SCOPE).pathname));

self.addEventListener('install', event => {
  // A failed download leaves the previous worker in place; activate only a complete shell.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(
    ASSETS.map(file => new Request(new URL(file, SCOPE), {cache: 'reload'}))
  )).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key !== CACHE && /^(?:rareworth-shell|whatnotai-mobile|cardscout)-v\d+(?:-[\w-]+)?$/.test(key))
    .map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

async function networkFirst(request, key) {
  const cache = await caches.open(CACHE);
  try {
    // Bypass HTTP cache as well: existing JS URLs are not all bumped each release.
    const response = await fetch(request, {cache: 'no-cache'});
    if (response.ok && response.type === 'basic' && !response.redirected) {
      // Storage quota/errors must never turn a successful network request into a failure.
      await cache.put(key, response.clone()).catch(() => {});
      return response;
    }
    return (await cache.match(key)) || response;
  } catch (error) {
    const cached = await cache.match(key);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  // No interception of external requests, non-GETs, other apps, data or artwork.
  if (request.method !== 'GET' || url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
  if (request.mode === 'navigate' && (url.pathname === SCOPE.pathname || url.pathname === new URL(INDEX).pathname)) {
    event.respondWith(networkFirst(request, INDEX));
  } else if (LOCAL_ASSETS.has(url.pathname)) {
    // Query strings remain part of the key; a new build cannot reuse an old asset.
    event.respondWith(networkFirst(request, request));
  }
});
