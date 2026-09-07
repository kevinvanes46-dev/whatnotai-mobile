# Rareworth v153 mobile polish — reviewbranch

## Baseline en scope
Baseline: `bb52604ea331567987d8d79cae94b1995153ad79` (`origin/fix/cardmarket-mobile-v152`).
Nieuwe branch: `rareworth-v153-mobile-polish`.
Alleen deze branch wordt gepusht. Geen merge, main-update of publicatie.

## Resultaat
- **Search overlap:** de resultaten-scrollcontainer krijgt een maximumhoogte op basis van de actuele zichtbare ruimte. De pagina reserveert eenmaal de gemeten ruimte voor dock, navigatie, hun safe-area/gaps plus 20px. Getest met 1, 10 en 35 resultaten; de laatste kaart past volledig boven beide actieve vaste balken. Eén resultaat krijgt geen kunstmatig hoge scrollcontainer. De sticky header wordt bij scrollen ook meegenomen.
- **Stamped presets:** de bestaande tien setchips staan direct onder de zichtbare voorkeuren. De rij scrolt horizontaal, gebruikt bestaande setdata en behoudt staat/editie. Een setkeuze houdt Stamped actief en gebruikt EN. De actieve chip wordt op de gedetecteerde set bepaald, niet op overlappende woorden zoals EX/Dragon.
- **Recent:** één grote Gebruik-knop per rij bevat thumbnail, naam en subtiele metadata. Bestaande Gebruik/Open/verwijder-handlers blijven behouden. Cardmarket en verwijderen zijn rustige acties met 44px targets. Wis alles blijft beschikbaar. Getest met één en twaalf items, lange namen, verwijderen en hergebruik.
- **Image recovery:** afbeeldingsdata wordt bij weergave genormaliseerd: geldige opgeslagen URL, source_id/sourceId/catalogId, anders naam+set+nummer+taal via geladen catalogus en bestaande metadata-resolver. Setlabels en nummers worden genormaliseerd. Ongeldige URLs vallen terug op hydratatie; opgeslagen URLs die niet laden proberen bestaande metadata. Positieve/pending/negatieve lookup-caching en vier gelijktijdige lookups voorkomen herhaalde requests bij renderen. Pinsir en Bagon zijn met echte beeldfixtures getest. Oude recent-/collectiegegevens worden niet gemigreerd of herschreven.
- **Gallery-audit:** deze baseline heeft een geselecteerde kaartpreview en een vierkaartengrid op Home, geen aparte horizontale preview-carrousel. Alle vier beschikbare beelden laden en de laatste is boven de vaste bediening bereikbaar. De scanner-galleryInput is een bestandskiezer en is niet gewijzigd. De daadwerkelijke horizontale presetrail is op beide uiteinden getest.
- **Fixed/sticky:** Zoeken, detail, Collectie, Recent en Meer zijn gecontroleerd. Lange stamped-knoptekst past op 320px. De document-padding volgt de werkelijke fixed-controls en wordt na een viewportwijziging opnieuw gemeten.
- **Keyboard:** bij een kleiner visualViewport met een actief tekstveld worden vaste bedieningselementen tijdelijk verborgen; na sluiten herstellen ze. Een verkleinde viewport en een gesimuleerde visualViewport-keyboardcyclus zijn getest. Gebruik van dvh/svh voorkomt een vaste 100vh-aanname voor de nieuwe scrollruimte.

## Gewijzigde bestanden
Productie:
- `index.html`: laadvolgorde/cache-bust voor de UI-bestanden en nieuwe polishlaag.
- `ui-v137-focus.js`: alleen catalogus-hydratatie-interface, stamped-presetvoorkeuren en actieve chip.
- `ui-v150-experience.js`: zichtbaarheid presets en gedeelde preview-hydratatie/cache.
- `ui-v153-mobile.js`: gemeten scrollruimte, toetsenbordgedrag en presentatie van Recent.
- `style-v153-mobile.css`: beperkte visuele overrides voor scrollruimte, presets, Recent en lange knoptekst.

Tests/documentatie: `tests/mobile-v153.test.cjs`, Pinsir-fixtures `tests/fixtures/artwork/base2-25.{json,webp}`, fixture-README, dit rapport en `artifacts/mobile-v153/`.

## Validatie
**10/10 suites geslaagd**: de negen bestaande suites plus de nieuwe mobiele suite.
- 697 bestaande routing/resolver/browsertests.
- 14 bestaande collectieprijs-scenario's.
- 8 algemene UI-auditgroepen en 5 collector-experiencegroepen.
- Bestaande releasecheck: 3.285 productroutes, beide providerfallbacks, browserflows, preview-retry en backup/export/import.
- 23 nieuwe mobiele checks, inclusief 320/375/390/430px, image recovery, negative-cache/request-deduplicatie, opslagbehoud, presets, bereikbaarheid, acties en viewportherstel.
- JS syntaxchecks en `git diff --check`.

Route-engine (`app-v137.js`, inclusief scanner), volledige collectiemodule/prijzen/import-export, `cards.json`, manifest en gecontroleerde productmappings zijn byte-identiek aan de baseline na normalisatie van Git-regeleinden. Supabase/backend/login zijn niet gewijzigd.

Logs staan in `artifacts/mobile-v153/mobile-tests.txt` en `artifacts/mobile-v153/regression/`. Een Windows-bestandslock op oude screenshotbestanden is opgelost door de resterende tests naar een nieuwe map te laten schrijven. Oude gegenereerde bestanden zijn apart bewaard en de oude artifactmappen zijn teruggezet; alleen v153-bewijs hoort bij deze review.

## Screenshots
| Breedte | Laatste zoekresultaat | Presets | Recent | Detail | Previews |
|---|---|---|---|---|---|
| 320 | [Zoeken](artifacts/mobile-v153/search-35-320.png) | [Presets](artifacts/mobile-v153/presets-320.png) | [Recent](artifacts/mobile-v153/recent-320.png) | [Detail](artifacts/mobile-v153/detail-320.png) | [Previews](artifacts/mobile-v153/previews-320.png) |
| 375 | [Zoeken](artifacts/mobile-v153/search-35-375.png) | [Presets](artifacts/mobile-v153/presets-375.png) | [Recent](artifacts/mobile-v153/recent-375.png) | [Detail](artifacts/mobile-v153/detail-375.png) | [Previews](artifacts/mobile-v153/previews-375.png) |
| 390 | [Zoeken](artifacts/mobile-v153/search-35-390.png) | [Presets](artifacts/mobile-v153/presets-390.png) | [Recent](artifacts/mobile-v153/recent-390.png) | [Detail](artifacts/mobile-v153/detail-390.png) | [Previews](artifacts/mobile-v153/previews-390.png) |
| 430 | [Zoeken](artifacts/mobile-v153/search-35-430.png) | [Presets](artifacts/mobile-v153/presets-430.png) | [Recent](artifacts/mobile-v153/recent-430.png) | [Detail](artifacts/mobile-v153/detail-430.png) | [Previews](artifacts/mobile-v153/previews-430.png) |

Ook screenshots van 1/10 resultaten, het laatste recent-item en één recent-item zijn opgenomen. Zoeklijsten met 1/10/35 items zijn synthetische UI-fixtures om scrollgeometrie te testen; de productiezoekinhoud is niet vervangen.

## Resterende risico's
- Echte iPhone Safari, dynamische browserbalken, notch/safe-area-waarden, schermrotatie en het fysieke toetsenbord blijven apparaat-QA; Chrome-emulatie is geen volledige iOS-test.
- Een afbeelding zonder beschikbare of eenduidige bron blijft een fallback. Negatieve metadataresultaten zijn 60 seconden gecachet; de expliciete herlaadknop kan opnieuw proberen.
- Er is geen nieuwe scanner- of backendtest uitgevoerd: die onderdelen vallen buiten deze polishscope en zijn ongewijzigd.
