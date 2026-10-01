(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RareWorthAccount = api.create({config:root.RareWorthSupabaseConfig,
    loadSDK:()=>api.loadSDK(document), href:()=>location.href, online:()=>navigator.onLine});
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js';
  const SDK_INTEGRITY = 'sha384-Rj26LVGvoeRVR6+mwQmFfcR3QOBEwT+ZmuCWpuiqeTzJpCs0ER4ITAWGb4Hiy3Ok';
  function loadSDK(document) {
    return new Promise((resolve, reject)=>{
      const script = document.createElement('script');
      script.src = SDK_URL; script.integrity = SDK_INTEGRITY;
      script.crossOrigin = 'anonymous'; script.referrerPolicy = 'no-referrer';
      script.onload = ()=>resolve(globalThis.supabase);
      script.onerror = ()=>{script.remove(); reject(Error('Accountservice niet beschikbaar. Probeer later opnieuw.'));};
      document.head.appendChild(script);
    });
  }
  function create({config, loadSDK, href, online}) {
    let client, starting, session = null, version = 0;
    const listeners = new Set();
    function publish(next) {
      session = next;
      version++;
      for (const listener of listeners) listener(session);
    }
    async function start() {
      if (client) return client;
      if (!online()) throw Error('Offline — lokale collectie blijft beschikbaar');
      if (!starting) starting = (async()=>{
        const sdk = await loadSDK();
        if (!online()) throw Error('Offline — lokale collectie blijft beschikbaar');
        const candidate = sdk.createClient(config.url, config.publishableKey, {auth:{
          persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, flowType:'pkce'
        }});
        // No asynchronous SDK calls inside the auth callback (SDK lock safety).
        const subscription = candidate.auth.onAuthStateChange((_event, next)=>publish(next)).data.subscription;
        const before = version;
        const result = await candidate.auth.getSession();
        if (result.error) {subscription.unsubscribe(); throw result.error;}
        client = candidate;
        if (before === version) publish(result.data.session);
        return client;
      })().finally(()=>{starting = null;});
      return starting;
    }
    return Object.freeze({start, getSession:()=>session,
      subscribe(listener) {listeners.add(listener); return ()=>listeners.delete(listener);},
      async signIn(email) {
        const sdk = await start();
        if (!online()) throw Error('Offline — lokale collectie blijft beschikbaar');
        const result = await sdk.auth.signInWithOtp({email, options:{shouldCreateUser:true,
          emailRedirectTo:new URL('./', href()).href}});
        if (result.error) throw result.error;
      },
      async signOut() {
        const sdk = await start();
        const result = await sdk.auth.signOut({scope:'local'});
        if (result.error) throw result.error;
        publish(null);
      }
    });
  }
  return Object.freeze({create, loadSDK, SDK_URL, SDK_INTEGRITY});
});
