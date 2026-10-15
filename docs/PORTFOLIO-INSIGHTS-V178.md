# HoloKeep v178 — Portfolio Insights

Baseline: `466ea1147d4ba532b36d89025dcbb5daf791262f`.

Derived-only presentation over the existing collection, v176 validated latest cache and v177 cost basis. The financial modules remain unchanged. No provider, backend, persistent key, market history, chart, movement, scheduler or alerts are introduced. Shared market history remains `NO_GO_SHARED_HISTORY`; this feature does not circumvent that gate.

## Contract

`HoloKeepPortfolioInsights.derive(items, lookup, Cost, Market, now)` returns delegated market/cost summaries, owned rows, independent category counts, deduplicated attention, and three rankings. CommonJS exposes the same pure API. It performs no storage writes or network operations. Financial comparison and portfolio totals are delegated to the original engines.

Most valuable ranks eligible observation value multiplied by quantity. Positive and negative differences rank only `Cost.comparison` results with the corresponding sign; partial known quantity remains partial. JP reference-only, unavailable and legacy prices are excluded. Wishlist is excluded from financial insights, including dormant costs. Confirmed zero purchase cost is valid; percentage remains unavailable when the comparable cost denominator is zero.

Independent attention counters count positions, not physical quantities. Missing observation, unavailable observation and reference-only are distinct categories. The compact attention list deduplicates collection UID and prioritizes: legacy confirmation, partial costs, unknown costs, missing observation, unavailable observation, reference-only, stale price. STALE, OLD and UNKNOWN freshness of eligible observations all require attention. Categories can overlap; their counts must not be summed into a distinct-card total.

## Collection

The summary shows owned quantity, indicative value, known costs and comparable difference with quantity coverage. A maximum of two preview rows plus an attention action is shown. The disclosure within Collection contains value, positive/negative differences and attention; no primary navigation is added. Insight rows open the existing editor; no duplicate edit flow.

Sorting: recent added, name, set, highest/lowest position value, positive/negative comparable difference, highest/lowest confirmed average acquisition price. Missing data sorts last; equal keys retain input order. Numeric insights exclude Wishlist; normal name/set/recent sorting still includes it.

Filters: with/without eligible market price, complete/incomplete costs, legacy confirmation, potentially stale price and attention. Filters compose with existing language/set/condition/list/search filters. Summary always represents the entire owned portfolio, not a misleading filtered total.

Position rows distinguish per-unit price and quantity total. Partial comparisons retain “Over X van Y exemplaren”. Legacy confirmation opens the original editor. Missing-data communication is informational; difference signs are explicit, not color-only. Existing v176 reference/legacy/reason labels remain visible.

## Offline and performance

Local collection and valid cached observations determine insights. Opening the disclosure or changing a filter/sort performs no pricing fetch. Preview artwork uses only supplied EN image URLs; it does not resolve card metadata. Ordinary collection artwork and the existing search bootstrap keep their existing behavior.

The collection render reads the full market cache once, memoizes each identity and retains `Market.get` validation through a one-entry adapter. The pure module looks up each item once; item/row maps avoid repeated scans. Ranking is O(n log n), lookup O(n); no per-item render loop. Expanded output is bounded by existing collection size, not provider catalog size.

Local Node timing (Windows, this development run, 20 iterations; not a production guarantee): 100 rows ~0.56 ms, 500 ~1.80 ms, 1,000 ~3.46 ms. Tests assert exact lookup counts and use only a generous catastrophic-regression bound. Real device DOM rendering costs are separate.

Offline browser fixture seeds collection/market cache and the existing catalog cache, as after prior successful use. Without a catalog cache the unchanged search bootstrap can attempt set requests even offline; this is not an insights request and no claim is made that v178 rewrites startup networking.

## Verification

New frozen unit and Chromium fixtures cover summaries, ranking, missing/tied sort keys, filters, attention, partial quantity, JP/Wishlist exclusions, zero extra provider calls, immutable collection/cloud signature, PWA offline reload, empty CTA and widths 320/375/390/430. Protected-file tests compare engines/routing/backend against baseline. PWA shell is `rareworth-shell-v178`; precache adds only the new same-origin module.

Existing version-specific expectations advance to v178; existing tests and assertions remain. The historical scope helper reverses exact reviewed v178 collection presentation hunks before running the old byte-scope assertions, following the existing v174-v177 test pattern. Brand inventory and allowlist are regenerated to reflect line moves and the shell version. No contract assertions are removed.
