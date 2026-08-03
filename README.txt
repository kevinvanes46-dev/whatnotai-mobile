CardScout Mobile v55

Standalone mobiele TCG/Cardmarket helper.

Upload naar GitHub Pages:
- index.html
- style.css
- app.js
- manifest.json
- sw.js
- data/cards.json

Nieuw in v55:
- Nieuwe naam: CardScout
- Professionele minimalistische achtergrond
- Strakkere mobiele layout
- Favorieten/recent blijven werken
- Geen server, geen OpenAI, geen OCR, gratis

Voorbeelden:
- jp base 002 ivysaur nm
- jp fossil 094 gengar nm
- jp neo revelation 220 swinub nm
- shining gyarados 65 nm
- en delta charizard 4 nm


v55: definitieve mobiele fix: Set/Taal/Staat zijn chip-balken i.p.v. dropdowns/popups.


v55: Set/taal/staat mobiel gefixt. Set blijft AUTO/detected; taal/staat zijn vaste knoppen. Legendary Collection Charizard holo/reverse/non-holo shortcuts toegevoegd.


v55: Manual fast mode. Als je nummer/naam handmatig invult, reset set naar AUTO zodat oude sets niet foute productpagina's openen. AUTO zoekt veilig op naam als set onbekend is.


v55: Shortcuts blijven zichtbaar onder snel zoeken, ook wanneer je begint te typen.


v55: Eevee gecorrigeerd naar Jungle #51. AUTO direct toegevoegd: EN Jungle Eevee JU51.


v55: Base Set Hitmonchan #7 exact route toegevoegd. 1st/holo woorden worden niet meer onderdeel van de kaartnaam/URL.


v56 SAFE BUILD: alle gegokte directe Cardmarket-routes verwijderd. Alleen geverifieerde database-links openen direct; alle andere kaarten openen een veilige zoekpagina.


v57: EN Base Set holo 1-16, Jungle holo 1-16 en Fossil holo 1-15 toegevoegd. Bij dubbele naam+nummer-combinaties toont de app een setkeuze.


v58: taal wordt automatisch uit de exacte kaartmatch gehaald. Voorbeeld: Jungle Vaporeon #12 schakelt automatisch naar EN. NM/EX/GD/PL wordt altijd op de directe Cardmarket-link gezet.


v59: database van 57 kaarten zit rechtstreeks in app.js. Geen fetch/data-cache meer. Vaporeon Jungle #12, Hitmonchan Base #7, Gengar Fossil #5 en Dragonite Fossil #4 hebben extra gegarandeerde directe routes.


v60: vaste geheugensteun onder snel zoeken: nummer + naam + set + staat.
