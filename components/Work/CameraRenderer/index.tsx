'use client'

import { useRef } from 'react';
import * as THREE from 'three';
import { useEditorStore } from '../../../stores/useEditStore';
import { useSceneStore } from '../../../stores/useSceneStore';
import { CameraType } from '../../../types/model/modelType';
import { TransformControls, PerspectiveCamera } from '@react-three/drei';
import { useHelper } from '@react-three/drei';

interface CameraRendererProps {
  camera: CameraType;
}

export default function CameraRenderer({ camera }: CameraRendererProps) {
  const { selectedObjectId, selectObject, setOrbitEnabled, transformMode } = useEditorStore();
  const { updateObject } = useSceneStore();
  
  const cameraRef = useRef<THREE.Camera>(null!);

  const isSelected = selectedObjectId === camera.name;

  useHelper(isSelected && cameraRef, THREE.CameraHelper);

  const handleTransform = () => {
    if (cameraRef.current) {
      const { x: lx, y: ly, z: lz } = cameraRef.current.position;
      const { x: rx, y: ry, z: rz } = cameraRef.current.rotation;
      updateObject(camera.name, { locate: { x: lx, y: ly, z: lz }, rotate: {x: rx, y:ry, z:rz} });
    }
  };

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        name={camera.name}
        position={[camera.locate.x, camera.locate.y, camera.locate.z]}
        rotation={[camera.rotate.x, camera.rotate.y, camera.rotate.z]}
        fov={camera.fov}
      />
      {isSelected && (
        <TransformControls 
          object={cameraRef.current} 
          onMouseUp={handleTransform}
          onDraggingChange={(e) => setOrbitEnabled(!e)}
          mode={transformMode}
        />
      )}
      {/* A visible box marker for the camera */}
      <mesh
          position={[camera.locate.x, camera.locate.y, camera.locate.z]}
          onClick={(e) => { e.stopPropagation(); selectObject(camera.name); }}
      >
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color="white" /> {/* Default color for the marker */}
      </mesh>
    </>
  );
}
