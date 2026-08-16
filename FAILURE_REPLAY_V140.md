# CardScout v130 Failure Set — v140 Audit Replay

Source: the uploaded `cardscout-failed-scans-2026-08-16(1).json` from build 130.

## What the export proves

- Total failure records: **34**.
- Automatic failures: **18**; manually marked failures: **16**.
- Final `name + number + set` are all empty on **34/34** records.
- Name OCR is empty on **27/34** records.
- Number OCR is empty on **34/34** records.
- Vision reference-count distribution: **{74: 1, 246: 33}**. This confirms a fresh/incomplete reference universe was used during the same session.
- Automatic scan time: min **234 ms**, median **294 ms**, max **512 ms**. Speed was not the primary failure.
- Against visually audited ground truth, the *logged v130 ranking* has **4/18 Top-1** and **4/18 Top-3** on these failures.

## Logged v130 candidates

| # | Ground truth | Logged top 3 | Top-1 | Top-3 | Refs | Time |
|---:|---|---|:---:|:---:|---:|---:|
| 0 | Oddish | oddish, dark vileplume, horsea | ✅ | ✅ | 74 | 512 ms |
| 1 | Oddish | oddish, slowpoke, horsea | ✅ | ✅ | 246 | 294 ms |
| 2 | Bagon | bagon, bagon delta species, horsea | ✅ | ✅ | 246 | 350 ms |
| 3 | Shelgon | ditto, dark dugtrio, jirachi | ❌ | ❌ | 246 | 351 ms |
| 4 | Mudkip | cradily, energy search, bagon | ❌ | ❌ | 246 | 471 ms |
| 5 | Shelgon | ninetales, rayquaza, rocket's mewtwo | ❌ | ❌ | 246 | 306 ms |
| 6 | Omastar | bagon, latios gold star, cradily | ❌ | ❌ | 246 | 314 ms |
| 7 | Chikorita | chikorita, venomoth, dark vileplume | ✅ | ✅ | 246 | 285 ms |
| 8 | Surskit | metang, bagon, shroomish | ❌ | ❌ | 246 | 238 ms |
| 9 | Gabite | rayquaza, clefairy, nidoqueen | ❌ | ❌ | 246 | 253 ms |
| 10 | Haunter | beldum, metang, meganium | ❌ | ❌ | 246 | 269 ms |
| 11 | Granbull | shroomish, metang, dark vileplume | ❌ | ❌ | 246 | 234 ms |
| 12 | Staraptor | beldum, dark dragonite, gengar | ❌ | ❌ | 246 | 254 ms |
| 13 | Exeggcute | dunsparce, pidgey, oddish | ❌ | ❌ | 246 | 311 ms |
| 14 | Cyndaquil | beldum, metang, dunsparce | ❌ | ❌ | 246 | 281 ms |
| 15 | Cacnea | beldum, tentacool, pidgey | ❌ | ❌ | 246 | 251 ms |
| 16 | Charmander | energy search, shroomish, cradily | ❌ | ❌ | 246 | 422 ms |
| 17 | Mudkip | bagon, bagon delta species, beldum | ❌ | ❌ | 246 | 237 ms |

## Seed-bias reality check

v140 no longer allows duplicated hand-made seeds to win by taking the minimum of many attempts. As an offline approximation, the exact legacy hash formula was rerun on the 18 failure thumbnails while grouping seed examples by card and using their median distance. This is **not** a full v140 browser accuracy test because it excludes the rebuilt official-reference cache and Pillow/Canvas resampling may differ slightly.

Result: **4/18** correct Top-1 in the seed-only replay.

| # | Ground truth | Fair seed-only prediction | Distance | Correct |
|---:|---|---|---:|:---:|
| 0 | Oddish | oddish | 0.3507 | ✅ |
| 1 | Oddish | oddish | 0.3338 | ✅ |
| 2 | Bagon | bagon | 0.3719 | ✅ |
| 3 | Shelgon | metang | 0.3221 | ❌ |
| 4 | Mudkip | pidgey | 0.3470 | ❌ |
| 5 | Shelgon | metang | 0.3758 | ❌ |
| 6 | Omastar | remoraid | 0.3561 | ❌ |
| 7 | Chikorita | chikorita | 0.3613 | ✅ |
| 8 | Surskit | bagon | 0.3522 | ❌ |
| 9 | Gabite | beldum | 0.3929 | ❌ |
| 10 | Haunter | metang | 0.3882 | ❌ |
| 11 | Granbull | jirachi | 0.3902 | ❌ |
| 12 | Staraptor | jirachi | 0.3662 | ❌ |
| 13 | Exeggcute | remoraid | 0.3320 | ❌ |
| 14 | Cyndaquil | shellder | 0.3707 | ❌ |
| 15 | Cacnea | pidgey | 0.3507 | ❌ |
| 16 | Charmander | metang | 0.3894 | ❌ |
| 17 | Mudkip | metang | 0.3864 | ❌ |

## Conclusion

The fairness and lifecycle fixes are necessary, but they do not turn pHash/dHash/aHash into a production-grade general card recognizer. v140 is therefore labelled **FOUNDATION**, not “scanner solved”. The next recognition engine must be evaluated blind on unseen cards and must never receive one-off code paths for the test cards.
