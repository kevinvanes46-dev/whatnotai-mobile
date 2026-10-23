# v187 — lokale Cardmarket-prijs-preview

**Status: ontwikkelproef, niet publiek.** Deze pagina wordt niet geladen door `index.html` en is niet opgenomen in de serviceworker. Geen wijzigingen aan `main`, PR #5, cloud, collectie, aankoopprijzen of de bestaande prijs-/historie-engine.

## Wat je kunt zien

- De precieze EN-kaart via een TCGdex-ID, bijvoorbeeld `base1-4`.
- Alleen wanneer de officiële Cardmarket-product-ID, set-ID, naam, nummer, variant en een actuele SHA-256-gecontroleerde prijsfeed overeenkomen: de algemene Europese `trend` in EUR.
- De officiële brondatum en de rechtstreekse productpagina.
- Met een eigen, expliciete Unlimited/NORMAL-bevestiging en een handmatige knop: één lokaal meetpunt voor die kaart en hoeveelheid.
- Na minstens twee verschillende **daadwerkelijk opgehaalde officiële publicatiedagen**: een grafiek voor 1W/1M/3M/1J/Alles, met pijltoetsen/Home/End en aanklikbare/touchbare punten.

De getoonde `trend` is **geen** conditionele NM/EX/GD/PL-, specifieke taal-, reverse-/STAMPED-, graded- of 1st Edition-prijs. Bij twijfel blijft de prijs uit. JP wordt niet geprijsd. Twee dagen uit één download maken **geen** geschiedenis. Demo-testfixtures bestaan uitsluitend in `tests/`, niet in de publieke preview.

## Zelf op Windows bekijken (alleen op je eigen pc)

Open PowerShell in de projectmap op de v187-branch. De officiële bronbestanden worden rechtstreeks gedownload, niet uit een nepbestand gemaakt:

```powershell
node scripts/build-cardmarket-public-v186.cjs --out cardmarket-public-v186
```

De builder controleert de inhoud, datums en unieke product-ID's en maakt een nieuwe uitvoermap met `manifest.json` en 256 SHA-256-gecontroleerde prijsbestanden. De map is genegeerd door Git. **Als de map al bestaat, weigert de builder die te overschrijven.** Stop dan en vraag een gecontroleerde oplossing, niet verwijderen of hernoemen in de veronderstelling dat de data waardeloos zijn.

Start daarna een server die uitsluitend deze previewbestanden op jouw eigen computer aanbiedt:

```powershell
node scripts/serve-cardmarket-preview-v187.cjs
```

Open `http://127.0.0.1:8765/cardmarket-preview-v187.html` in Chrome of Edge. Laat de terminal open. Dit is **geen publieke URL** en er wordt niets gedeployed. De browser vraagt alleen kaartidentiteit bij TCGdex en de checksum-gecontroleerde prijssnapshot op dezelfde lokale oorsprong. Hij vraagt de Cardmarket-webpagina of API niet vanuit de browser.

Maak in het scherm een keuze voor een Engelse kaart en bevestig alleen een editie waarvan je zeker bent. Controleer de Cardmarket-link en bronetiketten. Sla de meting alleen op wanneer de prijs en identiteit kloppen. Op dezelfde publicatiedag blijft de tweede poging een duplicaat; na een volgende daadwerkelijke dagdownload kan een tweede punt ontstaan.

## Omgevingscontroles en releasegrens

```powershell
node --test tests/cardmarket-preview-unit-v187.test.cjs tests/cardmarket-preview-v187.test.cjs
```

De browserproeven vereisen een lokaal geïnstalleerde Playwright Chromium, zoals de bestaande CI. Ze controleren 320px, prijs- en opslagafscherming, echte-dag-grafiek, keyboard en touch. De volledige regressiesuite moet bovendien via GitHub CI slagen.

Deze ontwikkelproef publiceert de commerciële prijsgids niet. Een eventueel online preview vraagt eerst een apart oordeel over herpublicatie en een veilige dagelijkse, atomische same-origin-feed met rollback. Daarna pas aanvullende ID-audits, PWA/offline-tests, echte mobiele browsertest en expliciete releasegoedkeuring. **Geen automatische merge of deployment.**
