#!/usr/bin/env node

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "dist/site");
const app = path.join(output, "app");
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const deck = JSON.parse(
  await readFile(path.join(root, "examples/graphs-are-awesome/deck.json"), "utf8"),
);

await rm(output, { recursive: true, force: true });
await mkdir(app, { recursive: true });
await mkdir(path.join(output, "schema"), { recursive: true });

await cp(path.join(root, "site"), output, { recursive: true });
await cp(path.join(root, "index.html"), path.join(app, "index.html"));
await cp(path.join(root, "src"), path.join(app, "src"), { recursive: true });
await cp(path.join(root, "examples"), path.join(app, "examples"), { recursive: true });
await cp(path.join(root, "schemas"), path.join(app, "schemas"), { recursive: true });
await cp(path.join(root, "dist/prezograph.html"), path.join(app, "offline.html"));
await cp(path.join(root, "schemas/deck.schema.json"), path.join(output, "schema/deck.schema.json"));
await cp(path.join(root, "agent-instructions.md"), path.join(output, "agents.md"));

await writeFile(
  path.join(output, "version.json"),
  `${JSON.stringify(
    {
      tool: packageJson.version,
      schema: deck.schemaVersion,
      releaseProfile: "technical-preview",
      repository: "https://github.com/yoheinakajima/prezograph",
    },
    null,
    2,
  )}\n`,
);

console.log(`Built Pages site at ${output}`);
