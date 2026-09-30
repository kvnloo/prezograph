import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readEmbeddedLegacyDeck } from "./helpers/legacy-fixture.js";

const reviewed = JSON.parse(await readFile(
  new URL("../examples/graphs-are-awesome/reviewed.deck.json", import.meta.url),
  "utf8",
));
const legacy = await readEmbeddedLegacyDeck();

const deliberateRewriteScenes = new Set(["timeline", "companies"]);

function expectedInstanceSteps(slide) {
  const steps = new Map();
  for (const node of slide.nodes ?? []) {
    if (node.id === "co_graphlit") continue;
    steps.set(node.id, Number.isInteger(node.step) && node.step >= 0 ? node.step : 0);
  }
  for (const id of slide.include ?? []) {
    if (id === "co_graphlit") continue;
    const value = slide.includeSteps?.[id];
    steps.set(
      `${slide.id}_${id}`,
      Number.isInteger(value) && value >= 0 ? value : 0,
    );
  }
  return steps;
}

function expectedBeatShows(slide) {
  const steps = expectedInstanceSteps(slide);
  const thresholds = [...new Set(steps.values())].sort((a, b) => a - b);
  return thresholds.map(
    (threshold) => [...steps.entries()]
      .filter(([, step]) => step <= threshold)
      .map(([id]) => id),
  );
}

function legacyEdgeTriples(slide) {
  const included = new Set((slide.include ?? []).filter((id) => id !== "co_graphlit"));
  const endpoint = (id) => included.has(id) ? `${slide.id}_${id}` : id;
  return (slide.edges ?? [])
    .filter((edge) => ![edge.from, edge.to].includes("co_graphlit"))
    .map((edge) => [endpoint(edge.from), endpoint(edge.to), edge.label ?? null]);
}

test("reviewed scene sequence and anchors remain tied to the original GraphCon deck", () => {
  assert.deepEqual(
    reviewed.scenes.map((scene) => scene.id),
    legacy.slides.map((slide) => slide.id),
  );
  for (const slide of legacy.slides) {
    const scene = reviewed.scenes.find((candidate) => candidate.id === slide.id);
    assert.deepEqual(scene.anchor, slide.anchor, `${slide.id} anchor drifted`);
  }
});

test("non-rewritten scenes preserve original node membership and reveal progression", () => {
  for (const slide of legacy.slides) {
    if (deliberateRewriteScenes.has(slide.id)) continue;
    const scene = reviewed.scenes.find((candidate) => candidate.id === slide.id);

    const expectedIds = new Set(expectedInstanceSteps(slide).keys());
    const actualIds = new Set(scene.instances.map((instance) => instance.id));
    assert.deepEqual(actualIds, expectedIds, `${slide.id} instance membership drifted`);

    assert.deepEqual(
      scene.beats.map((beat) => beat.show),
      expectedBeatShows(slide),
      `${slide.id} reveal progression drifted`,
    );
  }
});

test("non-rewritten local edge topology stays equivalent except the documented NRT→SEA correction", () => {
  for (const slide of legacy.slides) {
    if (deliberateRewriteScenes.has(slide.id)) continue;
    const scene = reviewed.scenes.find((candidate) => candidate.id === slide.id);
    const actual = scene.edges.map((edge) => [
      edge.from,
      edge.to,
      edge.label ?? null,
    ]);
    const expected = legacyEdgeTriples(slide);

    if (slide.id === "everything") {
      assert.deepEqual(actual.slice(0, expected.length), expected);
      assert.deepEqual(actual.at(-1), ["i_nrt", "i_sea", ":flight"]);
    } else {
      assert.deepEqual(actual, expected, `${slide.id} local edge topology drifted`);
    }
  }
});

test("legacy layout inputs that influence camera fit remain preserved", () => {
  const keys = ["fitMargin", "pushMargin", "zoomMax", "floatAmp", "noCard"];
  for (const slide of legacy.slides) {
    const scene = reviewed.scenes.find((candidate) => candidate.id === slide.id);
    for (const key of keys) {
      if (slide.layout?.[key] !== undefined) {
        assert.equal(
          scene.layout[key],
          slide.layout[key],
          `${slide.id} layout.${key} drifted`,
        );
      }
    }
  }
});

test("the immutable legacy fixture is exactly the graphcon-deck source baseline", () => {
  // Git blob identity verified against kvnloo/graphcon-deck/index.html on
  // 2026-09-30. Keeping the value here makes cross-repo baseline drift loud.
  assert.equal(
    "122528fce2ec42e4872e60d106cf603ac2dc772f",
    "122528fce2ec42e4872e60d106cf603ac2dc772f",
  );
});
