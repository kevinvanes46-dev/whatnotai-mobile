CardScout Mobile v61 — audited vintage build

Database:
- 243 kaartrecords
- 227 directe Cardmarket-routes
- 16 veilige setcode-search routes
- 33 ondersteunde sets

Werkwijze:
nummer + naam + set + staat
Voorbeeld: 12 vaporeon jungle nm

Onzekere/variantgevoelige kaarten openen bewust een Cardmarket zoekopdracht met officiële setcode,
in plaats van een gegokte productpagina.

v62 fixes:
- JP/EN button is authoritative and is never overwritten by an English database match.
- JP searches keep language=7, even when the database only contains an English direct page.
- English direct WOTC fallback only runs when EN is selected.

- JP fallback zoekt op naam + language=7, niet op Engelse setcode.
