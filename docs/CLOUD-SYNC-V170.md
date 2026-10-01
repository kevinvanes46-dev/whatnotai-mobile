# RareWorth v170B: optional account and collection sync

The dedicated RareWorth Supabase project already exists. The user reports that the v170A
backend migration, RLS isolation and CAS have been applied and tested. This branch does
not apply migrations, configure Auth, send live mail or create users.

Local-first operation without an account remains the default. Collection storage stays
an array at `cardscout_collection_v133`; Recent, favorites and backups remain local.

## Snapshot and ownership

`public.rareworth_collection_snapshots` holds one row per authenticated user:

| Field | Contract |
| --- | --- |
| user_id | UUID primary key, references `auth.users(id) ON DELETE CASCADE` |
| payload | Non-null JSON array; the existing collection objects, including unknown fields |
| revision | Positive bigint, initially 1, incremented by the save RPC |
| schema_version | Nonempty text, defaults to `v133`; no new card schema |
| device_id | Optional opaque text generated on explicit upload |
| created_at / updated_at | Server timestamps; update trigger sets `updated_at = now()` |

No email, password or payment columns are defined. Collection purchase-price fields are
preserved as collection data. Arbitrary future fields remain intact; the contract cannot
recognize secrets placed inside an arbitrary JSON payload. Adapters upload
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
JavaScript revisions are rejected. The read RPC preserves
bigint precision (request revision as text); do not round large revisions through Number.

The sync basis is `{revision, signature}` from the last **confirmed** common snapshot.
`{revision: '0', signature: null}` denotes confirmed absence before the first save.
Basis metadata lives outside the collection array in `rareworth_cloud_sync_v170`.

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

## Optional integration and deployment prerequisites

Account & cloud backup lives in Meer. No account is required to use Search, Collection,
Recent or backups. First login reads and classifies; it never chooses upload/download.
Conflicts have no overwrite action: use Backup & herstel. An empty unbound local array
can explicitly restore cloud data. Clearing a previously synced array remains a local edit.

The modern publishable browser key is frozen in supabase-config-v170.js. It is public
configuration, not privileged authorization. Only that exact config is permitted by the
credential regression. A service_role key, sb_secret key, database password or private
JWT must never be embedded. Documentation intentionally does not duplicate the key.

Official @supabase/supabase-js **2.117.2** is loaded lazily from the npm package's
**dist/umd/supabase.js** through jsDelivr, with an exact URL and SHA-384 SRI. The CDN
bytes were compared with the official npm tarball. No bundler/vendor dependency was
added. The SDK owns PKCE, sessions, refresh and logout. No tokens are manually stored
by the account modules. The browser package is only needed after account opt-in or
an Auth callback; visiting Meer as a local-only user makes no SDK request. A local
opt-in marker allows a returning user to resume the SDK session when opening Meer.
Offline startup never loads the SDK. A blocked CDN reports an account error without
blocking the local app. SDK API usage: getSession, onAuthStateChange, signInWithOtp
with shouldCreateUser:true, and signOut with scope:local. Async work is deferred out
of Auth callbacks to avoid the SDK's session lock.

Before deployment, configure Supabase Auth **separately**:

- Production Site URL: https://kevinvanes46-dev.github.io/whatnotai-mobile/
- Allow that exact production folder URL as an Auth redirect.
- Allow explicit localhost development URLs only when needed. Runtime redirects use
  the current app folder, removing query/hash/index.html, never hardcoding production.
- Review and apply 20261001_rareworth_cloud_read_v170b.sql separately. It has no
  arguments, derives ownership from auth.uid(), returns null for no row, casts revision
  to text, uses invoker/RLS and an empty search_path, and grants execution only to
  authenticated. This branch tests SQL statically; it does not claim live validation.
- Verify mail delivery and the reviewed production redirect after configuration.

## Sync safety

cloud-sync-v170.js remains the unchanged pure engine. supabase-client-v170.js owns
SDK/auth, cloud-adapter-v170.js owns the two RPCs and separate metadata, and
account-ui-v170.js owns presentation. Existing product scripts keep their order.
Only the collection array goes to the save RPC, never a whole storage dump.

Metadata contains boundUserId and per-user confirmed revision/signature/schema/timestamp.
Device ID uses crypto.randomUUID() only on upload, in rareworth_device_id_v170.
A conservative ownership guard is persisted before an explicit write, separately from
its basis: even a cancelled/failed request cannot make an A-bound device eligible for B.
No revision/signature advances at request start, on failure or on conflict. A confirmed
basis is saved only after SAVED or an explicit safe local download. Storage errors fail
closed; after a completed collection write but failed metadata write, data stays intact
and the UI asks to recheck. No cleanup or rollback deletes the collection.

Every request uses the SDK-issued token for the session checked at dispatch, so a
concurrent account change cannot send A's payload using B's token. Session epochs
ignore late responses. Signout preserves binding and all local data. A different
account gets ACCOUNT_MISMATCH with no sync actions. This beta has no rebind/force
merge button. Return to the original account or use a separate browser profile.

Uploads use only rareworth_save_collection_snapshot with expected_revision. CONFLICT
never retries automatically. Cloudstatus controleren rereads and reclassifies.
Downloads require the unchanged clicked-state signature, reread immediately before
one complete setItem; no clear/remove step. Normal collection rendering follows.
Unknown fields and JP Unicode remain unchanged in snapshot transfer. Unsupported
schema versions, malformed data and offline/auth/network errors never trigger replacement.
Same-content first login does not manufacture a confirmed basis; subsequent ambiguous
edits safely conflict. A concurrent same-content revision change also fails closed.

## PWA and validation

rareworth-shell-v170 precaches the new local JS/CSS, retaining navigation network-first
and same-origin-only caching. No Supabase Auth/REST/RPC, SDK CDN, marketplace, TCGdex
or artwork URL is cached. Account startup is optional; cached local collection UI works
offline. The version label is v170 · Beta; the four bottom navigation items are unchanged.

CI retains core 72 + line-ending 6, v168 2, v169 5 and v170A 25 tests. The v170A static
integration assertions now explicitly allow this authorized account shell while comparing
every original product engine to baseline. The added Node tests cover all states, CAS,
account switching, stale clicks/requests, failures, Unicode and read RPC SQL. A 390x844
Chromium smoke mocks only the SDK boundary; production modules, collection editor,
storage and service worker run unchanged. It exercises two uploads, remote download,
conflict, signout and offline reload, without live users/mail/network-dependent data.

References:
- https://supabase.com/docs/reference/javascript/auth-signinwithotp
- https://supabase.com/docs/reference/javascript/auth-onauthstatechange
- https://supabase.com/docs/guides/database/postgres/row-level-security
