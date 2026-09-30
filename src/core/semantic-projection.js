function edgeRef(sceneId, edge, index) {
  return edge.id ?? `scene:${sceneId}:edge:${index}`;
}

function copiedEdge(edge, id, representedEdgeIds, from = edge.from, to = edge.to) {
  const out = {
    id,
    from,
    to,
    representedEdgeIds: [...representedEdgeIds],
  };
  if (edge.label != null) out.label = edge.label;
  return out;
}

export function projectSceneSemanticGraph(
  deck,
  {
    sceneId,
    aggregateId,
    memberNodeIds,
  },
) {
  const scene = (deck.scenes ?? []).find((candidate) => candidate.id === sceneId);
  if (!scene) throw new Error(`unknown scene "${sceneId}"`);

  const sceneNodeIds = new Set((scene.instances ?? []).map((instance) => instance.id));
  if (sceneNodeIds.has(aggregateId)) {
    throw new Error(`aggregate id "${aggregateId}" collides with an authored instance`);
  }

  const members = [...memberNodeIds];
  if (members.length < 2) {
    throw new Error("an aggregate requires at least two member nodes");
  }
  if (new Set(members).size !== members.length) {
    throw new Error("aggregate member ids must be unique");
  }
  for (const id of members) {
    if (!sceneNodeIds.has(id)) throw new Error(`unknown scene instance "${id}"`);
  }

  const memberSet = new Set(members);
  const visibleNodeIds = [
    ...(scene.instances ?? [])
      .map((instance) => instance.id)
      .filter((id) => !memberSet.has(id)),
    aggregateId,
  ];

  const renderedEdges = [];
  const internalEdgeIds = [];

  (scene.edges ?? []).forEach((edge, index) => {
    const authoredId = edgeRef(scene.id, edge, index);
    const fromInside = memberSet.has(edge.from);
    const toInside = memberSet.has(edge.to);

    if (fromInside && toInside) {
      internalEdgeIds.push(authoredId);
      return;
    }

    if (fromInside || toInside) {
      renderedEdges.push(
        copiedEdge(
          edge,
          `aggregate:${aggregateId}:${authoredId}`,
          [authoredId],
          fromInside ? aggregateId : edge.from,
          toInside ? aggregateId : edge.to,
        ),
      );
      return;
    }

    renderedEdges.push(copiedEdge(edge, authoredId, [authoredId]));
  });

  return {
    sceneId,
    visibleNodeIds,
    renderedEdges,
    aggregates: [
      {
        id: aggregateId,
        memberNodeIds: members,
        internalEdgeIds,
      },
    ],
    suppressed: {
      nodeIds: members,
      edgeIds: internalEdgeIds,
    },
  };
}

export function expandProjectionNodeIds(projection) {
  const aggregateMap = new Map(
    projection.aggregates.map((aggregate) => [aggregate.id, aggregate.memberNodeIds]),
  );
  return projection.visibleNodeIds.flatMap(
    (id) => aggregateMap.get(id) ?? [id],
  );
}

export function projectionAuthoredEdgeIds(projection) {
  return [
    ...projection.renderedEdges.flatMap((edge) => edge.representedEdgeIds),
    ...projection.suppressed.edgeIds,
  ];
}
