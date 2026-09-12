# RareWorth v161 — verification

Base: `333ec94eae88da338a27d7bfc42335de00f348c4`.
Branch: `rareworth-v161-jp-image-library`. No merge or deployment.

## Changes

- Added exact-ID own image library and generated browser manifest/catalog.
- Added local Sharp importer with validation, WebP conversion, duplicate reports,
  exclusive image creation and an import lock; no source downloads.
- Added inventory generator and coverage for all 780 frozen v160 records.
- CardArtwork checks own images before existing metadata artwork, retries the
  existing chain if a local image fails, and rejects conflicting vintage IDs/sets.
  Metadata/price lookup still uses the existing implementation.
- All external fallback calls honor `allowExternalBeta`; the v158 map is unchanged.
- `index.html` loads the generated manifest and resolver before CardArtwork and
  uses v161 cache-busts for the new assets and modified UI script.

Only existing production files modified: `index.html`, `ui-v150-experience.js`.
No changes to routing, source catalogs, search UX, scanner, prices, Stamped,
keyboard, storage contracts, auth or payments.

## Results

| Check | Result |
|---|---|
| Exact own ID → OWN | PASS |
| Unknown own ID rejected | PASS |
| Wrong source/canonical set combination rejected | PASS |
| OWN precedes available TCGdex image | PASS |
| No own image + exact JA metadata → TCGDEX | PASS |
| No own/TCGdex + beta mapping → EXTERNAL_BETA | PASS |
| No usable source → MISSING | PASS |
| English artwork is not requested for JP identity | PASS |
| Broken own file → TCGDEX / EXTERNAL_BETA | PASS |
| Disable beta, including cached lookup and failed own image | PASS |
| Four Pikachu IDs remain distinct in resolver and search UI | PASS |
| One own image mount in each of all ten JP source sets | PASS |
| Swinub neo3-038 own and beta artwork, Awakening Legends/Swinub-AL route | PASS |
| Recent save, reload, restore: own and beta images + identity | PASS |
| Collection save and reload: own image + identity; beta regression | PASS |
| v157 routing | PASS |
| v158 artwork map | PASS |
| v159 source identity priority | PASS |
| v160 all 780 source records and search coverage | PASS |
| 240-image batch; JPG/JPEG/PNG/WebP input | PASS |
| Unknown IDs, corrupt/truncated images and mismatched formats rejected | PASS |
| Duplicate filenames/bytes and existing files skipped; no overwrite | PASS |
| Generator is deterministic; concurrent importer blocked | PASS |
| Syntax: 19 active/new JavaScript files | PASS |
| git diff --check | PASS |

45 targeted Node tests passed:

```sh
npm ci --prefix scripts
node --test tests/jp-image-library-v161.test.cjs tests/jp-cardmarket-twin-v157.test.cjs tests/jp-artwork-v158.test.cjs tests/source-identity-v159.test.cjs tests/jp-set-coverage-v160.test.cjs tests/history-identity-v154.test.cjs
```

Three browser scripts passed (Playwright with local Chromium 153, mobile viewport
390 × 844; existing `PLAYWRIGHT_MODULE` / `CHROME_PATH` overrides supported):

```sh
node tests/jp-image-library-browser-v161.test.cjs
node tests/jp-artwork-browser-v158.test.cjs
node tests/jp-set-browser-v160.test.cjs
```

The standard Playwright browser download timed out; a local Chromium binary from
the npm-distributed `@sparticuz/chromium` package was used instead. This test-only
installation is outside the repository and is not a production dependency.

Tests use intercepted API fixtures and synthetic test-only image bytes. They
verify rendering, identity and fallback selection, not live CDN uptime or the
visual correctness of third-party scans. No test images are shipped as artwork.

Inventory: **780 total; OWN 0; TCGDEX 0; EXTERNAL_BETA 413; MISSING 367**.
Coverage is **52.95%** with beta enabled. The frozen v160 records contain no
TCGdex image URLs; runtime JA metadata may later provide more. Counts describe
configured sources, not successful live downloads. See
`JP-IMAGE-COVERAGE-V161.md` for the ten-set breakdown.

Remaining input: authorized card scans, named with the exact source IDs from
`data/jp-image-inventory-v161.json`. The importer validates IDs and image integrity;
the person supplying scans must verify that each scan actually depicts that ID.
One command imports the whole folder and regenerates all manifests/reports; see
`assets/cards/jp/README.md`.
