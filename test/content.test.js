import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const deck = JSON.parse(
  await readFile(new URL("../examples/graphs-are-awesome/deck.json", import.meta.url), "utf8"),
);

test("example narrative has twelve scenes and explicit beats", () => {
  assert.equal(deck.scenes.length, 12);
  assert.equal(deck.scenes.reduce((sum, scene) => sum + scene.beats.length, 0), 38);
  assert.equal(deck.scenes.at(-2).id, "open-source");
  assert.equal(deck.scenes.at(-1).id, "close");
});

test("shared facts use local visual instances", () => {
  const title = deck.scenes.find((scene) => scene.id === "title");
  const companies = deck.scenes.find((scene) => scene.id === "companies");
  assert.ok(title.instances.some((instance) =>
    instance.id === "title_mem0" && instance.entity === "co_mem0",
  ));
  assert.ok(companies.instances.some((instance) =>
    instance.id === "co_mem0" && instance.entity === "co_mem0",
  ));
});

test("company corrections and disclosure are locked", () => {
  assert.equal(deck.entities.co_metaphacts.sub, "Acquired by Digital Science · Jan 2023");
  assert.match(deck.entities.co_graphwiseontot.sub, /Ontotext \+ Semantic Web Company/);
  assert.match(deck.entities.co_mem0.sub, /\$24M raised/);
  assert.doesNotMatch(deck.entities.co_mem0.body, /\bdefault\b/i);
  assert.match(deck.entities.co_linkurious.sub, /acquired 2026/);
  assert.equal(deck.entities.co_whyhowai, undefined);

  const companies = deck.scenes.find((scene) => scene.id === "companies");
  assert.match(companies.caption, /as of July 24, 2026/i);
  assert.match(companies.caption, /portfolio/i);
  assert.ok(companies.instances.some((instance) => instance.entity === "co_neptune"));
  assert.ok(companies.instances.some((instance) => instance.entity === "co_spanner_graph"));
});

test("all rendered instances are unique and every dated source has a review date", () => {
  const ids = deck.scenes.flatMap((scene) => scene.instances.map((instance) => instance.id));
  assert.equal(new Set(ids).size, ids.length);
  for (const entity of Object.values(deck.entities)) {
    if (entity.source) {
      assert.match(entity.source, /^https?:\/\//);
      assert.match(entity.sourceDate, /^\d{4}-\d{2}-\d{2}$/);
    }
  }
});
