'use client'

import GeometryFactory from "./GeometryFactory";
import MaterialFactory from "./MaterialFactory";
import EdgeBox from "./EdgeBox";
import { GeometryType } from "@/types/model/GeometryType";
import { MaterialType } from "@/types/model/MaterialType";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useEditorStore } from "@/stores/useEditStore";

interface ModelProps {
  geometryType: GeometryType;
  geometryArgs?: any[];
  materialType?: MaterialType;
  materialProps?: Partial<React.ComponentProps<typeof MaterialFactory>>;
  position?: [number, number, number];
  scale?: [number, number, number]; // 📍 scale prop 추가
  orbitControlSetter?: (enabled: boolean) => void;
  onHeightChange?: (deltaY: number) => void;
  onWidthChange?: (deltaX: number) => void;
  onDepthChange?: (deltaX: number) => void;
}

export default function Model({
  geometryType,
  geometryArgs,
  materialType = "standard",
  materialProps = {},
  position = [0, 0, 0],
  scale = [1, 1, 1], // 📍 scale 기본값 설정
  orbitControlSetter,
  onHeightChange,
  onWidthChange,
  onDepthChange,
}: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [boxSize, setBoxSize] = useState<[number, number, number] | null>(null);

  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const selectObject = useEditorStore((s) => s.selectObject);

  const isSelected = selectedObjectId === meshRef.current?.uuid;

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
    <group ref={groupRef} position={position}>
      {/* 실제 모델 (scale 적용) */}
      <mesh
        ref={meshRef}
        scale={scale} // 📍 메쉬에 scale 적용
        onClick={(e) => {
          e.stopPropagation();
          if (meshRef.current) selectObject(meshRef.current.uuid);
        }}
      >
        <GeometryFactory type={geometryType} args={geometryArgs} />
        <MaterialFactory type={materialType} {...materialProps} />
      </mesh>

      {/* 선택된 경우 EdgeBox 표시 (계산된 boxSize 사용) */}
      {boxSize && isSelected && (
        <EdgeBox
          size={boxSize} // 📍 스케일이 적용된 최종 크기 전달
          position={[0, 0, 0]}
          color="#ffffff"
          pointSize={0.05}
          orbitControlSetter={orbitControlSetter}
          onHeightChange={onHeightChange}
          onWidthChange={onWidthChange}
          onDepthChange={onDepthChange}
        />
      )}
    </group>
  );
}