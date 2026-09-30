-- v170A contract only. This migration is not applied by the app or CI.
begin;

create table if not exists public.rareworth_collection_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  schema_version text not null default 'v133' check (length(schema_version) > 0),
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rareworth_snapshot_payload_array check (jsonb_typeof(payload) = 'array')
);

alter table public.rareworth_collection_snapshots enable row level security;
revoke all on table public.rareworth_collection_snapshots from public, anon, authenticated;
grant select, insert, update, delete on table public.rareworth_collection_snapshots to authenticated;

drop policy if exists rareworth_snapshot_select on public.rareworth_collection_snapshots;
create policy rareworth_snapshot_select on public.rareworth_collection_snapshots
  for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists rareworth_snapshot_insert on public.rareworth_collection_snapshots;
create policy rareworth_snapshot_insert on public.rareworth_collection_snapshots
  for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists rareworth_snapshot_update on public.rareworth_collection_snapshots;
create policy rareworth_snapshot_update on public.rareworth_collection_snapshots
  for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists rareworth_snapshot_delete on public.rareworth_collection_snapshots;
create policy rareworth_snapshot_delete on public.rareworth_collection_snapshots
  for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create or replace function public.rareworth_snapshot_touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.rareworth_snapshot_touch_updated_at() from public, anon, authenticated;
drop trigger if exists rareworth_snapshot_updated_at on public.rareworth_collection_snapshots;
create trigger rareworth_snapshot_updated_at
  before update on public.rareworth_collection_snapshots
  for each row execute function public.rareworth_snapshot_touch_updated_at();

create or replace function public.rareworth_save_collection_snapshot(
  expected_revision bigint,
  new_payload jsonb,
  new_schema_version text,
  new_device_id text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  saved public.rareworth_collection_snapshots%rowtype;
begin
  if owner_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if expected_revision is null or expected_revision < 0
      or new_payload is null or jsonb_typeof(new_payload) <> 'array'
      or new_schema_version is null or length(new_schema_version) = 0 then
    raise exception 'INVALID_SNAPSHOT' using errcode = '22023';
  end if;
  if expected_revision = 0 then
    -- Concurrent first saves cannot replace one another.
    insert into public.rareworth_collection_snapshots (user_id, payload, revision, schema_version, device_id)
    values (owner_id, new_payload, 1, new_schema_version, new_device_id)
    on conflict (user_id) do nothing
    returning * into saved;
  else
    -- One atomic compare-and-swap, not SELECT followed by an unconditional UPDATE.
    update public.rareworth_collection_snapshots as current_snapshot
    set payload = new_payload,
        revision = current_snapshot.revision + 1,
        schema_version = new_schema_version,
        device_id = new_device_id
    where current_snapshot.user_id = owner_id
      and current_snapshot.revision = expected_revision
    returning current_snapshot.* into saved;
  end if;
  if not found then
    return jsonb_build_object('status', 'CONFLICT');
  end if;
  -- JSON numbers cannot represent every bigint in JavaScript. Return a decimal string.
  return jsonb_build_object('status', 'SAVED', 'snapshot',
    to_jsonb(saved) || jsonb_build_object('revision', saved.revision::text));
end;
$$;
revoke all on function public.rareworth_save_collection_snapshot(bigint, jsonb, text, text) from public, anon, authenticated;
grant execute on function public.rareworth_save_collection_snapshot(bigint, jsonb, text, text) to authenticated;

commit;
