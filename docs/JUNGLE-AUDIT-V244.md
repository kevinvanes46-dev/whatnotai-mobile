# Nederlandse Jungle audit v244 — geblokkeerd

Datum: 2026-11-07. Geen productiecode gewijzigd, geen releaseclaim.

## Hervatting 2026-11-07 (live Cardmarket-controle via VS Code-browser)

Status: deels geverifieerd. Cardmarket gaf na ~19 snelle verzoeken HTTP 429 en een Cloudflare-controle; daarna is niets meer opgevraagd.

UITGEVOERD + GETEST (live, HTTP 200, eindpagina zonder gewijzigde filters, kop `<naam> (JU <nr>)`, alleen Nederlandse aanbiedingen NM of beter):
- #1–#16 (`-V1-JUn`), #17–#19 (`-V2-JUn`) en Exeggcute #52 (`Exeggcute-JU52`).
- Exeggcute #52: 29 aanbiedingen, 28 NM en 1 MT, allemaal Nederlands.

Eerder door de verzamelaar aangeleverd en behouden: #26, #49, #51, #56, #60 (#7, #12, #13 komen ook live overeen).

NIET live geverifieerd: de overige kaarten (#20–#25, #27–#48, #50, #53–#55, #57–#59, #61–#64). Zij blijven zoeklinks met het label "niet live geverifieerd".
Holo/non-holo is alleen afgeleid uit de V1/V2-slug; de rarity is niet uitgelezen. Het effect van `isFirstEd` op Jungle-pagina's is niet bewezen.

Code: `nl-jungle-v242.js` faalt gesloten bij verkeerde set, source-id, naam of nummer. PWA-cache: `rareworth-shell-v244-nl-jungle-routes`, script `?build=244-nl-jungle-routes`.

## Eerdere status (vóór hervatting)


- AGENTS.md volledig gelezen, zowel in oorspronkelijke map als geïsoleerde worktree.
- Bestaande lokale wijzigingen blijven behouden; geen stash, reset of opschoning.
- Branch: `feat/v244-nl-jungle-audit`.
- Basis: actuele opgehaalde `origin/main`, `b83c441`.
- PR #16 is gemerged: https://github.com/kevinvanes46-dev/whatnotai-mobile/pull/16
- PR #16 introduceerde `nl-jungle-v242.js`, aparte NL/EN-links, checklistopslag en PWA-integratie. Acht expliciete routes zijn in de code als door de verzamelaar aangeleverd beschreven; overige kaarten gebruiken de bestaande router of zoekresultaten.

## UITGEVOERD + GETEST

Bronbestand: `C:/Users/kevin/Downloads/products_singles_6.json`.
Bron createdAt: `2026-11-05T13:23:49+0100`.
SHA-256: `321191f84c4acbe776a924f57d6d29dbb7457db1e31c224f38a01882e2660327`.

JSON met Node geparseerd en op idExpansion 1525 gefilterd:

- 66 records, 66 unieke product-ID's.
- Alle 64 product-ID's in bereik 273798–273861 aanwezig.
- Aanvullende records 275571 (Meowth) en 275572 (Clefable) aanwezig; niet gekoppeld of gewijzigd.
- Velden: idProduct, name, idCategory, categoryName, idExpansion, idMetacard, dateAdded.
- Geen expliciete kaartnummers, holo/non-holo, slugs, taal, editie of conditie in dit bestand.
- Clefable 273798 en 273814 hebben dezelfde naam en idMetacard 211659. Venomoth 273810 en 273826 hebben dezelfde naam en idMetacard 211671. Het bestand alleen bewijst het onderscheid tussen hun varianten niet.

Reproductie tegen ongewijzigde main-module via Node:

1. `routeFor({source_id:'base1-60',source_set_id:'base1',number:'60',name:'Pikachu'})` geeft een Jungle-zoeklink terug. Verkeerde setidentiteit wordt dus niet volledig geweigerd.
2. `routeFor({source_id:'base2-52',source_set_id:'base2',number:'52',name:'Wrong Name'})` geeft een zoeklink terug. Naam/nummer-validatie is niet volledig.
3. Venomoth base2-13 geeft de opgeslagen Venomoth-V1-JU13-link met language=12 en minCondition=2. Dit bewijst alleen URL-constructie, geen pagina-identiteit of aanbodfiltering.

## NIET MOGELIJK / GEBLOKKEERD

- Webtool kon de opgegeven idProduct-route voor 273798 met NL/NM/Unlimited niet openen.
- Browserprovider meldt `The browser access host is unavailable`.
- Chrome is zichtbaar in de app-inventaris, maar toegang tot het venster eindigde met `Computer Use app approval timed out`.
- Daarom geen geverifieerde uiteindelijke redirects, pagina-identiteiten, taal-/conditie-/editiefilters of aanbiedingen.
- Geen bewijs dat cookies filters overschrijven; ook geen bewijs dat filters behouden blijven.
- Geen volledige afbeeldingcontrole, mobiele/iPhone/Safari-test, bezitpersistentietest of PWA/regressies uitgevoerd.
- Geen productiecode gewijzigd; cache niet gewijzigd; geen commit, push of nieuwe PR gemaakt. Geen merge.

## Benodigd voor hervatting

Werkende browsertoegang tot Cardmarket om productvarianten en filters na redirects te inspecteren. Vervolgens alle 64 identiteiten onderbouwen, routes en fail-closed-validatie implementeren, regressies toevoegen en uitvoeren, PWA bijwerken en pas na groene controles een PR openen.
