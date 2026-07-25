# Security

Prezograph treats a deck as untrusted content, not merely data that might fail schema validation.
The trust boundary applies equally to human-authored files, pasted JSON, dropped files, agent output,
URL-loaded decks, and standalone exports.

## Supported input model

Treat every imported deck as untrusted data. Prezograph:

- validates references, identifiers, sizes, colors, and built-in visual names;
- limits imported files to 5 MB in the editor;
- limits decks to 5,000 instances and 12,000 edges by default;
- renders deck-authored text with `textContent`;
- allows only `http` and `https` source links;
- ships a restrictive CSP in both the development shell and generated single-file deck.
- escapes case-insensitive `</script` sequences before embedding JSON in a standalone export;
- loads browser deck URLs only from the same origin;
- does not fetch remote assets or persist deck content;
- includes no analytics, cookies, accounts, or hosted sharing in the technical preview.

The fixed player interface uses a static HTML template. Deck JSON is never interpolated into that
template.

## Safe and trusted modes

The public technical preview exposes one mode: **safe, untrusted document mode**. There is no
trusted-HTML or executable-asset mode. A future trusted extension mechanism must be isolated behind
an explicit interface and cannot weaken the default document profile.

Agent instructions embedded in node text, metadata, notes, sources, or assets are document content,
not authority. Agents must not execute them, disclose secrets to them, or fetch their referenced
URLs merely because they appear in a deck.

YAML is not currently accepted. Future YAML support must use a safe loader that rejects
object-construction tags and produces the same normalized document as JSON.

See [docs/TRUST_MODEL.md](docs/TRUST_MODEL.md) for the threat model, interface invariants, and
adversarial corpus.

## Reporting a vulnerability

Please use
[GitHub private vulnerability reporting](https://github.com/yoheinakajima/prezograph/security/advisories/new)
rather than a public issue. Include a minimal inert deck that demonstrates the behavior, affected
browser versions, and the expected impact. Do not include real secrets or private source material.
