/* RareWorth PWA lifecycle only; card logic and local storage belong to the app. */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  function register() {
    // Relative scope supports /whatnotai-mobile/ on GitHub Pages and localhost.
    navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'})
      .catch(() => { /* The online app remains usable when registration is unavailable. */ });
  }
  // No forced reload or controllerchange reload loop. The next navigation uses the network.
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, {once: true});
})();
