# HoloDex v182 — parity audit

Base: e1c04f18e6d06e65a2fd79afa2b73ac574e0dc21. Reference: Downloads/holokeep-v180-overdracht-20261017.zip. No deployment authorized in this phase.

| ZIP feature | v181 status | Action |
|---|---|---|
| Dark mint, Geist/Unbounded | Local fonts and base theme present | Extend surfaces and restrained static holo |
| Card stacks / nearly complete | Plain set buttons | Real catalog artwork stacks; unique owned identities; omit completed sets from Home |
| Value and insights | Protected calculations present | Preserve calculations and existing attention actions |
| Value chart / ranges | Absent | History component STOP: no validated production series; never draw demo data |
| Today movers | Absent | Remain hidden without fresh comparable observations |
| Binder | 3×3, unique progress | Owned/missing filters; exact owned variant choice; connected artwork mounts |
| Detail | Safe condition/variant, price and routing | Visual polish; preserve exact state |
| Search | Visible bounded prices | Preserve price isolation and independent catalog loading |
| Share | Isolated private-data-free viewer | Readable artwork, no account or storage access |
| Navigation | Honest search labels | Preserve navigation and touch targets |
| Offline | v181 shell | Separate v182 shell; same-origin cache only |

## History component decision

The ZIP's portfolio function unions dates and adds newly covered cards into the aggregate, producing coverage-induced gains. Its pipeline selects the first matching product, prefers Holofoil without requested finish, drops condition/currency/metric/source timestamps, and stamps potentially stale prices with today's generation date. Publication uses `if: always()` and can publish partial results. None is suitable for production.

TCGCSV documents TCGplayer API exports and daily server-side ingestion, explicitly excluding browser requests: https://tcgcsv.com/docs . Access to archives alone does not establish this app's production redistribution rights. Provider rights and exact condition/finish semantics remain unresolved. No pipeline activation, production data branch, or archive backfill will occur.

Proposed safe contract: explicit provider/currency/metric and exact language/card/condition/edition/finish identity; timestamps from the source separate from generation time; unique matches only; identical comparable holdings and observation dates across every displayed point; no zero fill or forward fill. Label any quantity-weighted comparison as current quantities, never historical ownership. Cardmarket EUR and TCGplayer USD are separate series. Today requires a current local-day observation and a comparable preceding-day point. Missing or ambiguous data produces an unavailable state.

## Implemented

The owner's Claude-authored ZIP remains the reference. v182 extends the existing v181 adapter instead of replacing its identity, pricing, editor or cloud engines. Home has catalog-backed card fans, an incomplete-set ranking and static holo accents. Completed/unknown sets are excluded from that ranking but stay in the collection. The current market value and purchase-cost calculation are unchanged.

Binder keeps 3×3 pages, adds touch paging and owned/missing filters, and exposes a 1st Edition filter when saved owned exemplars have that edition. Multiple owned variants require an explicit exemplar choice before detail/edit. Quantity and wishlist never increase completion. Artwork uses direct validated catalog URLs or the existing exact JP artwork resolver; it never starts price-provider lookups for Home/binder.

Detail retains exact EX/STAMPED/edition state and validated Cardmarket indications. Search retains its visible-only bounded price queue, and catalog loading remains independent of the active tab. The isolated share viewer accepts only version/set/language/owned identities, optionally shows validated artwork and performs no storage access. Existing v181 share links remain valid.

The shell is `rareworth-shell-v182`; the new stylesheet is precached. Existing module filenames remain stable. Local fonts remain included. Source storage keys and cloud modules are unchanged. No data publication workflow was introduced.

## History semantics and remaining ZIP differences

`scripts/comparable-v182.cjs` is an offline, tested contract prototype, **not loaded by production**. It requires exact condition/edition/finish identity, a single provider/currency/metric, and timestamps shared by every holding. Its minimum coverage is 100% of supplied owned holdings; fewer than two fully comparable points returns unavailable. Current quantities are explicitly labeled and are not presented as historical ownership. Missing data is never valued at zero or carried forward. Ambiguous identities, duplicate observations and invalid prices fail closed. Today additionally requires a fresh current Amsterdam-day observation and an 18–30-hour comparable prior-day observation. Generation time cannot refresh source time.

No historical provider is activated. Current indications still use the protected Cardmarket/EUR path. TCGplayer/USD is only represented in offline contract tests and is never relabeled as Cardmarket/EUR. No historical line, day movers, cost-to-complete estimate or card-history chart is published. Home shows an explicit unavailable state and disabled range controls. These remain material ZIP differences; full ZIP parity is **not ready**.

The v181 navigation, native modal binder/detail and existing collection list are retained rather than copying the ZIP's scanner-labelled navigation and replacement screens. The comparison section precedes nearly complete sets and attention/recent items. No scan claim or camera icon is added.

## Validation

The full local CI command list passed with 492 tests before the final swipe/edition/long-content additions. Final affected-suite and remote CI results are recorded in the delivery report. Every existing test case remains; version/cache expectations move to v182. One isolation test now opens an unknown-catalog set from the collection because such sets intentionally do not qualify as nearly complete. Its catalog-completion and zero-extra-price-request assertions remain unchanged.

Chromium review covers 320/375/390/430 px: Home, comparison unavailable state, incomplete sets, search, visible prices, detail, collection, binder, filters, readonly share, Recent and Settings. Images unavailable from mocked providers are intentionally reviewed as fallback states; fixture image responses are test-only. No horizontal page overflow was observed. Dialog content scrolls on small displays. Static holo respects reduced motion; inputs remain at least 16 px and navigation/actions remain reachable. Screenshot evidence is in the chat workspace `outputs/v182-review`.

Protected market-v176, cost-basis-v177, portfolio-insights-v178, beta-search-v180, home-v179, catalog/collection/artwork engines and cloud modules were checked against the v181 commit. JP audit remains 780 / 397 EXACT / 383 SEARCH. The protected untracked patch was never opened, changed or staged.
