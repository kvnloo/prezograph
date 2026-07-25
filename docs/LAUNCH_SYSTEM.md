# Launch-system v2 integration

The launch-system discussion describes an external execution program with 110 canonical tasks, 451
hard dependency edges, 25 topological waves, 13 workstream epics, 84 complete-launch P0 gates, and
110 generated issue bodies.

Those exact canonical task records and generated bodies were not present as files in this checkout,
so this repository does not pretend to reproduce or import them. When the canonical YAML bundle is
added, it should remain the source of truth and be validated for unique task IDs, known endpoints,
acyclic dependencies, and exact topological waves before any GitHub writes.

## Concepts incorporated now

- explicit safe/untrusted execution boundary;
- technical-preview, public-alpha, and complete-launch profiles;
- truthful available/planned interface status;
- end-user Agent Skill and raw agent instructions;
- coding-agent governance with owned/non-owned paths;
- contract-aware CI for schema, examples, copy, skill, and security boundaries;
- static discovery site with a durable site↔repo link graph;
- minimum workflow permissions and full-SHA action pins;
- release and issue templates designed for evidence, risks, and handoffs.

## GitHub plan importer contract

A future `scripts/create_github_plan.py` must:

- default to a no-write dry run;
- require `--apply` for external mutation;
- support `--only TASK_ID,...`;
- create or update epic parents before task issues;
- use hidden idempotency markers;
- create native sub-issue and blocked-by relationships from numeric issue IDs;
- preserve task IDs, labels, milestones, owners, acceptance criteria, and evidence checklists;
- never infer or silently rewrite the canonical dependency graph;
- leave Projects-v2 ownership, fields, and saved views as explicit account-level configuration.

GitHub currently exposes REST APIs for
[sub-issues](https://docs.github.com/en/rest/issues/sub-issues) and
[issue dependencies](https://docs.github.com/en/rest/issues/issue-dependencies). The importer should
pin an API version and include fixture-based dry-run tests before it is permitted to write.

## Immediate sequence represented in the external plan

`O01 → O02 → F01/F09/F04/F05 → T01/T02/T07 → F03/F06/R02/G04 → R07/Q01`

The maintainer chooses the release profile before merging copy that broadens public promises.
