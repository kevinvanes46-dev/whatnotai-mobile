(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./cloud-sync-v170.js'));
  else root.RareWorthCloudAdapter = factory(root.RareWorthCloudSync);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (engine) {
  'use strict';
  const COLLECTION = 'cardscout_collection_v133', META = 'rareworth_cloud_sync_v170', DEVICE = 'rareworth_device_id_v170';
  function create({auth, storage, online, randomUUID, refreshCollection = ()=>{}, now = ()=>new Date().toISOString()}) {
    let userId = auth.getSession()?.user.id || null, epoch = 0, cloud = null, loaded = false, busy = false;
    let current = {state:'SIGNED_OUT'}, actionToken = 0, operation = 0;
    const listeners = new Set();
    const emit = (state, extra = {})=>{
      current = Object.freeze({state, userId, busy, token:++actionToken, ...extra});
      for (const listener of listeners) listener(current);
      return current;
    };
    function metadata() {
      const value = JSON.parse(storage.getItem(META) || '{"boundUserId":null,"users":{}}');
      if (!value || typeof value.users !== 'object' || !value.users || Array.isArray(value.users) ||
          (value.boundUserId !== null && typeof value.boundUserId !== 'string')) throw Error('Ongeldige syncmetadata');
      return value;
    }
    function local(meta = metadata()) {
      const payload = JSON.parse(storage.getItem(COLLECTION) || '[]');
      const basis = meta.boundUserId === userId ? meta.users[userId] : null;
      return engine.createLocalSnapshot(payload, basis ? {revision:basis.revision,
        schema_version:basis.schema_version, base:{revision:basis.revision, signature:basis.signature}} : {});
    }
    function classify() {
      if (!online()) return emit('OFFLINE');
      if (!userId) return emit('SIGNED_OUT');
      try {
        const meta = metadata();
        if (meta.boundUserId && meta.boundUserId !== userId) return emit('ACCOUNT_MISMATCH');
        if (!loaded) return emit('ERROR', {message:'Controleer de cloud om de status te laden.'});
        const snapshot = local(meta);
        const input = !snapshot.payload.length && !snapshot.base ? null : snapshot;
        return emit(engine.classifySyncState(input, cloud), {signature:snapshot.signature});
      } catch {return emit('ERROR', {message:'Collectie of syncmetadata kon niet veilig worden gelezen.'});}
    }
    function live(id, generation) {
      return id === userId && generation === epoch && auth.getSession()?.user.id === id;
    }
    async function clientFor(id, generation) {
      const client = await auth.start();
      const session = await client.auth.getSession();
      if (session.error || session.data.session?.user.id !== id ||
          !session.data.session?.access_token || !live(id, generation)) throw Error('Account gewijzigd. Controleer opnieuw.');
      if (!online()) throw Error('Offline — lokale collectie blijft beschikbaar');
      return {client, accessToken:session.data.session.access_token};
    }
    function checkedCloud(value) {
      if (value === null) return null;
      if (!value || Array.isArray(value) || typeof value.revision !== 'string' || value.schema_version !== 'v133') throw Error('Onbekend cloudformaat');
      const snapshot = engine.parseSnapshot(value);
      if (snapshot.revision === '0') throw Error('Ongeldige cloudrevision');
      return snapshot;
    }
    function bind(id) {
      const meta = metadata();
      if (meta.boundUserId && meta.boundUserId !== id) throw Error('ACCOUNT_MISMATCH');
      // Persist an ownership guard before an explicit write. This is NOT a sync basis.
      // If a request is interrupted or metadata runs out of space, another account
      // still cannot claim this device's collection. No revision advances here.
      if (!meta.boundUserId) {meta.boundUserId = id; storage.setItem(META, JSON.stringify(meta));}
    }
    function saveBasis(id, snapshot) {
      const meta = metadata();
      if (meta.boundUserId !== id) throw Error('ACCOUNT_MISMATCH');
      meta.users[id] = {revision:snapshot.revision, signature:snapshot.signature,
        schema_version:snapshot.schema_version, lastSyncedAt:now()};
      storage.setItem(META, JSON.stringify(meta));
    }
    async function refresh() {
      if (busy) return current;
      if (!online() || !userId) return classify();
      const id = userId, generation = epoch, request = ++operation;
      busy = true; emit(current.state);
      try {
        const meta = metadata();
        if (meta.boundUserId && meta.boundUserId !== id) return emit('ACCOUNT_MISMATCH');
        const {client, accessToken} = await clientFor(id, generation);
        if (!live(id, generation)) return current;
        const result = await client.rpc('rareworth_get_collection_snapshot').setHeader('Authorization', 'Bearer ' + accessToken);
        if (!live(id, generation)) return current;
        if (result.error) throw result.error;
        cloud = checkedCloud(result.data); loaded = true;
        return classify();
      } catch {if (live(id, generation)) {loaded = false; emit(online() ? 'ERROR' : 'OFFLINE', {message:'Cloud niet beschikbaar. Je lokale collectie blijft bewaard.'});}}
      finally {if (request === operation) {busy = false; emit(current.state, currentDetails());}}
      return current;
    }
    function currentDetails() {
      return {signature:current.signature, message:current.message};
    }
    async function sync(token) {
      if (busy) return current;
      const clicked = current;
      if (token !== clicked.token) return emit('CONFLICT');
      const upload = ['LOCAL_ONLY','LOCAL_NEWER'].includes(clicked.state);
      if (!upload && !['CLOUD_ONLY','CLOUD_NEWER'].includes(clicked.state)) return current;
      const id = userId, generation = epoch, request = ++operation;
      busy = true; emit(clicked.state);
      try {
        const {client, accessToken} = await clientFor(id, generation);
        if (!live(id, generation)) return current;
        const meta = metadata();
        if (meta.boundUserId && meta.boundUserId !== id) return emit('ACCOUNT_MISMATCH');
        const snapshot = local(meta);
        if (snapshot.signature !== clicked.signature) return emit('CONFLICT');
        if (upload) {
          let device = storage.getItem(DEVICE);
          if (!device) {device = randomUUID(); storage.setItem(DEVICE, device);}
          const proposal = engine.prepareUpload({...snapshot, device_id:device}, cloud?.revision || '0');
          if (proposal.status !== 'READY') return emit('CONFLICT');
          bind(id);
          // No await between final identity check and dispatch. The SDK owns tokens.
          if (!live(id, generation)) return current;
          // Pin this request to the SDK-issued session that was just checked. A
          // concurrent sign-in must not attach another user's token to this payload.
          const result = await client.rpc(proposal.rpc, proposal.args).setHeader('Authorization', 'Bearer ' + accessToken);
          if (!live(id, generation)) return current;
          if (result.error) throw result.error;
          if (result.data?.status === 'CONFLICT') {loaded = false; return emit('CONFLICT');}
          if (result.data?.status !== 'SAVED') throw Error('Ongeldig save-antwoord');
          const saved = checkedCloud(result.data.snapshot);
          if (!saved || saved.signature !== snapshot.signature || saved.revision !== String(BigInt(proposal.args.expected_revision) + 1n)) throw Error('Onverwacht save-antwoord');
          saveBasis(id, saved); cloud = saved; loaded = true;
        } else {
          const proposal = engine.prepareDownload(cloud);
          const serialized = JSON.stringify(proposal.collection);
          bind(id);
          // Synchronous commit: reread at the last possible point; never clear first.
          if (!live(id, generation)) return current;
          if (local().signature !== clicked.signature) return emit('CONFLICT');
          storage.setItem(COLLECTION, serialized);
          try {saveBasis(id, cloud);} finally {refreshCollection();}
        }
        return classify();
      } catch {if (live(id, generation)) emit(online() ? 'ERROR' : 'OFFLINE', {message:'Synchroniseren niet voltooid. Controleer opnieuw; lokale data blijft bewaard.'});}
      finally {if (request === operation) {busy = false; emit(current.state, currentDetails());}}
      return current;
    }
    auth.subscribe(session=>{
      const next = session?.user.id || null;
      if (next === userId) return;
      userId = next; epoch++; operation++; busy = false; loaded = false; cloud = null;
      classify(); // No SDK calls inside auth callbacks.
    });
    return Object.freeze({refresh, sync, refreshLocal:()=>busy ? current : classify(), getState:()=>current,
      subscribe(listener) {listeners.add(listener); return ()=>listeners.delete(listener);}});
  }
  return Object.freeze({create, COLLECTION, META, DEVICE});
});
