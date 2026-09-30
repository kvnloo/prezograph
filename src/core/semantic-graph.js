function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function semanticEdge(edge) {
  const out = {
    from: edge.from,
    to: edge.to,
  };
  if (edge.id != null) out.id = edge.id;
  if (edge.label != null) out.label = edge.label;
  return out;
}

export function semanticGraphSnapshot(deck) {
  return canonicalize({
    schemaVersion: deck.schemaVersion,
    entities: deck.entities ?? {},
    scenes: (deck.scenes ?? []).map((scene) => ({
      id: scene.id,
      instances: (scene.instances ?? []).map((instance) => ({
        id: instance.id,
        entity: instance.entity,
      })),
      edges: (scene.edges ?? []).map(semanticEdge),
    })),
    connections: (deck.connections ?? []).map(semanticEdge),
  });
}

export function semanticGraphCanonicalJson(deck) {
  return JSON.stringify(semanticGraphSnapshot(deck));
}
