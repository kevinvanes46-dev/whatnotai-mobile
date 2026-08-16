# CardScout v140 — Known Data Issues

These are intentionally documented rather than silently patched.

## 1. Catalog is not complete

The v130/v140 known-card list contains 265 records. It is a curated subset, not a full Pokémon TCG catalog. A perfect recognizer cannot return a card that does not exist in its candidate database.

The uploaded failure set contains several visible cards that are absent from the current known-card catalog, including Shelgon, Mudkip, Omastar, Surskit, Gabite, Granbull, Staraptor, Exeggcute, Cyndaquil, Cacnea and Charmander variants shown in the test photos.

## 2. DP / POP manual options are not full coverage

The v140 set selector contains Diamond & Pearl-era and POP Series 1–9 options so a missing card can be manually routed to Cardmarket and learned. These options do **not** mean the underlying card catalog is complete. QA intentionally emits a warning while coverage remains absent.

## 3. Orphan seed

`en|jungle|43|farfetch'd` exists in `visual-seeds.json` but has no matching card record. v140 skips orphan seed rows at runtime. Source files are left unchanged for rollback/auditability.

## 4. Current cards without official visual-catalog reference

- `jp|base|002|ivysaur`
- `jp|base|006|charizard`
- `jp|base|009|blastoise`
- `jp|jungle|133|eevee`
- `jp|fossil|094|gengar`
- `jp|rocket|006|dark charizard`
- `jp|gym heroes|146|rocket's moltres`
- `jp|neo discovery|197|umbreon`
- `jp|neo revelation|220|swinub`
- `en|ex trainer kit 2|1|beldum`
- `en|ex trainer kit 2|5|metang`
- `en|ex dragon|67|nincada`

## 5. Same set/number groups requiring later normalization

- Legendary Collection Charizard #3 has normal/reverse variants and must remain variant-aware.
- EX Dragon Frontiers Bagon #43 currently has two name labels pointing at the same Cardmarket product. Do not silently collapse this until the full catalog has explicit variant identity.

## Migration rule for v150

Full catalog migration must use a single canonical card identity source for search, scanner, learning and Cardmarket routing. Set names alone are not considered coverage.
