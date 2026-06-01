import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import type { EditableMesh, Vertex, Edge, Face, MeshVector3 } from '@/types/model/editableMesh';

function createGeometry(geometryType: string): THREE.BufferGeometry {
  switch (geometryType) {
    case '정육면체': return new THREE.BoxGeometry(1, 1, 1);
    case '구': return new THREE.SphereGeometry(0.5, 16, 16);
    case '원기둥': return new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    case '평면': return new THREE.PlaneGeometry(1, 1);
    case '원판': return new THREE.CircleGeometry(0.5, 16);
    case '도넛': return new THREE.TorusGeometry(0.4, 0.15, 8, 16);
    case '꼬인 도넛': return new THREE.TorusKnotGeometry(0.4, 0.15, 64, 8);
    case '12면체': return new THREE.DodecahedronGeometry(0.5);
    case '8면체': return new THREE.OctahedronGeometry(0.5);
    case '20면체': return new THREE.IcosahedronGeometry(0.5);
    default: return new THREE.BoxGeometry(1, 1, 1);
  }
}

export function bufferGeometryToEditableMesh(geometry: THREE.BufferGeometry, scale: [number, number, number] = [1, 1, 1]): EditableMesh {
  const geo = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  geo.computeVertexNormals();

  const posAttr = geo.getAttribute('position');
  const normalAttr = geo.getAttribute('normal');

  const tolerance = 0.0001;
  const vertices: Vertex[] = [];
  const posToVertexId = new Map<string, string>();

  function posKey(x: number, y: number, z: number): string {
    return `${Math.round(x / tolerance) * tolerance},${Math.round(y / tolerance) * tolerance},${Math.round(z / tolerance) * tolerance}`;
  }

  const indexToVertexId: string[] = [];

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i) * scale[0];
    const y = posAttr.getY(i) * scale[1];
    const z = posAttr.getZ(i) * scale[2];
    const key = posKey(x, y, z);

    let vertexId = posToVertexId.get(key);
    if (!vertexId) {
      vertexId = uuidv4();
      const nx = normalAttr ? normalAttr.getX(i) : 0;
      const ny = normalAttr ? normalAttr.getY(i) : 0;
      const nz = normalAttr ? normalAttr.getZ(i) : 1;
      vertices.push({
        id: vertexId,
        position: { x, y, z },
        normal: { x: nx, y: ny, z: nz },
        selected: false,
      });
      posToVertexId.set(key, vertexId);
    }
    indexToVertexId.push(vertexId);
  }

  const faces: Face[] = [];
  const triCount = posAttr.count / 3;

  for (let i = 0; i < triCount; i++) {
    const i0 = i * 3;
    const v0 = indexToVertexId[i0];
    const v1 = indexToVertexId[i0 + 1];
    const v2 = indexToVertexId[i0 + 2];

    if (v0 === v1 || v1 === v2 || v0 === v2) continue;

    const p0 = vertices.find(v => v.id === v0)!.position;
    const p1 = vertices.find(v => v.id === v1)!.position;
    const p2 = vertices.find(v => v.id === v2)!.position;

    const edge1 = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z };
    const edge2 = { x: p2.x - p0.x, y: p2.y - p0.y, z: p2.z - p0.z };
    const normal: MeshVector3 = {
      x: edge1.y * edge2.z - edge1.z * edge2.y,
      y: edge1.z * edge2.x - edge1.x * edge2.z,
      z: edge1.x * edge2.y - edge1.y * edge2.x,
    };
    const len = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
    if (len > 0) { normal.x /= len; normal.y /= len; normal.z /= len; }

    faces.push({
      id: uuidv4(),
      vertexIds: [v0, v1, v2],
      normal,
      selected: false,
    });
  }

  const edges: Edge[] = [];
  const edgeMap = new Map<string, Edge>();

  for (const face of faces) {
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
        edges.push(edge);
      } else {
        edgeMap.get(key)!.faceIds.push(face.id);
      }
    }
  }

  geo.dispose();

  return {
    id: uuidv4(),
    vertices,
    edges,
    faces,
  };
}

export function primitiveToEditableMesh(
  geometryType: string,
  scale: [number, number, number] = [1, 1, 1]
): EditableMesh {
  const geometry = createGeometry(geometryType);
  const result = bufferGeometryToEditableMesh(geometry, scale);
  geometry.dispose();
  return result;
}
