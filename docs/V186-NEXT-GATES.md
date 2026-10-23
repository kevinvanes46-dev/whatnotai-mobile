# v186 vervolg — grote stappen zonder v185 of productie te raken

**Veilig uitgangspunt:** `codex/v185-card-library` = PR #5, nog niet mergen;
`codex/v186-cardmarket-official` = bronprototype, geen automatische prijs-UI.

## Zelfstandig te doen (kleine, afzonderlijk testbare stappen)

1. Cardmarket officiële download en checksumcontrole met echte brondata testen.
2. Bronrapport per goedgekeurde uitbreiding draaien; **bronproducten zijn niet hetzelfde als geverifieerde kaartmatches**.
3. De prijsintegratie voorbereiden in een geïsoleerde, standaard uitgeschakelde preview. Bestaande v185-opslag en cloud blijven onaangeroerd.
4. Product-ID, set-ID, volledige kaartnaam, nummer, editie en variant voor echte EN/JP-testkaarten individueel auditen.
5. Controleren dat de UI source/metric/datum, ontbrekende prijzen en uitgeschakelde variantprijzen eerlijk benoemt.

## Complexe review voor Codex en release-gates

1. Bevestig of publiek hergebruik van afgeleide Cardmarket-prijsbestanden in een eigen webapp toegestaan is. Openbare download betekent niet vanzelf publicatierecht.
2. Kies en implementeer pas daarna een gecontroleerde same-origin feedpublicatie: atomische dagelijkse bronbestanden, checksums, geldige datums, rollback; géén onbetrouwbare browser-CORS of uitgeschakelde API.
3. Laat de prijsrouter alleen een positieve, volledig geverifieerde match tonen. `trend` blijft *algemene Cardmarket-trend*, niet NM/EX/JP of laagste aanbieding.
4. Verifieer JP naam-/nummeralias, Reverse Holo, STAMPED en 1st Edition **apart**. Bij twijfel `UNAVAILABLE`.
5. Bouw de grafiek op afzonderlijk vastgelegde echte dagen met **dezelfde holdings/fingerprint en 100% prijsdekking**. Geen synthese, terugvulling, interpolation of oude v183-TCGdex-geschiedenis.
6. Test opslagbehoud, privacy, race/cancel, PWA/offline, desktop/mobiel 320/375/390/430px, toetsenbord/touch en visuele grafiekinteracties. Houd de bestaande regressies intact.
7. Na gerichte tests: volledige suite, echte browserproef, GitHub CI en expliciete review voordat een PR merge of deployment wordt overwogen.

## Blijvende grenzen

- Geen publicatie-/releasewijziging vanuit de bron-auditworkflow; read-only.
- Geen fake data, geen PriceCharting, geen TCGdex numerieke prijs, geen anonieme prijsfallback.
- Geen wijziging aan `rareworth-v158-jp-artwork.patch` of untracked bestanden.
- Geen automatische PR #5 merge of directe `main`-push.
