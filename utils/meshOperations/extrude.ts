import { v4 as uuidv4 } from 'uuid';
import type { EditableMesh, Vertex, Edge, Face, MeshVector3 } from '@/types/model/editableMesh';

export function extrudeFaces(mesh: EditableMesh, selectedFaceIds: string[], offset: number): EditableMesh {
  if (selectedFaceIds.length === 0) return mesh;

  const selectedFaces = mesh.faces.filter(f => selectedFaceIds.includes(f.id));
  if (selectedFaces.length === 0) return mesh;

  const avgNormal: MeshVector3 = { x: 0, y: 0, z: 0 };
  for (const face of selectedFaces) {
    avgNormal.x += face.normal.x;
    avgNormal.y += face.normal.y;
    avgNormal.z += face.normal.z;
  }
  const len = Math.sqrt(avgNormal.x ** 2 + avgNormal.y ** 2 + avgNormal.z ** 2);
  if (len > 0) {
    avgNormal.x /= len;
    avgNormal.y /= len;
    avgNormal.z /= len;
  }

  const selectedVertexIds = new Set<string>();
  for (const face of selectedFaces) {
    for (const vid of face.vertexIds) {
      selectedVertexIds.add(vid);
    }
  }

  const boundaryEdges: Array<{ oldV0: string; oldV1: string }> = [];
  for (const edge of mesh.edges) {
    const adjSelectedCount = edge.faceIds.filter(fid => selectedFaceIds.includes(fid)).length;
    if (adjSelectedCount === 1) {
      if (selectedVertexIds.has(edge.vertexIds[0]) && selectedVertexIds.has(edge.vertexIds[1])) {
        boundaryEdges.push({ oldV0: edge.vertexIds[0], oldV1: edge.vertexIds[1] });
      }
    }
  }

  const vertexDupMap = new Map<string, string>();
  const newVertices: Vertex[] = [...mesh.vertices];

  for (const vid of selectedVertexIds) {
    const original = mesh.vertices.find(v => v.id === vid)!;
    const newId = uuidv4();
    vertexDupMap.set(vid, newId);
    newVertices.push({
      id: newId,
      position: {
        x: original.position.x + avgNormal.x * offset,
        y: original.position.y + avgNormal.y * offset,
        z: original.position.z + avgNormal.z * offset,
      },
      normal: { ...original.normal },
      selected: true,
    });
  }

  const newFaces: Face[] = mesh.faces.map(face => {
    if (!selectedFaceIds.includes(face.id)) return { ...face };
    return {
      ...face,
      vertexIds: face.vertexIds.map(vid => vertexDupMap.get(vid) || vid),
      selected: true,
    };
  });

  for (const { oldV0, oldV1 } of boundaryEdges) {
    const newV0 = vertexDupMap.get(oldV0)!;
    const newV1 = vertexDupMap.get(oldV1)!;

    const p0 = mesh.vertices.find(v => v.id === oldV0)!.position;
    const p1 = mesh.vertices.find(v => v.id === oldV1)!.position;
    const p2 = newVertices.find(v => v.id === newV1)!.position;
    const e1 = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z };
    const e2 = { x: p2.x - p0.x, y: p2.y - p0.y, z: p2.z - p0.z };
    const normal: MeshVector3 = {
      x: e1.y * e2.z - e1.z * e2.y,
      y: e1.z * e2.x - e1.x * e2.z,
      z: e1.x * e2.y - e1.y * e2.x,
    };
    const sLen = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
    if (sLen > 0) {
      normal.x /= sLen;
      normal.y /= sLen;
      normal.z /= sLen;
    }

    const sideFace: Face = {
      id: uuidv4(),
      vertexIds: [oldV0, oldV1, newV1, newV0],
      normal,
      selected: false,
    };

    newFaces.push(sideFace);
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

  const newVertexIdSet = new Set(vertexDupMap.values());

  return {
    id: mesh.id,
    vertices: newVertices.map(v => ({
      ...v,
      selected: newVertexIdSet.has(v.id),
    })),
    edges: newEdges,
    faces: newFaces,
  };
}
