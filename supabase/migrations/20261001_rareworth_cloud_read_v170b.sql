-- Repository-only migration. Apply separately after review; never from the client.
begin;
create or replace function public.rareworth_get_collection_snapshot()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'payload', snapshot.payload,
    'revision', snapshot.revision::text,
    'schema_version', snapshot.schema_version,
    'device_id', snapshot.device_id,
    'created_at', snapshot.created_at,
    'updated_at', snapshot.updated_at
  )
  from public.rareworth_collection_snapshots as snapshot
  where snapshot.user_id = (select auth.uid());
$$;
revoke all on function public.rareworth_get_collection_snapshot() from public, anon, authenticated;
grant execute on function public.rareworth_get_collection_snapshot() to authenticated;
commit;
