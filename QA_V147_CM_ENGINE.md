# v147 generic Cardmarket engine

Baseline: clean working tree; fetched origin/main and local main were exactly 20f28591bbf729e8d0f244ce61ef2f900f584c14. Work is isolated on cardrally-v147-cm-engine. No main merge or deployment is included.

## Runtime changes

All production link generation, including candidate selection, goes through resolveFinalCardmarketRoute(card). It returns a final object immediately for verified local/legacy direct routes, valid cached routes, JP broad searches or cards without a remote ID. EN catalog IDs without an immediate route return a promise for the existing validated remote stage and its final fallback. The legacy URL literals are unchanged; their routing decisions now use isolated card inputs rather than live DOM fields. buildUrl remains a compatibility adapter for the earlier routing tests.

Pending state has a visible dock, disabled Cardmarket link, href '#', label 'Cardmarket zoeken…', and a visible disabled collection button. No temporary URL is published, copied, added to recent links or passed to the collection. Only final results dispatch cardscout:cm-route-ready. The existing collection selection is cleared while pending, without writing collection storage. A newer selection or edited search text invalidates older results; identical concurrent requests share one fetch. The existing 3000ms deadline remains in force.

The cache key and schema remain cardscout_cm_route_cache_v146 with source_id/url/timestamp and a 30-day maximum age. JP does not reuse the EN-only cache because TCGdex can reuse an English source_id for a Japanese card. Verified JP direct routes are preserved.

Set matching keeps longest-alias priority and also includes canonical labels from DATA.sets. Routing-only name cleanup handles repeated collector-number suffixes in addition to the existing delta/control/replacement cleanup. Visible names are retained. Only app-v137.js and ui-v137-focus.js receive 147-cm-engine cache-busts; CSS and collection assets are unchanged.

## Validation

697 tests/checks passed:

| Suite | Passed |
| --- | ---: |
| Existing routing suite | 10 |
| v146 resolver suite | 34 |
| v147 generic engine suite | 636 |
| Existing v146 browser suite | 8 |
| v147 browser suite | 9 |

Coverage counts (database copies overlap; counts are not all unique cards):

- 523 database records: 258 embedded plus 265 cards.json, covering 265 unique card keys.
- 491 verified direct records checked for exact URL/filter preservation, covering 248 unique direct URLs.
- All 28 legacy product URL literals compared against the original baseline; no new card-specific runtime mappings.
- 26 representative remote mock records across Base/Jungle/Fossil, Neo, e-Card, EX, Delta Species, Dragon Frontiers, Power Keepers, Team Rocket Returns and JP. Bagon DF43 exercises the existing legacy direct route; Azumarill DS19 exercises remote resolution. Mock metadata is test data, not a live catalog audit.
- 9 automatically enumerated cross-set alias-overlap pairs, plus 35 canonical set-label tests (44 set checks total).
- 40 async-state tests across a reproducible five-card sample (seed 147): pending/success, timeout, 404, invalid identity, stale response, immediate cache, deduplication and clearing a pending search.
- Browser checks at desktop 1280px and 390/375/320px: exactly one visible CM action, collection visible/disabled during pending, no horizontal overflow or dock geometry change after viewport transitions finish. API success and failure are both exercised. Screenshots inspected.
- An actual isolated-browser collection save contains the final URL. The existing fixture's URL, purchase price, condition and stamped data remain unchanged. No browser runtime errors.
- The v146 test expecting an immediate clickable fallback was intentionally updated to expect blocked pending state; all other cases remain. Shared test setup moved into tests/helpers/cardmarket-harness.cjs.
- Scanner implementation, embedded data and collection source are compared against the earlier frozen baseline. JS syntax checks and git diff --check passed.

Run the suites with node tests/cardmarket-routing.test.cjs, node tests/cardmarket-resolver-v146.test.cjs, node tests/cardmarket-engine-v147.test.cjs, node tests/cardmarket-ui-v146.test.cjs and node tests/cardmarket-ui-v147.test.cjs. Browser suites require an existing Playwright/Chromium installation; PLAYWRIGHT_MODULE and CHROME_PATH can select it. All external browser/API requests are mocked and no live service is needed for the tests.

## Remaining risks

API availability, CORS/rate limits, mismatched catalog IDs and strict identity validation can produce the intended final broad search after up to three seconds. A name-only search can contain multiple sets. Live Cardmarket results and the API's official Cardmarket redirects were not verified; forwarding offer filters through that redirect remains externally controlled. Old requests are neutralized for UI/collection updates and may still complete or time out; a valid success can populate the cache. Existing collection URLs are intentionally not migrated. Mobile layout was tested in Chromium viewports, not on physical Safari devices. Scanner, pricing, Supabase and import/export code are unchanged.
