# v185 — kaartbibliotheek en prijsbeleid

## Gedrag

De zoekfunctie kan extra EN/JP-metadata in pagina's laden. De setbrowser toont fysieke sets, series, beschikbare kaarten en bezit binnen de beschikbare brondekking. Bestaande bronidentiteiten blijven behouden. Gecachte setgegevens blijven bij een mislukte of onvolledige refresh beschikbaar.

TCGdex levert uitsluitend metadata. Ook eerder opgeslagen TCGdex-prijzen worden niet meer als marktwaarde of prijsgrafiek getoond. Opgeslagen collectie, aankoopkosten, historie en cache worden niet verwijderd. Er is geen nieuwe betrouwbare Cardmarket-prijsprovider aangesloten. Marketplace-links en bestaande routing blijven beschikbaar.

## Gemeten bronbereik

| Taal | Eerder: sets / kaarten | v185 niet-lege sets / kaarten | Alle ontdekte fysieke sets |
|---|---:|---:|---:|
| EN | 62 / 5.617 | 201 / 21.290 | 205 |
| JP | 10 / 780 | 118 / 13.006 | 186 |

Dit zijn opgeslagen bronmetingen uit docs/v185-audit/coverage.json, geen garantie van wereldwijde volledigheid of van iedere kaartvariant. De meegeleverde snapshot is lokaal nagerekend. Vier EN-sets en 68 JP-sets hebben geen beschikbare kaarten. Sommige niet-lege sets zijn onvolledig. In de audit ontbreken afbeeldingen voor 1.621 EN- en 9.124 JP-kaarten. Ontbrekende beelden worden niet verzonnen. Japanse naamaliassen zijn beperkt tot de bestaande soortenlijst; niet iedere moderne Engelse soortnaam vindt daardoor een Japanse kaart.

API-documentatie: https://tcgdex.dev/rest/sets en https://tcgdex.dev/rest/cards . Metadata komt uit TCGdex; een metadatalicentie geeft geen eigendomsrechten op Pokémon-afbeeldingen.

## Behouden testbescherming

Zie v185-test-review.md voor de matrix van negen oude controles naar productiebeleid en afzonderlijke componenttests. Componentfixtures activeren uitsluitend op de lokale testserver de bestaande CommonJS-marktengine. Geen productieoptie, fake prijzen of verzonnen geschiedenis.

De PWA-updatecontrole wacht op een daadwerkelijk nieuwe geactiveerde controller, controleert dat deze de actieve registratie is, en controleert nieuwe/verdwenen caches, overige caches, collectiebehoud en offline herladen. De oude asynchrone pollingpredicate kon als Promise voortijdig slagen; de timeout is niet verhoogd.

De historische Jirachi-test is aangepast aan het expliciete EN DP/POP-conditiefilter uit commit73910a5 (v174). Hij controleert nu de exacte toegestane parameter en zoekterm; overige fallbackroutes blijven uitsluitend searchString toestaan. Geen productierouting gewijzigd.

## Grenzen van validatie

Browserscenario's gebruiken Chromium, geïsoleerde providerfixtures en lokale opslag. Cloudtests gebruiken mocks en bewijzen geen live backendtoegang. Mobiele breedtes zijn browseremulatie, geen fysieke iPhone-test. Screenshots uit de librarytests gebruiken placeholderafbeeldingen en zijn geen live visueel bewijs. Geen merge of productie-deployment onderdeel van deze PR.

## Lokale validatie

1224/1224 Node-tests geslaagd, 0 mislukt, 0 overgeslagen. Inclusief 662 historische routingtests. Alle 28 CI-commando’s lokaal uitgevoerd; eerder geslaagde, onaangetaste stappen zijn na gerichte reparaties niet onnodig herhaald. Zie v185-validation.json voor uitsplitsing. De twee freshness-bestanden bevatten elk 14 scenario’s maar worden elk als één Node-bestandstest geteld. Syntaxis, diff, manifestconsistentie en de JP-audit zijn afzonderlijke geslaagde controles.
