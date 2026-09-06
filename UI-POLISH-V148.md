# CardScout UI polish v148

Branch: `ui/premium-polish-v148`. Parent: `b8c812f430ed12ab0498dbaa39ec7927a511741d`.
No main merge or production deployment.

## Delivered

Presentation-only premium charcoal/mint theme, clearer type hierarchy, roomier controls, visible keyboard focus and reduced-motion support. Search results, pending actions, saved cards, collection metrics, empty states, editor and navigation share a consistent visual language. The desktop shell expands to 1040px, with two collection columns and grouped search preferences. Narrow phones retain stacked dock actions and safe-area spacing. System fonts require no third-party font requests.

The collection's existing condition/set/sort selects were hidden by the legacy initializer. A scoped CSS rule exposes them, retaining their existing handlers. Empty collection text now flows normally instead of splitting into anonymous grid items. The app retains the CardScout name; this is not a full CardRally rebrand.

## Changed files

- `index.html`: load the isolated stylesheet, revise search introduction and add an accessible search label.
- `style-v148-polish.css`: new presentation layer; original CSS retained.
- `tests/ui-polish-v148.test.cjs`: responsive interaction and screenshot audit.
- `tests/run-ui-v148-audit.cjs`: run all six suites and retain logs.
- `UI-POLISH-V148.md`: this handoff.
- `artifacts/ui-v148/`: screenshots and six test logs, using synthetic collection fixtures.

All three active production JavaScript files, cards.json and original CSS match the baseline after normalizing Git's Windows line endings. No scanner, routing, collection storage, pricing, Supabase or business logic changes. Existing IDs, event contracts and script cache versions remain intact.

## Validation

| Suite | Passed |
| --- | ---: |
| Existing routing | 10 |
| v146 resolver | 34 |
| v147 engine | 636 |
| v146 browser | 8 |
| v147 browser | 9 |
| New UI audit groups | 8 |

697 existing checks plus eight UI audit groups passed. UI audit covers 320, 375, 390, 768 and 1280px: searching/selecting, dock clear of navigation, collection empty/populated states, wishlist and condition filters, sorting, no-results state, editor, recent/settings navigation, preserved seeded storage, horizontal overflow and keyboard focus. Existing suites cover final URL persistence, pending-disabled actions, stale responses and cache behavior. No browser runtime errors. `git diff --check` passed.

Run `node tests/run-ui-v148-audit.cjs`; set `PLAYWRIGHT_MODULE` to your Playwright package and `CHROME_PATH` to your Chromium browser if required. Tests serve localhost and mock external requests; they do not use your personal browser or collection.

## Screenshots

- [Mobile search](artifacts/ui-v148/search-375-viewport.png) · [before](artifacts/ui-v148/before-search-375.png)
- [Desktop search](artifacts/ui-v148/search-1280.png) · [before](artifacts/ui-v148/before-search-1280.png)
- [Mobile collection](artifacts/ui-v148/collection-375.png) · [desktop collection](artifacts/ui-v148/collection-1280.png)
- [Empty collection](artifacts/ui-v148/empty-375.png) · [search results](artifacts/ui-v148/results-375.png)
- [Selected card](artifacts/ui-v148/selected-375.png) · [pending resolver](artifacts/ui-v148/v147-pending-375.png)
- [320px editor](artifacts/ui-v148/editor-320.png)

Full-page captures show fixed navigation at its viewport position; content beneath it is reachable by scrolling. Separate viewport captures are provided for search, collection, empty and selected states at 375/1280px.

## Remaining risks

- Tested in desktop Chromium at mobile viewport sizes, not physical iPhone Safari. Safari safe areas, keyboard opening, native selects, landscape and Dynamic Type still need device QA.
- External catalog/Cardmarket and pricing services were mocked; their live availability and accuracy are not verified by this UI change.
- This is not a full accessibility audit. Focus styles and text sizes improve, but legacy dialog focus behavior remains unchanged.
- Existing CSS remains underneath the isolated override layer. Future base style updates should rerun these visual checks.

Rollback before merge is simply leaving main unchanged. To remove the redesign from this branch, remove the new stylesheet link and revert the two search markup edits.
