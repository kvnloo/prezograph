# Implementation tracker

Status: completed unless explicitly marked “future”.

| ID | Area | Decision / change | Evidence |
|---|---|---|---|
| T-01 | Preservation | Archive the attachment unchanged | `legacy/graph-deck_1.html` |
| T-02 | Structure | Split core, player, editor, CLI, scripts, schema, docs | project tree |
| T-03 | Security | Validate before compile/import | `src/core/schema.js` |
| T-04 | Security | Render authored text with safe DOM APIs | `src/player/player.js` |
| T-05 | Security | Allow-list structured visuals | `src/player/visuals.js` |
| T-06 | Security | Add CSP to served and single-file shells | `index.html`, build script |
| T-07 | Model | Add schema version 2.0 | schema + validator |
| T-08 | Model | Separate entities from visual instances | compiler + example |
| T-09 | Narrative | Replace implicit numeric steps with explicit beats | all 12 scenes |
| T-10 | Camera | Fit focused nodes, not every included node | geometry + player |
| T-11 | Readability | Preserve minimum readable scale and expose overflow | player + CSS |
| T-12 | Motion | Use elapsed-time easing and honor reduced motion | player + CSS |
| T-13 | Navigation | Keep overview optional and outside slide count | player |
| T-14 | Accessibility | Keyboard controls, focus, live announcements, labels | player |
| T-15 | Editor | Drag positions, tune layout, undo/redo | editor |
| T-16 | Portability | Build a CSP-hashed single HTML artifact | build script |
| T-17 | Story | Reframe tables vs graphs as relationship-query cost | scene 2 |
| T-18 | Story | Add “agent exhaust” bridge | scene 4 |
| T-19 | Story | Extend selected timeline through current 2026 status | scene 5 |
| T-20 | Story | Qualify ontology inversion rather than straw-manning | scene 6 |
| T-21 | Story | Map market to five durable questions | scenes 7–8 |
| T-22 | Story | Reveal company landscape by segment | scene 9 |
| T-23 | Story | Replace recursive loop slide with open-source reveal | scene 11 |
| T-24 | Story | End on a repository call to action | scene 12 |
| T-25 | Facts | Correct Mem0, Graphwise, metaphacts, Linkurious | example + sources |
| T-26 | Facts | Remove WhyHow from the infrastructure landscape | example |
| T-27 | Facts | Add Neptune and Spanner Graph platform context | example + sources |
| T-28 | Facts | Remove unsupported valuation/funding superlatives | example |
| T-29 | Disclosure | Mark disclosed portfolio companies and as-of date | scene 9 caption |
| T-30 | QA | Automated and browser validation, desktop/mobile beat walks, CSP and server checks | `test/`, `docs/QA_REPORT.md` |
| T-31 | Trust | Define browser, CLI, agent, remote-resource, privacy, and export boundaries | `docs/TRUST_MODEL.md` |
| T-32 | Security | Escape mixed-case script terminators in standalone exports | `src/core/escape.js`, adversarial tests |
| T-33 | Security | Reject script URLs, raw markup, event handlers, and active SVG authoring paths | schema + adversarial tests |
| T-34 | Release | Select technical preview and label later interfaces as planned | `docs/RELEASE_PROFILES.md` |
| T-35 | Discovery | Enforce truthful first-line copy across README and homepage | contract tests |
| T-36 | Site | Add static home, agent route, live app, raw source, schema, and version routes | `site/`, Pages build |
| T-37 | Agents | Add an inert-JSON Agent Skill and raw agent instructions | `skills/prezograph/`, `agents.md` |
| T-38 | Governance | Add lane ownership, generated-file boundaries, handoff rules, and repo map | `AGENTS.md`, path instructions |
| T-39 | GitHub | Add pinned CI/Pages workflows, templates, CODEOWNERS, and Dependabot | `.github/` |
| T-40 | Planning | Record release, label, milestone, and Projects-v2 contracts without inventing absent DAG records | `planning/` |
| F-01 | Future | Plugin API for third-party visual renderers | deferred: expands attack surface |
| F-02 | Future | Speaker notes and presenter display | deferred: needs separate UX design |
| F-03 | Future | PNG/PDF export | deferred: browser print pipeline needs layout QA |
| F-04 | Future | Collaborative/cloud editing | deferred: outside local open-source core |
| F-05 | Future | YAML input | deferred: safe parser and interface-parity work required |
| F-06 | Future | Hosted API and MCP | deferred: request isolation, quotas, and remote-resource policy required |
| F-07 | Future | Persistent sharing | deferred: privacy, retention, abuse, and access-control design required |
