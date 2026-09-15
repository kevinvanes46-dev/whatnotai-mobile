# RAREWORTH v165 JP Cardmarket audit

Baseline: 4005d655fdb2c431fe42adf5c7b5c0c30e22fa60. Branch: rareworth-v165-full-jp-cardmarket.

397 EXACT / 383 SEARCH across all 780 records; 390 mappings added to the seven proven v163 routes. No merge or deploy.

## Root cause and implementation

The v163 resolver only contained seven proven native Japanese products. Other identities correctly fell back to SEARCH even when a native product existed. A generated, frozen manifest now supplies 397 reviewed source-ID/source-set mappings to the same resolver. Conflicting source-set metadata is rejected. Product slugs are evidence data, never generated from names.

The full multi-card browser regression also exposed a collection collision: the Latin name normalizer erased Japanese names, merging different unnumbered Japanese cards within the same set. The collection deduplication key now includes the JP source ID, with Unicode name fallback for legacy records lacking one. EN keys, storage schema/key and v164 display rules remain unchanged. Previously merged historical quantities cannot be reconstructed automatically.

Production files: index.html (manifest order and cache keys), jp-cardmarket-native-v165.js (generated data), jp-cardmarket-native-v163.js (manifest input and identity conflict guard), ui-v137-collection.js (JP deduplication key), data/jp-cardmarket-audit-v165.json (reviewed evidence). The generator is scripts/generate-jp-cardmarket-v165.cjs.

## Evidence and limits

Every record is bound to the baseline source fixture, Japanese name and source set. Reliable bilingual ArtOfPkm metadata supplies English names where available. EXACT requires the corresponding Japanese expansion and an observed, unambiguous Cardmarket product URL; same-name source variants remain SEARCH without distinguishing evidence. Source ordinal numbers are not used as marketplace identity. Per-record evidence URLs, index titles, candidates, queries and reasons are preserved in the JSON audit.

Cardmarket direct requests returned HTTP 403. Product evidence therefore uses indexed Cardmarket pages, as authorized. Browser tests verify local routing and restoration with frozen source fixtures and external network blocked; they do not verify live offers, current redirects or HTTP success on Cardmarket. The official product catalog was consulted, but its numeric expansion IDs could not be independently bound to expansion names; no numeric product IDs were guessed or imported. No images downloaded.

The 383 unresolved records comprise 193 PRODUCT_UNPROVEN, 168 NAME_UNPROVEN and 22 VARIANT_AMBIGUOUS. SEARCH does not prove that a product does not exist or cannot ever be mapped.

## Coverage

| Source set | RareWorth set | Total | EXACT | SEARCH |
|---|---|---:|---:|---:|
| PMCG1 | Expansion Pack | 102 | 67 | 35 |
| PMCG2 | Pokémon Jungle | 48 | 36 | 12 |
| PMCG3 | Mystery of the Fossils | 48 | 31 | 17 |
| PMCG4 | Rocket Gang | 65 | 49 | 16 |
| PMCG5 | Leader's Stadium | 96 | 53 | 43 |
| PMCG6 | Challenge from the Darkness | 98 | 62 | 36 |
| neo1 | Neo Genesis | 96 | 36 | 60 |
| neo2 | Neo Discovery | 57 | 16 | 41 |
| neo3 | Awakening Legends | 57 | 22 | 35 |
| neo4 | Neo Destiny | 113 | 25 | 88 |
| **Total** | | **780** | **397** | **383** |

## Machamp

PMCG1-057, カイリキー, Expansion Pack: EXACT.

- EX: https://www.cardmarket.com/en/Pokemon/Products/Singles/Expansion-Pack/Machamp-EXP?minCondition=3
- NM: https://www.cardmarket.com/en/Pokemon/Products/Singles/Expansion-Pack/Machamp-EXP?minCondition=2

No language parameter on native Japanese products.

## Validation

- All v156-v165 test files: 72 passed, 0 failed, 0 skipped. Includes all seven v163 routes.
- Additional collection price freshness, Cardmarket routing/engine/resolver and history identity regressions: 679 passed, 0 failed, 0 skipped.
- All 780 records: EX/NM, identity immutability, unique source IDs/products, source-set conflicts, truthful SEARCH, native Japanese expansion, no language=7.
- Browser: PMCG1/PMCG2/PMCG5/neo1 Pikachu, neo3 Swinub, PMCG1 Machamp, PMCG1-097 SEARCH; all seven in EX and NM (14 cases), same persistent collection. Recent, Collection, reload, identity and injected stale Western URL recovery PASS.
- v156 SEARCH UI fixture explicitly omits the newly mapped Snubbull product; v160 Weedle and v162 Bulbasaur expectations updated for evidence-backed coverage. The unmodified v164 label tests PASS.
- Syntax checks and manifest generator --check PASS; git diff --check PASS.
- Protected artwork/image-library/scanner/set-label implementations unchanged. Storage key remains cardscout_collection_v133.

Reproduce required regressions in PowerShell with Playwright/Chrome available:

~~~powershell
$taskTests = Get-ChildItem tests -Filter '*.test.cjs' | Where-Object { $_.Name -match 'v15[6-9]|v16[0-5]' } | ForEach-Object { $_.FullName }
node --test --test-concurrency=2 @taskTests
node scripts/generate-jp-cardmarket-v165.cjs --check
git diff --check
~~~

## All SEARCH records requiring further evidence

Reason codes refer to the definitions above; full evidence and notes are in the JSON audit.

| source_id | source_set_id | JP name | English name if proven | Reason |
|---|---|---|---|---|
| PMCG1-004 | PMCG1 | ビードル | Weedle | PRODUCT_UNPROVEN |
| PMCG1-006 | PMCG1 | ドガース | Koffing | PRODUCT_UNPROVEN |
| PMCG1-009 | PMCG1 | コクーン | Kakuna | PRODUCT_UNPROVEN |
| PMCG1-012 | PMCG1 | スピアー | Beedrill | PRODUCT_UNPROVEN |
| PMCG1-013 | PMCG1 | ニドキング | Nidoking | PRODUCT_UNPROVEN |
| PMCG1-021 | PMCG1 | リザードン | Charizard | PRODUCT_UNPROVEN |
| PMCG1-024 | PMCG1 | ニョロモ | Poliwag | PRODUCT_UNPROVEN |
| PMCG1-025 | PMCG1 | ヒトデマン | Staryu | PRODUCT_UNPROVEN |
| PMCG1-033 | PMCG1 | ニョロボン | Poliwrath | PRODUCT_UNPROVEN |
| PMCG1-037 | PMCG1 | ビリリダマ | Voltorb | PRODUCT_UNPROVEN |
| PMCG1-039 | PMCG1 | レアコイル | Magneton | PRODUCT_UNPROVEN |
| PMCG1-040 | PMCG1 | マルマイン | Electrode | PRODUCT_UNPROVEN |
| PMCG1-041 | PMCG1 | エレブー | Electabuzz | PRODUCT_UNPROVEN |
| PMCG1-051 | PMCG1 | サンド | Sandshrew | PRODUCT_UNPROVEN |
| PMCG1-062 | PMCG1 | ラッタ | Raticate | PRODUCT_UNPROVEN |
| PMCG1-063 | PMCG1 | カモネギ | Farfetch’d | PRODUCT_UNPROVEN |
| PMCG1-064 | PMCG1 | ポリゴン | Porygon | PRODUCT_UNPROVEN |
| PMCG1-068 | PMCG1 | ラッキー | Chansey | PRODUCT_UNPROVEN |
| PMCG1-073 | PMCG1 | ポケモンいれかえ | Switch | PRODUCT_UNPROVEN |
| PMCG1-079 | PMCG1 | ディフェンダー | Defender | PRODUCT_UNPROVEN |
| PMCG1-080 | PMCG1 | なんでもなおし | Full Heal | PRODUCT_UNPROVEN |
| PMCG1-082 | PMCG1 | ポケモン図鑑 | Pokédex | PRODUCT_UNPROVEN |
| PMCG1-083 | PMCG1 | ポケモンセンター | Pokémon Center | PRODUCT_UNPROVEN |
| PMCG1-084 | PMCG1 | ポケモンの笛 | Pokémon Flute | PRODUCT_UNPROVEN |
| PMCG1-087 | PMCG1 | ダウジングマシーン | Item Finder | PRODUCT_UNPROVEN |
| PMCG1-090 | PMCG1 | パソコン通信 | Computer Search | PRODUCT_UNPROVEN |
| PMCG1-092 | PMCG1 | ポケモン回収 | Scoop Up | PRODUCT_UNPROVEN |
| PMCG1-093 | PMCG1 | ポケモン交換おじさん | Pokémon Trader | PRODUCT_UNPROVEN |
| PMCG1-095 | PMCG1 | ミニスカート | Lass | PRODUCT_UNPROVEN |
| PMCG1-097 | PMCG1 | 基本草エネルギー |  | NAME_UNPROVEN |
| PMCG1-098 | PMCG1 | 基本炎エネルギー |  | NAME_UNPROVEN |
| PMCG1-099 | PMCG1 | 基本水エネルギー |  | NAME_UNPROVEN |
| PMCG1-100 | PMCG1 | 基本雷エネルギー |  | NAME_UNPROVEN |
| PMCG1-101 | PMCG1 | 基本超エネルギー |  | NAME_UNPROVEN |
| PMCG1-102 | PMCG1 | 基本闘エネルギー |  | NAME_UNPROVEN |
| PMCG2-006 | PMCG2 | タマタマ | Exeggcute | PRODUCT_UNPROVEN |
| PMCG2-010 | PMCG2 | パラセクト | Parasect | PRODUCT_UNPROVEN |
| PMCG2-011 | PMCG2 | ウツドン | Weepinbell | PRODUCT_UNPROVEN |
| PMCG2-012 | PMCG2 | ナッシー | Exeggutor | PRODUCT_UNPROVEN |
| PMCG2-022 | PMCG2 | アズマオウ | Seaking | PRODUCT_UNPROVEN |
| PMCG2-027 | PMCG2 | バリヤード | Mr. Mime | PRODUCT_UNPROVEN |
| PMCG2-029 | PMCG2 | カラカラ | Cubone | PRODUCT_UNPROVEN |
| PMCG2-033 | PMCG2 | サイドン | Rhydon | PRODUCT_UNPROVEN |
| PMCG2-037 | PMCG2 | イーブイ | Eevee | PRODUCT_UNPROVEN |
| PMCG2-039 | PMCG2 | ペルシアン | Persian | PRODUCT_UNPROVEN |
| PMCG2-043 | PMCG2 | ピジョット | Pi | PRODUCT_UNPROVEN |
| PMCG2-046 | PMCG2 | ガルーラ | Kangaskhan | PRODUCT_UNPROVEN |
| PMCG3-004 | PMCG3 | アーボック | Arbok | PRODUCT_UNPROVEN |
| PMCG3-009 | PMCG3 | ファイヤー | Moltres | PRODUCT_UNPROVEN |
| PMCG3-014 | PMCG3 | タッツ |  | NAME_UNPROVEN |
| PMCG3-015 | PMCG3 | オムナイト | Omanyte | PRODUCT_UNPROVEN |
| PMCG3-016 | PMCG3 | ゴルダック | Golduck | PRODUCT_UNPROVEN |
| PMCG3-018 | PMCG3 | パルシェン | Cloyster | PRODUCT_UNPROVEN |
| PMCG3-022 | PMCG3 | ラプラス | Lapras | PRODUCT_UNPROVEN |
| PMCG3-024 | PMCG3 | ライチュウ | Raichu | PRODUCT_UNPROVEN |
| PMCG3-025 | PMCG3 | レアコイル | Magneton | PRODUCT_UNPROVEN |
| PMCG3-027 | PMCG3 | ヤドン | Slowpoke | PRODUCT_UNPROVEN |
| PMCG3-036 | PMCG3 | サンドパン | Sandslash | PRODUCT_UNPROVEN |
| PMCG3-037 | PMCG3 | ゴローン | Graveler | PRODUCT_UNPROVEN |
| PMCG3-040 | PMCG3 | カブトプス | Kabutops | PRODUCT_UNPROVEN |
| PMCG3-041 | PMCG3 | プテラ | Aerodactyl | PRODUCT_UNPROVEN |
| PMCG3-042 | PMCG3 | メタモン | Ditto | PRODUCT_UNPROVEN |
| PMCG3-046 | PMCG3 | なにかの化石 | Mysterious Fossil | PRODUCT_UNPROVEN |
| PMCG3-048 | PMCG3 | フジろうじん | Mr. Fuji | PRODUCT_UNPROVEN |
| PMCG4-007 | PMCG4 | わるいベトベトン | Dark Muk | PRODUCT_UNPROVEN |
| PMCG4-013 | PMCG4 | ポニータ | Ponyta | PRODUCT_UNPROVEN |
| PMCG4-017 | PMCG4 | わるいリザードン | Dark Charizard | PRODUCT_UNPROVEN |
| PMCG4-019 | PMCG4 | コダック | Psyduck | PRODUCT_UNPROVEN |
| PMCG4-021 | PMCG4 | わるいカメール | Dark Wartortle | PRODUCT_UNPROVEN |
| PMCG4-026 | PMCG4 | コイル | Magnemite | PRODUCT_UNPROVEN |
| PMCG4-031 | PMCG4 | ケーシィ | Abra | PRODUCT_UNPROVEN |
| PMCG4-033 | PMCG4 | スリープ | Drowzee | PRODUCT_UNPROVEN |
| PMCG4-037 | PMCG4 | わるいスリーパー | Dark Hypno | PRODUCT_UNPROVEN |
| PMCG4-045 | PMCG4 | コラッタ | Rattata | PRODUCT_UNPROVEN |
| PMCG4-046 | PMCG4 | わるいラッタ | Dark Raticate | PRODUCT_UNPROVEN |
| PMCG4-054 | PMCG4 | ねむれ!ねむれ! | Sleep! | PRODUCT_UNPROVEN |
| PMCG4-057 | PMCG4 | 夜の廃品回収 | Nightly Garbage Run | PRODUCT_UNPROVEN |
| PMCG4-058 | PMCG4 | たたきつけろ!挑戦状 | Challenge! | PRODUCT_UNPROVEN |
| PMCG4-060 | PMCG4 | ボスのやりかた | The Boss's Way | PRODUCT_UNPROVEN |
| PMCG4-063 | PMCG4 | きずぐすり配合エネルギー | Potion Energy | PRODUCT_UNPROVEN |
| PMCG5-002 | PMCG5 | エリカのナゾノクサ | Erika's Oddish | VARIANT_AMBIGUOUS |
| PMCG5-003 | PMCG5 | エリカのナゾノクサ | Erika's Oddish | VARIANT_AMBIGUOUS |
| PMCG5-005 | PMCG5 | エリカのマダツボミ | Erika's Bellsprout | VARIANT_AMBIGUOUS |
| PMCG5-006 | PMCG5 | エリカのモンジャラ | Erika's Tangela | PRODUCT_UNPROVEN |
| PMCG5-007 | PMCG5 | エリカのフシギダネ | Erika's Bulbasaur | PRODUCT_UNPROVEN |
| PMCG5-008 | PMCG5 | タケシのゴルバット | Brock's Golbat | PRODUCT_UNPROVEN |
| PMCG5-009 | PMCG5 | エリカのクサイハナ | Erika's Gloom | PRODUCT_UNPROVEN |
| PMCG5-010 | PMCG5 | エリカのマダツボミ | Erika's Bellsprout | VARIANT_AMBIGUOUS |
| PMCG5-011 | PMCG5 | エリカのウツドン | Erika's Weepinbell | PRODUCT_UNPROVEN |
| PMCG5-012 | PMCG5 | エリカのタマタマ | Erika's Exeggcute | PRODUCT_UNPROVEN |
| PMCG5-013 | PMCG5 | エリカのナッシー | Erika's Exeggutor | PRODUCT_UNPROVEN |
| PMCG5-015 | PMCG5 | エリカのウツボット | Erika's Victreebel | PRODUCT_UNPROVEN |
| PMCG5-017 | PMCG5 | タケシのロコン | Brock's Vulpix | VARIANT_AMBIGUOUS |
| PMCG5-018 | PMCG5 | タケシのロコン | Brock's Vulpix | VARIANT_AMBIGUOUS |
| PMCG5-022 | PMCG5 | カスミのニョロモ | Misty's Poliwag | PRODUCT_UNPROVEN |
| PMCG5-024 | PMCG5 | カスミのタッツー | Misty's Horsea | VARIANT_AMBIGUOUS |
| PMCG5-025 | PMCG5 | カスミのタッツー | Misty's Horsea | VARIANT_AMBIGUOUS |
| PMCG5-028 | PMCG5 | カスミのコイキング | Misty's Magikarp | PRODUCT_UNPROVEN |
| PMCG5-032 | PMCG5 | カスミのゴルダック | Misty's Golduck | PRODUCT_UNPROVEN |
| PMCG5-037 | PMCG5 | マチスのコイル | Lt. Surge's Magnemite | VARIANT_AMBIGUOUS |
| PMCG5-039 | PMCG5 | マチスのコイル | Lt. Surge's Magnemite | VARIANT_AMBIGUOUS |
| PMCG5-041 | PMCG5 | マチスのエレブー | Lt. Surge's Electabuzz | PRODUCT_UNPROVEN |
| PMCG5-043 | PMCG5 | タケシサンド | Brock's Sandshrew | PRODUCT_UNPROVEN |
| PMCG5-044 | PMCG5 | タケシのディグダ | Brock's Diglett | PRODUCT_UNPROVEN |
| PMCG5-045 | PMCG5 | タケシのマンキー | Brock's Mankey | PRODUCT_UNPROVEN |
| PMCG5-046 | PMCG5 | タケシのイシツブテ | Brock's Geodude | VARIANT_AMBIGUOUS |
| PMCG5-047 | PMCG5 | タケシのイシツブテ | Brock's Geodude | VARIANT_AMBIGUOUS |
| PMCG5-051 | PMCG5 | タケシのオコリザル | Brock's Primeape | PRODUCT_UNPROVEN |
| PMCG5-053 | PMCG5 | タケシのゴローニャ | Brock's Golem | PRODUCT_UNPROVEN |
| PMCG5-054 | PMCG5 | R団のエビワラー | Team Rocket's Hitmonchan | PRODUCT_UNPROVEN |
| PMCG5-056 | PMCG5 | マチスのコラッタ | Lt.Surge's Rattata | PRODUCT_UNPROVEN |
| PMCG5-058 | PMCG5 | エリカのプリン | Erika's Jigglypuff | PRODUCT_UNPROVEN |
| PMCG5-059 | PMCG5 | マチスのラッタ | Lt. Surge's Raticate | PRODUCT_UNPROVEN |
| PMCG5-061 | PMCG5 | タケシのベロリンガ | Brock's Lickitung | PRODUCT_UNPROVEN |
| PMCG5-062 | PMCG5 | マチスのイーブイ | Lt. Surge's Eevee | PRODUCT_UNPROVEN |
| PMCG5-063 | PMCG5 | エリカのミニリュウ | Erika's Dratini | PRODUCT_UNPROVEN |
| PMCG5-064 | PMCG5 | マチスのオニドリル | Lt. Surge's Fearow | PRODUCT_UNPROVEN |
| PMCG5-067 | PMCG5 | エネルギーサーキュレート | Energy Flow | PRODUCT_UNPROVEN |
| PMCG5-087 | PMCG5 | 錯乱ジム | Chaos Gym | PRODUCT_UNPROVEN |
| PMCG5-088 | PMCG5 | スパイ作戦 | Lt. Surge's Secret Plan | VARIANT_AMBIGUOUS |
| PMCG5-091 | PMCG5 | 抵抗力低下ジム | Resistance Gym | PRODUCT_UNPROVEN |
| PMCG5-092 | PMCG5 | マチス | Lt. Surge | PRODUCT_UNPROVEN |
| PMCG5-093 | PMCG5 | マチスの秘策 | Lt. Surge's Secret Plan | VARIANT_AMBIGUOUS |
| PMCG6-008 | PMCG6 | キョウのドガース | Koga's Koffing | VARIANT_AMBIGUOUS |
| PMCG6-013 | PMCG6 | サカキのニドリーノ | Giovanni's Nidorino | PRODUCT_UNPROVEN |
| PMCG6-015 | PMCG6 | キョウのドガース | Koga's Koffing | VARIANT_AMBIGUOUS |
| PMCG6-019 | PMCG6 | キョウのアーボック | Koga's Arbok | PRODUCT_UNPROVEN |
| PMCG6-022 | PMCG6 | ナツメのモルフォン | Sabrina's Venomoth | PRODUCT_UNPROVEN |
| PMCG6-025 | PMCG6 | カツラのヒトカゲ | Blaine's Charmander | PRODUCT_UNPROVEN |
| PMCG6-026 | PMCG6 | カツラのロコン | Blaine's Vulpix | PRODUCT_UNPROVEN |
| PMCG6-028 | PMCG6 | カツラのポニータ | Blaine's Ponyta | PRODUCT_UNPROVEN |
| PMCG6-031 | PMCG6 | カツラのブーバー | Blaine's Magmar | PRODUCT_UNPROVEN |
| PMCG6-035 | PMCG6 | カツラのファイヤー | Blaine's Moltres | PRODUCT_UNPROVEN |
| PMCG6-037 | PMCG6 | サカキのコイキング | Giovanni's Magikarp | PRODUCT_UNPROVEN |
| PMCG6-038 | PMCG6 | ナツメのゴルダック | Sabrina's Golduck | PRODUCT_UNPROVEN |
| PMCG6-040 | PMCG6 | サカキのギャラドス | Giovanni's Gyarados | PRODUCT_UNPROVEN |
| PMCG6-041 | PMCG6 | マチスのライチュウ | Lt. Surge's Raichu | PRODUCT_UNPROVEN |
| PMCG6-043 | PMCG6 | ナツメのケーシィ | Sabrina's Abra | PRODUCT_UNPROVEN |
| PMCG6-046 | PMCG6 | ナツメのバリヤード | Sabrina's Mr. Mime | PRODUCT_UNPROVEN |
| PMCG6-050 | PMCG6 | ナツメのゴースト | Sabrina's Haunter | PRODUCT_UNPROVEN |
| PMCG6-057 | PMCG6 | サカキのワンリキー | Giovanni's Machop | PRODUCT_UNPROVEN |
| PMCG6-058 | PMCG6 | カツラのサイホーン | Blaine's Rhyhorn | PRODUCT_UNPROVEN |
| PMCG6-061 | PMCG6 | サカキのカイリキー | Giovanni's Machamp | PRODUCT_UNPROVEN |
| PMCG6-062 | PMCG6 | キョウのポッポ | Koga's Pidgey | VARIANT_AMBIGUOUS |
| PMCG6-063 | PMCG6 | サカキのニャース | Giovanni's Meowth | VARIANT_AMBIGUOUS |
| PMCG6-064 | PMCG6 | カツラのドードー | Blaine's Doduo | PRODUCT_UNPROVEN |
| PMCG6-065 | PMCG6 | カツラのケンタロス | Blaine's Tauros | PRODUCT_UNPROVEN |
| PMCG6-066 | PMCG6 | ナツメのポリゴン | Sabrina's Porygon | PRODUCT_UNPROVEN |
| PMCG6-067 | PMCG6 | キョウのポッポ | Koga's Pidgey | VARIANT_AMBIGUOUS |
| PMCG6-068 | PMCG6 | サカキのニャース | Giovanni's Meowth | VARIANT_AMBIGUOUS |
| PMCG6-069 | PMCG6 | カツラのガルーラ | Blaine's Kangaskhan | PRODUCT_UNPROVEN |
| PMCG6-070 | PMCG6 | キョウのピジョン | Koga's Pidgeotto | PRODUCT_UNPROVEN |
| PMCG6-072 | PMCG6 | キョウのメタモン | Koga's Ditto | PRODUCT_UNPROVEN |
| PMCG6-080 | PMCG6 | ワープポイント | Warp Point | PRODUCT_UNPROVEN |
| PMCG6-081 | PMCG6 | カツラの奥の手 | Blaine's Last Resort | PRODUCT_UNPROVEN |
| PMCG6-093 | PMCG6 | カツラ | Blaine | PRODUCT_UNPROVEN |
| PMCG6-094 | PMCG6 | キョウ | Koga | PRODUCT_UNPROVEN |
| PMCG6-095 | PMCG6 | サカキ | Giovanni | PRODUCT_UNPROVEN |
| PMCG6-096 | PMCG6 | サカキの切り札 | Giovanni's Last Resort | PRODUCT_UNPROVEN |
| neo1-001 | neo1 | 奇妙な |  | NAME_UNPROVEN |
| neo1-003 | neo1 | レディバ | Ledyba | PRODUCT_UNPROVEN |
| neo1-004 | neo1 | スパラク |  | NAME_UNPROVEN |
| neo1-005 | neo1 | ホッピップ |  | NAME_UNPROVEN |
| neo1-006 | neo1 | サンカーン |  | NAME_UNPROVEN |
| neo1-007 | neo1 | シャックル |  | NAME_UNPROVEN |
| neo1-008 | neo1 | 暗闇 |  | NAME_UNPROVEN |
| neo1-010 | neo1 | レディアン | Ledian | PRODUCT_UNPROVEN |
| neo1-012 | neo1 | スキプルーム |  | NAME_UNPROVEN |
| neo1-013 | neo1 | サンフロラ |  | NAME_UNPROVEN |
| neo1-014 | neo1 | ミーガニウム |  | NAME_UNPROVEN |
| neo1-016 | neo1 | ジャンプラフ |  | NAME_UNPROVEN |
| neo1-018 | neo1 | シンダキル |  | NAME_UNPROVEN |
| neo1-019 | neo1 | マグマー |  | NAME_UNPROVEN |
| neo1-020 | neo1 | キラバ |  | NAME_UNPROVEN |
| neo1-021 | neo1 | 染色 |  | NAME_UNPROVEN |
| neo1-022 | neo1 | マグビー |  | NAME_UNPROVEN |
| neo1-023 | neo1 | 馬 |  | NAME_UNPROVEN |
| neo1-024 | neo1 | totodile | Totodile | PRODUCT_UNPROVEN |
| neo1-026 | neo1 | ウーパー |  | NAME_UNPROVEN |
| neo1-028 | neo1 | マンティン |  | NAME_UNPROVEN |
| neo1-030 | neo1 | クロコノー |  | NAME_UNPROVEN |
| neo1-032 | neo1 | ピロスワイン |  | NAME_UNPROVEN |
| neo1-034 | neo1 | アズマリル |  | NAME_UNPROVEN |
| neo1-037 | neo1 | チンチョウ |  | NAME_UNPROVEN |
| neo1-040 | neo1 | ラントン |  | NAME_UNPROVEN |
| neo1-041 | neo1 | フラフィー |  | NAME_UNPROVEN |
| neo1-042 | neo1 | ピチュ |  | NAME_UNPROVEN |
| neo1-043 | neo1 | アンファロス |  | NAME_UNPROVEN |
| neo1-046 | neo1 | natu | Natu | PRODUCT_UNPROVEN |
| neo1-049 | neo1 | スローキング |  | NAME_UNPROVEN |
| neo1-050 | neo1 | onix | Onix | PRODUCT_UNPROVEN |
| neo1-051 | neo1 | sudowoodo | Sudowoodo | PRODUCT_UNPROVEN |
| neo1-052 | neo1 | グリガー |  | NAME_UNPROVEN |
| neo1-053 | neo1 | ファンピー |  | NAME_UNPROVEN |
| neo1-054 | neo1 | ドンファン | Donphan | PRODUCT_UNPROVEN |
| neo1-055 | neo1 | マークロウ |  | NAME_UNPROVEN |
| neo1-056 | neo1 | スニーエル |  | NAME_UNPROVEN |
| neo1-058 | neo1 | スカルモリー |  | NAME_UNPROVEN |
| neo1-059 | neo1 | セントレット |  | NAME_UNPROVEN |
| neo1-062 | neo1 | スタントラー |  | NAME_UNPROVEN |
| neo1-063 | neo1 | クリーフ |  | NAME_UNPROVEN |
| neo1-065 | neo1 | ノクトウル |  | NAME_UNPROVEN |
| neo1-067 | neo1 | aipom | Aipom | PRODUCT_UNPROVEN |
| neo1-068 | neo1 | グランブル | Granbull | PRODUCT_UNPROVEN |
| neo1-069 | neo1 | ミルタンク | Miltank | PRODUCT_UNPROVEN |
| neo1-070 | neo1 | クレファ |  | NAME_UNPROVEN |
| neo1-072 | neo1 | ルギア | Lugia | PRODUCT_UNPROVEN |
| neo1-073 | neo1 | ベリー | Berry | PRODUCT_UNPROVEN |
| neo1-076 | neo1 | ポケモンマーチ | Pokémon March | PRODUCT_UNPROVEN |
| neo1-081 | neo1 | ミラクルベリー | Miracle Berry | PRODUCT_UNPROVEN |
| neo1-082 | neo1 | 新しいpokedex | New Pokédex | PRODUCT_UNPROVEN |
| neo1-084 | neo1 | ビルのテレポーター | Bill's Teleporter | PRODUCT_UNPROVEN |
| neo1-085 | neo1 | スプラウトタワー | Sprout Tower | PRODUCT_UNPROVEN |
| neo1-086 | neo1 | ecogym | Ecogym | PRODUCT_UNPROVEN |
| neo1-090 | neo1 | アーケードゲーム | Arcade Game | PRODUCT_UNPROVEN |
| neo1-092 | neo1 | スーパーエネルギー検索 |  | NAME_UNPROVEN |
| neo1-093 | neo1 | ポクギア | PokéGear | PRODUCT_UNPROVEN |
| neo1-095 | neo1 | 金属エネルギー | Metal Energy | PRODUCT_UNPROVEN |
| neo1-096 | neo1 | エネルギーをリサイクルします | Recycle Energy | PRODUCT_UNPROVEN |
| neo2-002 | neo2 | 雑草 |  | NAME_UNPROVEN |
| neo2-003 | neo2 | スパラク |  | NAME_UNPROVEN |
| neo2-004 | neo2 | ホッピップ |  | NAME_UNPROVEN |
| neo2-006 | neo2 | メタポッド |  | NAME_UNPROVEN |
| neo2-007 | neo2 | カクナ |  | NAME_UNPROVEN |
| neo2-008 | neo2 | スキスター |  | NAME_UNPROVEN |
| neo2-009 | neo2 | 蝶 |  | NAME_UNPROVEN |
| neo2-011 | neo2 | ヤンマ |  | NAME_UNPROVEN |
| neo2-012 | neo2 | ハウンドア（HR） | Houndour | VARIANT_AMBIGUOUS |
| neo2-013 | neo2 | poliwag | Poliwag | PRODUCT_UNPROVEN |
| neo2-015 | neo2 | ウーパー |  | NAME_UNPROVEN |
| neo2-017 | neo2 | コルサラ |  | NAME_UNPROVEN |
| neo2-018 | neo2 | カブトップス |  | NAME_UNPROVEN |
| neo2-019 | neo2 | 政治 |  | NAME_UNPROVEN |
| neo2-021 | neo2 | ダークライチュ |  | NAME_UNPROVEN |
| neo2-022 | neo2 | natu | Natu | PRODUCT_UNPROVEN |
| neo2-023 | neo2 | 未作外 |  | NAME_UNPROVEN |
| neo2-025 | neo2 | d |  | NAME_UNPROVEN |
| neo2-026 | neo2 | f |  | NAME_UNPROVEN |
| neo2-027 | neo2 | 未定のm |  | NAME_UNPROVEN |
| neo2-028 | neo2 | Unown u | Unown U | PRODUCT_UNPROVEN |
| neo2-029 | neo2 | エスペオン |  | NAME_UNPROVEN |
| neo2-030 | neo2 | a |  | NAME_UNPROVEN |
| neo2-031 | neo2 | ウォブバフェット |  | NAME_UNPROVEN |
| neo2-032 | neo2 | オマニテ |  | NAME_UNPROVEN |
| neo2-033 | neo2 | タイログ |  | NAME_UNPROVEN |
| neo2-034 | neo2 | 幼虫 |  | NAME_UNPROVEN |
| neo2-035 | neo2 | Omastar | Omastar | PRODUCT_UNPROVEN |
| neo2-036 | neo2 | Pupitar | Pupitar | PRODUCT_UNPROVEN |
| neo2-037 | neo2 | Poliwrath | Poliwrath | PRODUCT_UNPROVEN |
| neo2-038 | neo2 | ヒットモントップ |  | NAME_UNPROVEN |
| neo2-039 | neo2 | houndour（u） | Houndour | VARIANT_AMBIGUOUS |
| neo2-041 | neo2 | 猟犬 |  | NAME_UNPROVEN |
| neo2-042 | neo2 | タイラニター |  | NAME_UNPROVEN |
| neo2-043 | neo2 | マグナイト |  | NAME_UNPROVEN |
| neo2-045 | neo2 | Scizor | Scizor | PRODUCT_UNPROVEN |
| neo2-046 | neo2 | セントレット |  | NAME_UNPROVEN |
| neo2-047 | neo2 | ダンズパース |  | NAME_UNPROVEN |
| neo2-051 | neo2 | ウルサリング |  | NAME_UNPROVEN |
| neo2-054 | neo2 | 壁を台無しにする[カブト] |  | NAME_UNPROVEN |
| neo2-057 | neo2 | 壁を台無しにする[aerodactyl] |  | NAME_UNPROVEN |
| neo3-002 | neo3 | パラ |  | NAME_UNPROVEN |
| neo3-003 | neo3 | スキプルーム |  | NAME_UNPROVEN |
| neo3-007 | neo3 | ジャンプラフ |  | NAME_UNPROVEN |
| neo3-011 | neo3 | ho-oh | Ho-Oh | PRODUCT_UNPROVEN |
| neo3-012 | neo3 | ゴールデン |  | NAME_UNPROVEN |
| neo3-017 | neo3 | 航海 |  | NAME_UNPROVEN |
| neo3-018 | neo3 | ジンクス |  | NAME_UNPROVEN |
| neo3-019 | neo3 | オクリリー |  | NAME_UNPROVEN |
| neo3-022 | neo3 | 輝くマジカルプ |  | NAME_UNPROVEN |
| neo3-023 | neo3 | 輝くギャラドス |  | NAME_UNPROVEN |
| neo3-024 | neo3 | チンチョウ |  | NAME_UNPROVEN |
| neo3-025 | neo3 | ライチュ |  | NAME_UNPROVEN |
| neo3-026 | neo3 | ラントン |  | NAME_UNPROVEN |
| neo3-027 | neo3 | フラフィー |  | NAME_UNPROVEN |
| neo3-028 | neo3 | アンファロス |  | NAME_UNPROVEN |
| neo3-030 | neo3 | k | Unown K | PRODUCT_UNPROVEN |
| neo3-031 | neo3 | スムーチュム |  | NAME_UNPROVEN |
| neo3-033 | neo3 | yなしy | Unown Y | PRODUCT_UNPROVEN |
| neo3-034 | neo3 | スターミー | Starmie | PRODUCT_UNPROVEN |
| neo3-035 | neo3 | ミスレアヴァス |  | NAME_UNPROVEN |
| neo3-036 | neo3 | セレビ |  | NAME_UNPROVEN |
| neo3-037 | neo3 | ジオドード |  | NAME_UNPROVEN |
| neo3-039 | neo3 | 砂利 |  | NAME_UNPROVEN |
| neo3-040 | neo3 | シャックル |  | NAME_UNPROVEN |
| neo3-041 | neo3 | ピロスワイン |  | NAME_UNPROVEN |
| neo3-042 | neo3 | アエロダクチル |  | NAME_UNPROVEN |
| neo3-043 | neo3 | マークロウ |  | NAME_UNPROVEN |
| neo3-044 | neo3 | 猟犬 |  | NAME_UNPROVEN |
| neo3-045 | neo3 | マグネトン |  | NAME_UNPROVEN |
| neo3-049 | neo3 | スタントラー |  | NAME_UNPROVEN |
| neo3-052 | neo3 | ブリッシー |  | NAME_UNPROVEN |
| neo3-053 | neo3 | 古い棒 | Old Rod | PRODUCT_UNPROVEN |
| neo3-054 | neo3 | ヒーリングフィールド | Healing Field | PRODUCT_UNPROVEN |
| neo3-055 | neo3 | バルーンベリー | Balloon Berry | PRODUCT_UNPROVEN |
| neo3-056 | neo3 | ポケモンブリーダーフィールド | Pokémon Breeder Fields | PRODUCT_UNPROVEN |
| neo4-001 | neo4 | ヴェノナト |  | NAME_UNPROVEN |
| neo4-002 | neo4 | レディバ | Ledyba | PRODUCT_UNPROVEN |
| neo4-003 | neo4 | サンカーン |  | NAME_UNPROVEN |
| neo4-004 | neo4 | 軽いサンフロラ |  | NAME_UNPROVEN |
| neo4-005 | neo4 | Pineco | Pineco | PRODUCT_UNPROVEN |
| neo4-006 | neo4 | 軽い毒 |  | NAME_UNPROVEN |
| neo4-007 | neo4 | スキスター |  | NAME_UNPROVEN |
| neo4-008 | neo4 | 暗いforretress |  | NAME_UNPROVEN |
| neo4-010 | neo4 | 軽いレディアン |  | NAME_UNPROVEN |
| neo4-011 | neo4 | ダークアリアドス |  | NAME_UNPROVEN |
| neo4-012 | neo4 | 暗いクロバット |  | NAME_UNPROVEN |
| neo4-013 | neo4 | 輝くセレビ |  | NAME_UNPROVEN |
| neo4-015 | neo4 | うなり声 |  | NAME_UNPROVEN |
| neo4-016 | neo4 | シンダキル |  | NAME_UNPROVEN |
| neo4-018 | neo4 | 軽いニネタール |  | NAME_UNPROVEN |
| neo4-019 | neo4 | 軽いフレアロン |  | NAME_UNPROVEN |
| neo4-020 | neo4 | ダークキラバ |  | NAME_UNPROVEN |
| neo4-021 | neo4 | 軽アルカニン |  | NAME_UNPROVEN |
| neo4-022 | neo4 | 暗い染色 |  | NAME_UNPROVEN |
| neo4-023 | neo4 | ダークマグカルゴ |  | NAME_UNPROVEN |
| neo4-025 | neo4 | 輝くチャリザード |  | NAME_UNPROVEN |
| neo4-026 | neo4 | Psyduck | Psyduck | PRODUCT_UNPROVEN |
| neo4-027 | neo4 | シール |  | NAME_UNPROVEN |
| neo4-028 | neo4 | totodile | Totodile | PRODUCT_UNPROVEN |
| neo4-030 | neo4 | REMORAID | Remoraid | PRODUCT_UNPROVEN |
| neo4-031 | neo4 | マンティン |  | NAME_UNPROVEN |
| neo4-032 | neo4 | ライトゴルダック |  | NAME_UNPROVEN |
| neo4-033 | neo4 | 軽いデューゴン |  | NAME_UNPROVEN |
| neo4-034 | neo4 | 軽いvaporeon |  | NAME_UNPROVEN |
| neo4-035 | neo4 | 暗いオマニテ |  | NAME_UNPROVEN |
| neo4-036 | neo4 | 暗いワニ |  | NAME_UNPROVEN |
| neo4-037 | neo4 | ダークオクタリリー |  | NAME_UNPROVEN |
| neo4-038 | neo4 | ダークオマスター |  | NAME_UNPROVEN |
| neo4-039 | neo4 | 暗いferaligatr |  | NAME_UNPROVEN |
| neo4-040 | neo4 | 軽いアズマリル |  | NAME_UNPROVEN |
| neo4-041 | neo4 | 軽いピロスワイン |  | NAME_UNPROVEN |
| neo4-043 | neo4 | ライトジョルテオン |  | NAME_UNPROVEN |
| neo4-044 | neo4 | 暗いフラフィ |  | NAME_UNPROVEN |
| neo4-045 | neo4 | ライトラントン |  | NAME_UNPROVEN |
| neo4-046 | neo4 | 暗いアンファロ |  | NAME_UNPROVEN |
| neo4-047 | neo4 | 輝くライチュ |  | NAME_UNPROVEN |
| neo4-048 | neo4 | ガストリー |  | NAME_UNPROVEN |
| neo4-049 | neo4 | exeggcute | Exeggcute | PRODUCT_UNPROVEN |
| neo4-050 | neo4 | l | Unown L | PRODUCT_UNPROVEN |
| neo4-051 | neo4 | s | Unown S | PRODUCT_UNPROVEN |
| neo4-053 | neo4 | v | Unown V | PRODUCT_UNPROVEN |
| neo4-054 | neo4 | 軽いスローブロ |  | NAME_UNPROVEN |
| neo4-055 | neo4 | 暗いハンター |  | NAME_UNPROVEN |
| neo4-056 | neo4 | 暗いexeggutor |  | NAME_UNPROVEN |
| neo4-058 | neo4 | 未定のp | Unown P | PRODUCT_UNPROVEN |
| neo4-059 | neo4 | Q | Unown Q | PRODUCT_UNPROVEN |
| neo4-061 | neo4 | 暗いスローキング |  | NAME_UNPROVEN |
| neo4-063 | neo4 | hなしh | Unown H | PRODUCT_UNPROVEN |
| neo4-064 | neo4 | w | Unown W | PRODUCT_UNPROVEN |
| neo4-065 | neo4 | 未作たx | Unown X | PRODUCT_UNPROVEN |
| neo4-066 | neo4 | ダークジェンガー |  | NAME_UNPROVEN |
| neo4-067 | neo4 | 暗いエスペオン |  | NAME_UNPROVEN |
| neo4-068 | neo4 | 輝くミュウツー |  | NAME_UNPROVEN |
| neo4-069 | neo4 | マチョップ |  | NAME_UNPROVEN |
| neo4-070 | neo4 | ヒットモンチャン |  | NAME_UNPROVEN |
| neo4-071 | neo4 | グリガー |  | NAME_UNPROVEN |
| neo4-072 | neo4 | ファンピー |  | NAME_UNPROVEN |
| neo4-073 | neo4 | 幼虫 |  | NAME_UNPROVEN |
| neo4-074 | neo4 | ライトマチョーク |  | NAME_UNPROVEN |
| neo4-076 | neo4 | ダークプリター |  | NAME_UNPROVEN |
| neo4-077 | neo4 | 軽いマチャンプ |  | NAME_UNPROVEN |
| neo4-078 | neo4 | ダークドンファン |  | NAME_UNPROVEN |
| neo4-080 | neo4 | 輝くカブトップ |  | NAME_UNPROVEN |
| neo4-081 | neo4 | 猟犬 |  | NAME_UNPROVEN |
| neo4-082 | neo4 | 輝くタイラニター | Shining Tyranitar | PRODUCT_UNPROVEN |
| neo4-083 | neo4 | ダークシゾール |  | NAME_UNPROVEN |
| neo4-084 | neo4 | Shining Steelix | Shining Steelix | PRODUCT_UNPROVEN |
| neo4-086 | neo4 | ポリゴン | Porygon | PRODUCT_UNPROVEN |
| neo4-087 | neo4 | ドラチーニ |  | NAME_UNPROVEN |
| neo4-088 | neo4 | togepi | Togepi | PRODUCT_UNPROVEN |
| neo4-089 | neo4 | Girafarig | Girafarig | PRODUCT_UNPROVEN |
| neo4-092 | neo4 | チャンジー |  | NAME_UNPROVEN |
| neo4-093 | neo4 | ライトドラゴンエア |  | NAME_UNPROVEN |
| neo4-094 | neo4 | 軽いドラゴナイト |  | NAME_UNPROVEN |
| neo4-095 | neo4 | 光から光 |  | NAME_UNPROVEN |
| neo4-096 | neo4 | 暗いウルサリング |  | NAME_UNPROVEN |
| neo4-098 | neo4 | 輝くノクトウル |  | NAME_UNPROVEN |
| neo4-099 | neo4 | 粉末を癒します | Heal Powder | PRODUCT_UNPROVEN |
| neo4-100 | neo4 | ビルからのメール | Mail from Bill | PRODUCT_UNPROVEN |
| neo4-102 | neo4 | エネルギー増幅器 | Energy Amplifier | PRODUCT_UNPROVEN |
| neo4-108 | neo4 | 思考ウェーブマシン | Thought Wave Machine | PRODUCT_UNPROVEN |
| neo4-112 | neo4 | ラジオタワー | Radio Tower | PRODUCT_UNPROVEN |
| neo4-229 | neo4 | 暗い猟犬 |  | NAME_UNPROVEN |
