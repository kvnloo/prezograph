import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectDeckStats } from "../src/core/stats.js";

const cli = fileURLToPath(new URL("../cli/prezograph.mjs", import.meta.url));

const invalidDeck = () => ({
  schemaVersion: "2.0",
  meta: { title: "Null instance fixture" },
  entities: { shared: { title: "Shared" } },
  scenes: [
    {
      id: "one",
      title: "One",
      anchor: [0, 0],
      instances: [{ id: "one_shared", entity: "shared", pos: [0, 0] }, null],
      edges: [],
      beats: [{ id: "first", show: ["one_shared"] }],
    },
  ],
  connections: [],
});

test("stats CLI reports validation issues for a deck with a null instance", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "prezograph-stats-"));
  try {
    const file = path.join(dir, "invalid.deck.json");
    await writeFile(file, JSON.stringify(invalidDeck()));

    const run = spawnSync(process.execPath, [cli, "stats", file], {
      encoding: "utf8",
    });

    assert.doesNotMatch(run.stderr, /TypeError/);
    assert.equal(run.status, 1);
    const stats = JSON.parse(run.stdout);
    assert.equal(stats.valid, false);
    assert.equal(stats.instances, 2);
    assert.deepEqual(stats.issues, [
      { path: "scenes[0].instances[1]", message: "must be an object" },
    ]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("stats tolerate a null instance in a scene without beats", () => {
  const deck = invalidDeck();
  delete deck.scenes[0].beats;

  const stats = collectDeckStats(deck, { valid: false, issues: ["bad"] });

  assert.equal(stats.instances, 2);
  assert.deepEqual(stats.authoredContent.neverShownInstances, []);
  assert.deepEqual(stats.issues, ["bad"]);
});
