import { v4 as uuidv4 } from 'uuid';
import type { EditableMesh, Vertex, Edge, Face, MeshVector3 } from '@/types/model/editableMesh';

export function insetFaces(mesh: EditableMesh, selectedFaceIds: string[], amount: number): EditableMesh {
  if (selectedFaceIds.length === 0 || amount <= 0) return mesh;

  const clampedAmount = Math.min(Math.max(amount, 0), 0.99);

  const newVertices: Vertex[] = [...mesh.vertices];
  const newFaces: Face[] = [];

  for (const face of mesh.faces) {
    if (!selectedFaceIds.includes(face.id)) {
      newFaces.push({ ...face });
      continue;
    }

    const faceVerts = face.vertexIds.map(id => mesh.vertices.find(v => v.id === id)!);
    const centroid: MeshVector3 = { x: 0, y: 0, z: 0 };
    for (const v of faceVerts) {
      centroid.x += v.position.x;
      centroid.y += v.position.y;
      centroid.z += v.position.z;
    }
    centroid.x /= faceVerts.length;
    centroid.y /= faceVerts.length;
    centroid.z /= faceVerts.length;

    const insetVertexIds: string[] = [];
    for (const v of faceVerts) {
      const newId = uuidv4();
      insetVertexIds.push(newId);
      newVertices.push({
        id: newId,
        position: {
          x: v.position.x + (centroid.x - v.position.x) * clampedAmount,
          y: v.position.y + (centroid.y - v.position.y) * clampedAmount,
          z: v.position.z + (centroid.z - v.position.z) * clampedAmount,
        },
        normal: { ...v.normal },
        selected: true,
      });
    }

    newFaces.push({
      id: face.id,
      vertexIds: insetVertexIds,
      normal: { ...face.normal },
      selected: true,
    });

    const n = face.vertexIds.length;
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      const borderFace: Face = {
        id: uuidv4(),
        vertexIds: [
          face.vertexIds[i],
          face.vertexIds[next],
          insetVertexIds[next],
          insetVertexIds[i],
        ],
        normal: { ...face.normal },
        selected: false,
      };
      newFaces.push(borderFace);
    }
  }

  const newEdges: Edge[] = [];
  const edgeMap = new Map<string, Edge>();
  for (const face of newFaces) {
    const vids = face.vertexIds;
    for (let i = 0; i < vids.length; i++) {
      const a = vids[i];
      const b = vids[(i + 1) % vids.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edgeMap.has(key)) {
        const edge: Edge = {
          id: uuidv4(),
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

  return { id: mesh.id, vertices: newVertices, edges: newEdges, faces: newFaces };
}
