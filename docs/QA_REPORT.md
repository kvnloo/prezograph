# QA report

Run date: July 24, 2026

## Automated

- `npm run validate` — passed: schema 2.0, 12 scenes, 136 rendered entities.
- `npm test` — passed: 19/19 schema, security, compilation, geometry, content, hostile-input,
  public-copy, agent-surface, and workflow-policy assertions.
- `npm run build` — passed: CSP-hashed portable `dist/prezograph.html`.
- `npm run build:site` — passed: static Pages artifact with home, app, agent, raw source,
  schema, and version routes.
- Portable Agent Skill validation — passed.
- `git diff --check` — passed.
- Node syntax checks for the migration and player — passed.
- Original attachment vs archived fixture — byte-for-byte match.

## Browser

- Development shell loaded 151 instances with no console errors.
- Portable single-file build loaded 151 instances with no console errors or CSP violations.
- Walked all 38 desktop beats across all 12 scenes.
- Walked all 38 beats inside a 390 px mobile viewport.
- Inspected first scene, company segment, complete company landscape, ending, and whole-graph view.
- Confirmed the ending remains scene 12; overview is optional and reports “overview · 12 scenes.”
- Confirmed active-node scale never dropped below each scene's configured readability floor.
- Confirmed mobile overflow is explicit and pannable rather than silently shrinking text.
- Opened the editor, verified five layout controls, and confirmed undo begins disabled.
- Opened the JSON editor and confirmed an invalid deck is rejected without replacing the active deck.
- Confirmed the generated single-file deck begins at `01 / 12 · 1/4`.
- Confirmed the launch homepage has a complete discovery path, a truthful available/planned split,
  six durable example actions, and no dead-end footer.
- Confirmed `/agents/` instructs agents to return inert JSON and labels YAML, API, and MCP as planned.

The in-app browser's iframe instrumentation emitted a `MutationObserver` diagnostic while inspecting
the mobile test harness. Prezograph does not use `MutationObserver`; direct development and
single-file tabs both had empty browser logs.

## Local server security

- Normal in-repository JSON request returned HTTP 200.
- A temporary symlink pointing outside the repository returned HTTP 403.
- The temporary symlink was removed immediately after the check.

## Visual fixes made during QA

- Corrected the camera's vertical card offset so dense-scene titles clear the fixed header.
- Centered scene cards over focused bounds so mobile titles do not clip offscreen.
- Preserved the mobile readable-scale notice and touch/pan controls.
