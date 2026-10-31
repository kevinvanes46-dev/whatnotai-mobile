# Engelse Cardmarket-audit — 28 oktober 2026

## Status

**UITGEVOERD + GETEST:** lokale catalogusaudit, strengere centrale routecontrole,
bevroren publieke JP-taalkeuze, behoud van interne JP-verwerking en collectie,
actuele officiële productindex en lokale regressiecontroles.

**GEBLOKKEERD:** onafhankelijke bevestiging van alle kaartnummers, sets en
uitvoeringen op officiële Cardmarket-productpagina's. Cardmarket gaf HTTP 403 /
Cloudflare voor de setpagina en de gecontroleerde productpagina. De openbare
download bevat product-ID, naam en expansion-ID, maar geen kaartnummer,
expansion-naam, editie of finish. Een provider-cross-reference is geen
onafhankelijk bewijs. Er zijn **nul nieuwe live geverifieerde links**.

Dit is daarom **geen afgeronde reparatie van alle exacte productlinks** en geen
releasecertificering. Geen nieuwe branch, commit, push, PR, merge of deployment.
PR #14 blijft ongewijzigd en ongemerged.

## Werkbasis en bestaand werk

- Main: `edcbf76963f4def4a56608f75712ad4c89448325`.
- Bestaande draft PR #14: `a0d655dfed388abc8f34167b923b84d93b11056a`;
  de lokale wijzigingen zijn gebaseerd op deze commit, met detached HEAD.
- GitHub-run `40701273001` slaagde voor die bestaande PR-commit. Dit bewijst
  niets over de nieuwe, ongepushte wijzigingen.
- De oorspronkelijke werkmap was leeg. Er is een afzonderlijke clone gemaakt
  in `C:\Users\kevin\Documents\ChatGPT\holokeep main`.
- De later beschikbaar gekomen checkout `C:\Users\kevin\whatnotai-mobile`
  is uitsluitend gelezen. Bestaande wijzigingen en untracked bestanden zijn
  behouden. `rareworth-v158-jp-artwork.patch` blijft daar untracked en ongewijzigd;
  SHA-256: `82568145c226faea78ade6b9221e96aa0dc0e1e60ebdece0858daf5069c9c9fd`.
- Geen V198-patch of branch aangetroffen in beide checkouts, remote branches of
  de gecontroleerde Downloads-bestandsnamen. Het gesprek bevatte geen
  reproduceerbaar bewijsbestand voor 18.505 / 2.785.

## Aantallen: verschillende soorten bewijs niet optellen

Alle 21.290 actuele API-kaartidentiteiten binnen de bestaande 205 Engelse sets
zijn geïmporteerd. Geen ontbrekende records of parsefouten in de definitieve audit.
Eén extra bronrepo-record, `det1-25`, ontbreekt in die API-selectie en is uitgesloten.

| Kandidaatvergelijking met officiële download | Kaarten |
|---|---:|
| Eén consistent kandidaatproduct | 15.833 |
| Meerdere consistente kandidaatproducten — ambigu | 569 |
| Geen consistent kandidaatproduct | 4.888 |
| Totaal | 21.290 |

De vergelijking controleert productbestaan, productcategorie, naam, de door de
provider opgegeven expansion-ID en — waar aanwezig — abilities plus aanvallen
in de officiële productnaam. Alleen naam en provider-set zouden 17.410 records
opleveren. Geen van beide methoden reproduceert 18.505. Beide missen onafhankelijk
bewijs van kaartnummer en print. **Alle 21.290 blijven voor volledige officiële
identiteit in deze audit onbevestigd**, ook wanneer een kandidaat consistent is.

| Huidige uitgaande app-route, zonder expliciete printkeuze | Kaarten |
|---|---:|
| Bestaande curated / eerder bevestigde directe route (`exact` in code) | 215 |
| Gelabelde Cardmarket-zoekfallback | 21.075 |
| Zonder URL | 0 |

De 215 directe routes zijn geen 215 nieuwe live bevestigingen. Ze komen uit de
bestaande applicatieregels. De kandidaattabel en routetabel zijn aparte dimensies.

## Lokale wijzigingen

- Zoekselectie, bibliotheekdetail en collectie blijven de centrale `safeRoute`
  gebruiken. Tegenstrijdige `source_id`/`sourceId`, set-ID's en setnamen mogen
  niet meer door aliasnormalisatie verdwijnen.
- Onbewezen subtype, stempel, afwijkend formaat of foil mag geen bestaande
  directe route hergebruiken. Onzekerheid leidt tot een herkenbare zoekroute.
- De meerderheidsheuristiek voor oude set-ID's is verwijderd. Oude product-ID's
  kunnen alleen binnen de bestaande expliciete setallowlist kandidaat blijven.
- De curated lookup is op kaartnummer geïndexeerd; identiteitsvoorwaarden blijven
  gelijk. Geen nieuwe product-ID's of product-URL's verzonnen.
- De officiële productindex is vernieuwd van de oude snapshot naar 75.066
  officiële producten. Dit voegt geen automatisch bewezen kaartkoppelingen toe.
- Publieke JP-keuzeknoppen zijn verborgen/uitgeschakeld; de app start Engels.
  JP is verborgen in de openbare settaalkeuze. Interne JP-verwerking, opgeslagen
  voorkeuren en bestaande collecties blijven beschikbaar. De collectie kan JP
  records blijven tonen en filteren. Er is geen datamigratie of verwijdering.
- PWA-cachenaam vernieuwd naar `rareworth-shell-v199-english-cardmarket`.
- Geen wijzigingen aan prijs-/kostprijs-/portfolioberekeningen, cloudcontracten,
  Japanse datasets of historische grafieksemantiek. Geen PriceCharting gebruikt.

## Validatie

De volledige lokale CI-workflow is uitgevoerd. De eerste complete run had 1.300
tests en vier falende stappen. Daarna zijn de concrete oorzaken gecorrigeerd:
oude exacte cacheverwachtingen en een behouden JP-testpad na herladen naar Engels.
De 45 branding-/integratietests en alle 72 core-tests slaagden bij hercontrole.
Een aanvullende negatieve setheuristiektest brengt de workflow op 1.301 tests.

De catalogustest controleert alle 21.290 kaarten, 63.870 expliciete
editie-/variantcombinaties en conflicterende identiteitsvelden. Alle routes blijven
op Cardmarket; zoekroutes houden naam, taal, conditie en printfilters vast.
De laatste gerichte unitrun bevat 32 geslaagde tests, nul failures/skips.
Browser- en PWA-eindcontroles staan in het machineleesbare validatierapport.

Er zijn geen testcases verwijderd. Historische JP-browsertests gebruiken nu
expliciet de behouden interne JP-selectie; nieuwe publieke UI-asserties controleren
dat de JP-bediening verborgen/uitgeschakeld blijft en een opgeslagen JP-voorkeur
niet wordt verwijderd. De oorspronkelijke JP-identiteit-, artwork-, collectie-
en herlaadasserties zijn behouden. Cachefixtures zijn exact naar de nieuwe naam
bijgewerkt, zonder wildcard of ruimere acceptatie.

Browsercontroles gebruiken lokale providerfixtures; screenshots hebben
placeholderafbeeldingen. Dit is geen live Cardmarket- of fysieke iPhone-test.
De nieuwe wijzigingen hebben nog geen GitHub-CI-run, omdat ze niet zijn gepusht.

## Reproduceren en bewijsbestanden

- `scripts/audit-english-cardmarket-v199.cjs`: read-only bronvergelijking;
  publiceert de CI-fixture alleen bij volledige import.
- `data/en-cardmarket-audit-v199.json`: compacte audit per kaart voor offline CI.
- `artifacts/en-cardmarket-audit/audit.json`: volledige lokale kandidaatbewijzen.
- `artifacts/en-cardmarket-audit/summary.json` en `route-summary.json`: tellingen.
- `artifacts/en-cardmarket-audit/ci/`: volledige oorspronkelijke workflowlogs.
- `artifacts/en-cardmarket-audit/core-recheck.txt`, `recheck.txt`,
  `final-catalog-tests.txt`, `final-browser-tests.txt`: gerichte hercontroles.

De grote bronbestanden en uitgecheckte bronrepo zijn lokaal bewaard en uitgesloten
van Git. Voor reproductie: plaats de officiële productdownload als
`artifacts/en-cardmarket-audit/official-products.json`, de API-kaartlijst als
`api-cards.json` en de gepinde bronrepo als `tcgdex-source`; draai vervolgens
`node scripts/audit-english-cardmarket-v199.cjs` en
`node --test tests/english-catalog-v199.test.cjs`.

Bronnen:

- Officiële download: https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_6.json
- Downloadtijdstempel: `2026-10-28T13:49:46+0100`.
- SHA-256 download: `ab890778fb6f78363e5c612a952cb535f51f993b5a11f2c7a8c0659a05fa88c5`.
- Engelse API-lijst: https://api.tcgdex.net/v2/en/cards
- SHA-256 API-lijst: `82fdf91ddb77bf56539b0fd3a69239bfc244f4877aba19b4de8e25edb209a2d2`.
- Bronrepo: https://github.com/tcgdex/cards-database
- Broncommit: `cbddf7e54033b1b58e44af1049c88832e55b94d0`.

## Wat nog nodig is

Een onafhankelijk controleerbare officiële koppeling van expansionnaam,
kaartnummer, product-ID en print is nodig om kandidaatlinks veilig te promoveren.
De dagelijkse bestaande prijsworkflow vernieuwt de losse productindex nog niet
automatisch; een gecontroleerde verversing met bewijs- en dekkingscontrole blijft
releasewerk. Geen wijziging aan automatische publicatie gedaan.

Zonder die bewijzen blijft de zoekfallback eerlijker dan duizenden mogelijk
verkeerde directe links. Daarom wordt deze lokale tussenstand niet als de
gevraagde volledige reparatie gepubliceerd.
