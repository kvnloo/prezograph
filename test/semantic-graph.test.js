import test from "node:test";
import assert from "node:assert/strict";
import { compileDeck, serializeDeck } from "../src/core/compile.js";
import {
  semanticGraphCanonicalJson,
  semanticGraphSnapshot,
} from "../src/core/semantic-graph.js";

function fixture() {
  return {
    schemaVersion: "2.0",
    meta: { title: "Fingerprint fixture" },
    entities: {
      b: { title: "Beta", source: "https://example.test/b" },
      a: { title: "Alpha" },
    },
    scenes: [
      {
        id: "one",
        title: "One",
        anchor: [100, 200],
        instances: [
          { id: "one_a", entity: "a", pos: [0, 0], kind: "hub" },
          { id: "one_b", entity: "b", pos: [120, 0] },
        ],
        edges: [
          {
            id: "local",
            from: "one_a",
            to: "one_b",
            label: "depends on",
            kind: "light",
            curve: 0.2,
          },
        ],
        beats: [{ id: "first", show: ["one_a"], focus: ["one_a"] }],
        layout: { fitMargin: 90 },
      },
      {
        id: "two",
        title: "Two",
        anchor: [900, 1200],
        instances: [{ id: "two_a", entity: "a", pos: [10, 20] }],
        beats: [{ id: "all", show: ["two_a"] }],
      },
    ],
    connections: [
      {
        id: "cross",
        from: "one_b",
        to: "two_a",
        label: "flows to",
        kind: "cross",
        curve: -0.2,
      },
    ],
  };
}

test("semantic snapshot excludes presentation-only state", () => {
  const deck = fixture();
  const changed = structuredClone(deck);

  changed.meta.title = "Different presentation title";
  changed.scenes[0].title = "Different scene title";
  changed.scenes[0].anchor = [9999, -9999];
  changed.scenes[0].instances[0].pos = [500, 500];
  changed.scenes[0].instances[0].kind = "accent";
  changed.scenes[0].edges[0].kind = "bold";
  changed.scenes[0].edges[0].curve = 0.9;
  changed.scenes[0].beats = [{
    id: "different",
    show: ["one_a", "one_b"],
    focus: ["one_b"],
  }];
  changed.scenes[0].layout = { fitMargin: 500 };
  changed.scenes[0].overlay = { title: "Overlay" };

  assert.equal(
    semanticGraphCanonicalJson(changed),
    semanticGraphCanonicalJson(deck),
  );
});

test("semantic snapshot changes for identity, content, or topology changes", () => {
  const original = semanticGraphCanonicalJson(fixture());

  const content = fixture();
  content.entities.a.title = "Changed meaning";
  assert.notEqual(semanticGraphCanonicalJson(content), original);

  const identity = fixture();
  identity.scenes[0].instances[0].entity = "b";
  assert.notEqual(semanticGraphCanonicalJson(identity), original);

  const topology = fixture();
  topology.scenes[0].edges[0].to = "one_a";
  assert.notEqual(semanticGraphCanonicalJson(topology), original);

  const label = fixture();
  label.connections[0].label = "contradicts";
  assert.notEqual(semanticGraphCanonicalJson(label), original);
});

test("object key order does not change canonical graph identity", () => {
  const deck = fixture();
  const reordered = structuredClone(deck);
  reordered.entities = {
    a: reordered.entities.a,
    b: reordered.entities.b,
  };

  assert.equal(
    semanticGraphCanonicalJson(reordered),
    semanticGraphCanonicalJson(deck),
  );
});

test("compile and serialization cycles preserve semantic graph identity", () => {
  const deck = fixture();
  const expected = semanticGraphCanonicalJson(deck);

  let compiled = compileDeck(deck);
  for (let cycle = 0; cycle < 3; cycle += 1) {
    assert.equal(semanticGraphCanonicalJson(compiled.deck), expected);
    compiled = compileDeck(JSON.parse(serializeDeck(compiled)));
  }
});

test("snapshot exposes authored ids for future projection accounting", () => {
  const snapshot = semanticGraphSnapshot(fixture());
  assert.deepEqual(
    snapshot.scenes[0].instances.map((instance) => instance.id),
    ["one_a", "one_b"],
  );
  assert.deepEqual(
    snapshot.scenes[0].edges.map((edge) => edge.id),
    ["local"],
  );
  assert.deepEqual(snapshot.connections.map((edge) => edge.id), ["cross"]);
});
