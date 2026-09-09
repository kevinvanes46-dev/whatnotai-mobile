# RareWorth v155 - search/artwork (aangeleverde punten 4 en 5)

Baseline: `6140aad6939311f4fa99928d4fa109d10c55bc6b`.
Branch: `rareworth-v155-search-artwork`. Geen merge/deployment.
De oorspronkelijke v155-punten 1-3 zijn niet aangeleverd; dit rapport claimt die niet als uitgevoerd.

## Oorzaken en wijzigingen

1. Stamped-preset: de click-handler bouwde resultaten op; dezelfde click bereikte daarna de globale buiten-klik-handler, die de nieuwe lijst direct verborg. Daardoor bleven ook de lazy artwork-targets onzichtbaar. Alle bestaande presetknoppen vallen nu buiten die dismiss-regel. Geen wijziging aan zoekmatching, sortering, setmappings of individuele kaarten.
2. Curated EN-kaartnamen kunnen displaylabels zoals zeldzaamheid bevatten die afwijken van de API-titel. Voor een geverifieerd lokaal record met een unieke bestaande source-setmapping gebruikt artwork nu set + collector number als bron-ID. Geen naamgok en geen fallback naar een ander catalogus-ID als al een ID is opgegeven.
3. JP: de oude `/ja/`-substringcontrole is te beperkt als geldige JA-metadata een taalneutrale resource aanwijst. JP-artwork vereist nu exact dezelfde bron-ID in de JP-catalogus of in de via JA opgehaalde kaartmetadata. Een willekeurige opgeslagen afbeelding is onvoldoende. Expliciet buitenlandse taalpaden blijven geweigerd. De huidige gecontroleerde JP-kaarten hebben echter daadwerkelijk geen image-veld in de bron; de URL-check is dus niet de verklaring voor die twaalf ontbrekende beelden.

Gewijzigde productie: `ui-v137-focus.js`, `ui-v150-experience.js`, `index.html` (twee cache-busts `155-artwork`).
`app-v137.js`, `card-identity-v154.js`, `ui-v137-collection.js`, `cardmarket-products-v152.js`, `cards.json` en `ui-v154-keyboard.js` zijn bytegelijk aan de baseline (met normalisatie van Windows-regeleinden). Routing, collectie/prijzen/scanner en bestaande storage-contracts zijn niet aangepast.

## Stamped - echte bronafbeeldingen

Drie echte kaarten per set. Elke preset is aangeklikt; resultaten blijven zichtbaar zonder Enter. Elke afbeelding is in de browser geladen en de URL vergeleken met de echte kaartmetadata. Alle 30 echte asset-URLs gaven HTTP 200 met image-content; zie `live-assets.json`.

| Set | Resultaat | Exacte testkaarten |
|---|---|---|
| EX TEAM ROCKET RETURNS | PASS | ex7-1, ex7-2, ex7-3 |
| EX DEOXYS | PASS | ex8-1, ex8-2, ex8-3 |
| EX EMERALD | PASS | ex9-1, ex9-2, ex9-3 |
| EX UNSEEN FORCES | PASS | ex10-1, ex10-2, ex10-3 |
| EX DELTA SPECIES | PASS | ex11-1, ex11-2, ex11-3 |
| EX LEGEND MAKER | PASS | ex12-1, ex12-2, ex12-3 |
| EX HOLON PHANTOMS | PASS | ex13-1, ex13-2, ex13-3 |
| EX CRYSTAL GUARDIANS | PASS | ex14-1, ex14-2, ex14-3 |
| EX DRAGON FRONTIERS | PASS | ex15-1, ex15-2, ex15-3 |
| EX POWER KEEPERS | PASS | ex16-1, ex16-2, ex16-3 |

## JP - echte bronstatus en gerichte contracttests

De set-endpoints voor PMCG1 (Base), PMCG2 (Jungle), PMCG3 (Fossil) en neo1 leveren in deze opname geen image-velden voor hun card briefs. Ook de onderstaande twaalf volledige kaartrecords bevatten geen image-veld. Deze gevallen zijn dus **BRON ONTBREEKT**, niet "zichtbare JP-afbeelding PASS". Selectie, source_id, taal, Recent en Gebruik zijn wel PASS; geen Engelse afbeelding wordt geleend.

| JP-set | Source ID | Naam uit bron | Artwork |
|---|---|---|---|
| neo1 | neo1-001 | 奇妙な | Bron biedt geen afbeelding |
| neo1 | neo1-002 | チコリータ | Bron biedt geen afbeelding |
| neo1 | neo1-003 | レディバ | Bron biedt geen afbeelding |
| PMCG1 | PMCG1-001 | フシギダネ | Bron biedt geen afbeelding |
| PMCG1 | PMCG1-002 | キャタピー | Bron biedt geen afbeelding |
| PMCG1 | PMCG1-003 | トランセル | Bron biedt geen afbeelding |
| PMCG2 | PMCG2-001 | ニドラン♀ | Bron biedt geen afbeelding |
| PMCG2 | PMCG2-002 | ナゾノクサ | Bron biedt geen afbeelding |
| PMCG2 | PMCG2-003 | パラス | Bron biedt geen afbeelding |
| PMCG3 | PMCG3-001 | アーボ | Bron biedt geen afbeelding |
| PMCG3 | PMCG3-002 | ズバット | Bron biedt geen afbeelding |
| PMCG3 | PMCG3-003 | ベトベター | Bron biedt geen afbeelding |

Daarnaast: vier expliciet synthetische availability-contracttests gebruiken de echte JP-identiteiten met een test-only taalneutrale image-URL. Ze verifiëren dat exacte JP-catalogusprovenance wordt geaccepteerd zonder `/ja/` in het pad. Een aparte test controleert dezelfde recovery via JA-metadata; een negatieve test weigert een opgeslagen EN-afbeelding voor een JP-bron zonder image. Deze tests claimen geen live aanwezige Japanse scan en voegen geen fake artwork toe aan productie.

## Bronnen en reproduceerbaarheid

- [TCGdex card API](https://tcgdex.dev/rest/card)
- Voorbeeld EN-metadata: [EX Team Rocket Returns](https://api.tcgdex.net/v2/en/sets/ex7)
- JP-bronsets: [Base](https://api.tcgdex.net/v2/ja/sets/PMCG1), [Jungle](https://api.tcgdex.net/v2/ja/sets/PMCG2), [Fossil](https://api.tcgdex.net/v2/ja/sets/PMCG3), [Neo](https://api.tcgdex.net/v2/ja/sets/neo1).
- De echte API-antwoorden en 30 WebP-fixtures staan in `tests/fixtures/artwork-v155/`. `capture-artwork-v155.cjs` en `capture-artwork-assets-v155.cjs` kunnen de beperkte matrix opnieuw ophalen.
- Test: `tests/artwork-v155.test.cjs`; runner: `tests/run-artwork-v155.cjs`.

## Validatie

Zes gerichte suites PASS: artwork-v155, history-identity-v154, history-v154, keyboard-v154, mobile-v153 en release-v152. De bestaande release-suite controleert bovendien 3.285 productroutes zonder routecode te veranderen. Logs staan in `regression/`. JS-syntax en `git diff --check`: PASS.

Screenshots: `stamped-images-390.png` (echte EN-artwork) en `jp-source-unavailable-390.png` (eerlijke JP-bronstatus). `matrix.json` bevat de kaartmatrix. Overige regressiescreenshots zijn lokaal reproduceerbaar en niet toegevoegd aan Git.

## Grenzen

Echte iPhone/Safari-QA blijft nodig. De live bron- en assetchecks zijn gecombineerd met stabiele browserfixtures. Voor de twaalf genoemde JP-kaarten kan deze wijziging geen ontbrekende bronafbeelding produceren; daarvoor moet TCGdex alsnog artwork aanbieden of moet een afzonderlijk geautoriseerde, betrouwbare JP-bron worden toegevoegd. Er zijn geen geraden of per-kaart gehardcodeerde URLs toegevoegd.

Rapport vastgelegd: 2026-09-09T20:01:56.012601+00:00
