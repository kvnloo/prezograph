Prezograph is a dependency-free JavaScript technical preview for graph-based presentations.
Read `AGENTS.md`, `docs/RELEASE_PROFILES.md`, and `docs/TRUST_MODEL.md` before changing contracts.
Use `npm run check` for validation.
Keep JSON, browser player/editor, local validation/statistics CLI, Agent Skill source generation, and
offline export marked available. Keep YAML, API, MCP, persistent sharing, and registry publishing
marked planned.
Never render deck-controlled markup, fetch deck-controlled URLs, or edit `legacy/` and generated
`dist/` artifacts by hand.
Schema changes must update the JSON Schema, runtime validator, tests, docs, example, and Agent Skill
reference together.
