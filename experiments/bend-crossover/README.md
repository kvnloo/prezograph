# Prezograph × Bend crossover: evidence-first profiling

**Status:** downstream-only CHECK; no runtime Bend integration or CUDA acceleration claim.
**Upstream author:** Yohei Nakajima, https://github.com/yoheinakajima/prezograph (MIT). This fork preserves the upstream's code, license and release profile.
**Owned paths:** `experiments/bend-crossover/` only. No changes to src/, schema, generated dist/, public promises or examples.

## Reason

Prezograph's reviewed presentation is a versioned JSON deck. Core compile and camera geometry use in-process JS; the browser's DOM/SVG rendering is a separate workload. Bend's JS target does not run these calculations on a GPU. Shipping a CUDA launcher inside a portable offline presentation would add a new native dependency and violate the product's current Profile A constraints.

The existing reviewed sample provides an honest first baseline without synthesizing 1M-node scenes that the supported schema/runtime do not promise.

## Run

```sh
node experiments/bend-crossover/profile.mjs
npm run check
```

The profiler warms up 20 iterations, measures 101 iterations of schema-valid compile + all-scene/beat bounds, and emits p50/p95 CPU timings as JSON. It does **not** measure browser paint, SVG layout, interaction latency, GPU, or end-to-end presentation performance. Results require a full local checkout; they were not run on the isolated connector host where this branch was created.

## Decision gate

1. Confirm a slow **supported** deck with real p95 user-visible performance impact.
2. Profile the JS compile/geometry/presentation paint and determine the actual dominant step. If compile/geometry is below an actionable budget, stop here.
3. Only for a large pure numeric operator: benchmark a standalone Bend 2.0.36 CPU/native CUDA implementation with independent output parity against `src/core/geometry.js` and native transfer/startup cost measured.
4. Preserve authored positions, scene-local instance IDs, explicit focus/reveal semantics, accessibility, no custom HTML execution, schema validation and portable single-file export.
5. Do not introduce native code or a runtime API for existing browser users without separate maintainer approval and validated requirement evidence.

Cross-project high-value alternate target: Yohei's `activegraph/packs/diligence` already contains deterministic investment-diligence fixtures, useful for snapshot/query experiments; it has an issues-first external contribution policy. `airtable_to_graph` downstream PR #4 independently benchmarks large synthetic relationship extraction. `kvnloo/hapsland/packages/agent-flow-bend` demonstrates the exact pinned Bend compiler/proof artifact pattern, while `kvnloo/z0intelligence` can log shadow performance evidence without making route decisions from unverified speed claims.
