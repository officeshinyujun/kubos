'use client'

import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useEditorStore } from '../../../stores/useEditStore';
import { useSceneStore } from '../../../stores/useSceneStore';
import { LightType } from '../../../types/model/modelType';
import {
  TransformControls,
} from '@react-three/drei';
import { useHelper } from '@react-three/drei';

interface LightRendererProps {
  light: LightType;
}

export default function LightRenderer({ light }: LightRendererProps) {
  const { selectedObjectId, selectObject, setOrbitEnabled, transformMode } = useEditorStore();
  const { updateObject } = useSceneStore();
  
  const lightRef = useRef<THREE.Light>(null!);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setOrbitEnabled(!isDragging);
  }, [isDragging, setOrbitEnabled]);

  const isSelected = selectedObjectId === light.name;

  // Use the useHelper hook from drei
  useHelper(isSelected && lightRef, 
    // @ts-ignore
    light.light === 'directional' ? THREE.DirectionalLightHelper :
    light.light === 'point' ? THREE.PointLightHelper :
    light.light === 'spot' ? THREE.SpotLightHelper : null,
    1, // size of the helper
    light.color
  );

  const handleTransform = () => {
    if (lightRef.current) {
      const { x: lx, y: ly, z: lz } = lightRef.current.position;
      const { x: rx, y: ry, z: rz } = lightRef.current.rotation;
      updateObject(light.name, { locate: { x: lx, y: ly, z: lz }, rotate: {x: rx, y:ry, z:rz} });
    }
  };

  const LightComponent = (() => {
    const position: [number, number, number] = [light.locate.x, light.locate.y, light.locate.z];
    const rotation: [number, number, number] = [light.rotate.x, light.rotate.y, light.rotate.z];

    switch (light.light) {
      case 'ambient':
        return <ambientLight ref={lightRef as any} intensity={light.intensity} color={light.color} />;
      case 'directional':
        return (
            <directionalLight
                ref={lightRef as any}
                position={position}
                rotation={rotation}
                intensity={light.intensity}
                color={light.color}
            />
        );
      case 'point':
        return (
          <pointLight
            ref={lightRef as any}
            position={position}
            rotation={rotation} // pointlight doesn't use rotation but for consistency
            intensity={light.intensity}
            color={light.color}
          />
        );
      case 'spot':
        return (
            <spotLight
                ref={lightRef as any}
                position={position}
                rotation={rotation}
                intensity={light.intensity}
                color={light.color}
                angle={light.angle || 0.1}
            />
        );
      default:
        return null;
    }
  })();

  return (
    <>
      {/* The light component is rendered directly. It's wrapped in a group below for selection purposes, but TransformControls needs the actual light object */}
      {LightComponent}
      {isSelected && light.light !== 'ambient' && lightRef.current && (
        <TransformControls 
          mode={transformMode}
          object={lightRef.current} 
          onMouseUp={handleTransform} 
          // @ts-ignore
          onDraggingChange={setIsDragging}
        />
      )}
      {/* A clickable, visible marker for selection */}
      {light.light !== 'ambient' && 
        <mesh
            position={[light.locate.x, light.locate.y, light.locate.z]}
            onClick={(e) => { e.stopPropagation(); selectObject(light.name); }}
        >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color={light.color} toneMapped={false} />
        </mesh>
      }
    </>
  );
}
