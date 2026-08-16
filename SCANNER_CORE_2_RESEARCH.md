# CardScout Scanner Core 2 — Research Decision Record

## Goal

Replace v130's perceptual-hash matcher with a scanner that generalizes to unseen cards, remains fast on iPhone, works without a paid per-scan API, and can be used in a future commercial CardScout release without accidentally importing copyleft/research-only model terms.

## What proven scanners are doing

### CollectorVision

- Browser/mobile-first card identification pipeline.
- Detect/dewarp card, create a learned 128-dimensional embedding, nearest-neighbour search against a reference catalog, optional multi-frame voting/rotation handling.
- Publishes Pokémon catalogs, but currently labels non-MTG/Pokémon support as experimental.
- Current project/model licensing is AGPL-3.0; commercial licenses are offered separately.
- Decision: **excellent architecture/benchmark reference; do not copy/embed current code or weights in a closed commercial build without a commercial license.**

### TCG-AR

- Research system for Pokémon cards using oriented card detection, orientation correction and ArcFace metric-learning embeddings with nearest-neighbour lookup over a 20k+ catalog.
- Published real-evaluation identification numbers: 85.1% Top-1 and 96.2% Top-5; higher when candidate space is restricted to a deck.
- GPL-3.0 and desktop/GPU oriented.
- Decision: **strong evidence that metric learning + nearest-neighbour is the right technical direction, not a browser drop-in.**

### The Tin

- Real iOS collector app; scanning combines on-device OCR with a downloadable visual fingerprint pack.
- Fingerprint pipeline uses ORB descriptors + a vector-quantized codebook and maintains real-card test images with ground truth.
- AGPL-3.0.
- Decision: **useful second architecture reference, especially for offline/iPhone behavior and regression testing; do not copy code into a closed app.**

### TCGdex

- Multi-language Pokémon TCG database with EN/JA support and images/metadata.
- Database is MIT licensed and actively backfills older sets including Diamond & Pearl-era data.
- Decision: **preferred metadata/catalog source candidate.** Legal review is still required for redistribution of Pokémon artwork; a database license is not automatically an artwork license.

### Apple MobileCLIP

- Technically attractive mobile embedding family and has an iOS demo.
- Current pretrained model weights are under Apple ML Research Model terms restricting them to research purposes.
- Decision: **not suitable as the production commercial CardScout weight source.**

## v150 target architecture

1. Keep the existing CardScout camera guide + card crop/dewarp if real-device tests confirm it remains reliable.
2. One canonical full catalog for Smart Search, scanner candidates and learning.
3. Compact **CardScout-owned or commercially licensed** image embedding model, ideally MobileNet/MobileViT-class, trained with ArcFace/triplet-style metric learning on card crops.
4. Precompute one or more reference embeddings per catalog card offline; ship/download a compact index.
5. Query embedding on-device in browser; nearest-neighbour Top-K search.
6. Use 2–3 consecutive frames to vote rather than trusting one frame.
7. OCR only as verification for title/collector-number/variant, not as the primary recognizer.
8. Persistent CardScout Learning Memory adds user-confirmed real-camera embeddings/fingerprints and corrections without retraining the whole base model.
9. Confidence gate: high confidence may auto-open Cardmarket; low confidence shows Top 3; missing card allows one-time manual name/set/number and then learns it.
10. Every model/index version is content-hashed. Old/stale indexes must never be considered “ready”.

## Release benchmark required before calling scanner solved

- Blind test cards not used to tune thresholds or learning memory.
- Separate era buckets: WotC, EX/e-Reader, Diamond & Pearl/POP, modern, JP.
- Real camera variables: sleeves, glare, angle, handwriting/stickers, poor framing, upside-down.
- Report Top-1, Top-3/5, false auto-accept rate, median/p95 latency and no-match rate.
- No per-test-card exceptions in source code.
- Target should prioritize **very low confident-wrong rate** over forcing a result every time; manual fallback is acceptable.

## Why v140 stops before neural integration

The strongest currently available Pokémon-specific open implementations found in this audit are AGPL/GPL or have research-only model terms. Shipping one silently would create a licensing problem for the planned commercial app. v140 therefore fixes the foundation and learning layer first. v150 should either (a) obtain a commercial license for a proven model, or (b) train/export a CardScout-owned compact metric-learning model from a legally reviewed reference pipeline.
