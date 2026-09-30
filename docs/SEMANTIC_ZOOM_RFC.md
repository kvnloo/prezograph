# Downstream RFC: loss-aware semantic zoom

Status: exploratory proposal in the fork; not an upstream contract.

## Problem

Prezograph's approved direction includes semantic zoom, viewport culling, routes,
and Explore mode. Those features create a subtle integrity risk: a renderer may
hide or collapse authored content for readability and accidentally turn that
presentation decision into semantic data loss.

The core distinction should stay explicit:

- the authored semantic graph is truth;
- a zoom level is a deterministic projection of that graph;
- omitted-at-this-level is not deleted;
- expanding a summary must recover the same member identities and edges.

This proposal is intentionally about the projection contract, not visual style.

## Proposed invariant

For authored graph `G`, presentation context `C`, and semantic zoom level
`L`:

```
P = project(G, C, L)
```

`project` may change visibility, aggregation, labels, and rendered edge
density. It must not mutate `G`, mint replacement semantic identities for
existing nodes, or silently discard membership needed to reverse a collapse.

A projection therefore carries enough provenance to answer:

1. which authored nodes does this rendered node represent?
2. which authored edges are represented, suppressed, or summarized?
3. can the next-more-detailed projection recover those identities exactly?

## Minimal projection shape

A future compiler experiment could produce an internal value like:

```js
{
  level: "system",
  visibleNodeIds: ["agent-runtime", "memory"],
  visibleEdgeIds: ["runtime-memory"],
  aggregates: [
    {
      id: "aggregate:memory",
      memberNodeIds: ["fts5", "tencentdb", "jsonl"],
      representedEdgeIds: ["memory-fts5", "memory-tencentdb"]
    }
  ],
  suppressed: {
    nodeIds: [],
    edgeIds: ["fts5-jsonl"]
  }
}
```

The exact schema is not proposed as public API. The important part is explicit
membership and suppression rather than destructive simplification.

## Suggested semantic levels

The names are illustrative; decks should not be forced into one ontology.

- **system** — major subsystems / route landmarks;
- **component** — services, agents, stores, or clusters;
- **node** — authored semantic nodes and meaningful edges;
- **detail** — evidence, metadata, source details, annotations.

A deck may map several adjacent levels to the same output. Zoom level is a
rendering policy, not a requirement to fabricate hierarchy.

## Edge policy

Collapsing nodes creates the hardest ambiguity. A first implementation should
prefer conservative rules:

- internal edges inside one aggregate may be suppressed but remain enumerated;
- an authored edge crossing aggregate boundaries becomes a rendered aggregate
  edge only when its membership can be traced back to authored edge ids;
- parallel authored edges may render as one summary edge, but the summary keeps
  the full represented-edge list;
- no semantic edge is inferred merely because two nodes share an aggregate.

## Interaction with routes and Explore mode

Routes choose narrative state. Semantic zoom chooses rendering detail. They
should remain orthogonal.

- changing zoom must not advance a cue;
- Explore mode may change viewport and detail level without modifying the
  compiled route;
- returning from Explore restores the same route-relative cue and semantic
  identities;
- route compilation happens before semantic projection.

## First implementation slice

Do not begin in the renderer.

1. Add a pure `projectSemanticGraph(...)` experiment over compiled fixtures.
2. Keep the authored deck object byte-stable before/after projection.
3. Start with only one reversible collapse rule.
4. Expose projection diagnostics in tests, not public copy.
5. Integrate with rendering only after the projection tests are stable.

## Acceptance evidence

A useful first gate would prove:

- projection never mutates authored input;
- repeated projection with equal inputs is byte-deterministic;
- every aggregate lists all represented authored node ids;
- expanding an aggregate recovers the same node ids;
- represented/suppressed authored edge ids form an explicit accounting;
- route/cue position is unchanged by zoom;
- a dense synthetic graph demonstrates reduced mounted/rendered work without
  changing the authored graph fingerprint.

## Non-goals

- automatic ontology induction;
- LLM-generated grouping in the rendering hot path;
- changing schema-v2 public promises;
- choosing final zoom thresholds;
- replacing slide-local layout work;
- making aggregates editable semantic nodes.

## Why this is worth separating now

The existing execution order correctly places fixtures and deterministic layout
before semantic zoom. Writing the projection invariant now gives those later
performance features a target that preserves the project's central thesis:
**one graph, many views, many routes** without letting a view become a lossy
rewrite of the graph.
