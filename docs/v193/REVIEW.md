# v193 Cardmarket condition and official snapshot review

Base: `26196a5c7cacbce63a97ce3a115db6a347f56111` (origin/main, PR #9).
Branch: `feat/v193-cardmarket-nm-prices`. This document does not assert deployment.

## Root causes and changes

The library's v191 product-ID choices appended `language=1` but omitted the selected condition. The v192 language fix therefore still allowed Poor offers. The legacy `withFilters` builder already knew NM=2, but did not default an empty preference and appended duplicate parameters. Website parameters are numeric, unlike the authenticated API's string codes.

The library now forwards the current condition without changing the stored card. Mint/M/MT=1, NM=2, EX=3, GD=4, LP=5, PL=6, PO=7. Empty preference defaults to NM. Unsupported library conditions produce a broad search instead. Broad fallbacks do not claim condition filtering. EN stays language=1; JP product routing remains separate. Legacy exact URLs replace duplicate filters. Unlimited and first-edition library choices use separate edition filters; reverse choices remain separate from ordinary prints even when Cardmarket shares a product ID.

Production market-v176 is intentionally disabled. The v188 bridge is localhost-only. The new production orchestration reuses the v186 checksum-verified feed and quote engine; it never uses TCGdex numeric prices or turns the legacy engine on. TCGdex supplies identity metadata only. A price requires matching source ID, number, name, reviewed expansion, a unique ordinary detailed variant and official product ID. Japanese, stamped, reverse, first-edition and ambiguous matches remain unavailable.

Detailed selections show EUR, Cardmarket, trend, snapshot timestamp and age status, explicitly stating that condition, language and edition are not processed by the aggregate. The source is a daily aggregate, not a live seller offer. The collection subtotal uses only separately checked cards held in memory during this session, with exact identity/edition matching and explicit uncovered counts. The subtotal performs no network requests. There are no collection, cost-basis, cloud, history or legacy-cache writes. No synthetic historical graph is created from one publication day.

## Independent source evidence (2026-10-24)

- [Cardmarket publication announcement](https://news.cardmarket.com/en/Magic/were-making-the-price-guide-and-product-catalogue-available-for-download): public files, price guide updated daily.
- [Cardmarket's own application-use statement](https://insight.cardmarket.com/en/Articles/scryfall-x-cardmarket): applications can import the public files without extra permission or an access point.
- Official downloads: `https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_6.json` and `https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_6.json`.
- Existing importer successfully downloaded and validated 66,837 matched products. Catalog timestamp: 2026-10-24T09:13:34.000Z; guide timestamp: 2026-10-24T00:45:46.000Z. All 256 shards passed the existing audit. See `source-audit.json`.
- The real browser opened `https://www.cardmarket.com/en/Pokemon/Products?idProduct=273698&language=1&isFirstEd=N&minCondition=2`. It redirected to `/en/Pokemon/Products/Singles/Base-Set/Chansey-V1-BS3?language=1&isFirstEd=N&minCondition=2`. DOM-backed form inspection returned `minCondition=2` and `extra[isFirstEd]=N`; the heading was Chansey (BS 3), Base Set. Visible offers were NM/MT and English. The site's condition options explicitly mapped Mint through Poor to 1 through 7.
- Public TCGdex `base1-3` identified ordinary holo unlimited product 273698 and distinct shadowless product 660225. The checked-in identity fixture removes all upstream numeric price fields. Browser regression fixtures are deterministic test inputs, not evidence of live provider access.
- Chansey's staged official ordinary trend is EUR 30.98. The website can display a different later value; the app labels the dated snapshot instead of claiming a live listing price.

## Actual coverage and limitations

63,907 source rows have an ordinary trend; this is **not** 63,907 verified app cards. The reviewed price expansion allowlist covers Base Set, English 151 and Japanese 151. JP remains blocked by the identity rules. Actual availability additionally requires a unique supported detailed variant. Only Chansey Unlimited has been exercised end to end against this downloaded snapshot in this change; do not claim complete set coverage.

No historical series was imported. Existing history storage remains untouched. No condition-specific, language-specific or edition-specific valuation is claimed. The old home portfolio total remains disabled; the separate local coverage summary is explicit about its limited scope. A reload clears the new session-only observations.

The snapshot becomes ageing after 36 hours and unavailable after 72 hours. Price data are deliberately excluded from the offline shell cache: offline source checks fail closed. The app shell remains covered by its existing offline lifecycle tests.

## Updates and release gate

The manual, read-only `Official Cardmarket snapshot candidate` workflow builds and audits a fresh artifact using the existing importer. It cannot commit, push, merge or deploy. A reviewer can copy its 257 guide files into `cardmarket-public-v193/`, copy the audit to `docs/v193/source-audit.json`, run the v186/v193 tests and propose a reviewed data update. Publish a complete snapshot together; mixed generations fail checksum validation. Git history preserves previous snapshots for rollback.

Automatic daily repository writes and PR creation were rejected by automatic approval review as ongoing external actions beyond this turn's authorization. Until an approved daily publishing mechanism exists, maintaining fresh production prices requires reviewed updates; unattended continuous price availability is **not delivered**. Do not deploy and forget this snapshot. No new paid provider or credentials are required for the verified public download path.

A collection-wide TCGdex lookup was also rejected by automatic approval review because it would disclose private holdings. The implemented coverage summary instead uses only locally held observations and sends no collection identifiers.

Merge and deployment require review, green PR checks and explicit user approval. They are not performed by this change.
