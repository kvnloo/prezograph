import test from "node:test";
import assert from "node:assert/strict";
import { semanticGraphCanonicalJson } from "../src/core/semantic-graph.js";
import {
  expandProjectionNodeIds,
  projectSceneSemanticGraph,
  projectionAuthoredEdgeIds,
} from "../src/core/semantic-projection.js";

function fixture() {
  return {
    schemaVersion: "2.0",
    meta: { title: "Projection fixture" },
    entities: {
      a: { title: "A" },
      b: { title: "B" },
      c: { title: "C" },
      d: { title: "D" },
    },
    scenes: [{
      id: "one",
      title: "One",
      anchor: [0, 0],
      instances: [
        { id: "a1", entity: "a", pos: [0, 0] },
        { id: "b1", entity: "b", pos: [10, 0] },
        { id: "c1", entity: "c", pos: [20, 0] },
        { id: "d1", entity: "d", pos: [30, 0] },
      ],
      edges: [
        { id: "ab", from: "a1", to: "b1", label: "inside" },
        { id: "bc", from: "b1", to: "c1", label: "out" },
        { id: "da", from: "d1", to: "a1", label: "in" },
        { id: "cd", from: "c1", to: "d1", label: "outside" },
      ],
      beats: [{ id: "all", show: ["a1", "b1", "c1", "d1"] }],
    }],
    connections: [],
  };
}

function project(deck = fixture()) {
  return projectSceneSemanticGraph(deck, {
    sceneId: "one",
    aggregateId: "cluster_ab",
    memberNodeIds: ["a1", "b1"],
  });
}

test("one aggregate collapses members without mutating authored graph identity", () => {
  const deck = fixture();
  const before = semanticGraphCanonicalJson(deck);
  const original = structuredClone(deck);

  const projection = project(deck);

  assert.equal(semanticGraphCanonicalJson(deck), before);
  assert.deepEqual(deck, original);
  assert.deepEqual(projection.visibleNodeIds, ["c1", "d1", "cluster_ab"]);
  assert.deepEqual(projection.suppressed, {
    nodeIds: ["a1", "b1"],
    edgeIds: ["ab"],
  });
});

test("expanding the aggregate recovers every authored scene node id", () => {
  const projection = project();
  assert.deepEqual(
    new Set(expandProjectionNodeIds(projection)),
    new Set(["a1", "b1", "c1", "d1"]),
  );
});

test("every local authored edge is explicitly rendered or suppressed", () => {
  const projection = project();

  assert.deepEqual(
    new Set(projectionAuthoredEdgeIds(projection)),
    new Set(["ab", "bc", "da", "cd"]),
  );

  assert.deepEqual(
    projection.renderedEdges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      representedEdgeIds: edge.representedEdgeIds,
    })),
    [
      { from: "cluster_ab", to: "c1", representedEdgeIds: ["bc"] },
      { from: "d1", to: "cluster_ab", representedEdgeIds: ["da"] },
      { from: "c1", to: "d1", representedEdgeIds: ["cd"] },
    ],
  );
});

test("projection is byte-deterministic for equal input", () => {
  assert.equal(JSON.stringify(project()), JSON.stringify(project()));
});

test("missing authored edge ids receive deterministic local references", () => {
  const deck = fixture();
  delete deck.scenes[0].edges[0].id;

  const projection = project(deck);
  assert.deepEqual(
    projection.suppressed.edgeIds,
    ["scene:one:edge:0"],
  );
});

test("invalid aggregate membership fails before producing a projection", () => {
  assert.throws(
    () => projectSceneSemanticGraph(fixture(), {
      sceneId: "one",
      aggregateId: "cluster",
      memberNodeIds: ["a1", "missing"],
    }),
    /unknown scene instance/,
  );
  assert.throws(
    () => projectSceneSemanticGraph(fixture(), {
      sceneId: "one",
      aggregateId: "a1",
      memberNodeIds: ["a1", "b1"],
    }),
    /collides/,
  );
});
