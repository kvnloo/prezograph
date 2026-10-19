# Legacy structural parity

Status: downstream regression harness.

Prezograph keeps `legacy/graph-deck_1.html` as the immutable executable reference.
Its Git blob is currently identical to `yoheinakajima/graphcon-deck`'s original
`index.html` baseline used by this fork:

```
122528fce2ec42e4872e60d106cf603ac2dc772f
```

Motion parity is covered separately by [MOTION_PARITY.md](MOTION_PARITY.md).
The structural harness in `test/legacy-structure-parity.test.js` parses the
embedded legacy deck without executing the HTML and checks the adaptation
boundary that should remain stable:

- slide/scene ordering;
- scene anchors used by camera fitting;
- node membership and reveal progression for scenes that were not deliberately
  rewritten during review;
- local edge topology, with the documented NRT→SEA correction;
- authored layout inputs that affect camera fit.

The reviewed `timeline` and `companies` scenes remain explicit exceptions
because their content was intentionally redesigned. This harness should not
turn those reviewed product decisions back into accidental parity requirements.

## What the harness does not compare

- `timeline` and `companies` are skipped entirely for node membership, reveal
  progression and edge topology. Their ordering, anchors and layout inputs are
  still checked.
- The harness drops the legacy node `co_graphlit`, and any edge touching it,
  before comparing. In the current fixture that node and its one edge appear
  only in `companies`, which is already skipped, so the filter changes no
  result today. It would hide a difference if another scene ever included it.
- `everything` must equal the legacy edge list followed by exactly one extra
  edge, `i_nrt → i_sea :flight`. Any other added, removed or reordered edge
  fails.
- Edges are compared as ordered `from`, `to`, `label` triples. Edge ids, node
  content and node positions are not compared.
- Layout parity covers `fitMargin`, `pushMargin`, `zoomMax`, `floatAmp` and
  `noCard`, and only where the legacy slide sets the key.

The blob identity above can be checked without the test suite:

```
git hash-object legacy/graph-deck_1.html
```
