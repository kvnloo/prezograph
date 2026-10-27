// Pins what `prezograph stats` prints for invalid decks.
//
// This file runs the real command as a child process and imports only Node
// built-ins, so it runs unmodified on any revision that has the CLI,
// including ones that predate src/core/stats.js.
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../cli/prezograph.mjs", import.meta.url));

const deckWith = (secondInstance) => ({
  schemaVersion: "2.0",
  meta: { title: "Invalid instance fixture" },
  entities: { shared: { title: "Shared" } },
  scenes: [
    {
      id: "one",
      title: "One",
      anchor: [0, 0],
      instances: [
        { id: "one_shared", entity: "shared", pos: [0, 0] },
        secondInstance,
      ],
      edges: [],
      beats: [{ id: "first", show: ["one_shared"] }],
    },
  ],
  connections: [],
});

const cases = [
  {
    name: "an instance object with no id",
    instance: { entity: "shared", pos: [1, 1] },
    issues: [
      {
        path: "scenes[0].instances[1].id",
        message: "must be an identifier beginning with a letter",
      },
    ],
  },
  {
    name: "a null instance",
    instance: null,
    issues: [{ path: "scenes[0].instances[1]", message: "must be an object" }],
  },
];

for (const { name, instance, issues } of cases) {
  test(`stats CLI output for ${name} in a scene with beats`, async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "prezograph-stats-"));
    try {
      const file = path.join(dir, "invalid.deck.json");
      await writeFile(file, JSON.stringify(deckWith(instance)));

      const run = spawnSync(process.execPath, [cli, "stats", file], {
        encoding: "utf8",
      });

      assert.equal(run.stderr, "");
      assert.equal(run.status, 1);
      const { authoredContent, ...counts } = JSON.parse(run.stdout);

      // The fields the command has always printed.
      assert.deepEqual(counts, {
        schemaVersion: "2.0",
        entities: 1,
        scenes: 1,
        beats: 1,
        instances: 2,
        edges: 0,
        valid: false,
        issues,
      });

      // authoredContent is newer than the command. Where it exists, the
      // invalid instance has no id to list, so it must not appear as a
      // null placeholder in neverShownInstances.
      if (authoredContent !== undefined) {
        assert.deepEqual(authoredContent, {
          placedEntities: 1,
          unplacedEntities: [],
          neverShownInstances: [],
          localEdges: 0,
          crossSceneEdges: 0,
        });
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
}
