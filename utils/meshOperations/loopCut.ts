import { v4 as uuidv4 } from 'uuid';
import type { EditableMesh, Vertex, Edge, Face } from '@/types/model/editableMesh';

export function loopCut(mesh: EditableMesh, startEdgeId: string, factor: number = 0.5): EditableMesh {
  const startEdge = mesh.edges.find(e => e.id === startEdgeId);
  if (!startEdge) return mesh;

  const loopEdgeIds = findEdgeLoop(mesh, startEdgeId);
  if (loopEdgeIds.length === 0) return mesh;

  const edgeMidpoints = new Map<string, string>();
  const newVertices: Vertex[] = [...mesh.vertices];

  for (const edgeId of loopEdgeIds) {
    const edge = mesh.edges.find(e => e.id === edgeId)!;
    const v0 = mesh.vertices.find(v => v.id === edge.vertexIds[0])!;
    const v1 = mesh.vertices.find(v => v.id === edge.vertexIds[1])!;

    const midId = uuidv4();
    newVertices.push({
      id: midId,
      position: {
        x: v0.position.x + (v1.position.x - v0.position.x) * factor,
        y: v0.position.y + (v1.position.y - v0.position.y) * factor,
        z: v0.position.z + (v1.position.z - v0.position.z) * factor,
      },
      normal: {
        x: (v0.normal.x + v1.normal.x) / 2,
        y: (v0.normal.y + v1.normal.y) / 2,
        z: (v0.normal.z + v1.normal.z) / 2,
      },
      selected: true,
    });
    edgeMidpoints.set(edgeId, midId);
  }

  const newFaces: Face[] = [];
  const processedFaces = new Set<string>();

  for (const face of mesh.faces) {
    const crossingEdges = loopEdgeIds.filter(eid => {
      const edge = mesh.edges.find(e => e.id === eid)!;
      return edge.faceIds.includes(face.id);
    });

    if (crossingEdges.length === 2) {
      processedFaces.add(face.id);

      const mid1 = edgeMidpoints.get(crossingEdges[0])!;
      const mid2 = edgeMidpoints.get(crossingEdges[1])!;

      if (face.vertexIds.length === 4) {
        const vids = face.vertexIds;
        const newVids: string[] = [];

        for (let i = 0; i < vids.length; i++) {
          newVids.push(vids[i]);
          const nextI = (i + 1) % vids.length;
          const edgeKey1 = `${vids[i]}-${vids[nextI]}`;
          const edgeKey2 = `${vids[nextI]}-${vids[i]}`;

          for (const ceId of crossingEdges) {
            const ce = mesh.edges.find(e => e.id === ceId)!;
            const ceKey1 = `${ce.vertexIds[0]}-${ce.vertexIds[1]}`;
            const ceKey2 = `${ce.vertexIds[1]}-${ce.vertexIds[0]}`;
            if (edgeKey1 === ceKey1 || edgeKey1 === ceKey2 || edgeKey2 === ceKey1 || edgeKey2 === ceKey2) {
              newVids.push(edgeMidpoints.get(ceId)!);
              break;
            }
          }
        }

        const midIndices: number[] = [];
        for (let i = 0; i < newVids.length; i++) {
          if (newVids[i] === mid1 || newVids[i] === mid2) {
            midIndices.push(i);
          }
        }

        if (midIndices.length === 2) {
          const [i1, i2] = midIndices;
          const face1Vids: string[] = [];
          const face2Vids: string[] = [];

          for (let i = i1; i !== i2; i = (i + 1) % newVids.length) {
            face1Vids.push(newVids[i]);
          }
          face1Vids.push(newVids[i2]);

          for (let i = i2; i !== i1; i = (i + 1) % newVids.length) {
            face2Vids.push(newVids[i]);
          }
          face2Vids.push(newVids[i1]);

          if (face1Vids.length >= 3) {
            newFaces.push({ id: face.id, vertexIds: face1Vids, normal: { ...face.normal }, selected: false });
          }
          if (face2Vids.length >= 3) {
            newFaces.push({ id: uuidv4(), vertexIds: face2Vids, normal: { ...face.normal }, selected: false });
          }
        } else {
          newFaces.push({ ...face });
        }
      } else {
        newFaces.push({ ...face });
      }
    } else {
      if (!processedFaces.has(face.id)) {
        newFaces.push({ ...face });
      }
    }
  }

  const finalEdges: Edge[] = [];
  const edgeMap = new Map<string, Edge>();
  for (const face of newFaces) {
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

  return { id: mesh.id, vertices: newVertices, edges: finalEdges, faces: newFaces };
}

function findEdgeLoop(mesh: EditableMesh, startEdgeId: string): string[] {
  const loop: string[] = [startEdgeId];
  const visited = new Set<string>([startEdgeId]);

  for (const direction of [0, 1]) {
    let currentEdgeId = startEdgeId;

    while (true) {
      const currentEdge = mesh.edges.find(e => e.id === currentEdgeId)!;
      let nextEdgeId: string | null = null;

      for (const faceId of currentEdge.faceIds) {
        const face = mesh.faces.find(f => f.id === faceId)!;
        if (face.vertexIds.length !== 4) continue;

        const oppositeEdge = findOppositeEdge(mesh, face, currentEdge);
        if (oppositeEdge && !visited.has(oppositeEdge.id)) {
          nextEdgeId = oppositeEdge.id;
          break;
        }
      }

      if (!nextEdgeId) break;

      visited.add(nextEdgeId);
      if (direction === 0) {
        loop.push(nextEdgeId);
      } else {
        loop.unshift(nextEdgeId);
      }
      currentEdgeId = nextEdgeId;
    }
  }

  return loop;
}

function findOppositeEdge(mesh: EditableMesh, face: Face, edge: Edge): Edge | null {
  if (face.vertexIds.length !== 4) return null;

  const edgeVerts = new Set(edge.vertexIds);

  for (const otherEdge of mesh.edges) {
    if (otherEdge.id === edge.id) continue;
    if (!otherEdge.faceIds.includes(face.id)) continue;

    const shares = otherEdge.vertexIds.some(v => edgeVerts.has(v));
    if (!shares) return otherEdge;
  }

  return null;
}
