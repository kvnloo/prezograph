import { readFile } from "node:fs/promises";

export async function readEmbeddedLegacyDeck() {
  const source = await readFile(
    new URL("../../legacy/graph-deck_1.html", import.meta.url),
    "utf8",
  );
  const marker = "const EMBEDDED_DECK =";
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error("legacy fixture has no EMBEDDED_DECK");

  const start = source.indexOf("{", markerIndex + marker.length);
  if (start < 0) throw new Error("legacy fixture has no embedded deck object");

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return JSON.parse(source.slice(start, index + 1));
    }
  }

  throw new Error("legacy embedded deck object is unterminated");
}
