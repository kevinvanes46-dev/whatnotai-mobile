# EN Platinum + HeartGold & SoulSilver coverage — v175

Source verification: 2026-10-10 (Europe/Amsterdam). Full frozen responses from https://api.tcgdex.net/v2/en/sets/{id}, plus the real hgss3-86 card metadata for the Prime/idProduct regression. Runtime retains the existing background set loader (maximum six concurrent set requests); CI uses frozen responses and blocks all external network data. No per-card catalog preload.

The requested hsp endpoint returns HTTP 404. The official source identifies HGSS Black Star Promos as **hgssp** (25 cards), explicitly approved for this release. hsp remains only a human search alias/app code. Runtime requests /sets/hgssp, never /sets/hsp. Counts match the expected total of 1,062. Pokémon Rumble is excluded.

| Set | Canonical key | TCGdex ID | Cards | Representative | Special numbering | Search | Collection reload | Route in frozen set-only test |
|---|---|---|---:|---|---|---|---|---|
| Platinum | PLATINUM | pl1 | 133 | Dialga G LV.X (pl1-122) | Yes | PASS | PASS | SEARCH |
| Rising Rivals | RISING RIVALS | pl2 | 120 | Fan Rotom (pl2-RT1) | Yes | PASS | PASS | SEARCH |
| Supreme Victors | SUPREME VICTORS | pl3 | 153 | Milotic (pl3-SH7) | Yes | PASS | PASS | SEARCH |
| Arceus | ARCEUS | pl4 | 111 | Charizard (pl4-1) | Yes | PASS | PASS | SEARCH |
| HeartGold & SoulSilver | HEARTGOLD SOULSILVER | hgss1 | 124 | Ho-Oh LEGEND (hgss1-111) | Yes | PASS | PASS | SEARCH |
| Unleashed | UNLEASHED | hgss2 | 96 | Alph Lithograph (hgss2-TWO) | Yes | PASS | PASS | SEARCH |
| Undaunted | UNDAUNTED | hgss3 | 91 | Umbreon (hgss3-86) | Yes | PASS | PASS | SEARCH |
| Triumphant | TRIUMPHANT | hgss4 | 103 | Alph Lithograph (hgss4-FOUR) | Yes | PASS | PASS | SEARCH |
| Call of Legends | CALL OF LEGENDS | col1 | 106 | Rayquaza (col1-SL10) | Yes | PASS | PASS | SEARCH |
| HGSS Black Star Promos | HGSS BLACK STAR PROMOS | hgssp | 25 | Ho-Oh (hgssp-HGSS01) | Yes | PASS | PASS | SEARCH |

## Identity and truthful routes

Frozen set responses prove real source identities, not direct marketplace product routes. Their representative cases therefore use contextual www.cardmarket.com SEARCH links with the cleaned name, original localId and set label. The separately frozen Prime card hgss3-86 proves Cardmarket idProduct 279339 and exercises DIRECT. No product IDs or URLs were invented. Existing verified local routes remain authoritative. Conditions remain NM=2, EX=3, GD=4, PL=6.

Special numbering includes SH, RT, AR, SL, HGSS01–HGSS25 and Alph Lithograph ONE/TWO/THREE/FOUR. Source IDs and localIds remain strings through selection, Recent, collection and reload. Numeric sorting is only ranking, never source identity. Quick-input special numbers require a matching card in the explicit set's catalog; no special ID is fabricated.

LV.X: pl1-122 Dialga G LV.X. LEGEND: hgss1-111 and hgss1-112 Ho-Oh LEGEND remain distinct cards. Prime: hgss3-86 Umbreon (source name), rarity Rare PRIME and suffix Prime in full card metadata; no synthetic Prime name or variant schema.

Explicit source aliases take precedence. Arceus alone (including a numeric/LV.X suffix) is a Pokémon query, not proof of set identity; charizard arceus identifies the set. PL remains Played when another set alias is present, otherwise it is the Platinum alias. Pikachu is absent from pl1 and Lugia is absent from hgss2: those example queries must return no matching card, never substitute another set.

## Safety and regression coverage

EN cache advances to cardscout_search_catalog_v152_EN_v175; previous caches are ignored, not user data deleted. Existing collection, Recent, favorites, cloud/account/device, guest and valid Cardmarket cache keys remain unchanged. One failed set response preserves the shell, local catalog and successful sets, with no cards fabricated for the failed set. Cached Platinum/HGSS searches survive a real offline reload.

Only seven production files change: app-v137.js, cards.json, ui-v137-focus.js, ui-v137-collection.js, index.html, brand-v172.js, sw.js. JP, artwork, CardmarketUI host security, scanner, pricing, Supabase and cloud production files remain unchanged. Existing DP/POP 17 sets / 1,053 cards and JP 780 / 397 EXACT / 383 SEARCH are protected by regressions. Stamped mode remains the existing EX-only set list.

Shell rareworth-shell-v175 precaches changed same-origin assets; external cache entries remain zero. HoloKeep version is v175 · Beta. Mobile widths 320/375/390/430 retain hidden manual set controls and no horizontal overflow.

The new dedicated CI step runs tests/en-platinum-hgss-coverage-v175.test.cjs. Existing tests keep their assertions; only current version/cache expectations and exact reviewed scope reversals advance. tests/fixtures/en-scope-v175.json records exact before/after changes for historical byte comparisons, so unrelated engine changes still fail.
