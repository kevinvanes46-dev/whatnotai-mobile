# HoloKeep v179 — Home and app shell

Baseline: c9b9945d2b490d4e830139f52dda9481c7127ca0.

## Navigation and hierarchy

Five primary destinations: Home, Zoeken, Collectie, Recent, Instellingen. At
320/375/390/430 CSS px each target measures at least 44 by 44 px, labels remain
single-line and the bar does not overflow. Recent remains directly accessible;
its original data, search-history cards and interactions are unchanged.

Home is the default for a bare URL and the PWA start URL. Explicit deep links
such as #search remain valid. The existing generic tab controller handles Home;
its implementation is unchanged. The brand button returns to Home. The real
session-only launch gate continues to control access, including offline guests.

The visual order is context and search action, collection snapshot, quiet attention
link, then recent additions. Near-black, deep green and mint, simple local SVGs,
12/14/16/20/32px type hierarchy and 4/8/12/16/24px spacing keep it restrained.
No charts, invented performance deltas, neon, remote icon libraries or splash delay.

## Data and honest states

home-v179.js reads existing collection and market cache. Each render calls
HoloKeepPortfolioInsights.derive exactly once with HoloKeepCostBasis and
HoloKeepMarket. Its summary is passed through, without alternative financial
calculations. Market observations use the existing identity validation. Cache
JSON is read once; validated entries are memoized per identity. No per-item
network calls. Recent sorting is O(n log n), not quadratic.

- Empty or Wishlist-only: first-card invitation, no finance blocks.
- Owned but no eligible observations: count, em dash and an honest no-price message.
- Priced but unknown costs: value with coverage, em dash for costs/result and a
  prompt to add purchase prices.
- Populated: owned quantity, indicative value, known costs and signed comparable
  difference. Separate price/cost/comparison coverage. A known zero cost stays zero;
  a missing value never becomes a fictitious zero.
- JP reference prices and Wishlist never enter owned financial totals or rankings.

Attention uses the existing deduplicated, priority-ordered v178 result and at most
two distinct causes. Its navigation handoff clears previous collection filters
and activates the existing attention control. A recent item opens the existing
collection editor by UID. No duplicate editor or price UI.

## Recent additions and artwork

Home shows up to four unique **owned collection additions**, newest addedAt first,
with deterministic input-order ties. Identity includes the existing market identity
plus condition; repeated rows do not crowd out distinct cards. Wishlist is omitted
because this section describes cards already collected. The separate Recent tab
continues to contain search history and retains all of its functionality/data.

Only an already stored HTTPS assets.tcgdex.net image is used; JP requires a /ja/
path. Missing or unsafe artwork becomes a quiet HK placeholder. Home never calls
CardArtwork lookup, provider endpoints or the JP external artwork resolver.

## Navigation, accessibility and offline

Buttons have explicit names, visible keyboard outlines and at least 44px targets.
Result sign is text, not color alone. Long names wrap/clamp in their own columns;
full names remain in the accessible button label. Navigation honors safe areas.
Home refreshes on entry, hash navigation, cross-tab storage updates and existing
collection render updates. It does not write collection or a new persistent key.

All Home assets are same-origin precached by rareworth-shell-v179. The PWA start
URL is ./#home; manifest identity is unchanged. Old shell caches are cleaned by the
unchanged worker lifecycle. Offline Home uses only local observations and records.

## Protected scope and validation

NO_GO_SHARED_HISTORY remains active. No history, charts, alerts, push, provider,
backend, Supabase, Auth or schema work. All baseline root production files except
the exact shell allowlist are compared with line-ending normalization in the new
scope test. market-v176.js, cost-basis-v177.js, portfolio-insights-v178.js,
app-v137.js, search, routing, JP and cloud engines remain identical after checkout
line-ending normalization.

The only collection module change exposes two navigation handoffs. Historical
scope tests reverse these exact strings, then retain their original comparisons.
Existing assertions remain; navigation expectations now include Home, version
expectations are v179, and historical Search tests enter #search explicitly.

New deterministic Node/Chromium tests cover empty/priced/no-market/no-cost states,
exact summary reuse, quantities and partial costs, attention, latest four unique
cards, read-only storage, JP/Wishlist exclusion, safe thumbnails, one derive pass,
no extra provider requests, offline/cache lifecycle, keyboard navigation and
all four mobile widths. Visual captures cover Home states, gate, Search, Collection,
Recent and Settings. Existing v171.1 tests cover real session/auth gate semantics.

Screenshots are validation artifacts in the local temp directory (holokeep-v179-*),
not production assets. The existing untracked artwork patch is never accessed.

## Resume validation (2026-10-17)

All 405 existing CI tests and 19 Home tests passed locally (424 total).
The interrupted brand document was repaired from its exact v178 preamble,
retaining the current inventory. A stale PWA test update fixture was corrected
from v178-test to v179-test without removing lifecycle assertions.
Home tests use a fixed clock and additionally exercise natural Tab/Shift+Tab,
Enter/Space activation, offline navigation, provider-free tab changes, label
fit and scrolling recent cards above the fixed navigation.

Viewport screenshots for nine states at 320/375/390/430 were visually reviewed.
Long card names intentionally clamp; full names remain in accessible labels.
In states with explanatory text, recent additions may require scrolling.
Artwork requests use deterministic image mocks in browser fixtures.
Safe-area CSS is retained and checked; physical notch-device/Safari standalone
behavior has not been certified by these desktop Chromium checks.
This is an accessibility smoke test, not a WCAG certification.
No HoloDex rebrand or beta-readiness expansion is included.
