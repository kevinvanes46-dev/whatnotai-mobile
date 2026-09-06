# Rareworth — collector experience v150

Review branch: `ui/collector-experience-v150`, built on the published UI branch commit `2df8490da67ce9453e7960eaae13760a176d6991` (whose parent is live v147 `b8c812f430ed12ab0498dbaa39ec7927a511741d`). No main merge or deployment.

## What changed

- Rareworth name, restrained R mark, browser favicon, iPhone home-screen icon and PWA icons. App identity and existing collection storage key remain unchanged.
- Minimal search start: recent cards, collapsed manual correction/preferences, link diagnostics moved into settings.
- An accessible 44px X in the search field clears the query and selected card immediately, retains language/condition/edition preferences and restores typing focus.
- Search thumbnails and selected-card detail view with artwork, set/number/language, route confidence and market indication. One existing Cardmarket dock remains the action source; temporary URLs are not exposed.
- Collection grid/list toggle with saved display preference. Images load lazily with a four-request concurrency limit and a readable fallback. Grid tiles open the existing editor; full quantity/price controls remain available in list mode and the editor.
- Keyboard containment, Escape to close and focus restoration for the collection editor.
- Ten-second undo for additions, including additions merged into existing entries. Undo preserves other entries and refuses to overwrite a subsequently edited item.
- Last known quotes retained after failed/missing price responses. Coverage text identifies partially priced totals; fully unpriced owned collections show a dash instead of €0. Quote dates and stale/failed labels appear per card. Background refresh merges only price fields into current records, so deletions, variant changes and concurrent quantity/purchase edits are respected. Older source quotes cannot overwrite newer ones.

## Scope and contracts

`app-v137.js` and routing/scanner logic remain unchanged. The two focus-module additions only attach artwork and retain the catalog image field. Collection price selection precedence remains the existing TCGdex/Cardmarket logic; this is not a new pricing model. The existing collection key `cardscout_collection_v133`, item identity, import/export format and event names remain stable. The only new storage key is `cardscout_collection_view` for the display preference. No Supabase, authentication, payments, scanner activation or main deployment.

## Validation

Run `node tests/run-ui-v148-audit.cjs` with an installed Playwright package (`PLAYWRIGHT_MODULE`) and Chromium executable (`CHROME_PATH`) if not available by default.

- 697 existing routing/resolver/browser checks.
- 8 responsive audit groups at 320, 375, 390, 768 and 1280px, plus focus and runtime checks.
- 11 price-freshness scenarios: missing/network error retention, updated totals, all/partially missing coverage, invalid imported prices, concurrent edits, deletion, variant changes, older quotes and automatic/manual refresh.
- 5 end-to-end experience groups at the same widths: real fixture artwork loads, X clears selection and restores focus, detail view, editor keyboard behavior, save/undo, duplicate-quantity undo, grid/list persistence and original data preservation.

The old frozen-collection assertion was intentionally replaced with the new price/undo behavioral coverage. Manual-field tests now expand the deliberate disclosure first. Runtime production routing tests remain unchanged in their expectations. Screenshots use real TCGdex artwork fixtures and synthetic prices; they are not live price evidence. Older v148 test artifacts were regenerated during intermediate development and retained; final review evidence is in `artifacts/rareworth-v150/`.

## Review screenshots

- [Mobile start](artifacts/rareworth-v150/home-375-viewport.png)
- [Search results](artifacts/rareworth-v150/results-375-viewport.png)
- [Card detail and X](artifacts/rareworth-v150/detail-375-viewport.png)
- [Collection grid](artifacts/rareworth-v150/collection-grid-375.png)
- [Collection list](artifacts/rareworth-v150/collection-list-375.png)
- [Desktop collection](artifacts/rareworth-v150/collection-grid-1280.png)
- [Unavailable quote retained](artifacts/price-freshness/retained-price-mobile.png)

Full-page screenshots capture fixed navigation at its viewport position; scroll exposes the content underneath. Mobile viewport captures are also provided.

## Name check and remaining work

Rareworth was selected by the user. On 2026-09-06 Apple's public Search API showed no exact Rareworth match among results for NL, US and GB. Public catalog search does not establish reservation or trademark clearance. Final name availability must be checked when creating the App Store Connect record: https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app . No app record, domain or trademark was purchased or registered.

Real iPhone Safari, software-keyboard behavior, landscape, Dynamic Type and a full accessibility audit still require device QA. Catalog artwork can differ from the owned condition/edition/stamped variant; the interface labels it as reference artwork. Live metadata and pricing availability remain external dependencies. Price dates use the provider date when supplied and fetch time otherwise. A reload clears transient failure labels; saved stale timestamps remain. This branch is a webapp review build, not an App Store release.

## Release variant validation

New stamped saves require confirmed `variants_detailed.stamp: set-logo`; first-edition saves require firstEdition metadata or a first-edition stamp. Unknown metadata blocks new special saves, while existing entries remain editable. Search variant filters remain discovery preferences; confirmation happens when saving. Generic Cardmarket quotes are excluded for first edition, including previously saved generic values (preserved in storage). First-edition cards show an explicit missing-price label and edition badge. Stamped quotes remain reverse-market indications, not condition-specific offers. Additional tests cover unconfirmed/confirmed stamped saves and first-edition price exclusion. Deployment to existing GitHub Pages was explicitly authorized by the user.
