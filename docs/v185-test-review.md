# v185: dekkingsmatrix prijsbeleid en behouden componenten

Eerst zijn afzonderlijke componenttests toegevoegd en uitgevoerd: 10/10 geslaagd (v185-component-tests.log). Pas daarna zijn de negen productiescenario's aangepast. Productie toont geen TCGdex-prijzen; collectie, aankoopkosten, caches en historie worden niet verwijderd.

## Testisolatie

`tests/helpers/market-fixture-v185.cjs` publiceert uitsluitend op de lokale testserver de bestaande CommonJS-marktengine, met onderschepte providerantwoorden. Geen productieschakelaar of echte prijsbron wordt geactiveerd. Dit bewijst componentgedrag, niet betrouwbaarheid van live prijzen.

## Dekkingsmatrix

De eerste vier productiecontroles staan in `tests/market-value-browser-v176.test.cjs`; de laatste vijf in `tests/history-browser-v183.test.cjs`, in onderstaande volgorde.

| Oude controle | Nieuwe productiecontrole | Behouden componenttest |
|---|---|---|
| Refresh toont trend/avg7/avg30; collectie/cloudhandtekening intact | Geen prijsfetch; exacte bytes/handtekening en eerlijke mobiele labels | market-component-v185: real refresh preserves exact collection |
| Legacy, STAMPED/1ST, aantallen/kosten, deduplicatie | Ook TCGdex-cache verborgen; varianten/aantallen/kosten intact | market-component-v185: legacy excluded; plus fixture component deduplicates concurrent (twee refreshes, één aanvraag) |
| Offline cache, bronmetadata, collectie, lokale assets | Cache behouden maar onzichtbaar; offline reload behoudt gegevens | market-component-v185: real service worker offline reload |
| Verkeerde responsidentiteit en wijziging tijdens aanvraag | Geen prijsaanvraag; identiteitsbewerking behouden | market-component-v185: mismatched response and in-flight identity change |
| Metingen tekenen lijn/vulling, reload | Geen grafiek; historie/collectie exact behouden | history-component-v185: real local observations drive |
| Beschadigde historie, dubbele initialisatie | Beschadigde bytes intact; één paneel | history-component-v185: corrupt history stays untouched |
| Stijging/daling/vlak, endpoints, periodes | Alle vijf periodes bedienbaar zonder prijsverschil | history-component-v185: polished summary follows real range endpoints |
| Hover/toetsenbord, observedAt versus generatedAt | Periodeknoppen per toetsenbord; geen verborgen prijsdetails | history-component-v185: hover and keyboard detail use observedAt |
| Touchdetails, grote EUR-bedragen | Touchknoppen; geen overflow op 320/375/390/430 px; prijzen verborgen | history-component-v185: touch details and long EUR labels |

Componentbestanden staan in `tests/` met extensie `.test.cjs`. De oorspronkelijke componentfunctionaliteit bestaat nog. Alleen de positieve productieprijsverwachting vervalt vanwege het afgesproken bronbeleid.

## Extra bescherming

- `portfolio-component-v185.test.cjs` behoudt de zes oorspronkelijke browserscenario's, inclusief de waardegerelateerde editorlink. Productie controleert dat die link ontbreekt zonder prijzen en de gewone kaarteditor bereikbaar blijft.
- `price-freshness-component-v185.test.cjs` behoudt alle 14 oorspronkelijke refreshscenario's, inclusief gelijktijdige edits, verwijderen en variantwissel. De productiesuite controleert het uitgeschakelde pad. Gerichte hercontrole: 14 scenario's geslaagd, door Node als één bestandstest geteld (v185-freshness-recheck.log).
- Pure prijs-, bron-, identiteit-, kostprijs-, historie- en opslagcontracttests blijven afzonderlijk bestaan.

## Aanvullende periodecontrole

De oude jaarperiode/uitlegcontrole uit parity-browser-v182 staat ook in history-component-v185, als fixture component retains yearly empty-history explanation. Productie controleert de prijsuitschakelmelding; beide behouden vijf bedienbare periodes zonder verzonnen grafiek.

## Verificatie

Zie V185-RELEASE.md en v185-validation.json voor de uiteindelijke testresultaten. De exacte scopecontroles keren uitsluitend vastgelegde v185-blokken terug; alle overige historische broncode blijft exact beschermd. Geen merge of deployment is onderdeel van deze releasevoorbereiding.
