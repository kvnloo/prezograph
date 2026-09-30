import test from "node:test";
import assert from "node:assert/strict";
import { collectDeckStats } from "../src/core/stats.js";

test("stats expose authored graph coverage without treating hidden content as loss", () => {
  const deck = {
    schemaVersion: "2.0",
    meta: { title: "Coverage fixture" },
    entities: {
      shared: { title: "Shared" },
      hidden: { title: "Hidden" },
      unused: { title: "Unused" },
    },
    scenes: [
      {
        id: "one",
        title: "One",
        instances: [
          { id: "one_shared", entity: "shared", pos: [0, 0] },
          { id: "one_hidden", entity: "hidden", pos: [100, 0] },
        ],
        edges: [{ from: "one_shared", to: "one_hidden" }],
        beats: [{ id: "first", show: ["one_shared"] }],
      },
      {
        id: "two",
        title: "Two",
        instances: [{ id: "two_shared", entity: "shared", pos: [0, 0] }],
        edges: [],
        beats: [{ id: "first", show: ["two_shared"] }],
      },
    ],
    connections: [{ from: "one_hidden", to: "two_shared" }],
  };

  assert.deepEqual(collectDeckStats(deck), {
    schemaVersion: "2.0",
    entities: 3,
    scenes: 2,
    beats: 2,
    instances: 3,
    edges: 2,
    authoredContent: {
      placedEntities: 2,
      unplacedEntities: ["unused"],
      neverShownInstances: ["one_hidden"],
      localEdges: 1,
      crossSceneEdges: 1,
    },
    valid: true,
    issues: [],
  });
});

test("stats tolerate missing optional collections for invalid-deck diagnostics", () => {
  const stats = collectDeckStats(
    { schemaVersion: "2.0", entities: {}, scenes: [] },
    { valid: false, issues: [{ path: "$.connections", message: "required" }] },
  );

  assert.equal(stats.edges, 0);
  assert.deepEqual(stats.authoredContent, {
    placedEntities: 0,
    unplacedEntities: [],
    neverShownInstances: [],
    localEdges: 0,
    crossSceneEdges: 0,
  });
  assert.equal(stats.valid, false);
  assert.equal(stats.issues.length, 1);
});
