# JP vintage source fixtures — v160

The ten set JSON files are unmodified JSON payloads (formatting only) captured
from `https://api.tcgdex.net/v2/ja/sets/{source_set_id}` on 2026-09-12.
They contain 780 records: PMCG1 102, PMCG2 48, PMCG3 48, PMCG4 65,
PMCG5 96, PMCG6 98, neo1 96, neo2 57, neo3 57, neo4 113.

The requested English display labels are attached to these Japanese source
identities; they do not assert equality with English card-set partitions.
Existing BASE/JUNGLE/FOSSIL/ROCKET/NEO keys stay language-qualified for v158/v159
compatibility. PMCG5 and PMCG6 use distinct JP GYM 1 / JP GYM 2 keys.

`species-names.json` records its pinned PokéAPI source URL. The 251 Japanese
(language 1) / English (language 9) species-name pairs are used only as search
aliases. They do not replace source names, source IDs, or identity aliases.
Owner-qualified and Dark/Light/Shining source names remain intact. No English
card ID is used to infer a Japanese card's name, number, or artwork.

Source-dataset Pikachu coverage:

| Source set | Source ID |
|---|---|
| PMCG1 | PMCG1-035 |
| PMCG2 | PMCG2-024 |
| PMCG3 | none |
| PMCG4 | none |
| PMCG5 | PMCG5-036 (マチスのピカチュウ) |
| PMCG6 | none |
| neo1 | neo1-036 |
| neo2 | none |
| neo3 | none |
| neo4 | none |

No missing record is invented. “None” means absent from the captured source
dataset, not proof about all historical releases, decks, or promotions.
TCGdex includes incomplete/inconsistently translated names; unrecognized names
remain searchable under their original source spelling. Source localId values
are retained in source_id, not assumed to be printed Japanese card numbers.
Gym routing remains SEARCH unless independently verified by existing routing.
Artwork and pricing are outside this change.

Verification uses actual source fixtures with browser network interception;
it does not depend on the availability of the live API during each test run.
