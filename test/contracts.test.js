import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");
const canonical =
  "Prezograph is an open-source graph-based presentation tool for creating interactive presentations\nfrom versioned JSON—in the browser, with local CLI validation and portable single-file export.";

test("README and homepage share the truthful canonical first sentence", async () => {
  const [readme, homepage] = await Promise.all([read("README.md"), read("site/index.html")]);
  assert.match(readme, new RegExp(canonical.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(
    homepage.replace(/\s+/g, " "),
    /Prezograph is an open-source graph-based presentation tool for creating interactive presentations from versioned JSON—in the browser, with local CLI validation and portable single-file export\./,
  );
  assert.match(readme, /YAML, hosted API, MCP, persistent sharing.*planned/s);
});

test("agent surfaces require inert JSON and preserve interface status", async () => {
  const files = await Promise.all([
    read("agent-instructions.md"),
    read("skills/prezograph/SKILL.md"),
    read("site/agents/index.html"),
    read("cli/prezograph.mjs"),
  ]);
  for (const content of files) {
    assert.match(content, /inert/i);
    assert.match(content, /JSON/i);
    assert.match(content, /YAML/i);
    assert.match(content, /MCP/i);
    assert.match(content, /planned/i);
  }
  const governance = await read("AGENTS.md");
  assert.match(governance, /coding-agent contract/i);
  assert.notEqual(governance, files[0], "coding and end-user agent contracts must remain separate");
});

test("public example exposes six durable actions and no dead-end footer", async () => {
  const homepage = await read("site/index.html");
  for (const label of ["Live", "Source", "Raw", "Remix", "Schema", "Version"]) {
    assert.match(homepage, new RegExp(`>${label}<`));
  }
  for (const label of ["Home", "Docs", "License", "Security", "Support"]) {
    assert.match(homepage, new RegExp(`>${label}<`));
  }
});

test("GitHub workflows use full commit SHAs and explicit permissions", async () => {
  const workflowDir = path.join(root, ".github/workflows");
  const names = (await readdir(workflowDir)).filter((name) => name.endsWith(".yml"));
  assert.ok(names.length >= 2);
  for (const name of names) {
    const workflow = await readFile(path.join(workflowDir, name), "utf8");
    const uses = [...workflow.matchAll(/uses:\s+[^@\s]+@([^\s#]+)/g)];
    assert.ok(uses.length > 0, `${name} should use at least one action`);
    for (const match of uses) assert.match(match[1], /^[0-9a-f]{40}$/);
    assert.match(workflow, /permissions:/);
  }
  const pages = await read(".github/workflows/pages.yml");
  assert.match(pages, /pages: write/);
  assert.match(pages, /id-token: write/);
  const ci = await read(".github/workflows/ci.yml");
  assert.doesNotMatch(ci, /\b(write-all|contents: write)\b/);
});
