'use client'

import GeometryFactory from "./GeometryFactory";
import MaterialFactory from "./MaterialFactory";
import EdgeBox from "./EdgeBox";
import { GeometryType } from "@/types/model/GeometryType";
import { MaterialType } from "@/types/model/MaterialType";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useEditorStore } from "@/stores/useEditStore";
import { useSceneStore } from "@/stores/useSceneStore";
import { useTexture, TransformControls } from '@react-three/drei';

interface ModelProps {
  name: string;
  geometryType: GeometryType;
  geometryArgs?: any[];
  materialType?: MaterialType;
  materialProps?: Partial<React.ComponentProps<typeof MaterialFactory>>;
  position?: [number, number, number];
  scale?: [number, number, number]; // 📍 scale prop 추가
  texturePath?: string; // Add texturePath prop
  onHeightChange?: (deltaY: number) => void;
  onWidthChange?: (deltaX: number) => void;
  onDepthChange?: (deltaX: number) => void;
}

// Helper component to ensure useTexture is not called conditionally
const MaterialWithTexture = ({ materialType, materialProps, texturePath }: {
  materialType: MaterialType;
  materialProps?: Partial<React.ComponentProps<typeof MaterialFactory>>;
  texturePath: string;
}) => {
  const textureMap = useTexture(texturePath);
  return <MaterialFactory type={materialType} {...materialProps} map={textureMap} />;
};


export default function Model({
  name,
  geometryType,
  geometryArgs,
  materialType = "standard",
  materialProps = {},
  position = [0, 0, 0],
  scale = [1, 1, 1], // 📍 scale 기본값 설정
  texturePath, // Destructure texturePath
  onHeightChange,
  onWidthChange,
  onDepthChange,
}: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [boxSize, setBoxSize] = useState<[number, number, number] | null>(null);

  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const selectObject = useEditorStore((s) => s.selectObject);
  const activeTool = useEditorStore((s) => s.activeTool);
  const editorMode = useEditorStore((s) => s.editorMode);
  const setOrbitEnabled = useEditorStore((s) => s.setOrbitEnabled);
  const { updateObject } = useSceneStore();

  const isSelected = selectedObjectId === name;
  const showGizmo = isSelected && editorMode === 'object' && ['move', 'rotate', 'scale'].includes(activeTool);
  const gizmoMode = activeTool === 'rotate' ? 'rotate' : activeTool === 'scale' ? 'scale' : 'translate';

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setOrbitEnabled(!isDragging);
  }, [isDragging, setOrbitEnabled]);

  const handleTransform = () => {
    if (groupRef.current) {
      const pos = groupRef.current.position;
      const rot = groupRef.current.rotation;
      const scl = groupRef.current.scale;
      updateObject(name, {
        locate: { x: pos.x, y: pos.y, z: pos.z },
        rotate: { x: rot.x, y: rot.y, z: rot.z },
        scale: { x: scl.x, y: scl.y, z: scl.z },
      });
    }
  };

  // Geometry 크기 계산 (스케일 적용)
  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.BufferGeometry;
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox!;
      
      // 📍 지오메트리 바운딩 박스 크기에 scale을 곱하여 최종 크기 계산
      setBoxSize([
        (bbox.max.x - bbox.min.x) * scale[0],
        (bbox.max.y - bbox.min.y) * scale[1],
        (bbox.max.z - bbox.min.z) * scale[2],
      ]);
    }
    // 📍 geometryArgs와 scale이 변경될 때마다 크기 다시 계산
  }, [geometryType, geometryArgs, scale]);

  return (
    <group ref={groupRef} name={name} position={position}>
      {/* 실제 모델 (scale 적용) */}
      <mesh
        ref={meshRef}
        scale={scale} // 📍 메쉬에 scale 적용
        onClick={(e) => {
          e.stopPropagation();
          selectObject(name);
        }}
      >
        <GeometryFactory type={geometryType} args={geometryArgs} />
        {texturePath ? (
          <MaterialWithTexture 
            materialType={materialType} 
            materialProps={materialProps} 
            texturePath={texturePath} 
          />
        ) : (
          <MaterialFactory type={materialType} {...materialProps} />
        )}
      </mesh>

      {boxSize && isSelected && editorMode === 'object' && activeTool === 'select' && (
        <EdgeBox
          size={boxSize}
          position={[0, 0, 0]}
          color="#ffffff"
          pointSize={0.05}
          onHeightChange={onHeightChange}
          onWidthChange={onWidthChange}
          onDepthChange={onDepthChange}
        />
      )}

      {showGizmo && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={gizmoMode}
          onMouseUp={handleTransform}
          // @ts-ignore
          onDraggingChange={setIsDragging}
        />
      )}
    </group>
  );
}