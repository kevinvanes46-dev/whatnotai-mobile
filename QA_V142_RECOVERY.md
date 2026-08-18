# CardScout v142 RECOVERY — Release QA

**Result: 50 PASS · 0 FAIL**

## Root cause fixed

- v140/v141 required 100% official visual-reference coverage before any automatic visual acceptance.
- Real iPhone run reached 246/253 references (97.2%), so even correct Top-1 Oddish/Bagon/Chikorita matches were forced into failing OCR.
- v142 treats >=95% official coverage as usable, while background index building can still retry missing references.
- Automatic acceptance remains official-reference only and requires a clear margin to the next genuinely different printing.

## Real failure replay (latest uploaded export)

- 10 automatic v140 scans at 11:04–11:05 UTC.
- Ground truth: Oddish, Oddish, Bagon, Shelgon, Omastar, Chikorita, Surskit, Granbull, Cacnea, Cyndaquil.
- Only Oddish/Bagon/Chikorita exist in the current 265-card DB (4 occurrences total).
- v140 visual Top-1 was correct on all 4 DB-available occurrences, but the readiness gate rejected all four.
- v142 recovery rule would accept all 4 correct DB-available occurrences and 0 of the 6 wrong Top-1 candidates.
- This does NOT make the legacy hash scanner complete: the six missing cards still require the future full catalog/neural engine or manual fallback.

## Checks

- ✅ file index.html
- ✅ file app-v142.js
- ✅ file ui-v142.js
- ✅ file cardscout-memory-v142.js
- ✅ file ui-v110.js
- ✅ file cards.json
- ✅ file visual-catalog.json
- ✅ file visual-seeds.json
- ✅ file manifest.json
- ✅ file sw.js
- ✅ file style-v100.css
- ✅ file style-v110.css
- ✅ file style-v120.css
- ✅ index uses app-v142
- ✅ index uses ui-v142
- ✅ index uses memory-v142
- ✅ no old v141 runtime refs
- ✅ manifest build 142
- ✅ APP_VERSION v142
- ✅ CORE3_BUILD 142
- ✅ debug scanner label v142
- ✅ status v142
- ✅ vision fetch build 142 — 2
- ✅ cards fetch build 142
- ✅ 95 percent coverage gate
- ✅ index build retries missing refs
- ✅ official-only auto accept
- ✅ distinct-printing margin
- ✅ recovery upper distance 0.25
- ✅ unchanged from v141: cards.json
- ✅ unchanged from v141: visual-catalog.json
- ✅ unchanged from v141: visual-seeds.json
- ✅ unchanged from v141: style-v100.css
- ✅ unchanged from v141: style-v110.css
- ✅ unchanged from v141: style-v120.css
- ✅ unchanged from v141: sw.js
- ✅ unchanged from v141: ui-v110.js
- ✅ cards count 265 — 265
- ✅ card keys unique
- ✅ required card fields
- ✅ current failure replay has 10 automatic v140 tests — 10
- ✅ v142 recovery accepts 4 of current 10 — 4
- ✅ all accepted current tests are correct — [('Oddish', 'Oddish'), ('Oddish', 'Oddish'), ('Bagon', 'Bagon Delta Species'), ('Chikorita', 'Chikorita')]
- ✅ zero known wrong auto-accepts in current 10
- ✅ all current DB-available test occurrences accepted — (['Oddish', 'Oddish', 'Bagon', 'Chikorita'], ['Oddish', 'Oddish', 'Bagon', 'Chikorita'])
- ✅ 246/253 is usable under recovery gate — (253, 241)
- ✅ Chromium interaction 50/50 — 50/50
- ✅ Chromium pageerrors zero — []
- ✅ Chromium console errors zero — []
- ✅ HTML ids unique — []