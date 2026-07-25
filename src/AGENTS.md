# Core tool agent instructions

Own `src/` behavior and its direct tests. Preserve the safe-document profile and immutable compile
boundary. Any new field must be added consistently to the JSON Schema, runtime validator, tests,
docs, example, and Agent Skill reference.

Never render document-controlled strings with `innerHTML`, fetch document-controlled URLs, or add a
visual type that accepts markup/code. Run `npm run check` after changes.
