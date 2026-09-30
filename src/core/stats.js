export function collectDeckStats(deck, validation = { valid: true, issues: [] }) {
  const scenes = deck.scenes ?? [];
  const entityIds = Object.keys(deck.entities ?? {});
  const instances = scenes.flatMap((scene) => scene.instances ?? []);
  const placedEntityIds = new Set(instances.map((instance) => instance.entity));
  const visibleInstanceIds = new Set(
    scenes.flatMap((scene) =>
      (scene.beats ?? []).flatMap((beat) => beat.show ?? []),
    ),
  );
  const localEdges = scenes.reduce(
    (sum, scene) => sum + (scene.edges?.length ?? 0),
    0,
  );
  const crossSceneEdges = deck.connections?.length ?? 0;

  return {
    schemaVersion: deck.schemaVersion,
    entities: entityIds.length,
    scenes: scenes.length,
    beats: scenes.reduce((sum, scene) => sum + (scene.beats?.length ?? 0), 0),
    instances: instances.length,
    edges: localEdges + crossSceneEdges,
    authoredContent: {
      placedEntities: placedEntityIds.size,
      unplacedEntities: entityIds.filter((id) => !placedEntityIds.has(id)),
      neverShownInstances: instances
        .map((instance) => instance.id)
        .filter((id) => !visibleInstanceIds.has(id)),
      localEdges,
      crossSceneEdges,
    },
    valid: validation.valid,
    issues: validation.issues,
  };
}
