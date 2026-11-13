# Cardmarket EN audit v247

## Resultaat en beperkingen

De [kaart- en setaudit](./CARDMARKET-AUDIT-V247.json) is een momentopname van
8 november 2026, 14:42 UTC, met 206 fysieke Engelse sets en 21.432 ontvangen
kaartidentiteiten. De audit gebruikt conditie NM, editie AUTO en variant NORMAL.
Andere uitvoeringen kunnen bewust naar zoeken verwijzen.

| Meting | Aantal |
| --- | ---: |
| Bestaande of toegevoegde exacte runtime-URL's | 219 |
| Waarvan nieuw in v247 met onafhankelijk nummerbewijs | 1 |
| Zoekfallbacks | 21.213 |
| Kaarten met conflicterende historische kandidaat-ID's | 1.898 |
| Kaarten zonder bruikbare historische kandidaat | 1.071 |
| Ontbrekende kaartrecords bij onvolledige sets | 228 |
| Ontbrekende of defecte setresponses | 0 |
| Dubbele exacte productpaden binnen de ontvangen catalogus | 0 |
| Uitgesloten digitale sets | 15 |

De conflict- en kandidaatcategorieën kunnen elkaar en de routecategorieën
overlappen. Een historisch kandidaatconflict bewijst niet dat een bestaande
product-URL fout is. Controle op dubbele paden bewijst evenmin dat twee
verschillende URL's niet hetzelfde product-ID vertegenwoordigen: de officiële
download bevat geen URL of kaartnummer waarmee die koppeling onafhankelijk
kan worden vastgesteld. Geen kandidaat-ID is daarom automatisch gepromoveerd.

De 218 overige exacte routes zijn bestaande routes, waaronder acht Jungle-links
die al in setdetail bestonden en nu ook centraal bereikbaar zijn. Ze zijn in
deze audit **niet allemaal opnieuw live en onafhankelijk geverifieerd**.
De telling van 219 is geen telling van aantoonbaar momenteel bereikbare
Cardmarket-pagina's. Per kaart bevat de JSON de daadwerkelijke route, de
beschikbare historische kandidaten en hun officiële productgegevens; per set
staan er aantallen en de status van de broncatalogus.

Zes bronsets zijn onvolledig:

| Set | Ontvangen / verwacht | Ontbrekend |
| --- | ---: | ---: |
| W Promotional (`wp`) | 0 / 7 | 7 |
| Jumbo cards (`jumbo`) | 0 / 160 | 160 |
| Sample (`sp`) | 0 / 10 | 10 |
| Radiant Collection (`rc`) | 0 / 25 | 25 |
| SM trainer Kit (Lycanroc) (`tk-sm-l`) | 18 / 30 | 12 |
| My First Battle (`mfb`) | 34 / 48 | 14 |

## Charizard ex 151

Voor `sv03.5-199`, Charizard ex 199/165, is de door de gebruiker verstrekte
[product-URL](https://www.cardmarket.com/en/Pokemon/Products/Singles/151/Charizard-ex-V3-MEW199)
opgenomen. Een zoekmachine-index van die Cardmarket-pagina vermeldde de naam,
set 151 en nummer 199; [TCGdex](https://api.tcgdex.net/v2/en/cards/sv03.5-199)
bevestigt de catalogusidentiteit. Rechtstreekse toegang tot Cardmarket gaf
HTTP 403, dus actuele bereikbaarheid is niet bevestigd. TCGdex noemt kandidaat
product-ID 733794 en de officiële download bevat dat ID met de naam
Charizard ex en expansion-ID 5402, maar die download bevat geen kaartnummer:
dit is geen onafhankelijk bewijs voor de product-ID-koppeling.

## Bronnen en reproduceerbaarheid

- [Officiële Cardmarket-productdownload](https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_6.json):
  `createdAt` 2026-11-08T13:01:06+0100, 75.495 producten, SHA-256
  `0a33ab0b239ca7506c539458f98d20c6bd2edc5d1931c4730760ac44a61bf701`.
  De download is niet ingecheckt; de audit registreert zijn ruwe bytehash.
- [TCGdex EN-setlijst](https://api.tcgdex.net/v2/en/sets) en de afzonderlijke
  setresponses leveren identiteiten en gepubliceerde aantallen.
- [v191-index](../cardmarket-product-index-v191.json) was aanwezig. De
  [v199-audit](../data/en-cardmarket-audit-v199.json), [v201-kandidaten](../data/en-cardmarket-candidates-v201.json)
  en [v203-routefixture](../tests/fixtures/v203-exact-routes.json) zijn exact
  hersteld uit Git-commit `bfa45fec79ae4d6329826950b9c5746d1a0f4014`.
  v199 en v201 zijn kandidaatdata, geen onafhankelijk gevalideerde product-ID's;
  v203 legt historische runtimeverwachtingen vast.
- `v202-clean-candidates.json` en `v202-conflict-triage.json` zijn niet
  aangetroffen in de onderzochte beschikbare worktrees en lokale Git-historie.
  Een oude geregistreerde worktree ontbreekt fysiek. Dit blijft ontbrekend bewijs.

Download de officiële catalogus naar een lokaal bestand en voer uit:

```powershell
node scripts\audit-cardmarket-v247.cjs --catalog <pad-naar-products_singles_6.json> --out docs\CARDMARKET-AUDIT-V247.json
```

De actuele externe bronnen kunnen veranderen; een nieuwe meting kan andere
aantallen opleveren. De JSON bevat ook hashes van de gebruikte historische
data, resolver, app, Jungle-module en het auditscript.

## Lokale testresultaten

- `node scripts\check-ci.cjs core`: 72 geslaagd.
- Voor de CI-diagnose: alle 61 testbestanden uit de huidige CI-workflow en aanvullende
  v247-resolver-/audittests samen, met `--test-concurrency=1`: 1.672 geslaagd,
  0 mislukt. Dit omvat mobiele Chromium-, collectie-, prijs-, NL-, offline
  PWA- en Cardmarket-regressies en de controle van alle 21.432 kaartidentiteiten.
- Syntaxcontrole: 231 bestanden geslaagd. JP-manifest en audit: 780 records,
  waarvan 397 EXACT en 383 SEARCH, geslaagd.
- Merkinventaris: generator `--check` en `git diff --cached --check` geslaagd.
- Na de CI-diagnose: de volledige v185 library-/componenten-CI-stap,
  inclusief mobiele Chromium en een geforceerde garbage-collection-proef:
  49 geslaagd.

De eerste twee GitHub-CI-runs faalden bij `page.evaluate` tijdens een
prijsverversing met `Resulting promise was garbage collected`, terwijl dezelfde
test lokaal slaagde. De testharness bewaart nu de lopende browseroperatie en
wacht op haar resultaat zonder de CDP-promise rechtstreeks te laten wachten;
fouten en time-outs blijven expliciet. De bestaande prijs- en collectieasserties
zijn behouden. De onderliggende oorzaak van de CI-fout is niet onafhankelijk
vastgesteld; alleen een nieuwe CI-run kan de wijziging daar toetsen.

De historische `tests/cardmarket-routing.test.cjs` faalt ook op de ongewijzigde
v246-mainbasis: de test verlangt exacte gelijkheid van `EMBEDDED_DATA` met een
oude commit met 35 sets, terwijl main inmiddels 61 sets bevat. De test is niet
afgezwakt en maakt geen deel uit van de huidige CI-workflow. De bestaande
`sharp@0.35.4`-dependency is door npm audit als high severity gemeld; deze
wijziging bevat geen dependency-upgrade.
