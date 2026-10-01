/* Optional account UI. Existing local collection, search and routing own their UI. */
(function () {
  'use strict';
  const card = document.getElementById('accountCard');
  if (!card) return;
  const auth = window.RareWorthAccount, $ = id=>document.getElementById(id);
  const enabledKey = 'rareworth_account_enabled_v170';
  const adapter = window.RareWorthCloudAdapter.create({auth, storage:localStorage,
    online:()=>navigator.onLine, randomUUID:()=>crypto.randomUUID(),
    refreshCollection:()=>window.cardscoutCollectionUI?.render()});
  const labels = {
    EMPTY:'Nog niets om te synchroniseren.', LOCAL_ONLY:'Je collectie staat op dit apparaat.',
    CLOUD_ONLY:'Er staat een collectie klaar in de cloud.', IN_SYNC:'Collectie is gesynchroniseerd',
    LOCAL_NEWER:'Je hebt lokale wijzigingen.', CLOUD_NEWER:'Er staan nieuwe wijzigingen in de cloud.',
    CONFLICT:'Er zijn wijzigingen op dit apparaat én in de cloud. Gebruik Backup & herstel om je gegevens veilig te bewaren.',
    ACCOUNT_MISMATCH:'Deze lokale collectie hoort bij een ander cloudaccount. Log in met dat account. Er wordt niets overgezet.',
    OFFLINE:'Offline — lokale collectie blijft beschikbaar', ERROR:'Cloud niet beschikbaar. Je lokale collectie blijft bewaard.'
  };
  const actions = {LOCAL_ONLY:'Lokale collectie naar cloud', CLOUD_ONLY:'Cloudcollectie herstellen',
    LOCAL_NEWER:'Wijzigingen uploaden', CLOUD_NEWER:'Cloudwijzigingen ophalen'};
  let formBusy = false, message = '', renderedToken;
  function render() {
    const state = adapter.getState(), session = auth.getSession(), offline = !navigator.onLine;
    card.dataset.state = offline ? 'OFFLINE' : session ? state.state : 'SIGNED_OUT';
    $('accountForm').hidden = !!session;
    $('accountSignedIn').hidden = !session;
    $('accountEmail').textContent = session?.user.email || '';
    $('accountStatus').textContent = offline ? labels.OFFLINE : message || state.message || labels[state.state] || '';
    $('accountSync').hidden = offline || !session || !actions[state.state];
    $('accountSync').textContent = actions[state.state] || '';
    $('accountSync').disabled = state.busy || formBusy;
    $('accountRefresh').disabled = state.busy || formBusy || offline;
    $('accountSignOut').disabled = formBusy;
    $('accountSend').disabled = formBusy || offline;
    $('accountSync').setAttribute('aria-busy', String(state.busy));
    renderedToken = state.token;
  }
  adapter.subscribe(render);
  async function run(task) {
    if (formBusy) return;
    formBusy = true; message = ''; render();
    try {await task();}
    catch {message = 'Accountservice niet beschikbaar. Je lokale collectie blijft bewaard. Probeer later opnieuw.';}
    finally {formBusy = false; render();}
  }
  auth.subscribe(()=>{
    message = ''; render();
    // Defer RPC/getSession outside Supabase's synchronous auth callback.
    setTimeout(()=>{if (auth.getSession() && navigator.onLine) void adapter.refresh();}, 0);
  });
  $('accountForm').addEventListener('submit', event=>{
    event.preventDefault();
    void run(async()=>{
      localStorage.setItem(enabledKey, '1');
      await auth.signIn($('accountEmailInput').value.trim());
      message = 'Inloglink verstuurd. Open de link in je e-mail om in te loggen.';
    });
  });
  $('accountSignOut').addEventListener('click', ()=>void run(()=>auth.signOut()));
  $('accountRefresh').addEventListener('click', ()=>{message = ''; void adapter.refresh();});
  $('accountSync').addEventListener('click', ()=>{message = ''; void adapter.sync(renderedToken);});
  function activate() {
    adapter.refreshLocal();
    let enabled = false;
    try {enabled = localStorage.getItem(enabledKey) === '1';} catch {return;}
    if (enabled && navigator.onLine) void run(async()=>{await auth.start(); await adapter.refresh();});
  }
  $('navSettings').addEventListener('click', activate);
  window.addEventListener('online', activate);
  window.addEventListener('offline', ()=>adapter.refreshLocal());
  window.addEventListener('storage', event=>{
    if ([null,'cardscout_collection_v133','rareworth_cloud_sync_v170'].includes(event.key)) adapter.refreshLocal();
  });
  // Collection edits already render this container. Observe instead of patching
  // collection storage or its API; status changes cannot trigger this observer.
  const collection = $('collectionList');
  if (collection) new MutationObserver(()=>adapter.refreshLocal()).observe(collection, {childList:true, subtree:true});
  const callback = new URL(location.href);
  if (callback.searchParams.has('code') || /(?:access_token|error_description)=/.test(callback.hash)) {
    try {localStorage.setItem(enabledKey, '1');} catch { /* Normal local UI still starts. */ }
    if (navigator.onLine) void run(async()=>{await auth.start(); await adapter.refresh();});
  } else if (location.hash === '#settings') activate();
  render();
})();
