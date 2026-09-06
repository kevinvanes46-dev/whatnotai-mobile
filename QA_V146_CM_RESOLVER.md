# v146 Cardmarket resolver QA

Baseline: fetched origin/main and local main both equal 2a16d2eab37c129e076d75fa03b6423572e433ea; clean working tree before creating cardrally-v146-cm-resolver. Main must remain unchanged. No deployment or merge is part of this branch.

## Changes

- Set detection collects all matching aliases and orders them by descending length. Removal uses the same ordering.
- Routing cleans standalone delta symbols, duplicate Delta Species text, invisible/replacement characters and displayed collector-number suffixes. Existing local direct lookups retain the original name before using the cleaned name. The displayed catalog name is retained.
- Fallback searches now intentionally use the cleaned name only, without offer filters. This supersedes the stricter name/set/number expectation from v145.
- Verified selected local URLs take priority; existing direct mappings bypass the API. EN TCGdex selections with source_id can resolve through the Pokemon TCG API, with no key. Responses must agree on ID, set ID, set name, number and cleaned card name.
- Only HTTPS Cardmarket product URLs or the official prices.pokemontcg.io/cardmarket/<same-source-id> redirect are accepted. The official redirect is documented by the API: https://docs.pokemontcg.io/api-reference/cards/card-object/ .
- Successful API routes use only the new cardscout_cm_route_cache_v146 key, storing source_id, url and timestamp. Entries expire after 30 days; corrupt/expired/future entries and unavailable storage are safe. Concurrent identical requests share one fetch. The 3000ms timeout includes JSON parsing; a late response cannot replace a newer selection.
- The fallback is usable immediately. Resolved links update openBtn and the pending selection event used by the unchanged collection editor. Existing saved collection entries are not rewritten.
- makeBtn remains in the DOM with display:none. The persistent dock retains Open Cardmarket and the collection action. Manual name/number edits now rebuild the link; set/language/condition/edition listeners continue to do so. Cache-busting changes only the three changed runtime assets.

## Validation

52 checks passed:

- 10 existing routing regressions, with only intentional v146 search expectations and the focus-file change contract adjusted. All existing direct database routes compared against the baseline; embedded database unchanged. Collection file and scanner implementation compared byte-for-byte after line-ending normalization.
- 34 new mocked resolver/set-detection tests: the four required overlapping-set examples; Bagon DF43 and Azumarill DS19 exact product results; cleaned fallback names; CG4; EN and JP fallbacks; timeout; 404; corrupt cache; cache hits/expiry; invalid API identity/URL rejection; official redirect; storage denial; deduplication; stale-response protection.
- 8 isolated Chromium browser checks with all external requests mocked: actual Bagon quick entry, one visible Cardmarket button and visible collection action at 1280/390/375/320px, no horizontal overflow, actual TCGdex Azumarill selection/API upgrade, final URL in the collection editor, all six manual fields updating the dock, cached route avoiding additional requests, existing fictitious collection and purchase/stamped prices unchanged, zero browser runtime errors. Desktop/mobile screenshots visually inspected.

Commands:

```powershell
node tests/cardmarket-routing.test.cjs
node tests/cardmarket-resolver-v146.test.cjs
# Requires an installed Playwright package/browser; optional PLAYWRIGHT_MODULE and CHROME_PATH select existing installations.
node tests/cardmarket-ui-v146.test.cjs
node --check app-v137.js
node --check ui-v137-focus.js
node --check ui-v137-collection.js
node --check tests/cardmarket-routing.test.cjs
node --check tests/cardmarket-resolver-v146.test.cjs
node --check tests/cardmarket-ui-v146.test.cjs
git diff --check
```

## Remaining risks

The API, its Cardmarket redirect, and live Cardmarket search results were not tested against live services. API availability, CORS/rate limits, differing catalog IDs or strict identity mismatches may lead to the intended broad fallback. Offer-filter forwarding by the API's official redirect depends on that external service. Name-only search can return multiple sets. A user opening the immediately available fallback before resolution completes will use that fallback; already saved collection entries retain their saved URL. Scanner, pricing engine, Supabase and import/export code are unchanged.
