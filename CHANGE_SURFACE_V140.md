# CardScout v140 — Change Surface Audit

## Release policy

v140 is generated from the exact uploaded v130 ZIP. The original v130 directory is never modified. This release deliberately limits changes to scanner/data lifecycle, persistence, version markers and the minimal UI hooks needed for learning backup/restore.

## Exact byte-preserved files

- `QA_V130.txt`
- `UPLOAD_INSTRUCTIONS_V130.txt`
- `VISION_CORE_V130.txt`
- `style-v100.css`
- `style-v110.css`
- `style-v120.css`
- `sw.js`
- `ui-v110.js`
- `visual-catalog.json`
- `visual-seeds.json`

## Replaced/advanced runtime files

- `app-v130.js` → `app-v140.js`: scanner data source, index lifecycle, fair ranking, persistent learning hooks, stable debug/prefs migration and build marker.
- `ui-v120.js` → `ui-v140.js`: stable preference keys + migration, deliberate confirmation/correction hooks, learning backup/restore controls. UI similarity gate remains >97%.
- `index.html`: only script/build references, learning-memory controls and manual set options required by the foundation.
- `manifest.json`: `start_url` advanced to build 140; all other manifest fields preserved.
- `cards.json`: the original 265 known-card records are byte-for-byte equivalent as JSON records; only set definitions/options required for manual DP/POP routing were added.
- `cardscout-memory-v140.js`: new persistent IndexedDB learning/cache layer.

## Things intentionally NOT changed

- Existing Cardmarket direct URLs and direct-vs-search behavior.
- EN/JP and NM/EX/GD/PL routing identifiers.
- 1st Edition routing marker.
- Existing style sheets.
- Existing `visual-catalog.json` and `visual-seeds.json` source data.
- Existing v110 compatibility UI file.
- Existing service-worker cleanup logic.
- Camera yellow-frame/crop/dewarp code, except where the scanner lifecycle consumes its result.

## Rollback

The untouched v130 upload remains the rollback baseline. v140 should first be deployed to a staging/test URL or branch and smoke-tested on a real iPhone before replacing production.
