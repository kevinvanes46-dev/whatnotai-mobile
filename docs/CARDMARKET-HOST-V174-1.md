# HoloKeep v174.1 Cardmarket host hotfix

Baseline: 73910a5693b05e9ae285aca8649895f905d04cab.

The v146 validator accepted prices.pokemontcg.io/cardmarket/{source_id} as an exact route. The UI also accepted that host as SEARCH. Cached redirects could survive 30 days. Saved Recent/Favorites and Collection entries could publish their original external URL before re-resolution.

The final host contract is HTTPS www.cardmarket.com only: a Singles product path, a positive integer Products?idProduct route, or Products/Search with a nonempty searchString. Userinfo, ports (including explicit :443), fragments, controls, spoofed hosts and other paths are rejected. Existing source/name/number/set validation is retained. A primary API redirect proceeds to the independent TCGdex stage; a validated idProduct yields a Cardmarket product URL, otherwise the existing contextual SEARCH fallback is used.

The route cache keeps cardscout_cm_route_cache_v146. Invalid entries are removed on read; valid entries survive, including when writing is denied. Invalid URLs cannot enter through the cache writer. Read denial still falls back safely. There is no blanket cache wipe or new storage key.

User-facing saved links are guarded without rewriting saved user data. The additional one-line change in ui-v137-collection.js is necessary because stored cardmarketUrl values previously bypassed the resolver. No collection schema or key changes. JP routing files, catalog definitions, cards.json, ui-v137-focus.js, pricing fundamentals, artwork, scanner, cloud and Supabase remain unchanged.

Brand: HoloKeep v174.1 · Beta. Cache: rareworth-shell-v174-1. Changed scripts have matching cache-busts and precache entries. The old v174 shell is removed; unrelated site caches and local user data are retained. External CacheStorage URLs: zero.

Validation retains all 206 v174 regressions and adds 23 hotfix tests. The existing 34 v146 resolver tests are now explicitly included in CI; their redirect acceptance case changes to rejection plus secondary-resolution, while identity/security assertions stay intact. Total CI count: 263. Synthetic idProduct 123456 is used only in mocked API responses, never as a production mapping.

Browser cases cover POP5 Mew δ for NM/EX/GD/PL, with and without secondary product data; old cached redirect cleanup; no external published URLs; saved Recent/Favorites/Collection links; untouched stored fields; JP Machamp; PWA cleanup and same-origin cache. Existing Azumarill and Bagon regressions remain included.

The isolated live-QA 180-second catalog timeout was not reproduced with frozen fixtures. Existing concurrency-six and immediately usable shell tests remain enabled. A valid 13-day EN cache loads without any EN set requests; after 15 days it refreshes. Classification: external/network transient, no production change. No live-network CI test or catalog/runtime performance refactor was added.
