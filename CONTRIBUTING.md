# Contributing

Prezograph intentionally has no runtime dependencies. Please keep changes small, testable, and
compatible with the JSON schema.

Read [AGENTS.md](AGENTS.md) for owned paths, generated-file boundaries, and the required handoff.

1. Create or edit a deck.
2. Run `npm run check`.
3. Run `npm run serve` and inspect the first beat, every scene transition, the whole-graph view,
   keyboard focus, the editor, and a narrow mobile viewport.
4. Update `CHANGELOG.md` and any affected documentation.
5. If an interface, public promise, schema, example, agent prompt, or security boundary changed,
   update the corresponding contract test and release-profile documentation.

Deck changes should distinguish:

- verifiable facts from interpretation;
- entities from visual instances;
- a scene's complete node set from a beat's visible and focused subset;
- dated claims from durable descriptions.

For dated company or product claims, add a primary source and `sourceDate`. Avoid unsourced
funding totals, valuations, market-leader language, and status claims.

Do not add raw HTML fields to the deck schema. New visual types should be structured, finite,
reviewable renderers in `src/player/visuals.js`.

Public copy must distinguish **available** from **planned** interfaces. Do not add JSON/YAML, API,
MCP, hosted sharing, package-registry, or “works with any agent” claims until the corresponding
release-profile gate has executable evidence.
