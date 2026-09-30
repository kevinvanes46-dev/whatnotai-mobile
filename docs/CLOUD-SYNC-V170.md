# RareWorth v170A: dormant cloud snapshot contract

This release contains no live backend, Supabase project/configuration, credentials,
network adapter, auth, UI or automatic synchronization. `cloud-sync-v170.js` is **not**
loaded by `index.html` and is not in the service-worker cache. Existing product scripts,
`rareworth-shell-v169`, Recent, favorites and the `cardscout_collection_v133` key are unchanged.
Local-first operation without an account remains the default. No migration reads or writes
browser storage. Do not replace localStorage with the snapshot envelope.

## Snapshot and ownership

`public.rareworth_collection_snapshots` holds one row per authenticated user:

| Field | Contract |
| --- | --- |
| user_id | UUID primary key, references `auth.users(id) ON DELETE CASCADE` |
| payload | Non-null JSON array; the existing collection objects, including unknown fields |
| revision | Positive bigint, initially 1, incremented by the save RPC |
| schema_version | Nonempty text, defaults to `v133`; no new card schema |
| device_id | Optional opaque text supplied by a future adapter |
| created_at / updated_at | Server timestamps; update trigger sets `updated_at = now()` |

No email, password or payment columns are defined. Collection purchase-price fields are
preserved as collection data. Arbitrary future fields remain intact; the contract cannot
recognize secrets placed inside an arbitrary JSON payload. Future adapters must upload
only the collection array, never account/session objects or all localStorage.

Ownership is enforced by RLS, not by a browser-provided owner ID. Each SELECT/INSERT/UPDATE/DELETE
policy targets `authenticated` and requires a non-null `auth.uid()` equal to `user_id`.
UPDATE has both USING and WITH CHECK, preventing reassignment to another owner.
PUBLIC and anon have no table or RPC access; authenticated has only the requested CRUD
table privileges and EXECUTE on the save RPC. The RPC takes no `user_id`: it derives it
from `auth.uid()`. Functions are SECURITY INVOKER with an empty, explicit search_path;
table/function references outside pg_catalog are schema-qualified.

## Saving with optimistic concurrency

`rareworth_save_collection_snapshot(expected_revision, new_payload, new_schema_version, new_device_id)`:

- Expected revision 0: INSERT revision 1, with ON CONFLICT DO NOTHING.
- Positive expected revision: atomic UPDATE WHERE owner AND revision match; increment by 1.
- A missing row with a positive expected revision, or any revision mismatch: `{status: "CONFLICT"}`.
- Success: `{status: "SAVED", snapshot: {...}}`. The returned revision is a decimal **string**
  to avoid bigint precision loss in JavaScript.
- Unauthenticated invocation: SQLSTATE 42501 (`AUTH_REQUIRED`). Invalid arguments: 22023
  (`INVALID_SNAPSHOT`). Bigint exhaustion is an error, never a reset or wraparound.

The predicate and write are a single database statement. Two writers using the same
revision cannot both save successfully. Concurrent initial saves cannot overwrite each other.
No stale-save retry with a newer revision is permitted without re-reading and explicit
conflict handling. Existing content is not merged automatically.

The future adapter **must use the RPC** for collection saves. The requested table CRUD grants
and ownership policies do not themselves enforce optimistic concurrency on direct table
updates. Do not implement an unconditional `.update()` or `.upsert()` save path. Emptying
a collection should save `[]` via the RPC, preserving revision history. Explicit row deletion
discards that history; discard any old sync basis as well before creating a new snapshot.

## Pure JavaScript API

CommonJS: `require('../cloud-sync-v170.js')`. A future browser inclusion exposes
`globalThis.RareWorthCloudSync`. Importing or calling helpers performs no I/O, clock reads,
UUID generation, device inspection or storage writes. All payload outputs are detached
JSON copies; neither inputs nor nested collection fields are mutated.

- `parseSnapshot(raw)` accepts a JSON string, an envelope, a legacy collection array, or
  null/undefined (absence). It validates and clones data, then recomputes the signature.
  Never trust a supplied snapshot signature without its payload.
- `createLocalSnapshot(array, metadata = {})` creates an envelope. Optional metadata:
  `schema_version`, `revision`, `device_id`, `created_at`, `updated_at`, `base`.
  No implicit timestamps. No device fingerprint; a later adapter may generate a random UUID.
- `classifySyncState(local, cloud)` returns one of the seven state strings below. A cloud
  snapshot must have a positive revision. **Null cloud means confirmed absence, not a
  failed network request or a request that has not completed.**
- `prepareUpload(local, cloudRevision)` returns `{status: 'READY', rpc, args}` or
  `{status: 'CONFLICT'}` without args. Expected revision 0 is allowed for a new local
  snapshot. Saving over an existing row requires a matching known base revision.
- `prepareDownload(cloud)` returns `{status: 'READY', collection, metadata}` including a
  new sync basis. It is a proposal, not permission to overwrite existing local data.

Revisions normalize to decimal strings in the range 0..9223372036854775807. Unsafe numeric
JavaScript revisions are rejected. A future adapter reading raw table rows must preserve
bigint precision (request revision as text); do not round large revisions through Number.

The sync basis is `{revision, signature}` from the last **confirmed** common snapshot.
`{revision: '0', signature: null}` denotes confirmed absence before the first save.
Keep basis metadata outside the existing collection array/key in a future integration.

| Situation | State |
| --- | --- |
| Both absent or the same empty content | EMPTY |
| Local content only, no prior cloud basis | LOCAL_ONLY |
| Cloud content only, local absent | CLOUD_ONLY |
| Identical payload and schema | IN_SYNC |
| Local changed, cloud still has base content | LOCAL_NEWER |
| Local has base content, cloud changed with a higher revision | CLOUD_NEWER |
| Both changed, no reliable base, regressed revision, disappeared synced row, or changed cloud content at the same revision | CONFLICT |

An explicit empty array is still content: clearing a synced collection can conflict with
another device's edit. An unknown relationship never becomes LOCAL_NEWER just because a
timestamp is later. Timestamps and device IDs are descriptive only; clock skew is not a
conflict resolver. Equal content needs no write, even if descriptive metadata differs.

If cloud content is unchanged but its revision advanced, classification may be LOCAL_NEWER.
`prepareUpload` still refuses a mismatched base revision: a future adapter must establish
and confirm the new basis from the fetched content before preparing a save.

Example (pure proposals only):

```js
const sync = require('../cloud-sync-v170.js');
const remote = sync.parseSnapshot({payload: [{sourceId: 'neo1-036'}], revision: '4'});
const download = sync.prepareDownload(remote);
const edited = sync.createLocalSnapshot(
  [{sourceId: 'neo1-036', quantity: 2}], download.metadata
);
sync.classifySyncState(edited, remote); // LOCAL_NEWER
sync.prepareUpload(edited, remote.revision); // READY, expected_revision '4'
```

## Canonical content identity

The signature is `rareworth-json-v1:` plus canonical JSON of `{payload, schema_version}`.
It is an exact, collision-free content signature, not a cryptographic authentication token
or a short hash. Object keys are sorted lexicographically, recursively; array order remains
unchanged. Unicode is not normalized. Standard JSON number/string encoding is used.
Metadata such as device IDs, revisions and timestamps does not change content identity.
Signatures contain collection data: do not treat them as anonymized telemetry or log them.

Unknown collection fields are kept. Non-JSON input (undefined, functions, symbols, cycles,
accessors, Date/class instances, sparse/extended arrays or nonfinite numbers) is rejected
instead of silently stripping fields. Invalid payloads never become an empty collection.

## Future configuration and v170B

No actual Supabase URL, project ID or key is present. v170B will add account/auth UI and
a real adapter, separately reviewed. A publishable key may be client-side later; it is not
authorization without the user's session and RLS. A service_role key or secret key must
never enter browser code, this repository or client-visible configuration.

Before any real integration: apply and test the migration in an isolated backend, verify
anon denial and two-user isolation through the actual Data API, and exercise simultaneous
writers. Use the explicit grants; do not rely on project default privileges. No anonymous
sign-in is configured here. The database `anon` role is distinct from an Auth anonymous
user, which can receive the authenticated role; v170B must choose its auth policy explicitly.

Future UI must require an explicit choice on conflicts. Recheck local content immediately
before applying any confirmed download, and only advance the sync basis after an acknowledged
save/download. No failure may clear local storage. Do not sync Recent or favorites implicitly.

## Validation scope

The Node tests validate the pure engine, JSON preservation, conflicts, dormant production
integration and SQL text contract. They require no credentials or network calls. SQL checks
are **static**, not a live RLS/concurrency test. No local PostgreSQL/Supabase runtime is assumed,
and this migration is not applied in CI or production. CREATE TABLE IF NOT EXISTS and replacement
of this migration's own policies/functions/trigger make a same-schema rerun safe. It is not a
repair migration for a pre-existing incompatible table. There is no DROP TABLE, data migration
or seed user.

References checked for the contract:

- [Supabase RLS, grants and ownership](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database functions and privileges](https://supabase.com/docs/guides/database/functions)
- [Explicit table exposure/grants change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
