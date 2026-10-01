'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const engine=require('../cloud-sync-v170.js'),adapter=require('../cloud-adapter-v170.js'),sdk=require('../supabase-client-v170.js');
const card={uid:'jp1',name:'ピカチュウ',sourceId:'neo1-036',setName:'Neo Genesis',language:'JP',qty:1,future:{'珍しい':['é','e\u0301','🃏']}};
const snapshot=(payload,revision='1')=>({payload,revision,schema_version:'v133'});
function fixture(payload=[card],remote=null) {
  const entries=new Map([[adapter.COLLECTION,JSON.stringify(payload)],['recent','keep'],['favorites','keep'],['backup','keep']]);
  const storage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v)};
  let session={user:{id:'A',email:'a@example.test'},access_token:'mock-A'},online=true,cloud=remote,authError=false,networkError=false;
  let gate=null;const listeners=[],calls=[];
  const client={auth:{getSession:async()=>({data:{session},error:authError?Error('auth'):null})},rpc(name,args){
    return {setHeader(key,value){
      const owner=session?.user.id;calls.push({name,args,key,value,owner});
      return (async()=>{
        if(gate)await gate;
        if(networkError)throw Error('network');
        if(name==='rareworth_get_collection_snapshot')return {data:structuredClone(cloud)};
        if(args.expected_revision!==(cloud?.revision||'0'))return {data:{status:'CONFLICT'}};
        cloud=snapshot(args.new_payload,String(BigInt(args.expected_revision)+1n));
        return {data:{status:'SAVED',snapshot:structuredClone(cloud)}};
      })();
    }};
  }};
  const auth={getSession:()=>session,start:async()=>client,subscribe:fn=>listeners.push(fn)};
  let renders=0;
  const sync=adapter.create({auth,storage,online:()=>online,randomUUID:()=> 'test-device',refreshCollection:()=>renders++});
  return {sync,storage,entries,calls,client,get renders(){return renders;},
    setRemote:r=>cloud=r,setLocal:p=>storage.setItem(adapter.COLLECTION,JSON.stringify(p)),
    setOnline:v=>online=v,setNetwork:v=>networkError=v,setAuthError:v=>authError=v,
    setSession(id){session=id?{user:{id,email:id+'@example.test'},access_token:'mock-'+id}:null;listeners.forEach(fn=>fn(session));},
    block(){gate=new Promise(resolve=>this.release=resolve);},
    act(){return sync.sync(sync.getState().token);},
    local:()=>storage.getItem(adapter.COLLECTION),meta:()=>JSON.parse(storage.getItem(adapter.META)||'null')};
}
test('first login reads only; EMPTY, LOCAL_ONLY and CLOUD_ONLY classify without writes',async()=>{
  for(const [local,remote,state] of [[[],null,'EMPTY'],[[card],null,'LOCAL_ONLY'],[[],snapshot([card]),'CLOUD_ONLY']]){
    const f=fixture(local,remote),before=f.local();await f.sync.refresh();assert.equal(f.sync.getState().state,state);
    assert.equal(f.local(),before);assert.equal(f.meta(),null);assert.deepEqual(f.calls.map(x=>x.name),['rareworth_get_collection_snapshot']);
  }
});
test('explicit uploads use CAS only, advance basis after SAVED, preserve unknown Unicode fields',async()=>{
  const f=fixture();await f.sync.refresh();await f.act();assert.equal(f.sync.getState().state,'IN_SYNC');
  assert.equal(f.meta().users.A.revision,'1');assert.deepEqual(f.calls[1].args.new_payload,[card]);
  assert.equal(f.calls[1].args.expected_revision,'0');assert.equal(f.calls[1].value,'Bearer mock-A');
  assert.equal(f.storage.getItem(adapter.DEVICE),'test-device');
  f.setLocal([{...card,qty:2}]);f.sync.refreshLocal();assert.equal(f.sync.getState().state,'LOCAL_NEWER');await f.act();
  assert.equal(f.meta().users.A.revision,'2');assert.equal(f.calls[2].args.expected_revision,'1');assert.equal(f.sync.getState().state,'IN_SYNC');
});
test('CLOUD_ONLY explicit download keeps array format and refreshes collection',async()=>{
  const f=fixture([],snapshot([card]));await f.sync.refresh();await f.act();
  assert.deepEqual(JSON.parse(f.local()),[card]);assert.equal(f.renders,1);assert.equal(f.sync.getState().state,'IN_SYNC');
});
test('CLOUD_NEWER downloads only with unchanged confirmed local basis',async()=>{
  const f=fixture();await f.sync.refresh();await f.act();f.setRemote(snapshot([{...card,qty:3}],'2'));
  await f.sync.refresh();assert.equal(f.sync.getState().state,'CLOUD_NEWER');await f.act();
  assert.equal(JSON.parse(f.local())[0].qty,3);assert.equal(f.meta().users.A.revision,'2');
});
test('different first-login collections and concurrent local/cloud edits remain CONFLICT',async()=>{
  const f=fixture([card],snapshot([{...card,qty:4}]));await f.sync.refresh();assert.equal(f.sync.getState().state,'CONFLICT');
  const before=f.local();await f.act();assert.equal(f.local(),before);assert.equal(f.calls.length,1);
  const g=fixture();await g.sync.refresh();await g.act();g.setLocal([{...card,qty:2}]);g.setRemote(snapshot([{...card,qty:3}],'2'));
  await g.sync.refresh();assert.equal(g.sync.getState().state,'CONFLICT');assert.equal(g.meta().users.A.revision,'1');
});
test('signout preserves all local data and B cannot read, upload or download A-bound collection',async()=>{
  const f=fixture();await f.sync.refresh();await f.act();const before=[...f.entries];f.setSession(null);
  assert.equal(f.sync.getState().state,'SIGNED_OUT');assert.deepEqual([...f.entries],before);
  f.setSession('B');await f.sync.refresh();assert.equal(f.sync.getState().state,'ACCOUNT_MISMATCH');
  await f.act();assert.equal(f.calls.length,2);assert.deepEqual([...f.entries],before);
});
test('network and auth failures preserve collection and never advance basis',async()=>{
  for(const fail of ['setNetwork','setAuthError']){
    const f=fixture();await f.sync.refresh();const before=f.local();f[fail](true);await f.act();
    assert.equal(f.sync.getState().state,'ERROR');assert.equal(f.local(),before);assert.equal(f.meta()?.users.A,undefined);
  }
});
test('offline issues zero RPC requests and leaves collection available',async()=>{
  const f=fixture();f.setOnline(false);await f.sync.refresh();await f.act();assert.equal(f.sync.getState().state,'OFFLINE');assert.equal(f.calls.length,0);assert.deepEqual(JSON.parse(f.local()),[card]);
});
test('stale download click fails before writing even without a storage event',async()=>{
  const f=fixture([],snapshot([card]));await f.sync.refresh();f.setLocal([{...card,qty:9}]);const before=f.local();await f.act();
  assert.equal(f.sync.getState().state,'CONFLICT');assert.equal(f.local(),before);assert.equal(f.meta(),null);
});
test('stale rendered token cannot apply a newer cloud proposal',async()=>{
  const f=fixture([],snapshot([card]));await f.sync.refresh();const old=f.sync.getState().token;
  f.setRemote(snapshot([{...card,qty:9}],'2'));await f.sync.refresh();await f.sync.sync(old);
  assert.equal(f.sync.getState().state,'CONFLICT');assert.equal(f.local(),'[]');
});
test('stale server revision produces CONFLICT with no retry and no basis advancement',async()=>{
  const f=fixture();await f.sync.refresh();f.setRemote(snapshot([{...card,qty:3}]));await f.act();
  assert.equal(f.sync.getState().state,'CONFLICT');assert.equal(f.calls.length,2);assert.equal(f.meta().users.A,undefined);
  await f.act();assert.equal(f.calls.length,2);await f.sync.refresh();assert.equal(f.calls.length,3);assert.equal(f.sync.getState().state,'CONFLICT');
});
test('late read after account switch cannot expose previous cloud data',async()=>{
  const f=fixture([],snapshot([card]));f.block();const pending=f.sync.refresh();await new Promise(setImmediate);
  f.setSession('B');f.release();await pending;assert.equal(f.sync.getState().userId,'B');assert.notEqual(f.sync.getState().state,'CLOUD_ONLY');assert.equal(f.local(),'[]');
});
test('late upload after signout cannot advance metadata; request retains original SDK token',async()=>{
  const f=fixture();await f.sync.refresh();f.block();const pending=f.act();await new Promise(setImmediate);
  f.setSession('B');f.release();await pending;assert.equal(f.sync.getState().state,'ACCOUNT_MISMATCH');
  assert.equal(f.meta().users.A,undefined);assert.equal(f.calls.at(-1).value,'Bearer mock-A');assert.equal(f.calls.length,2);
});
test('local edits while upload runs are preserved and classified LOCAL_NEWER after success',async()=>{
  const f=fixture();await f.sync.refresh();f.block();const pending=f.act();await new Promise(setImmediate);
  f.setLocal([{...card,qty:8}]);f.release();await pending;assert.equal(f.sync.getState().state,'LOCAL_NEWER');assert.equal(JSON.parse(f.local())[0].qty,8);
});
test('malformed local, remote or unsupported schema never overwrite collection',async()=>{
  for(const bad of [{},snapshot([card],'0'),{...snapshot([card]),schema_version:'future'},snapshot([card],1)]){
    const f=fixture([],bad),before=f.local();await f.sync.refresh();assert.equal(f.sync.getState().state,'ERROR');await f.act();assert.equal(f.local(),before);
  }
  const f=fixture();f.storage.setItem(adapter.COLLECTION,'{}');await f.sync.refresh();assert.equal(f.sync.getState().state,'ERROR');assert.equal(f.local(),'{}');
});
test('storage failures keep original collection and prevent unsafe cross-account use',async()=>{
  const f=fixture([],snapshot([card]));await f.sync.refresh();const original=f.storage.setItem;
  f.storage.setItem=(k,v)=>{if(k===adapter.COLLECTION)throw Error('quota');original(k,v);};await f.act();
  assert.equal(f.local(),'[]');assert.equal(f.meta().users.A,undefined);f.setSession('B');assert.equal(f.sync.getState().state,'ACCOUNT_MISMATCH');
});
test('empty previously-synced local collection represents deletion, not unrelated CLOUD_ONLY',async()=>{
  const f=fixture();await f.sync.refresh();await f.act();f.setLocal([]);f.sync.refreshLocal();assert.equal(f.sync.getState().state,'LOCAL_NEWER');await f.act();assert.equal(f.meta().users.A.revision,'2');assert.equal(f.sync.getState().state,'EMPTY');
});
test('same-content first login is IN_SYNC without manufacturing a confirmed basis',async()=>{
  const f=fixture([card],snapshot([card]));await f.sync.refresh();assert.equal(f.sync.getState().state,'IN_SYNC');assert.equal(f.meta(),null);
});
test('SDK auth lifecycle is lazy, pinned, OTP/PKCE, email redirect folder and SDK-owned signout',async()=>{
  let callback,session=null,loads=0;const calls=[];
  const auth={onAuthStateChange:fn=>(callback=fn,{data:{subscription:{unsubscribe(){}}}}),getSession:async()=>({data:{session}}),
    signInWithOtp:async args=>(calls.push(args),{}),signOut:async args=>(calls.push(args),callback('SIGNED_OUT',null),{})};
  const account=sdk.create({config:{url:'mock',publishableKey:'mock'},loadSDK:async()=>{loads++;return {createClient:(url,key,options)=>{assert.equal(options.auth.flowType,'pkce');return {auth};}};},href:()=> 'http://localhost:8080/whatnotai-mobile/index.html#settings',online:()=>true});
  assert.equal(loads,0);assert.equal(account.getSession(),null);await account.signIn('a@example.test');
  assert.deepEqual(calls[0],{email:'a@example.test',options:{shouldCreateUser:true,emailRedirectTo:'http://localhost:8080/whatnotai-mobile/'}});
  session={user:{id:'A',email:'a@example.test'}};callback('SIGNED_IN',session);assert.equal(account.getSession().user.email,'a@example.test');
  callback('TOKEN_REFRESHED',session);await account.signOut();assert.equal(account.getSession(),null);assert.deepEqual(calls[1],{scope:'local'});assert.equal(loads,1);
  assert.match(sdk.SDK_URL,/@supabase\/supabase-js@2\.117\.2\/dist\/umd\/supabase\.js$/);assert.match(sdk.SDK_INTEGRITY,/^sha384-/);
});
test('SDK unavailable and offline auth fail locally without constructing a client',async()=>{
  for(const online of [true,false]){
    let loads=0;const account=sdk.create({config:{},loadSDK:async()=>{loads++;throw Error('SDK unavailable');},href:()=> 'http://localhost/',online:()=>online});
    await assert.rejects(account.signIn('a@example.test'));assert.equal(account.getSession(),null);assert.equal(loads,online?1:0);
  }
});
test('public config is immutable and exposes exactly URL and publishableKey',()=>{
  const context={};vm.runInNewContext(fs.readFileSync('supabase-config-v170.js','utf8'),context);
  assert.ok(Object.isFrozen(context.RareWorthSupabaseConfig));assert.equal(Object.getOwnPropertyDescriptor(context,'RareWorthSupabaseConfig').writable,false);
  assert.deepEqual(Object.keys(context.RareWorthSupabaseConfig),['url','publishableKey']);
});
test('read RPC is no-argument, owner-scoped, bigint-safe, invoker and rerunnable without destructive SQL',()=>{
  const sql=fs.readFileSync('supabase/migrations/20261001_rareworth_cloud_read_v170b.sql','utf8').replace(/--[^\n]*/g,'').replace(/\s+/g,' ').trim().toLowerCase();
  assert.match(sql,/^begin; create or replace function public\.rareworth_get_collection_snapshot\(\) returns jsonb/);
  assert.match(sql,/security invoker set search_path = ''/);assert.match(sql,/where snapshot.user_id = \(select auth.uid\(\)\)/);assert.match(sql,/snapshot.revision::text/);
  assert.match(sql,/revoke all on function public.rareworth_get_collection_snapshot\(\) from public, anon, authenticated/);
  assert.match(sql,/grant execute on function public.rareworth_get_collection_snapshot\(\) to authenticated/);
  assert.doesNotMatch(sql,/security definer|delete |drop |truncate |insert |update |user_id uuid/);assert.match(sql,/commit;$/);
});
test('download rechecks local edits made while SDK session validation is pending',async()=>{
  const f=fixture([],snapshot([card]));await f.sync.refresh();const get=f.client.auth.getSession;let release;
  f.client.auth.getSession=async()=>{await new Promise(r=>release=r);return get();};
  const pending=f.act();await new Promise(setImmediate);f.setLocal([{...card,qty:7}]);release();await pending;
  assert.equal(f.sync.getState().state,'CONFLICT');assert.equal(JSON.parse(f.local())[0].qty,7);assert.equal(f.renders,0);
});
test('download is cancelled if account changes during session validation',async()=>{
  const f=fixture([],snapshot([card]));await f.sync.refresh();const get=f.client.auth.getSession;let release;
  f.client.auth.getSession=async()=>{await new Promise(r=>release=r);return get();};
  const pending=f.act();await new Promise(setImmediate);f.setSession('B');release();await pending;
  assert.equal(f.local(),'[]');assert.equal(f.meta(),null);assert.equal(f.renders,0);
});
test('metadata quota failure after download preserves complete data and still refreshes UI',async()=>{
  const f=fixture([],snapshot([card]));await f.sync.refresh();const set=f.storage.setItem;
  f.storage.setItem=(k,v)=>{if(k===adapter.META&&JSON.parse(v).users.A)throw Error('quota');set(k,v);};await f.act();
  assert.equal(f.sync.getState().state,'ERROR');assert.deepEqual(JSON.parse(f.local()),[card]);assert.equal(f.renders,1);
  assert.equal(f.meta().boundUserId,'A');assert.equal(f.meta().users.A,undefined);
});
test('adapter has only approved RPC names and never uses direct table writes or local cleanup',()=>{
  const code=fs.readFileSync('cloud-adapter-v170.js','utf8'),auth=fs.readFileSync('supabase-client-v170.js','utf8');
  assert.doesNotMatch(code,/\.(?:from|update|upsert|insert)\s*\(|storage\.(?:delete|removeItem|clear)\s*\(/);
  assert.doesNotMatch(auth,/localStorage|sessionStorage|removeItem|\.clear\s*\(/);
  assert.match(code,/rareworth_get_collection_snapshot/);assert.equal(engine.prepareUpload(engine.createLocalSnapshot([card]),'0').rpc,'rareworth_save_collection_snapshot');
});
