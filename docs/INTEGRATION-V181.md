# HoloDex v181 integration review

Base: `67235a8da9e697f5f51dc754f8b66ede67d41cd9` (proven v180).
Reviewed redesign source: local audited `holokeep-cleanup-v179`, `a8aac81638b95c053ab51cd776bdd6c5ca5b0747`.
No wholesale merge, cherry-pick, legacy-file deletion, backend or storage migration.

## Production classification

| Files | Classification | Change |
|---|---|---|
| `ui-v181-redesign.js` | SAFE REDESIGN / BUG FIX | Large modal detail, exact selection handoff, unique set progress, 3×3 binder, visible-row validated prices, read-only sharing. |
| `style-v181-holo.css` | SAFE REDESIGN | Reviewed local font declarations, mint/dark typography and surfaces; responsive detail/binder/share layout. |
| `assets/fonts/*.woff2`, `assets/fonts/*-OFL.txt` | SAFE REDESIGN / TEST/DOC | Four local font files from reviewed source, with upstream SIL OFL 1.1 licenses. |
| `share-v181.html`, `share-v181.js` | SAFE REDESIGN | Isolated viewer; URL allowlist only version, set, language and owned source IDs. No account or collection code, no Storage API access. |
| `ui-v137-focus.js` | SAFE REDESIGN | Read-only exact catalog set accessor and nonserialized row/card reference. |
| `ui-v137-collection.js` | BUG FIX | Explicit selection accepted by existing add editor; source set retained; read-only items/link APIs exposed. |
| `ui-v150-experience.js` | BUG FIX | Selected-card price uses validated Market output instead of legacy `quote.price`. |
| `index.html`, `brand-v172.js`, `sw.js` | BRAND/PWA | HoloDex v181 Beta, new presentation assets and unique `rareworth-shell-v181`. Existing cache cleanup retained. |
| `tests/*`, `docs/*`, `.github/workflows/ci.yml` | TEST/DOC | Retained baseline cases; exact metadata/script updates, reversible scope fixture, added blocker and mobile regressions. |

UNEXPECTED production files: none.

## Preserved boundaries

The market, cost, insights, Home calculations, beta search adapter, cloud/account engines, original catalog and routing data remain exact v180 content. Historical scope tests reverse only the explicitly recorded integration edits, then retain their original comparisons. Existing test cases are not removed.

NO_GO_SHARED_HISTORY stays active. No history graphs, periods, invented movement, TCGCSV dependency, backfill, data branch or camera-scanner promise. Five existing navigation actions remain. Set completion uses only loaded actual source identities; wishlist and duplicate quantities do not increase completion.

The redesign's EX+Stamped defect was reproduced before implementation as NM+NORMAL with a generic EUR25 detail price. The regression requires EX+STAMPED in the detail/add flow and an unavailable price for an unproven special variant. Binder edit targets the selected owned UID; search detail never silently edits another owned variant.

Share links contain no acquisition costs, quantities, tokens or account identifiers. Their viewer is isolated from app initialization so visiting it cannot normalize or overwrite the local collection. Share views require a connection to load the public set catalog; the main binder uses the existing cached catalog offline.

No legacy files were removed. The existing untracked artwork patch is excluded from every read, staging operation and inventory.

## Evidence

Local CI-equivalent checks, the 459-case baseline, new frozen/browser regressions, four-width screenshots and deployment evidence are recorded in the release report outside the repository. Deployment requires green branch CI, unchanged v178 main, verified rollback ref, fast-forward-only main update, green main CI and Pages for the exact commit, followed by a live smoke check.
