# v163 Japanese Cardmarket products

Baseline: `f0053b32286e21bee4cb56673070c758d9f5abaf`.
Branch: `rareworth-v163-jp-native-cardmarket`. No merge or deployment.

## Cause and behavior

v162 resolved a Japanese source record to a Western product and added `language=7`.
A language filter cannot establish the Japanese expansion/product identity.
The new final JP resolver uses explicit source-ID, source-set, Japanese expansion
and product mappings. It does not generate products from Pokémon names or aliases.
Unknown/conflicting/ambiguous mappings produce SEARCH, even if a saved link was
marked verified or the Western twin has a known product ID. Western twin reference
and EN routing remain available.

Recent skipped re-resolution for saved syntactically valid product URLs. Collection
also returned saved JP URLs directly. Both now resolve JP links before rendering,
so old v162 Western URLs cannot reappear after reload. Storage identity is retained;
existing saved data is not rewritten merely by reading it.

Native URLs retain condition and edition filters, but omit language entirely.
EX uses `minCondition=3`; NM uses `minCondition=2`. Source ID, source set,
JP language, RareWorth set/name, edition, variant and condition are not converted.

## Mapping evidence

The four Pikachu source-to-product mappings below were explicitly supplied as
proven acceptance cases in the v163 request. Japanese source IDs, names and set
membership are captured in `tests/fixtures/jp-sets-v160`. The three older regression
cards also have exact source records in `jp-artwork-v158.js`; their native pages
were checked against Cardmarket search results on 2026-09-13. Swinub's native path
is additionally present in the existing embedded JP catalog.

| JP source ID | Japanese Cardmarket product |
|---|---|
| PMCG1-035 | [Expansion Pack / Pikachu](https://www.cardmarket.com/en/Pokemon/Products/Singles/Expansion-Pack/Pikachu) |
| PMCG2-024 | [Pokémon Jungle / Pikachu](https://www.cardmarket.com/en/Pokemon/Products/Singles/Pokemon-Jungle/Pikachu) |
| neo1-036 | [Gold, Silver, to a New World… / Pikachu](https://www.cardmarket.com/en/Pokemon/Products/Singles/Gold-Silver-to-a-New-World/Pikachu-GSNW) |
| PMCG5-036 | [Leaders' Stadium / Lt. Surge's Pikachu](https://www.cardmarket.com/en/Pokemon/Products/Singles/Leaders-Stadium/Lt-Surges-Pikachu-LST) |
| neo1-061 | [Gold, Silver, to a New World… / Snubbull](https://www.cardmarket.com/en/Pokemon/Products/Singles/Gold-Silver-to-a-New-World/Snubbull-GSNW) |
| neo3-048 | [Awakening Legends / Snubbull](https://www.cardmarket.com/en/Pokemon/Products/Singles/Awakening-Legends/Snubbull-AL) |
| neo3-038 | [Awakening Legends / Swinub](https://www.cardmarket.com/en/Pokemon/Products/Singles/Awakening-Legends/Swinub-AL) |

Extend `expansions` and `products` only with an independently proven Japanese
source record and unique Japanese product page. Adding an expansion alone grants
no exact routes. Duplicate IDs or product paths are rejected. PMCG3/4/6 and
neo2/4 can be added with evidence without changing the resolver. Unlisted cards
currently use SEARCH; the seven mappings are deliberately not full-set coverage.

## Validation

59 targeted Node tests cover v163 native routes and v157–v162 reference/identity
regressions. The older isolated twin unit tests retain the reference-layer contract;
v163 unit tests and all five browser scripts exercise the final native JP contract.
Browser expectations that previously required Western IDs or `language=7` were
updated to the explicitly requested native paths; identity/UI/artwork assertions
remain. The four-Pikachu script additionally checks EX/NM, old verified Western
links in Recent/Collection, reload and unknown-card truthful SEARCH.

These are fixture-backed application checks, not Cardmarket checkout or offer tests.
