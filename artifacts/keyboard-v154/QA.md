# RareWorth v154 - iPhone keyboard/search follow-up

Parent commit: `13d151306401eba7017b22d6b809aa405d062649`.
Branch: `rareworth-v154-history-identity`. No main merge or deployment.

## Changes

- `ui-v154-keyboard.js`: passive vertical touch-intent detection (12px threshold, vertical dominance), one blur per gesture, ghost-click suppression after a drag, and ordinary tap/horizontal/pinch preservation. Wheel scrolling is supported too.
- Blur/Done preserve the existing result DOM and preferences. Search/Enter is captured once, prevents navigation, uses the existing parsing/link path without clipboard focus, then leaves the keyboard closed. Composition and repeat key events do not cause duplicate searches.
- During keyboard closure, the result scrollport temporarily keeps its size. After viewport events settle, layout is measured again and the saved result/page positions are restored. Restoration is cancelled by new input, focus, orientation change or an intentional page-scroll gesture. A bounded timeout releases the temporary size if viewport events stop.
- `ui-v153-mobile.js`: fixed controls remain hidden during the closing viewport animation, including after input blur. Pinch zoom is not classified as a keyboard.
- `ui-v137-focus.js`: focus does not rebuild an already visible result list; unchanged background catalog results reuse their DOM; genuine catalog updates retain scroll position for the same search. Outside dismissal uses a click rather than the start of a swipe. Tab navigation no longer schedules delayed input focus.
- `style-v153-mobile.css`: results contain vertical overscroll and do not become a page scroll anchor. Native touch scrolling remains enabled; no global touchmove prevention or body scroll lock.
- `index.html`: load keyboard controller and refresh changed asset cache-busts.

Matching/scoring/sorting, Cardmarket routing, collection, prices and scanner code were not changed by this follow-up.

## Validation

`tests/keyboard-v154.test.cjs` tests 26 Bagon results at 320, 390 and 430px. It verifies vertical-swipe blur, tap/horizontal preservation, fixed controls during close, unchanged query/filters/result nodes, retained result and page scroll offsets, further scrolling in both directions, toolbar-Done blur without search, Enter with one search/no navigation, no automatic refocus and no runtime errors.

`tests/run-history-v154.cjs` now includes all previous suites plus keyboard checks (13 suites). Logs are in `../history-v154/regression/`. Screenshots of the focused flow are `results-320.png`, `results-390.png`, `results-430.png`.

JavaScript syntax and `git diff --check` are checked separately. Main remains at `4bbfb0057afcee13d230fd283c74fd500f60d421`.

## Device limitation

These are Chromium mobile-emulation tests using simulated touch-intent and visualViewport changes. They assert DOM blur/state/scroll behavior; they do not operate a real iOS keyboard or certify Safari's native gesture/keyboard animation. Real iPhone Safari QA is still required: type Bagon, swipe results with the keyboard open, tap toolbar Done, then try Search/Enter and scroll to both ends. Results and preferences must remain intact throughout.
