import { v4 as uuidv4 } from 'uuid';
import type { EditableMesh, Edge, Face, MeshVector3 } from '@/types/model/editableMesh';

export function bevelEdges(mesh: EditableMesh, selectedEdgeIds: string[], width: number): EditableMesh {
  if (selectedEdgeIds.length === 0 || width <= 0) return mesh;

  const newVertices = [...mesh.vertices];
  const newFaces = [...mesh.faces];
  const bevelFaces: Face[] = [];

  const faceVertexReplacements = new Map<string, Map<string, string>>();

  for (const edgeId of selectedEdgeIds) {
    const edge = mesh.edges.find(e => e.id === edgeId);
    if (!edge) continue;

    const v0 = mesh.vertices.find(v => v.id === edge.vertexIds[0])!;
    const v1 = mesh.vertices.find(v => v.id === edge.vertexIds[1])!;

    const dir: MeshVector3 = {
      x: v1.position.x - v0.position.x,
      y: v1.position.y - v0.position.y,
      z: v1.position.z - v0.position.z,
    };
    const len = Math.sqrt(dir.x ** 2 + dir.y ** 2 + dir.z ** 2);
    if (len === 0) continue;
    dir.x /= len; dir.y /= len; dir.z /= len;

    const clampedWidth = Math.min(width, len / 2 - 0.001);

    const v0PrimeId = uuidv4();
    const v1PrimeId = uuidv4();

    newVertices.push({
      id: v0PrimeId,
      position: {
        x: v0.position.x + dir.x * clampedWidth,
        y: v0.position.y + dir.y * clampedWidth,
        z: v0.position.z + dir.z * clampedWidth,
      },
      normal: { ...v0.normal },
      selected: false,
    });

    newVertices.push({
      id: v1PrimeId,
      position: {
        x: v1.position.x - dir.x * clampedWidth,
        y: v1.position.y - dir.y * clampedWidth,
        z: v1.position.z - dir.z * clampedWidth,
      },
      normal: { ...v1.normal },
      selected: false,
    });

    bevelFaces.push({
      id: uuidv4(),
      vertexIds: [v0.id, v0PrimeId, v1PrimeId, v1.id],
      normal: { x: 0, y: 1, z: 0 },
      selected: false,
    });

    for (const faceId of edge.faceIds) {
      if (!faceVertexReplacements.has(faceId)) {
        faceVertexReplacements.set(faceId, new Map());
      }
      const replacements = faceVertexReplacements.get(faceId)!;
      replacements.set(v0.id, v0PrimeId);
      replacements.set(v1.id, v1PrimeId);
    }
  }

  const updatedFaces = newFaces.map(face => {
    const replacements = faceVertexReplacements.get(face.id);
    if (!replacements) return face;
    return {
      ...face,
      vertexIds: face.vertexIds.map(vid => replacements.get(vid) || vid),
    };
  });

  const allFaces = [...updatedFaces, ...bevelFaces];

  const finalEdges: Edge[] = [];
  const edgeMap = new Map<string, Edge>();
  for (const face of allFaces) {
    const vids = face.vertexIds;
    for (let i = 0; i < vids.length; i++) {
      const a = vids[i];
      const b = vids[(i + 1) % vids.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, { id: uuidv4(), vertexIds: a < b ? [a, b] : [b, a], faceIds: [face.id], selected: false });
        finalEdges.push(edgeMap.get(key)!);
      } else {
        edgeMap.get(key)!.faceIds.push(face.id);
      }
    }
  }

  return { id: mesh.id, vertices: newVertices, edges: finalEdges, faces: allFaces };
}
