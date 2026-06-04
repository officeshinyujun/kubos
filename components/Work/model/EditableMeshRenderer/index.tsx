'use client'

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useEditorStore } from '@/stores/useEditStore';
import { useSceneStore } from '@/stores/useSceneStore';
import { TransformControls } from '@react-three/drei';
import { snapVector3 } from '@/hooks/useSnapping';
import type { EditableMesh } from '@/types/model/editableMesh';
import SelectionOverlay from './SelectionOverlay';
import GizmoOverlay from '../GizmoOverlay';

interface EditableMeshRendererProps {
  name: string;
  meshData: EditableMesh;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export default function EditableMeshRenderer({
  name,
  meshData,
  position,
  rotation,
  scale,
}: EditableMeshRendererProps) {
  const groupRef = useRef<THREE.Group>(null);

  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const selectObject = useEditorStore((s) => s.selectObject);
  const editorMode = useEditorStore((s) => s.editorMode);
  const selectionMode = useEditorStore((s) => s.selectionMode);
  const activeTool = useEditorStore((s) => s.activeTool);
  const orientationMode = useEditorStore((s) => s.orientationMode);
  const setOrbitEnabled = useEditorStore((s) => s.setOrbitEnabled);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const snapIncrement = useEditorStore((s) => s.snapIncrement);
  const { updateObject, updateMeshSelection } = useSceneStore();

  const isSelected = selectedObjectId === name;
  const showGizmo = isSelected && editorMode === 'object' && ['move', 'rotate', 'scale'].includes(activeTool);
  const gizmoMode = activeTool === 'rotate' ? 'rotate' : activeTool === 'scale' ? 'scale' : 'translate';
  const gizmoSpace = orientationMode === 'local' ? 'local' : 'world';

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    const vertexIdToIndex = new Map<string, number>();
    meshData.vertices.forEach((v, i) => vertexIdToIndex.set(v.id, i));

    const positions = new Float32Array(meshData.vertices.length * 3);
    const normals = new Float32Array(meshData.vertices.length * 3);

    meshData.vertices.forEach((v, i) => {
      positions[i * 3] = v.position.x;
      positions[i * 3 + 1] = v.position.y;
      positions[i * 3 + 2] = v.position.z;
      normals[i * 3] = v.normal.x;
      normals[i * 3 + 1] = v.normal.y;
      normals[i * 3 + 2] = v.normal.z;
    });

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

    const indices: number[] = [];
    for (const face of meshData.faces) {
      const faceIndices = face.vertexIds.map(id => vertexIdToIndex.get(id)!).filter(i => i !== undefined);
      if (faceIndices.length === 3) {
        indices.push(faceIndices[0], faceIndices[1], faceIndices[2]);
      } else if (faceIndices.length === 4) {
        indices.push(faceIndices[0], faceIndices[1], faceIndices[2]);
        indices.push(faceIndices[0], faceIndices[2], faceIndices[3]);
      } else if (faceIndices.length > 4) {
        for (let i = 1; i < faceIndices.length - 1; i++) {
          indices.push(faceIndices[0], faceIndices[i], faceIndices[i + 1]);
        }
      }
    }

    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, [meshData]);

  const faceIndexMap = useMemo(() => {
    const map: string[] = [];
    for (const face of meshData.faces) {
      if (face.vertexIds.length === 3) {
        map.push(face.id);
      } else if (face.vertexIds.length === 4) {
        map.push(face.id);
        map.push(face.id);
      } else {
        for (let i = 0; i < face.vertexIds.length - 2; i++) {
          map.push(face.id);
        }
      }
    }
    return map;
  }, [meshData]);

  const handleClick = (e: any) => {
    e.stopPropagation();

    if (editorMode === 'object') {
      selectObject(name);
      return;
    }

    if (editorMode === 'edit' && isSelected) {
      const faceIndex = e.faceIndex;
      if (faceIndex === undefined || faceIndex === null) return;

      const additive = e.nativeEvent?.shiftKey || false;

      if (selectionMode === 'face') {
        const faceId = faceIndexMap[faceIndex];
        if (faceId) {
          updateMeshSelection(name, { faceIds: [faceId] }, additive);
        }
      } else if (selectionMode === 'vertex') {
        const point = e.point as THREE.Vector3;
        const localPoint = groupRef.current
          ? groupRef.current.worldToLocal(point.clone())
          : point;

        let closestVertex = meshData.vertices[0];
        let closestDist = Infinity;
        for (const v of meshData.vertices) {
          const dist = (v.position.x - localPoint.x) ** 2 +
            (v.position.y - localPoint.y) ** 2 +
            (v.position.z - localPoint.z) ** 2;
          if (dist < closestDist) {
            closestDist = dist;
            closestVertex = v;
          }
        }
        if (closestVertex) {
          updateMeshSelection(name, { vertexIds: [closestVertex.id] }, additive);
        }
      } else if (selectionMode === 'edge') {
        const faceId = faceIndexMap[faceIndex];
        const face = meshData.faces.find(f => f.id === faceId);
        if (face) {
          const faceEdges = meshData.edges.filter(edge => edge.faceIds.includes(face.id));
          if (faceEdges.length > 0) {
            const point = e.point as THREE.Vector3;
            const localPoint = groupRef.current
              ? groupRef.current.worldToLocal(point.clone())
              : point;

            let closestEdge = faceEdges[0];
            let closestDist = Infinity;
            for (const edge of faceEdges) {
              const v0 = meshData.vertices.find(v => v.id === edge.vertexIds[0]);
              const v1 = meshData.vertices.find(v => v.id === edge.vertexIds[1]);
              if (v0 && v1) {
                const midX = (v0.position.x + v1.position.x) / 2;
                const midY = (v0.position.y + v1.position.y) / 2;
                const midZ = (v0.position.z + v1.position.z) / 2;
                const dist = (midX - localPoint.x) ** 2 +
                  (midY - localPoint.y) ** 2 +
                  (midZ - localPoint.z) ** 2;
                if (dist < closestDist) {
                  closestDist = dist;
                  closestEdge = edge;
                }
              }
            }
            if (closestEdge) {
              updateMeshSelection(name, { edgeIds: [closestEdge.id] }, additive);
            }
          }
        }
      }
    }
  };

  const handleTransform = () => {
    if (groupRef.current) {
      const pos = groupRef.current.position;
      const rot = groupRef.current.rotation;
      const scl = groupRef.current.scale;

      const locate = snapEnabled
        ? snapVector3(pos.x, pos.y, pos.z, snapIncrement)
        : { x: pos.x, y: pos.y, z: pos.z };

      if (snapEnabled) {
        groupRef.current.position.set(locate.x, locate.y, locate.z);
      }

      updateObject(name, {
        locate,
        rotate: { x: rot.x, y: rot.y, z: rot.z },
        scale: { x: scl.x, y: scl.y, z: scl.z },
      });
    }
  };

  return (
    <group ref={groupRef} name={name} position={position} rotation={rotation} scale={scale}>
      <mesh onClick={handleClick}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial color="#cccccc" side={THREE.DoubleSide} />
      </mesh>

      {isSelected && editorMode === 'edit' && (
        <SelectionOverlay meshData={meshData} selectionMode={selectionMode as 'vertex' | 'edge' | 'face'} />
      )}

      {showGizmo && (
        <GizmoOverlay visible={true} />
      )}

      {showGizmo && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={gizmoMode}
          space={gizmoSpace}
          onMouseUp={handleTransform}
          // @ts-ignore
          onDraggingChange={(dragging: boolean) => setOrbitEnabled(!dragging)}
        />
      )}
    </group>
  );
}
