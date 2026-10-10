# HoloKeep v176 — trustworthy market value

Only TCGdex's Cardmarket EUR data is used. No provider, backend, scheduler,
history, alerts, condition discounts, acquisition averaging or profit/loss is added.

## Source and identity

`market-v176.js` exports the frozen `HoloKeepMarket` browser API (CommonJS in tests).
The collection UI supplies the exact requested endpoint language, source ID,
source-set ID, collector number and name. The response must match all of them.
Known legacy EN set mappings can supply an absent source ID only for a single
unambiguous set. Price lookup never retries another set. Artwork/edition metadata
lookup and Cardmarket routing remain separate and unchanged.

Name comparison permits case/spacing, apostrophe typography and the existing
Delta Species/δ display alias; it does not substitute another card name.

EN prices are GENERAL_MARKET: the localized card identity is verified, but the
feed does not prove condition-specific or English-only underlying transactions.
JP is at most REFERENCE_ONLY even with exact JP response identity, because this
adapter has no independent Japanese price-series proof. It never uses an EN twin.
REFERENCE_ONLY is excluded from the primary total. Wrong/missing currency or
product identity is rejected. There is no currency conversion.

## Finish, edition and metric

NORMAL is not interpreted as non-foil. All three normal/holo/reverse availability
flags must be present, and exactly one usable finish must be established. Detailed
variant records must not contradict that finish. Rarity never decides finish.
Reverse ambiguity, stamped and 1ST are UNAVAILABLE. STAMPED functionality and
purchase metadata remain available; only the unsupported price claim changes.

Non-foil uses `trend`, then `avg7`, then `avg30`; holo uses their `-holo` fields.
Only positive finite numeric values qualify. `low`, `avg`, `avg1`, strings and
invalid numbers never enter the total. The selected metric and original field
are retained. Labels distinguish Cardmarket trend, 7-day average and 30-day average.

Quality vocabulary: CONDITION_AWARE, GENERAL_MARKET, REFERENCE_ONLY, UNAVAILABLE.
This adapter never emits CONDITION_AWARE and rejects such claims in its cache.
NM/EX/GD/PL share the general series without adjustments. UI explicitly states
that condition is not included. EXACT/SEARCH remains a routing distinction only.

## Latest-observation cache

Only `holokeep_market_cache_v176` is written by a price refresh:
`{version:176, entries:{[identityKey]:entry}}`.
The key includes source ID/set, language, collector, normalized name, variant and
edition. Condition, quantity, purchase price, owner and collection uid are excluded.
Each entry stores source, sourceId, sourceSetId, language, number, name, variant,
editionScope, finish, metric, metricField, value, currency, quality, reason,
sourceUpdatedAt, fetchedAt and, when available, productId.
One latest observation is retained per identity; no historical records exist.
An observation's finish and metric describe the current series; transitions do
not create historical comparisons. Cache is bounded at 2,000 entries by fetch time.

## Dates and refresh

sourceUpdatedAt comes only from a valid nonfuture provider timestamp; otherwise
it is null. fetchedAt is the response processing time and throttles automatic
refreshes for 12 hours. Manual refresh may force a request. Same-identity items
are deduplicated, including different conditions. Source freshness is independent:

* <=36h CURRENT
* >36h and <=72h STALE
* >72h OLD
* missing/invalid source date UNKNOWN

Network, identity or storage failures retain the previous validated cache and show
a refresh-failed message. A lagging dated response cannot replace a newer dated
price. A valid response that establishes unavailable pricing records that outcome,
rather than leaving a disproven finish eligible. Unknown freshness is shown honestly.

## Collection, cloud, legacy and offline

Price refresh never writes `cardscout_collection_v133`. All old price fields and
unknown/future collection fields remain intact. Existing user edits/import/export
keep their existing semantics. Price refresh does not change cloud canonical
signatures; cloud modules/schema/RPCs are unchanged.

Legacy prices may appear as "Oudere prijs · opnieuw controleren", never as a
validated current value, and are excluded from the total. Cache takes precedence
after a successful check. Special editions/variants never use legacy price claims.
Offline uses the same cache and original source date; failures do not clear it.
Market cache is disposable and is not part of collection export.

Primary totals include GENERAL_MARKET (and conceptually supported CONDITION_AWARE)
observations in EUR, multiplied by qty. Reference/unavailable/legacy values do not
contribute. No qualifying price means a dash, not a zero valuation. Price coverage
and known purchase-price coverage both count exemplars, including known zero cost.
Older/undated qualifying observations remain visible with explicit coverage notice.
No cost averaging or profit calculation is performed in v176.

## Verification and scope

Frozen unit and Chromium fixtures test identity rejection, finish/metric rules,
timestamp boundaries, cache throttling, exact storage/signature preservation,
failure retention, quantity coverage and a real service-worker offline reload.
Mobile widths: 320/375/390/430. New script is precached in rareworth-shell-v176;
external responses remain excluded from CacheStorage.

The diagnostic sample is explicitly synthetic contract data: Base/Jungle/Neo/EX/
DP/Platinum/HGSS/POP, JP, 1ST and STAMPED. Its outcomes are not a claim of real
market or whole-catalog coverage. Historical scope tests reverse only exact reviewed
collection changes through market-scope-v176.cjs; unrelated production bytes remain
protected. Existing release tests follow v176 branding and PWA build identifiers.

The separate read-only audit of 11 existing fixture/card types produces 2
GENERAL_MARKET, 0 REFERENCE_ONLY and 9 UNAVAILABLE observations. Jungle base2-25
and HGSS hgss3-86 have usable frozen price metadata. Base/Neo local records and
DP/Platinum/POP set briefs do not carry sufficient finish/price proof; EX ex14-4
has stamped ambiguity; JP neo1-001 has no Cardmarket price; 1ST and STAMPED are
intentionally excluded. This is a fixture availability audit, not live coverage.
