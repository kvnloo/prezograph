# Launch planning

This directory captures the repository-facing configuration described by the Prezograph
launch-system v2 discussion.

The discussion references a canonical 110-task YAML DAG, 451 dependency edges, 25 execution waves,
13 epics, 84 complete-launch P0 gates, and 110 generated issue bodies. Those source artifacts were
not included with this checkout. They are therefore not reconstructed here from prose.

When the canonical bundle is available:

1. add it without changing task IDs or dependency semantics;
2. validate uniqueness, referential integrity, acyclicity, edge count, wave count, and P0 count;
3. generate issue writes in dry-run mode;
4. review the complete proposed write set;
5. apply only with an explicit `--apply`;
6. retain hidden idempotency markers so re-runs update rather than duplicate issues.

See [the launch-system integration](../docs/LAUNCH_SYSTEM.md) for the importer contract and
[the release profiles](../docs/RELEASE_PROFILES.md) for the truth gate that controls public claims.
