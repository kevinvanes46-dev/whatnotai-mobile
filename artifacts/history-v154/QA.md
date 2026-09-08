# RareWorth v154 - exact Recent identity

Baseline: `4bbfb0057afcee13d230fd283c74fd500f60d421`
Branch: `rareworth-v154-history-identity`
Date: 2026-09-08

## Outcome and scope

Recent separates actual card selections (`kind: card`) from searches (`kind: query`). A selected card retains source/catalog identity, name, collector number, set key/label, language, image metadata, condition, edition, variant and the final Cardmarket URL. The legacy `lang`, `cond`, `url` and other history fields remain compatible.

Selection is saved immediately, before a potentially slow route resolves. The final route updates the same identity entry. Card/query deduplication has separate keys; preferences are part of a card key. A later generic search cannot replace the exact record. Delayed metadata and route responses cannot replace a newer selection.

## Write-path audit

- Quick search and explicit link generation: existing `makeLink` final-result path writes Recent. Unresolved name-only input is explicitly a query.
- Result and candidate selection: `selectCardmarketCard` retains normalized metadata and immediately writes the chosen identity; existing `makeLink` supplies the final route.
- Detail preference changes: existing rebuild path uses the active selection plus current condition, edition and variant.
- Main Cardmarket Open: its existing anchor consumes the final route; it does not reconstruct or separately overwrite history.
- Recent Use and Home Recent: hydrate/restore exact identity and preferences before invoking the same existing engine.
- Recent Open: new records use their saved final route. Legacy records recover metadata in memory and obtain a route through the existing resolver.
- Favorites share the existing history helper functions and receive the same compatible identity fields. Collection storage is separate and unchanged.

## Legacy and artwork rules

Source ID takes precedence, followed by a unique catalog tuple, saved artwork and verified metadata recovery. Language namespaces stay separate. Metadata responses must match the requested source ID, or the name/number/source set of a uniquely identifiable tuple. Shared-set ambiguity is not resolved by choosing the first result.

Name-only AUTO records remain labelled Zoekopdracht with a search icon, no arbitrary artwork or card price. Loading/reading legacy history does not rewrite localStorage. An explicit Use, selection or delete remains a user action that can update Recent normally.

## Changed production files

- `card-identity-v154.js`: central normalized identity, dedupe keys and in-memory metadata hydration.
- `app-v137.js`: selection/history save and restore plumbing, legacy Open handling. Resolver functions, existing resolver invocation/stale-response guards and scanner are protected by byte comparisons.
- `ui-v137-focus.js`: catalog source lookup, ambiguity check, variant restoration and query event state.
- `ui-v150-experience.js`: history/selection artwork, source validation, legacy hydration and explicit query state.
- `ui-v153-mobile.js`: pass normalized identity to Recent thumbnails.
- `style-v153-mobile.css`: minimal query/search-icon state only.
- `index.html`: load identity module before app and update affected asset cache-busts.

No collection, price calculation, scanner, Supabase, import/export, routing mappings or product catalog files were changed. No merge or deployment is part of this branch.

## Validation

Run `node tests/run-history-v154.cjs` with Playwright and Chrome configured. The runner includes all ten previous suites plus the two new history suites. Individual outputs are in `regression/*.txt`.

- Existing routing/UI: 697 tests, including 636 v147 engine cases.
- Existing UI polish: 8 groups.
- Existing collection price freshness: 14 scenarios.
- Existing collector experience: 5 viewport groups.
- Existing v152 release: 3,285 verified product routes plus API fallback and browser checks.
- Existing v153 mobile polish: 23 checks across 320/375/390/430px.
- New identity unit tests: 7 checks (source priority, language isolation, query separation, metadata recovery, ambiguity and mismatch rejection).
- New history browser tests: 9 groups covering real Bagon/Pinsir result selection, persistence across reload, Use/Open, edition/condition/stamped, generic query retention, delayed responses, legacy hydration, source-first artwork and byte-identical collection storage.
- JavaScript syntax checks: root JS files and test entry scripts; `git diff --check`.

The previously broad frozen-app assertions now exclude only the authorized history/selection plumbing. Protected resolver/scanner sections and unchanged collection, mappings, cards and manifest comparisons remain enforced.

## Changed test/support files

- New: `tests/history-identity-v154.test.cjs`, `tests/history-v154.test.cjs`, `tests/helpers/history-protected.cjs`, `tests/run-history-v154.cjs`.
- Updated: `tests/helpers/cardmarket-harness.cjs` (async restore boundary), `tests/ui-polish-v148.test.cjs` and `tests/mobile-v153.test.cjs` (precise protected-code assertions), `tests/release-v152.test.cjs` and `tests/collection-price-freshness.test.cjs` (isolated screenshot output paths).
- Evidence: this report, artifact-specific `.gitignore`, 12 suite logs and five focused screenshots.

## Screenshots

- `regression/history-v154/recent-390.png`: ambiguous query alongside exact legacy cards on mobile.
- `regression/history-v154/recent-1280.png`: same state on desktop.
- `regression/history-v154/restored-card-390.png`: exact selected card after reload and Recent Use.
- `regression/mobile-v153/recent-390.png` and `presets-390.png`: existing mobile layout regression evidence.

Other full-suite screenshots remain local, reproducible, and ignored by the artifact-specific .gitignore.

## Remaining risks

- Real iPhone/Safari device QA is still required; automated browser tests use Chromium with mobile viewport sizes.
- External artwork/metadata services may be unavailable; missing assets remain an honest unavailable state. Legacy name-only AUTO entries cannot reconstruct an identity that was never stored; the user must select the intended result again.
- Cardmarket destinations are asserted through the existing engine using deterministic catalog/API fixtures. This task does not claim an exhaustive live check of Cardmarket availability or offers.
- Existing price behavior and collection contracts are unchanged.

## Keyboard follow-up

The branch also includes the iPhone keyboard/scroll follow-up described in [keyboard QA](../keyboard-v154/QA.md). The combined runner now has 13 suites. Core matching, routing, scanner, price and collection modules remain unchanged by that follow-up.
