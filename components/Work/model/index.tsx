// Model.tsx
'use client'

import GeometryFactory from "./GeometryFactory";
import MaterialFactory from "./MaterialFactory";
import EdgeBox from "./EdgeBox";
import { GeometryType } from "@/types/model/GeometryType";
import { MaterialType } from "@/types/model/MaterialType";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { is } from "@react-three/fiber/dist/declarations/src/core/utils";

interface ModelProps {
  geometryType: GeometryType;
  geometryArgs?: any[];
  materialType?: MaterialType;
  materialProps?: Partial<React.ComponentProps<typeof MaterialFactory>>;
  position?: [number, number, number];
}

export default function Model({
  geometryType,
  geometryArgs,
  materialType = "standard",
  materialProps = {},
  position = [0, 0, 0],
}: ModelProps) {
  const [active, setActive] = useState(false);
  const [boxSize, setBoxSize] = useState<[number, number, number] | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // GeometryFactory의 실제 크기를 계산
  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.BufferGeometry;
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox!;
      const size: [number, number, number] = [
        bbox.max.x - bbox.min.x,
        bbox.max.y - bbox.min.y,
        bbox.max.z - bbox.min.z,
      ];
      setBoxSize(size);
    }
  }, [geometryType, geometryArgs]);

  return (
    <>
      {/* 원본 모델 */}
      <mesh ref={meshRef} position={position} onClick={() => setActive(!active)}>
        <GeometryFactory type={geometryType} args={geometryArgs} />
        <MaterialFactory type={materialType} {...materialProps} />
      </mesh>

      {/* 클릭 가능한 EdgeBox 표시 */}
      {boxSize && active &&    (
        <EdgeBox
          size={boxSize}
          position={position}
          color="#ffffff" // 클릭 시 색 변경 예시
          pointSize={0.05}
        />
      )}
    </>
  );
}
