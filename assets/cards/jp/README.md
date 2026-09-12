# RareWorth Japanese image library — v161

Only import your own scans or images you are explicitly authorized to host.
The importer never downloads images. Keep permission/provenance records yourself.
Do not use it to copy ArtOfPkm scans. No card images are shipped in v161.

One-time setup (Node.js 22 or newer), from the repository root:

```sh
npm install --prefix scripts
```

Then import one folder containing hundreds of files with one command:

```sh
node scripts/import-jp-images-v161.cjs "C:\Users\kevin\Pictures\jp-scans"
```

Use exact, case-sensitive **source IDs**, not Pokédex numbers, English collector
numbers or card names: `PMCG1-035.jpg`, `PMCG2-024.png`, `PMCG5-036.jpeg`,
`neo1-036.webp`. Accepted extensions are JPG/JPEG/PNG/WebP. The folder is flat;
subfolders, symlinks, unknown IDs, mismatched formats and animated files are rejected.
The 780 allowed IDs come from the frozen v160 source catalog.

Images are fully decoded, EXIF-oriented and converted to WebP (quality 90,
at most 1200 × 1680, aspect ratio preserved, no upscaling, metadata stripped).
Limits: 30 MiB input, 40 million pixels. No cloud service or runtime dependency.

Outputs:

- `assets/cards/jp/<source_id>.webp` — owned/authorized artwork.
- `data/jp-image-manifest-v161.json` — persistent manifest (source of truth).
- `jp-image-manifest-v161.js` — generated synchronous browser catalog + manifest.
- `data/jp-image-inventory-v161.json` — all 780 statuses and selected image URLs.
- `JP-IMAGE-COVERAGE-V161.md` — per-set coverage.
- `data/jp-image-import-report-v161.json` — imported, duplicate and rejected files
  with reasons (local report, excluded from Git).

Valid files in a partially invalid batch are imported; rejected files produce exit
code 1. Duplicates are skipped and reported. Existing files are never overwritten.
Multiple files for the same ID are all skipped. Identical image bytes under other
IDs are skipped for manual review. Original inputs are never modified or moved.
The filename is your assertion of artwork identity: the script validates the ID
and image integrity, but cannot verify what card the pixels depict. Review the
source ID and any edition/variant differences before supplying each scan.

Run only one import at a time. An interrupted process may leave
`.jp-image-import-v161.lock`; remove it only after checking no importer is running.
Review an orphan image before removing it and retrying; the importer will not
overwrite it. To replace an existing scan, explicitly remove its manifest entry
and WebP file in a reviewed branch, then re-import. Run the generator after any
manual manifest removal. No automatic replacements or fuzzy matches.

Regenerate inventory without importing:

```sh
node scripts/generate-jp-image-inventory-v161.cjs
```

Runtime order: OWN → exact JA TCGdex metadata → EXTERNAL_BETA → unavailable.
Own images are selected with `RareWorthJPImageLibrary.resolve(source_id)`;
CardArtwork additionally validates language, canonical set and source set.
A broken local image tries the existing fallbacks. Prices still use the original
metadata lookup. Neither artwork nor import changes saved card identities.

To disable beta, change `config.allowExternalBeta` to `false` in
`jp-image-library-v161.js`, or set it before mounting artwork:

```js
RareWorthJPImageLibrary.config.allowExternalBeta = false;
```

Reload after changing this configuration; already-rendered images are not removed
retroactively. The v158 mapping is retained unchanged. The inventory report uses
the module's default setting. A future CDN migration can be contained in this
library's resolver/path validation, keeping CardArtwork's interface unchanged.

For a later release, review/commit generated assets and manifests together and
bump the manifest script's cache-bust in `index.html`. The importer never commits,
pushes, merges or deploys. GitHub Pages needs only static files; Sharp is used
only by the local import tool.
