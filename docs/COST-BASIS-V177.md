# HoloKeep v177 — known costs and indicative comparison

`cost-basis-v177.js` is a pure CommonJS/browser module (`HoloKeepCostBasis`).
It uses the unchanged v176 eligibility policy; no network or persistence is added.

## User-owned cost basis

An additive collection field holds `{version:177, method:"WEIGHTED_AVERAGE",
knownQty, total, currency:"EUR"}`. Quantity is integral and knownQty cannot exceed
the position quantity. Total is finite and nonnegative; zero known quantity must
have zero total. Invalid data remains physically preserved but is excluded from
calculations. Unknown fields survive edits and import/export.

Status is derived: CONFIRMED for all quantities known, PARTIAL for some known,
UNKNOWN for none, LEGACY_UNCONFIRMED when no valid basis exists but paidEach does.
Legacy amounts never become trusted merely by opening/saving the editor or by a
metadata edit. Explicit confirmation applies the old average to the entire current
quantity. Ignore/clear writes an empty basis while retaining the legacy paidEach.

## Acquisitions and reductions

New known purchases add quantity and `quantity * unitCost` to known costs. A blank
price adds unknown quantity only. Explicit zero is a real known free purchase.
Totals retain numeric precision; display formatting alone rounds averages.
For example 1×10 + 1×20 = total 30 / average 15; 3×10 + 2×25 = total 80 / average 16.

Adding to unconfirmed legacy counts only the new purchase, with the old paidEach
physically retained. The acquisition editor explains that earlier unknown costs
remain unknown. paidEach is only a compatibility value, never authoritative.

Plus opens an acquisition editor without modifying storage until Save. Confirmed
minus removes one weighted-average share. Unknown minus reduces quantity safely.
Partial minus requires choosing a known-cost or unknown-cost exemplar. Legacy
minus requires confirm/ignore first. Inline minus never reduces below one.
This is portfolio average-cost accounting, not a sale or a claim about a physical lot.

Ordinary metadata saves preserve costBasis exactly. Quantity is locked in those
edits. `Kostenbasis aanpassen` explicitly replaces the full position's average and
quantity. `Aankoopkosten wissen` clears known costs without deleting the card or
market cache. Acquisition undo restores the full previous item, including basis,
quantity, paidEach and unknown fields.

## Wishlist decision

New Wishlist items have no cost basis. As explicitly approved by the user, moving
an existing position to Wishlist preserves dormant historical costs, excluded from
all totals/comparisons. Converting to purchased asks for quantity and optional price
again; a blank new price creates UNKNOWN. No silent reuse of old costs occurs.

## Comparable subsets

Only `HoloKeepMarket.eligible(entry)` prices can be compared. Comparable quantity is
knownQty, never the full quantity of a partially known position. Comparable value
is unit market price × knownQty; difference subtracts the known cost total. Percentage
is difference / comparable cost × 100, or null when cost is zero. Portfolio totals
sum comparable differences and costs before dividing, never average percentages.
Free items contribute euro differences but add zero to the denominator.

REFERENCE_ONLY, UNAVAILABLE and unvalidated legacy market prices never produce a
comparison. Existing v176 freshness notices remain visible; general market prices
do not account for condition. The UI says “Indicatief verschil”, with explicit
quantity coverage. It makes no realized-profit, tax, sales or transaction-history claim.

## Storage, cloud and offline

The existing collection key is unchanged. There is no separate cost-storage key.
Backups and the existing cloud canonical JSON include costBasis as ordinary user
data. Cost edits change the signature; market refreshes do not. Cloud protocol,
conflicts, backend, auth, routes and market-v176.js are unchanged. Frozen tests
cover exact import/export and undo, unknown/malformed data, cloud signatures,
mobile flows and service-worker offline reload. The v177 shell precaches the new
module and never caches external API responses.
