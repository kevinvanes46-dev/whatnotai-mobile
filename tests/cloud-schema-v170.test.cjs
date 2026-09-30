'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const file='supabase/migrations/20260930_rareworth_cloud_v170.sql';
const sql=fs.readFileSync(file,'utf8').replace(/--[^\r\n]*/g,'').replace(/\s+/g,' ').trim().toLowerCase();
const table='public.rareworth_collection_snapshots';
const rpc=sql.match(/create or replace function public\.rareworth_save_collection_snapshot\((.*?)\) returns jsonb(.*?)\$\$;(.*)$/s);

test('SQL snapshot schema has owner PK/FK, array constraint and version metadata',()=>{
  assert.match(sql,/create table if not exists public\.rareworth_collection_snapshots \(/);
  assert.match(sql,/user_id uuid primary key references auth\.users\(id\) on delete cascade/);
  assert.match(sql,/payload jsonb not null/);assert.match(sql,/check \(jsonb_typeof\(payload\) = 'array'\)/);
  assert.match(sql,/revision bigint not null default 1 check \(revision > 0\)/);
  assert.match(sql,/schema_version text not null default 'v133'/);assert.match(sql,/device_id text/);
  assert.match(sql,/created_at timestamptz not null default now\(\)/);assert.match(sql,/updated_at timestamptz not null default now\(\)/);
  assert.doesNotMatch(sql,/\b(email|password|payment|jwt)\b/);
});
test('SQL RLS explicitly denies anon and restricts every CRUD policy to the owner',()=>{
  assert.ok(sql.includes('alter table '+table+' enable row level security;'));
  assert.ok(sql.includes('revoke all on table '+table+' from public, anon, authenticated;'));
  assert.ok(sql.includes('grant select, insert, update, delete on table '+table+' to authenticated;'));
  const policies=[...sql.matchAll(/create policy (.*?) on public\.rareworth_collection_snapshots (.*?);/g)];
  assert.equal(policies.length,4);
  const ownership='((select auth.uid()) is not null and (select auth.uid()) = user_id)';
  for(const command of ['select','insert','update','delete']){
    const actual=policies.find(p=>p[1]==='rareworth_snapshot_'+command)?.[2];
    const expected='for '+command+' to authenticated '+(command==='insert'?'with check '+ownership:'using '+ownership)+(command==='update'?' with check '+ownership:'');
    assert.equal(actual,expected,command+' owner policy');
  }
  assert.doesNotMatch(sql,/create policy[^;]+to (?:anon|public)/);
  assert.doesNotMatch(sql,/grant[^;]+to (?:anon|public)\b/);
});
test('SQL save RPC derives ownership from auth.uid, validates payload and uses atomic CAS',()=>{
  assert.ok(rpc);
  assert.equal(rpc[1].trim(),'expected_revision bigint, new_payload jsonb, new_schema_version text, new_device_id text');
  const body=rpc[2];
  assert.match(body,/owner_id uuid := auth\.uid\(\)/);
  assert.match(body,/if owner_id is null then raise exception 'auth_required' using errcode = '42501'/);
  assert.match(body,/expected_revision is null or expected_revision < 0/);
  assert.match(body,/new_payload is null or jsonb_typeof\(new_payload\) <> 'array'/);
  assert.match(body,/if expected_revision = 0 then insert into public\.rareworth_collection_snapshots/);
  assert.match(body,/values \(owner_id, new_payload, 1, new_schema_version, new_device_id\) on conflict \(user_id\) do nothing returning \* into saved/);
  assert.match(body,/revision = current_snapshot\.revision \+ 1/);
  assert.match(body,/where current_snapshot\.user_id = owner_id and current_snapshot\.revision = expected_revision returning current_snapshot\.\* into saved/);
  assert.match(body,/if not found then return jsonb_build_object\('status', 'conflict'\)/);
  assert.match(body,/jsonb_build_object\('revision', saved\.revision::text\)/);
  assert.doesNotMatch(body,/on conflict[^;]+do update|execute\s|select\s+.*from\s+public\.rareworth_collection_snapshots/);
});
test('SQL functions have invoker security, explicit search_path and restricted execution',()=>{
  assert.equal((sql.match(/security invoker set search_path = ''/g)||[]).length,2);
  assert.doesNotMatch(sql,/security definer|service_role/);
  assert.ok(sql.includes('revoke all on function public.rareworth_save_collection_snapshot(bigint, jsonb, text, text) from public, anon, authenticated;'));
  assert.ok(sql.includes('grant execute on function public.rareworth_save_collection_snapshot(bigint, jsonb, text, text) to authenticated;'));
  assert.match(sql,/new\.updated_at := now\(\); return new/);
  assert.match(sql,/create trigger rareworth_snapshot_updated_at before update on public\.rareworth_collection_snapshots for each row execute function public\.rareworth_snapshot_touch_updated_at\(\)/);
});
test('SQL is transactional and rerunnable without dropping tables or seeding users',()=>{
  assert.match(sql,/^begin;/);assert.match(sql,/commit;$/);
  assert.doesNotMatch(sql,/drop table|truncate|insert into auth\.users|delete from|alter default privileges/);
  assert.equal((sql.match(/drop policy if exists /g)||[]).length,4);
  assert.match(sql,/drop trigger if exists rareworth_snapshot_updated_at on public\.rareworth_collection_snapshots/);
});
test('loaded production files, storage key and PWA remain byte-equivalent to v169',()=>{
  const baseline='604071a8cb8e24f4ef3f5ec03c3fc4991163a0b9';
  const html=fs.readFileSync('index.html','utf8');assert.doesNotMatch(html,/cloud-sync-v170/);
  const files=['index.html','sw.js','pwa-v169.js','manifest.json',...[...html.matchAll(/<script src="([^?]+)\?/g)].map(m=>m[1])];
  for(const file of new Set(files)){
    const before=execFileSync('git',['show',baseline+':'+file],{encoding:'utf8',maxBuffer:16*1024*1024});
    assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n?/g,'\n'),before.replace(/\r\n?/g,'\n'),file);
  }
  assert.match(fs.readFileSync('sw.js','utf8'),/rareworth-shell-v169/);
  assert.doesNotMatch(fs.readFileSync('sw.js','utf8'),/cloud-sync-v170/);
  assert.match(fs.readFileSync('ui-v137-collection.js','utf8'),/cardscout_collection_v133/);
});
test('repository has no embedded Supabase config, private key or JWT credential patterns',()=>{
  const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
  files.push(file,'cloud-sync-v170.js','docs/CLOUD-SYNC-V170.md');
  const patterns=[/https?:\/\/[a-z0-9-]+\.supabase\.(?:co|in)\b/i,/\bsb_(?:secret|publishable)_[a-z0-9_-]{12,}/i,/\beyJ[a-zA-Z0-9_-]{12,}\.[a-zA-Z0-9_-]{12,}\.[a-zA-Z0-9_-]{12,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
  for(const file of new Set(files)){
    if(!/\.(?:js|cjs|json|sql|md|html|ya?ml|toml|env)$/i.test(file))continue;
    const content=fs.readFileSync(file,'utf8');
    for(const pattern of patterns)assert.equal(pattern.test(content),false,'Credential/config pattern in '+file);
  }
});
