self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('whatnotai-mobile') || key.startsWith('cardscout'))
          .map(key => caches.delete(key))
      ))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});
