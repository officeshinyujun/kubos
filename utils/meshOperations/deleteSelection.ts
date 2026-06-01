import type { EditableMesh, Edge, Face } from '@/types/model/editableMesh';

type DeleteMode = 'vertex' | 'edge' | 'face';

/**
 * Deletes selected elements from the mesh based on the current selection mode.
 *
 * - Face mode: removes selected faces and any orphaned vertices/edges
 * - Edge mode: removes selected edges and their adjacent faces, then orphaned vertices
 * - Vertex mode: removes selected vertices and any faces/edges that reference them
 */
export function deleteSelection(mesh: EditableMesh, mode: DeleteMode): EditableMesh {
  let remainingFaces: Face[];
  let removedVertexIds: Set<string>;

  if (mode === 'face') {
    remainingFaces = mesh.faces.filter(face => !face.selected);
    removedVertexIds = new Set<string>();
  } else if (mode === 'edge') {
    const selectedEdgeIds = new Set(mesh.edges.filter(edge => edge.selected).map(edge => edge.id));
    const facesToRemove = new Set<string>();

    for (const edge of mesh.edges) {
      if (!selectedEdgeIds.has(edge.id)) continue;

      for (const faceId of edge.faceIds) {
        facesToRemove.add(faceId);
      }
    }

    remainingFaces = mesh.faces.filter(face => !facesToRemove.has(face.id));
    removedVertexIds = new Set<string>();
  } else {
    const selectedVertexIds = new Set(mesh.vertices.filter(vertex => vertex.selected).map(vertex => vertex.id));
    remainingFaces = mesh.faces.filter(face => !face.vertexIds.some(vertexId => selectedVertexIds.has(vertexId)));
    removedVertexIds = selectedVertexIds;
  }

  const usedVertexIds = new Set<string>();
  for (const face of remainingFaces) {
    for (const vertexId of face.vertexIds) {
      usedVertexIds.add(vertexId);
    }
  }

  const remainingVertices = mesh.vertices.filter(vertex => usedVertexIds.has(vertex.id) && !removedVertexIds.has(vertex.id));

  const newEdges: Edge[] = [];
  const edgeMap = new Map<string, Edge>();

  for (const face of remainingFaces) {
    const vertexIds = face.vertexIds;

    for (let index = 0; index < vertexIds.length; index++) {
      const a = vertexIds[index];
      const b = vertexIds[(index + 1) % vertexIds.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;

      if (!edgeMap.has(key)) {
        const edge: Edge = {
          id: `${a}-${b}`,
          vertexIds: a < b ? [a, b] : [b, a],
          faceIds: [face.id],
          selected: false,
        };
        edgeMap.set(key, edge);
        newEdges.push(edge);
      } else {
        edgeMap.get(key)!.faceIds.push(face.id);
      }
    }
  }

  return {
    id: mesh.id,
    vertices: remainingVertices.map(vertex => ({ ...vertex, selected: false })),
    edges: newEdges,
    faces: remainingFaces.map(face => ({ ...face, selected: false })),
  };
}
