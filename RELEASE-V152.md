# Rareworth v152 herstelcontrole

## Opgelost
- Gedeelde Cardmarket-routing: een gecontroleerde tabel met 3.285 productidentiteiten voorkomt afhankelijkheid van de falende primaire linkdienst. Zonder tabelmatch probeert de app twee onafhankelijke bronnen, met identiteitcontrole, time-outs en bescherming tegen verouderde antwoorden.
- Dragonair Base Set 2 #22 verwijst naar product 273945; Azumarill EX Delta Species #114 naar product 276877. Dit zijn bronbevestigde productidentiteiten; bestemmingspagina's zijn niet rechtstreeks geverifieerd wegens HTTP 403.
- Alle 4.428 beschikbare catalogusregels en hun metadata gecontroleerd: 3.648 EN en 780 JP. Daarnaast 249 lokale URLs syntactisch gecontroleerd. De herstelde setlijst heeft geen mislukte set-endpoints in deze audit. Trainer Kit-subsets en Legendary Collection gebruiken correcte bron-ID's.
- Taal, staat, editie en Normaal/Stamped staan zichtbaar. Stamped is vrij te kiezen en op te slaan; geen blokkade op ontbrekende variantmetadata. Een stamped-prijs wordt alleen aangeboden als de bron die variant bevestigt.
- EX wordt doorgegeven als Cardmarket minCondition=3. CM-trend is expliciet algemeen; de bron levert geen afzonderlijke staatprijs. First edition krijgt geen gewone trend als editieprijs.
- JP heeft een aparte catalogus, Japanse namen en een strikte taalfilter. Een taalwissel vereist een nieuwe kaartselectie, zodat geen oude Engelse afbeelding/link actief blijft. De huidige catalogus heeft geen Japanse previewbeelden; Engelse beelden worden niet als JP getoond. Japanse online routes blijven zoekroutes zolang geen bevestigde productkoppeling beschikbaar is.
- Previews proberen een lagere resolutie na een laadfout en bieden opnieuw laden bij ontbrekende detailafbeeldingen.
- Mobiele uitlijning, compactere actieknoppen en beter leesbare tekst rechts van de preview. Nieuw vectorlogo, bijbehorende installatie-iconen en subtiele kaartschaduwen.
- Collectielinks gebruiken de gecontroleerde product-ID met de actuele staat/editie wanneer beschikbaar, zonder bestaande opslag te herschrijven.

## Gegevensdekking op 6 september 2026
Van de 4.428 records hadden 3.285 een algemene CM-prijs en 1.143 niet. Bij 876 records ontbrak een bronafbeelding. Ontbrekende prijzen/beelden worden niet verzonnen. Gegevensdekking kan later wijzigen. Dit is geen controle van iedere afzonderlijke Cardmarket-aanbieding, variantprijs of kaartstaat.

## Validatie
- Bestaande routing-, resolver-, UI-, collectieprijs- en ervaringstests.
- Alle 3.285 gebundelde productroutes gecontroleerd op juiste product-ID en filters zonder netwerk.
- Beide gemelde kaarten getest met echte metadata en een gesimuleerde primaire serverfout.
- Browsercontroles op 320, 375, 390, 768 en 1280 pixels: zichtbare keuzes, EX-filter, vrij stamped opslaan, JP-invalidatie, uitlijning en geen horizontale overflow.
- Preview-resolutiefallback en herlaadknop getest.
- Export, bevestigd wissen, importherstel en behoud bij ongeldige backup getest in een geïsoleerde testcollectie.
- Scanner en code vanaf applyItem blijven gelijk aan v147; er is geen nieuwe fysieke camera/OCR-veldtest uitgevoerd. Echte iPhone Safari, toetsenbord en installatie-iconcache vragen nog apparaatcontrole.

## Bewijs
Zie `artifacts/links-v152/audit.json`, `product-audit.json`, `local-links.json`, `regression/release-v152.txt` en `detail-375.png` / `detail-1280.png`. Cataloguscontrole en URL-validatie betekenen niet dat alle bestemmingspagina's geopend zijn: Cardmarket blokkeert geautomatiseerde toegang met HTTP 403. De logo- en previewtests gebruiken lokale echte bronafbeeldingen; bedragen in de nieuwe regressiebeelden komen uit de opgeslagen bronmomentopname.

Belangrijkste productie-bestanden: app-v137.js, cardmarket-products-v152.js, ui-v137-focus.js, ui-v137-collection.js, ui-v150-experience.js, style-v150-minimal.css, index.html, manifest.json en icon-rareworth assets. Bestaande collectiekeys en backupformaat zijn behouden. Geen wijziging aan Supabase of scannerengine.

Herhaalbare controle: `node tests/audit-live-links-v152.cjs`, `node tests/audit-all-products-v152.cjs`, `node tests/build-product-map-v152.cjs`, gevolgd door `node tests/run-ui-v148-audit.cjs` met Playwright en Chrome ingesteld. De eerste drie stappen gebruiken live brondata; de regressiesuite gebruikt vaste testgegevens.
