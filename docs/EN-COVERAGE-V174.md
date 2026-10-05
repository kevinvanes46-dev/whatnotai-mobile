# HoloKeep EN coverage v174

Baseline: `5cfda7e927b89555c6cbb784b4d7a6ac8149640b`.

## Sources and coverage

Frozen complete set responses were fetched on 2026-10-05 from the official TCGdex API at `https://api.tcgdex.net/v2/en/sets/{source_id}`, with a maximum of six concurrent requests. Each response ID and card list was checked before implementation. Fixtures are in `tests/fixtures/en-sets-v174/`; tests never depend on live API or Cardmarket data.

Counts reflect the actual cards array, including secret cards and promos (not only cardCount.official). DP and promos contain 900 cards; POP contains 153; total 1,053. Legends Awakened's 146 cards were already supported.

Search and collection results below refer to the dedicated browser regression, which checks every alias, full set label, name + number + set, identity, conditions, Recent restore, collection persistence and loaded artwork. Route types are for each representative card under frozen metadata, not claims about every card in the set.

| Set | Canonical key | Source ID | Cards | Representative | Search | Collection | Cardmarket route |
|---|---|---|---:|---|---|---|---|
| Diamond & Pearl | DIAMOND PEARL | [dp1](https://api.tcgdex.net/v2/en/sets/dp1) | 130 | Dialga (dp1-1) | PASS | PASS | SEARCH |
| Mysterious Treasures | MYSTERIOUS TREASURES | [dp2](https://api.tcgdex.net/v2/en/sets/dp2) | 124 | Lucario (dp2-122) | PASS | PASS | SEARCH |
| Secret Wonders | SECRET WONDERS | [dp3](https://api.tcgdex.net/v2/en/sets/dp3) | 132 | Ampharos (dp3-1) | PASS | PASS | SEARCH |
| Great Encounters | GREAT ENCOUNTERS | [dp4](https://api.tcgdex.net/v2/en/sets/dp4) | 106 | Blaziken (dp4-1) | PASS | PASS | SEARCH |
| Majestic Dawn | MAJESTIC DAWN | [dp5](https://api.tcgdex.net/v2/en/sets/dp5) | 100 | Articuno (dp5-1) | PASS | PASS | SEARCH |
| Legends Awakened | LEGENDS AWAKENED | [dp6](https://api.tcgdex.net/v2/en/sets/dp6) | 146 | Deoxys Normal Forme (dp6-1) | PASS | PASS | DIRECT — existing product 278150 |
| Stormfront | STORMFRONT | [dp7](https://api.tcgdex.net/v2/en/sets/dp7) | 106 | Charizard (dp7-103) | PASS | PASS | SEARCH |
| DP Black Star Promos | DP BLACK STAR PROMOS | [dpp](https://api.tcgdex.net/v2/en/sets/dpp) | 56 | Dialga (dpp-DP17) | PASS | PASS | SEARCH |
| POP Series 1 | POP SERIES 1 | [pop1](https://api.tcgdex.net/v2/en/sets/pop1) | 17 | Blaziken (pop1-1) | PASS | PASS | SEARCH |
| POP Series 2 | POP SERIES 2 | [pop2](https://api.tcgdex.net/v2/en/sets/pop2) | 17 | Entei (pop2-1) | PASS | PASS | SEARCH |
| POP Series 3 | POP SERIES 3 | [pop3](https://api.tcgdex.net/v2/en/sets/pop3) | 17 | Blastoise (pop3-1) | PASS | PASS | SEARCH |
| POP Series 4 | POP SERIES 4 | [pop4](https://api.tcgdex.net/v2/en/sets/pop4) | 17 | Chimecho δ (pop4-1) | PASS | PASS | SEARCH |
| POP Series 5 | POP SERIES 5 | [pop5](https://api.tcgdex.net/v2/en/sets/pop5) | 17 | Mew δ (pop5-3) | PASS | PASS | SEARCH |
| POP Series 6 | POP SERIES 6 | [pop6](https://api.tcgdex.net/v2/en/sets/pop6) | 17 | Bastiodon (pop6-1) | PASS | PASS | SEARCH |
| POP Series 7 | POP SERIES 7 | [pop7](https://api.tcgdex.net/v2/en/sets/pop7) | 17 | Ampharos (pop7-1) | PASS | PASS | SEARCH |
| POP Series 8 | POP SERIES 8 | [pop8](https://api.tcgdex.net/v2/en/sets/pop8) | 17 | Heatran (pop8-1) | PASS | PASS | SEARCH |
| POP Series 9 | POP SERIES 9 | [pop9](https://api.tcgdex.net/v2/en/sets/pop9) | 17 | Garchomp (pop9-1) | PASS | PASS | SEARCH |

## Search and identity

Explicit DP/POP aliases constrain results to the chosen canonical set before token scoring. The digit in “pop 5” belongs to its alias. Full alphanumeric collector numbers such as DP17 are searchable. No set-size hints were added: 106 cannot distinguish DP4/DP7, and 17 cannot identify a POP set.

TCGdex DP1 contains no Pikachu. “pikachu dp” and “pikachu dp1” correctly return no result, rather than silently selecting Pikachu from DP2, DP7 or another set. POP5's Mew is officially named “Mew δ”; both “mew pop 5” and “mew pop5” find it.

Remote source_id, source_set_id, number, EN language and canonical set/display label remain distinct. Collection keeps its existing sourceId field and preserves source_set_id for these EN cards using the existing extensible item object; there is no migration or key change. The regression verifies name, number, set, source identity, EX condition, quantity 2, paidEach 4.25, OWNED and NORMAL across reload. Unknown market value remains null.

## Routing and performance

No new direct URL or product mapping is added. The existing validated product catalog and identity checks remain authoritative. Unverified DP/POP cards use SEARCH with the correct name, collector number and display set; NM/EX/GD/PL keep minCondition 2/3/4/6. Existing generic and JP routing are unchanged.

Embedded local cards are available synchronously before the cards.json request. EN set endpoints load in the existing background queue, maximum concurrency six; JP starts afterwards through the existing idle scheduling. There is no per-card preload. Per-card metadata/artwork requests occur only through existing selection/collection flows.

Only the EN search cache version changes to cardscout_search_catalog_v152_EN_v174. The existing 14-day TTL is retained; JP still uses JP_v160. Old EN cache and user data are not deleted. A same-storage offline browser reload recovers DP/POP catalog results; an empty cache retains embedded local cards without a crash.

## Protected scope and validation

Production files: app-v137.js, cards.json, ui-v137-focus.js, ui-v137-collection.js, index.html, brand-v172.js, sw.js. Branding remains HoloKeep; About is v174 · Beta; shell cache is rareworth-shell-v174. Updated script URLs are precached. CacheStorage remains same-origin only.

JP engines, mappings, artwork, manifests, scanner logic, stamped membership, pricing fundamentals, cloud/auth/Supabase and storage keys remain unchanged. JP audit stays 780 / 397 EXACT / 383 SEARCH.

The 184 existing regressions remain enabled. Version/cache expectations advance to v174. Historical engine byte checks reverse only exact reviewed v174 blocks via coverage-scope-v174.cjs; any other edit still fails. No old assertion or test is removed. The new suite adds 22 tests, including all 17 set regressions and Chromium checks at 320/375/390/430px. Total: 206 tests. CI includes the dedicated v174 suite.
