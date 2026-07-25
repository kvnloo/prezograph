# Prezograph

[![CI](https://github.com/yoheinakajima/prezograph/actions/workflows/ci.yml/badge.svg)](https://github.com/yoheinakajima/prezograph/actions/workflows/ci.yml)
[![Pages](https://github.com/yoheinakajima/prezograph/actions/workflows/pages.yml/badge.svg)](https://yoheinakajima.github.io/prezograph/)
[![License: MIT](https://img.shields.io/badge/license-MIT-17714d.svg)](LICENSE)

Prezograph is an open-source graph-based presentation tool for creating interactive presentations
from versioned JSON—in the browser, with local CLI validation and portable single-file export.

Facts live in reusable entities; scenes place local visual instances; beats explicitly control what
appears and what the camera frames.

[Live site](https://yoheinakajima.github.io/prezograph/) ·
[Open the example](https://yoheinakajima.github.io/prezograph/app/) ·
[Schema](schemas/deck.schema.json) ·
[Security](SECURITY.md) ·
[Roadmap](docs/RELEASE_PROFILES.md)

> **Technical preview:** JSON presentation, browser editing, CLI validation/statistics, and offline
> export work today. YAML, hosted API, MCP, persistent sharing, and package registries are planned
> interfaces and are not part of the current public promise.

The included “Graphs Are Awesome” deck is both an example and a dogfood test: its source is
[examples/graphs-are-awesome/deck.json](examples/graphs-are-awesome/deck.json).

## Quick start

Requires Node.js 20 or newer.

```bash
npm run serve
```

Open `http://127.0.0.1:4173`. Use the arrow keys to advance, `o` for the whole graph, `f` to refit,
and `e` to edit. No install step or runtime dependency is required.

Validate a deck:

```bash
node cli/prezograph.mjs validate path/to/deck.json
node cli/prezograph.mjs stats path/to/deck.json
```

Build a portable, CSP-protected single HTML file:

```bash
npm run build -- path/to/deck.json
```

The result is written to `dist/prezograph.html`.

## Create with an AI agent

Give an agent this repository and start with:

> Turn this into a Prezograph: create a graph-based presentation from source material or JSON;
> validate it, then open it with Prezograph.

The portable [Prezograph Agent Skill](skills/prezograph/SKILL.md) instructs agents to emit inert
`.prezograph.json`, never executable HTML. The rendered document remains untrusted content and must
pass the same validator as a human-authored deck. See
[the raw agent instructions](agent-instructions.md) and the
[trust model](docs/TRUST_MODEL.md).

## Interface status

| Interface | Current status | Truthful action |
|---|---|---|
| Browser player/editor | Available | `npm run serve` |
| JSON schema | Available, v2.0 | `schemas/deck.schema.json` |
| CLI validation/statistics | Available | `node cli/prezograph.mjs --help` |
| Offline single-file export | Available | `npm run build` |
| Agent Skill | Available, source-generation only | `skills/prezograph/` |
| YAML | Planned | Do not claim support yet |
| Hosted API | Planned | No public endpoint |
| MCP server | Planned | No public server |
| Persistent sharing | Planned | Static files only |

## JSON model

```json
{
  "schemaVersion": "2.0",
  "meta": { "title": "My graph story" },
  "entities": {
    "idea": { "title": "One fact, defined once" }
  },
  "scenes": [{
    "id": "opening",
    "title": "Opening",
    "anchor": [500, 400],
    "instances": [
      { "id": "opening_idea", "entity": "idea", "pos": [0, 0], "kind": "hub" }
    ],
    "edges": [],
    "beats": [{
      "id": "first",
      "label": "First beat",
      "show": ["opening_idea"],
      "focus": ["opening_idea"],
      "revealOrder": ["opening_idea"]
    }]
  }],
  "connections": []
}
```

The complete machine-readable contract is [schemas/deck.schema.json](schemas/deck.schema.json).

## Design principles

- Deck content never enters the DOM through `innerHTML`; text is rendered with safe DOM APIs.
- Schema validation happens before a deck is compiled or imported.
- Entity identity and visual placement are separate, so one fact can appear locally in many scenes.
- Beats use explicit `show`, `focus`, and `revealOrder` lists instead of hidden numeric step rules.
- The whole-graph view is optional and is not counted as an extra slide or forced after the ending.
- Reduced-motion preferences, keyboard navigation, focus states, and readable-scale floors are built in.

## Project map

- `src/core/` — validation, compilation, geometry
- `src/player/` — renderer, camera, interaction, built-in visuals
- `src/editor/` — position/layout editing, undo/redo, JSON import/export
- `cli/` — validation and deck statistics
- `scripts/` — local server, legacy migration, single-file build
- `site/` — static public discovery and agent pages
- `skills/` — portable end-user Agent Skill
- `examples/` — example deck source
- `docs/` — architecture, audit, and implementation decisions
- `.github/` and `AGENTS.md` — CI and coding-agent governance
- `agent-instructions.md` — source for the public `/agents.md` discovery route
- `legacy/` — the original attached prototype, preserved unchanged

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and
[docs/AUDIT_REPORT.md](docs/AUDIT_REPORT.md) before making structural changes.
