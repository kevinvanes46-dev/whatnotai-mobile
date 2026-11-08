# Setdekking v246

## Bronmeting

De machineleesbare resultaten per set staan in [SET-COVERAGE-V246.json](SET-COVERAGE-V246.json).
De meting is uitgevoerd op 8 november 2026 om 09:23 UTC met
`node scripts/audit-set-coverage-v246.cjs <output.json>`. De setlijsten en
setdetails komen van TCGdex; aantallen kunnen later veranderen. "Compleet"
betekent hier uitsluitend dat de bron een positieve totaaltelling geeft en
evenveel afzonderlijke, geldige kaartidentiteiten teruggeeft.

| Taal | Complete fysieke sets | Onvolledig | Conflicterende set-ID's | Uitgesloten digitale sets |
|---|---:|---:|---:|---:|
| EN | 200 | 6 | 0 | 15 |
| JP | 118 | 82 | 2 | 0 |

De 15 uitgesloten sets zijn TCG Pocket-sets; die vallen buiten de bestaande
fysieke-kaartcatalogus. De gemeten setdetails bevatten 21.432 unieke EN- en
13.098 unieke JP-kaartidentiteiten. Er zijn geen dubbele of ongeldige
kaart-ID's aangetroffen in de niet-conflicterende setresponsen. Dit is geen
controle van fysieke kaartuitvoeringen of van alle mogelijke productlinks.

De oorspronkelijke momentopname van 22 oktober 2026 telde 201 EN-sets met
21.290 kaarten en 118 JP-sets met 13.006 kaarten. Vier EN- en 68 JP-sets
hadden destijds geen kaartrecords. De actuele EN-set `me06` en nieuwe
eenduidige JP-setmetadata zijn toegevoegd; metadata die later is gemeten
heeft een eigen meettijd. De oude JP-naam van `SV4a` bleek tegenstrijdig met
de actuele bronlijst en -setdetails en is gecorrigeerd.

EN `tk-sm-l` heeft 18 van 30 en `mfb` 34 van 48 bronrecords. `wp`,
`jumbo`, `sp` en `rc` hebben geen kaartrecords. Bij JP zijn 80 van de
82 onvolledige sets leeg; `web1` heeft 47 van 48 en `WCS23` 1 van 30.
De actuele JP-setlijst gebruikt `BW3a` en `BW8a` elk voor twee verschillende
setnamen. Deze conflicten zijn niet als betrouwbare setidentiteit opgenomen.
Setrecords zonder volledige kaartdekking kunnen worden geopend, maar tonen
geen volledig setpercentage.

### Onvolledige sets per bron-ID

- EN: `wp` 0/7, `jumbo` 0/160, `sp` 0/10, `rc` 0/25,
  `tk-sm-l` 18/30 en `mfb` 34/48.
- JP: `web1` 47/48 en `WCS23` 1/30. De volgende 80 sets bevatten
  0 bronrecords: `ADV1`, `ADV2`, `ADV3`, `ADV4`, `ADV5`, `PCG10`,
  `L1b`, `L1a`, `L2`, `LL`, `L3`, `XY1b`, `XY1a`, `XY2`, `XY3`,
  `XY4`, `XY5a`, `XY5b`, `XY6`, `XY7`, `XY8a`, `XY8b`, `XY9`,
  `CP3`, `XY10`, `CP4`, `XY11b`, `XY11a`, `CP5`, `CP6`, `SM0`,
  `SM1+`, `sm2+`, `SM3+`, `SM4+`, `SM5+`, `SMP2`, `S1W`, `S1H`,
  `S1a`, `S2`, `S3`, `S3a`, `CS3.5`, `CS2.5`, `CS2b`, `CS4a`,
  `CS1.5`, `CSA`, `CS3D`, `CS3a`, `CS1b`, `CS2a`, `CS3b`, `CS4Da`,
  `CS1a`, `CS4b`, `CS4`, `S7R`, `S10D`, `S8a`, `S5a`, `S6a`,
  `S4`, `S2a`, `S4a`, `S10b`, `BW1b`, `BW1a`, `BW2`, `BW4`, `DS`,
  `BW5a`, `BW5b`, `BW6b`, `BW6a`, `BW7`, `SC`, `BW9`, `EBB`.
  De conflicterende `BW3a` en `BW8a` zijn afzonderlijk uitgesloten.
- NL-bron: `base1` 0/102, `base2` 0/64 en `base3` 0/62.
  Dit beschrijft de Nederlandse bron, niet de behouden v245-Junglecatalogus
  met 64 gecontroleerde referentie-identiteiten.

## Nederlands

TCGdex `/v2/nl/sets` noemt Basis Set, Jungle en Fossiel, maar de
bijbehorende Nederlandse setdetails bevatten respectievelijk 0 van 102,
0 van 64 en 0 van 62 kaartrecords. De setnamen bewijzen geen onderlinge
kaartidentiteiten. Daarom zijn Basis Set en Fossiel niet toegevoegd.
NL Jungle blijft op de eerder gecontroleerde v245-identiteiten gebaseerd;
de Engelse referentieafbeeldingen blijven duidelijk gelabeld.

## Beperkingen

- Een bron-ID en bronnummer zijn niet automatisch een gedrukt Japans
  kaartnummer. De bestaande JP-bronidentiteit en zoeksemantiek blijven leidend.
- Onvolledige of verouderde setinhoud geeft geen betrouwbaar totaal;
  Home en de binder blijven bereikbaar met een expliciete melding. Ontbreken
  cataloguskaarten, dan toont de binder ook de eenduidig geïdentificeerde
  opgeslagen eigen kaarten, zonder volledige setdekking te suggereren.
- Collectieregels zonder expliciete of met tegenstrijdige bronidentiteit
  blijven ongewijzigd bewaard, maar tellen niet mee in setvoortgang.
- Ontbrekende afbeeldingen gebruiken een zichtbare fallback.
- De bestaande alleen-lezen deellink ondersteunt EN en JP, maar nog geen NL.
- Bestaande Cardmarket-routing blijft behouden. Deze audit bevestigt geen
  nieuwe exacte productlinks, uitvoeringen of prijzen.
- `npm audit` meldt een hoge kwetsbaarheid in de bestaande vastgepinde
  `sharp`-toolingdependency; die dependency is in deze wijziging niet bijgewerkt.
- Een opgeslagen audit is een momentopname en vervangt geen toekomstige
  hercontrole van de externe bron.

## Lokaal geteste regressies

- 423 catalogus- en per-setcontroles: geslaagd.
- 82 bibliotheek-, NL-, binder-, mobiele Chromium- en PWA-regressies: geslaagd.
- 72 JP-kernregressies: geslaagd.
- 794 Cardmarket-, marktwaarde- en cloudregressies: geslaagd.
- Syntaxcontrole en JP-manifestcontrole: geslaagd.

Na de laatste wijziging aan collectie-identiteiten zijn opnieuw 424
catalogus- en per-setcontroles, 54 NL-, binder-, mobiele Chromium- en
PWA-regressies en 169 collectie-, marktwaarde- en cloudregressies geslaagd.

Na de offline-cold-startreparatie zijn 71 Home-, binder- en mobiele
browserregressies, 450 NL-, PWA-, library- en setcontroles en 199 collectie-,
markt-, cloud- en Cardmarket-controles geslaagd. JavaScript-syntaxcontrole
voor 227 bestanden, 41 merk- en regeleindcontroles en 72 JP-kernregressies
zijn geslaagd.

De eerste brede browserrun had zes fouten doordat sets met onbekende
voortgang niet meer vanaf Home bereikbaar waren. Na herstel bleven de
volledigheidscontroles intact en slaagde de herhaalde brede browserrun.
