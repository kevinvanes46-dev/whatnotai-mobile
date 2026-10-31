# Cardmarket vintage variants and promos (V208)

Base Set remains the single `base1` set. The only confirmed print variants added are for English Pidgeotto #22:

| Print | Cardmarket product page | First Edition filter |
|---|---|---|
| Unlimited | `Base-Set/Pidgeotto-V1-BS22` | `isFirstEd=N` |
| Shadowless | `Base-Set/Pidgeotto-V2-BS22` | `isFirstEd=N` |
| Shadowless First Edition | `Base-Set/Pidgeotto-V2-BS22` | `isFirstEd=Y` (stored as the existing `1ST` edition) |

The route uses the supplied product slugs and the existing Cardmarket condition/language filters. It does not infer or add product IDs. Other Pidgeotto editions and conflicting identities use a safe search.

The confirmed Wizards Black Star Promos route is Jigglypuff #7 (`basep-7`) to `Wizards-Black-Star-Promos/Jigglypuff-WP7`. Other promo cards remain search-only until their product pages are independently confirmed. The previous Jigglypuff route was search-only because the promo set had no exact route mapping.

The First Edition option sends `isFirstEd=Y` on the supplied Shadowless product page. Cardmarket returned HTTP 403 when the product pages were checked in this environment, so current live offer availability for that filter combination could not be independently confirmed. No Shadowless or First Edition market price is displayed as a general Cardmarket trend.
