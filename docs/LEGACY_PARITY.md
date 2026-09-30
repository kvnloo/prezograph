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
