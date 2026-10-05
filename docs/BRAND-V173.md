# HoloKeep v173 — product-facing rebrand

VISIBLE BRAND: **HoloKeep**. LEGACY INTERNAL BRAND: **RareWorth**.

The central frozen `window.RareWorthBrand` now contains HoloKeep, the unchanged
tagline, HoloKeep document title and v173/Beta. Static HTML fallbacks, Apple title,
manifest names and the home JP artwork placeholder also show HoloKeep. The placeholder
reads the brand config; no artwork resolution or Recent behavior changes.

## Compatibility and data

There is no data migration, copy, rename or deletion. Keep all existing globals:
RareWorthBrand, RareWorthCloudAdapter, RareWorthCloudSync, RareWorthAccount,
RareWorthSupabaseConfig, RareWorthJPImageLibrary/Manifest and RareWorthKeyboard.
Keep collection `cardscout_collection_v133`, `rareworth_cloud_sync_v170`,
`rareworth_device_id_v170`, `rareworth_account_enabled_v170`,
`rareworth_guest_session_v171_1`, `rareworth_onboarding_v171` and all Recent/Favorites
keys. Visible branding is independent of these compatibility contracts.

Supabase project name/ref/URL/keys, RPCs, tables, RLS, auth redirects/PKCE/session
logic and migrations are unchanged. No live backend operation or real authmail is
part of branch validation. Repository and Pages URL remain whatnotai-mobile.

## Icon and cache

Existing icon filenames remain `icon-rareworth.svg` and the 180/192/512 PNG variants.
The new vector has a dark-green rounded tile, two offset cards, geometric H and
mint sparkle. No fonts, text glyphs, Pokémon assets or external rendering services.
PNG files are rendered with the existing locked Sharp dependency: resize the SVG
to each size and encode as PNG. The full background is opaque.

Cache name: `rareworth-shell-v173`. Retaining the prefix preserves the existing
scoped cleanup regex and rollback compatibility. No cleanup-rule expansion,
unregister or reload changes. Brand, manifest, SVG/Apple icon and presentation
script URLs use `173-holokeep-rebrand`; unchanged manifest PNG paths are fetched
with cache reload during install. Precache is same-origin only. Install URL,
scope, display, orientation and colours remain unchanged.

## Remaining legacy occurrence classification

The exact production-line allowlist is `tests/brand-allowlist-v172.json`.
All remaining occurrences fall into these categories; none are visible brand copy:

| Location | Allowed legacy purpose |
|---|---|
| brand-v172.js | Read-only global name |
| index.html, manifest.json | Existing icon filenames only |
| account-ui-v170.js, onboarding-v171.js | Globals and existing storage keys |
| cloud-adapter-v170.js, cloud-sync-v170.js | Globals, storage, signature prefix, RPC names |
| supabase-client-v170.js, supabase-config-v170.js | Existing globals |
| supabase/migrations/* | Historical filenames, tables, RPCs, policies and triggers |
| jp-image-library-v161.js, jp-image-manifest-v161.js | Existing global APIs |
| ui-v150-experience.js | Brand and image-library global references |
| ui-v153-mobile.js, ui-v154-keyboard.js | Keyboard API/event identifiers |
| sw.js | Cache prefix, cleanup regex and icon paths |
| pwa-v169.js | Internal source comment only |
| artifacts/rareworth-v150/* | Historical test artifact paths/logs, never app-loaded |

The generated tracked-repository appendix in BRAND-V172.md is kept current for CI;
its v172 design notes describe the pre-rebrand state and are superseded here.
Other tests/docs/scripts may retain historical names and technical fixtures.
New visible RareWorth copy must fail both the exact allowlist and DOM/text checks.

## Verification

The v173 suite checks config, manifest/Apple metadata, static pre-script content,
SVG parsing/monogram, opaque nonempty PNGs/dimensions, all five screens and widths
320/375/390/430. It saves 390px screenshots to the OS temporary directory only when
`HOLOKEEP_SCREENSHOTS` is set. Existing session/auth/cloud/routing regressions remain
mandatory. The worker update test installs the actual previous v172 worker/assets,
then updates to v173 and verifies data, same-origin cache and unrelated cache survival.
