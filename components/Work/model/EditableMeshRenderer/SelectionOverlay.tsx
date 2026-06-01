'use client'

import { useMemo } from 'react';
import * as THREE from 'three';
import type { EditableMesh } from '@/types/model/editableMesh';

interface SelectionOverlayProps {
  meshData: EditableMesh;
  selectionMode: 'vertex' | 'edge' | 'face';
}

export default function SelectionOverlay({ meshData, selectionMode }: SelectionOverlayProps) {
  const selectedVertices = useMemo(() =>
    meshData.vertices.filter(v => v.selected),
    [meshData]
  );

  const selectedEdgeLines = useMemo(() => {
    const selected = meshData.edges.filter(e => e.selected);
    const points: THREE.Vector3[] = [];
    for (const edge of selected) {
      const v0 = meshData.vertices.find(v => v.id === edge.vertexIds[0]);
      const v1 = meshData.vertices.find(v => v.id === edge.vertexIds[1]);
      if (v0 && v1) {
        points.push(new THREE.Vector3(v0.position.x, v0.position.y, v0.position.z));
        points.push(new THREE.Vector3(v1.position.x, v1.position.y, v1.position.z));
      }
    }
    return points;
  }, [meshData]);

  const faceOverlayGeo = useMemo(() => {
    const selectedFaces = meshData.faces.filter(f => f.selected);
    if (selectedFaces.length === 0) return null;

    const positions: number[] = [];
    const vertexMap = new Map(meshData.vertices.map(v => [v.id, v]));

    for (const face of selectedFaces) {
      const verts = face.vertexIds.map(id => vertexMap.get(id)).filter(Boolean);
      if (verts.length >= 3) {
        for (let i = 1; i < verts.length - 1; i++) {
          positions.push(verts[0]!.position.x, verts[0]!.position.y, verts[0]!.position.z);
          positions.push(verts[i]!.position.x, verts[i]!.position.y, verts[i]!.position.z);
          positions.push(verts[i+1]!.position.x, verts[i+1]!.position.y, verts[i+1]!.position.z);
        }
      }
    }

    if (positions.length === 0) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return geo;
  }, [meshData]);

  return (
    <group>
      {selectionMode === 'vertex' && selectedVertices.map(v => (
        <mesh key={v.id} position={[v.position.x, v.position.y, v.position.z]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#ff6b4a" />
        </mesh>
      ))}

      {selectionMode === 'edge' && selectedEdgeLines.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(selectedEdgeLines.flatMap(p => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#4a9eff" linewidth={2} />
        </lineSegments>
      )}

      {selectionMode === 'face' && faceOverlayGeo && (
        <mesh>
          <primitive object={faceOverlayGeo} attach="geometry" />
          <meshBasicMaterial color="#ff6b4a" transparent opacity={0.3} side={THREE.DoubleSide} depthTest={false} />
        </mesh>
      )}
    </group>
  );
}
