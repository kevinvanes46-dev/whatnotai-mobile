# HoloDex v180 beta readiness

Base: c05e3e13c78cc3ac7720a5d1013e1fb8eaacf3d6 (v179). Separate branch: holodex-v180-beta-readiness. No merge or deployment.

## Audit before changes

The complete v179 CI command sequence passed locally: 424 tests. A separate frozen Chromium audit captured the primary screens at 320, 375, 390 and 430 pixels. Existing browser suites exercise guest/account mocks, Home states, EN/JP routes, collection editing, quantity, partial/legacy/zero costs, filters, sorts, import/export, offline and service-worker updates.

Nine issue groups found and addressed:

| Classification | Finding | Change |
|---|---|---|
| INCONSISTENT | Previous visible product name/version | HoloDex v180 metadata, shell, manifest and About |
| BROKEN | JP source Charizard records excluded by numeric query | Search-only Pokédex hints from existing trusted names |
| CONFUSING | Multiword JP set queries fail | Longest existing JP set alias recognized |
| CONFUSING | No results leaves stale route feedback | Explicit empty/offline search message |
| UNNECESSARY | Catalog-loaded and technical selection toasts | Quiet catalog completion and simple selection confirmation |
| UGLY | Empty collection CTA tiny/default style | Consistent mint button, minimum 44px |
| INCONSISTENT | Account button and editor fonts | Shared visual treatment, 16px editor inputs |
| INCONSISTENT | Backup filename exposes CardScout | holodex-collectie prefix; format unchanged |
| UGLY | Missing-art retry cramped at 320px | Vertical fallback layout and contained 44px retry button |

GOOD: existing financial semantics, separate JP routing, Home summary, five-tab shell, optional account, local guest collection and offline shell. Preserved. No broad redesign.

## Charizard reproduction and fix

Before: `charizard 006`, reversed, `Charizard #006`, `006`, `charizard 06`, `charizard 6` returned only old source-less Base/Rocket entries. Native-name plus number and Expansion Pack-qualified variants returned no result. Name-only queries exposed the real source records.

| source_id | source_set_id | Display set | Name / existing English alias | Source ordinal | Canonical collector number | Route |
|---|---|---|---|---|---|---|
| PMCG1-021 | PMCG1 | Expansion Pack | リザードン / Charizard | 021 | blank | SEARCH |
| PMCG4-017 | PMCG4 | Rocket Gang | わるいリザードン / Dark Charizard | 017 | blank | SEARCH |
| PMCG6-032 | PMCG6 | Challenge from the Darkness | カツラのリザードン / Charizard (Blaine's Charizard) | 032 | blank | EXACT |

006 is a Pokédex species hint in the existing data, not a proven printed collector number or source ordinal. The original matcher compared numeric tokens only with the intentionally blank JP source collector number. The new adapter indexes existing species aliases once per catalog rebuild. It never changes identity, number, route, storage or financial data. Hints are labelled Pokédex in suggestions. Leading zeros affect matching only. All real ambiguous records remain choices; no source is automatically selected.

Frozen tests cover all requested Charizard forms, set-qualified variants, representative records from all ten JP sets, and EN Base/Jungle/Fossil/Neo/DP/POP/Platinum/HGSS. The guest journey checks source identity through selection, route, Recent, collection, edit, backup and offline reload. Missing-art images and provider responses are simulated; no live provider or authentication is required.

## Preserved contracts and limits

Protected market-v176.js, cost-basis-v177.js, portfolio-insights-v178.js, cloud/account/backend, JP catalogs/manifests and cards.json are unchanged from v179. Storage keys are unchanged. Counts stay JP 780/397 EXACT/383 SEARCH, DP/POP 17/1053 and Platinum/HGSS 10/1062. Cardmarket final host remains www.cardmarket.com; no JP EN twin price. Machamp PMCG1-057 remains NM=2, EX=3, no language=7. Shared history remains NO_GO.

Technical compatibility names remain intentionally. BRAND-INVENTORY-V180.json records tracked source matches and their classification; normal visible views and metadata have independent old-name/no-AI assertions. Historical inactive app versions are retained, not relabelled. The local artwork patch is never opened or included.

Validation uses Chromium and frozen providers. Actual Safari, physical iPhone keyboard/safe area, real email login and live provider availability are not established by this suite. No new backend or artwork integration. The final release report contains exact counts and CI evidence.

## Physical iPhone checks before testers

1. Open launch screen; continue as guest and check Home.
2. Search JP Charizard 006; choose the intended set.
3. Open Cardmarket and confirm the selected Japanese card and condition.
4. Add quantity 2 with a purchase price; edit and reload.
5. Check Home, Collection, Insights and Recent.
6. Open/close keyboard; verify fields and bottom navigation remain reachable.
7. Export a backup and import it; confirm collection and purchase data.
8. Add to Home Screen; check HoloDex name/icon and standalone navigation.
9. Reload offline with saved data; check all local views.
10. Check optional login/logout and sync with your own test account.
