# Cardmarket routing v145

Base: clean main and fetched origin/main both at 80cbcfc197cf7f8419e781efc47080c892a4ef67. index.html loads the v144-polish assets. No deployment was performed or independently verified.

Changes are limited to Cardmarket routing in app-v137.js. EN fallback uses card name, full set label and collector number; legacy compact queries are ignored even in cached records. JP fallback uses the name. Search URLs omit offer filters; direct product URLs retain existing behavior. First edition fallback keeps the collector number without adding an edition search constraint.

Validation: node tests/cardmarket-routing.test.cjs: 10 tests passed. Includes requested examples, invisible characters and duplicate numbers, search filter removal, direct filter preservation, comparison of existing direct routes against v144, and unchanged collection/selection source including cardscout_collection_v133 and final URL persistence. Collection validation is a source contract regression check, not an interactive browser/storage test. JS syntax checks passed for app-v137.js, ui-v137-focus.js, ui-v137-collection.js and the test file. git diff --check passed.

Structural URL audit (records, not unique URLs):

| Source | Direct | Fallback/search-only | Malformed |
| --- | ---: | ---: | ---: |
| Embedded knownCards | 242 | 16 | 0 |
| cards.json knownCards | 249 | 16 | 0 |
| Additional routing product literals (unique, overlapping database) | 28 | 0 | 0 |

Empty URLs on search-only records are intentional. No direct-flagged empty URLs were found. Remote TCGdex catalogs are loaded at runtime and are not included in these fixed database counts. The datasets and mapping literals overlap and should not be summed.

Remaining risks: structural validity does not verify that Cardmarket still serves a product or returns a specific search result. Broader JP name searches can return multiple cards. Existing saved collection URLs remain unchanged; newly selected cards use the corrected route. Release cache-busting/version labels remain for the later v145 deployment review. Scanner, collection pricing, collection storage, Supabase, and catalog caches were not modified.
