# v186 — officiële Cardmarket-prijzen en eerlijke geschiedenis (WIP)

**Status 23 oktober 2026: lokaal experiment op `codex/v186-cardmarket-official`.**

- Gebaseerd op `codex/v185-card-library` (`19cb6891ef0a2fbb37d9411d59857438742d3d33`).
- **PR #5 NIET mergen.** Geen wijzigingen op `main`, geen release of deployment.
- De nieuwe v186-adapters zijn opzettelijk **niet** aangesloten op de publieke UI, `market-v176.js`, `history-v183.js`, serviceworker, cloud of opgeslagen collectie.
- Prijzen en grafiek blijven op de v185-app uit totdat zowel de koppelingen als de gebruikersstroom aantoonbaar correct zijn.

## 1. Herkomst: precies wat officieel bestaat

Cardmarket publiceert zelf downloadbare productlijsten en prijsgidsen voor Pokémon. De publieke productcatalogus en prijsgids kunnen op `idProduct` worden gekoppeld:

- [Cardmarkets officiële aankondiging van de openbare downloads](https://news.cardmarket.com/en/Magic/were-making-the-price-guide-and-product-catalogue-available-for-download)
- [Officiële Pokémon-singleproductlijst](https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_6.json)
- [Officiële Pokémon-prijsgids](https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json)
- [Cardmarket-handleiding over gewone holo en Reverse Holo](https://help.cardmarket.com/en/finding-and-listing-pokemon-cards)

Bij een **echte lokale proefimport** met brondata van 21/22 oktober 2026 kwamen **66.786 Pokémon-singleproducten met ten minste één geldige trendwaarde** uit de officiële product- en prijsgids. Dit is aantoonbare *beschikbare brondata*, niet 66.786 afzonderlijk bewezen identieke TCGdex-kaarten.

De gids bevat een algemene Europese prijsindicatie per product, **geen bewezen NM/EX/GD/PL-bedrag, geen exacte EN/JP-taalprijs, geen 1st Edition-, stamped- of graded-schatting**. `trend` is geen laatste eBay-verkoopprijs en ook niet de laagste actuele Cardmarket-aanbieding.

**Belangrijke holo-regel:** een reguliere holo is bij Cardmarket een kaartrarity; Reverse Holo is een aparte kaartattribuut. `TCGdex.variants.holo` mag daarom niet automatisch het officiële `trend-holo`-veld kiezen. Het prototype toont bij een normale, niet-reverse kaart **uitsluitend `trend`**. Reverse/stamped krijgen zonder afzonderlijk geverifieerde koppeling geen prijs.

## 2. Technische opbouw en fail-closed regels

| Onderdeel | Gebouwd | Nog niet klaar |
| --- | --- | --- |
| `scripts/cardmarket-public-v186.cjs` en `scripts/build-cardmarket-public-v186.cjs` | Join op product-ID, bron- en datumcontrole, 256 kleine bestanden en SHA-256-checksums. Nooit `avg7`, `avg30`, `low` of verzonnen waarden als vervangende `trend`. | Dagelijkse GitHub Actions-download en een veilige publicatie naar dezelfde origin als de app. |
| `cardmarket-expansions-v186.json` | Drie handmatig gecontroleerde koppelingen: `base1`/1523, `sv03.5`/5402 en `SV2a`/5328. | Alle andere EN-/JP-expansies zijn vooralsnog **niet goedgekeurd**. |
| `cardmarket-price-v186.js` | Kaart-, nummer-, set-, product-ID-, naam-, editie- en finishcontrole; onbekend betekent geen prijs. Alleen TCGdex `idProduct` als verwijzing, nooit TCGdex numerieke prijs. | Diepe audit van extra prints, promo's, oudere kaarten en setnamen. |
| `cardmarket-feed-v186.js` | Leest prijsgegevens via dezelfde website, weigert oude bron of onjuiste SHA-256; geen browser-CORS naar Cardmarket en geen user-data writes. | Echte browser-/PWA-/iPhone-tests en ververs-UX. |
| `cardmarket-history-v186.js` | Echte tijdstippen van de bron, geen opvulling tussen dagen, geen gemengde prijsmetrieken of verschillende collecties; minstens twee echte meetpunten. | Compatibele UI met periodeknoppen/toetsenbord/touch, offline-/conflicttests en opslagmigratieonderzoek. |

De geschiedenis staat in een eigen sleutel `holodex_cardmarket_history_v186`. Het oudere v183-historieformaat en zijn onbetrouwbare TCGdex-prijzen worden **niet** automatisch omgezet. De grafiek begint pas na twee **afzonderlijk daadwerkelijk opgehaalde** dagmomenten voor precies dezelfde bezitssamenstelling; voor 1W/1M/3M/1J/Alles zijn geen historische terugvullingen beschikbaar. Een volledige portefeuille-grafiek verschijnt pas als *alle* getelde kaarten veilig geprijsd kunnen worden. De eerste standalone implementatie staat alleen EN toe: JP blijft voor portefeuillehistorie voorlopig uitgesloten.

## 3. Download- en validatieprocedure

Lokaal / CI kunnen de publieke downloads vooraf worden opgehaald, bijv. met `curl`, waarna de builder de bestanden alleen **in een nieuwe uitvoermap** verwerkt:

```bash
node scripts/build-cardmarket-public-v186.cjs \
  --catalog /path/products_singles_6.json \
  --prices /path/price_guide_6.json \
  --out /path/new-cardmarket-public-v186
```

De builder weigert bestaande mappen, afwijkend bronformaat, dubbele product-ID's, te oude/futuristische brondatums en ontbreken van prijsdata. De browser leest alleen dezelfde-origin bestanden met een geldige checksum. De 256 shards + manifest bevatten **geen collectie-, cloud-, betaal- of persoonlijke gegevens**.

**Geen automatische deployment:** eerst extra kaartmatching-audit, een handmatige publicatieproef in een niet-live omgeving, alle browser-, PWA-, cloud-, identiteit- en historiecontracttests, daarna expliciete releasegoedkeuring. De generieke public-download kan niet zomaar rechtstreeks vanuit GitHub Pages browsercode worden ingelezen (CORS). Een betrouwbare achtergrondimport op GitHub Actions is de voorkeursrichting, nog niet ingericht.

## 4. Minimale acceptance criteria vóór activatie

1. De echte product-ID én set-ID zijn geverifieerd voor voldoende relevante EN- en JP-sets; twijfel = `UNAVAILABLE`.
2. Normale holo versus Reverse Holo, 1st Edition, stamped, verschillende Cardmarket-productpagina's en kaartconditie worden niet samengevoegd.
3. Elke getoonde indicatie noemt Cardmarket, EUR, `trend`, brondatum, het feit dat conditie/taal niet verwerkt zijn en een link naar het juiste product of een controleerbare bron.
4. Volledige eigen-collectie-dekking voordat een portefeuillewaarde wordt berekend; geen fake nulwaardes voor onbekende kaarten.
5. Geen enkele oude v183-waarde wordt voorgesteld als officiële nieuwe geschiedenis; wijzigingen in bezit, aantallen of varianten beginnen een nieuw cohort.
6. Geverifieerde real-world browser-, PWA- en offline regressies, inclusief 320/375/390/430px, grafiek-interacties, collectie- en aankoopdatabehoud.
7. Bronstoring, mismatch of vertraging schakelt de prijsweergave **uit** en verandert geen collectie of historische data.

## 5. Tests en grenzen

Standalone tests in `tests/cardmarket-{public,quote,feed,history}-v186.test.cjs`; aan de bestaande CI-workflow toegevoegd voor een toekomstige push. Het lokale testresultaat hoort bij het specifieke geteste commit-/werkboomstadium en is **geen GitHub CI-resultaat** zolang niets is gepusht.

Tests gebruiken geïsoleerde fixtures; cijfers daarin zijn uitsluitend testinputs, **geen productie- of marktprijzen**. De echte downloadproef met 66.786 records en enkele geverifieerde ID's bewijst de import, maar niet de complete mobiele gebruikersstroom, alle prijzen of grafiekpresentatie.
