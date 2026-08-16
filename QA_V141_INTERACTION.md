# CardScout v141 Interaction Hotfix QA

**Result: 53 PASS · 0 FAIL**

v141 is a minimal interaction hotfix on top of v140. The scanner recognition algorithm and card/visual datasets are intentionally unchanged.

## Critical fix

- v140 referenced `DATA.pokedex` before `DATA` was initialized. That stopped `app-v140.js` at startup, so Search, Cardmarket preferences, camera/scan handlers, favorites/recent and learning/debug handlers from that file never bound.
- v141 initializes `DATA` first, then expands the OCR Pokémon name vocabulary.

## Automated checks

- PASS — file index.html
- PASS — file app-v141.js
- PASS — file ui-v141.js
- PASS — file cardscout-memory-v141.js
- PASS — file cards.json
- PASS — file visual-catalog.json
- PASS — file visual-seeds.json
- PASS — file manifest.json
- PASS — file sw.js
- PASS — file style-v100.css
- PASS — file style-v110.css
- PASS — file style-v120.css
- PASS — node syntax app-v141.js
- PASS — node syntax ui-v141.js
- PASS — node syntax cardscout-memory-v141.js
- PASS — HTML IDs unique
- PASS — HTML local references exist
- PASS — index uses app-v141
- PASS — index uses ui-v141
- PASS — index uses memory-v141
- PASS — manifest build 141
- PASS — UI cards fetch build 141
- PASS — vision seed fetch build 141
- PASS — vision catalog fetch build 141
- PASS — DATA declared before runtime DATA use
- PASS — quickGo listener
- PASS — makeBtn listener
- PASS — favorite listener
- PASS — scanPhoto listener
- PASS — takePhoto listener
- PASS — choosePhoto listener
- PASS — camera shutter listener
- PASS — preferences shortcut listener
- PASS — nav listener
- PASS — choice button listener
- PASS — result edit listener
- PASS — result bad listener
- PASS — learning backup listener
- PASS — learning restore listener
- PASS — cards count 265
- PASS — card keys unique
- PASS — card required fields complete
- PASS — unchanged from v140: cards.json
- PASS — unchanged from v140: visual-catalog.json
- PASS — unchanged from v140: visual-seeds.json
- PASS — unchanged from v140: style-v100.css
- PASS — unchanged from v140: style-v110.css
- PASS — unchanged from v140: style-v120.css
- PASS — unchanged from v140: sw.js
- PASS — unchanged from v140: ui-v110.js
- PASS — Chromium interaction suite 50/50 — 50/50
- PASS — Chromium pageerrors zero
- PASS — Chromium console errors zero

## Scope intentionally NOT claimed

- This hotfix restores interaction/runtime behavior. It does **not** claim that the legacy visual hash scanner has become accurate. Neural scanner/catalog work remains a separate next step.
- Diamond & Pearl / POP full catalog coverage is not added by this hotfix.

## Tested interaction paths

- All 5 bottom tabs
- Scan → Cardmarket preferences shortcut
- JP / EN, NM / EX / GD / PL, Normal / 1ST in **More**
- The same preference buttons in **Search**
- Smart Search suggestions
- Search button and “Zoek op Cardmarket”
- Direct Oddish Team Rocket #63 Cardmarket route
- Favorites, Recent and both clear buttons
- Camera handler
- Gallery photo load and automatic Scan kaart pipeline
- Internal scan button listener and re-enable state
- Result sheet language/condition/edit controls
- Search clear
- Debug clear and learning backup/restore controls
- No browser page errors or console errors during the interaction suite