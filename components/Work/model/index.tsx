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
}

export default function Model({
  geometryType,
  geometryArgs,
  materialType = "standard",
  materialProps = {},
  position = [0, 0, 0],
}: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [boxSize, setBoxSize] = useState<[number, number, number] | null>(null);

  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const selectObject = useEditorStore((s) => s.selectObject);

  const isSelected = selectedObjectId === meshRef.current?.uuid;

  // Geometry 크기 계산
  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.BufferGeometry;
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox!;
      setBoxSize([
        bbox.max.x - bbox.min.x,
        bbox.max.y - bbox.min.y,
        bbox.max.z - bbox.min.z,
      ]);
    }
  }, [geometryType, geometryArgs]);

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          if (meshRef.current) selectObject(meshRef.current.uuid);
        }}
      >
        <GeometryFactory type={geometryType} args={geometryArgs} />
        <MaterialFactory type={materialType} {...materialProps} />
      </mesh>

      {boxSize && isSelected && (
        <EdgeBox
          size={boxSize}
          position={[0, 0, 0]} // 그룹 기준
          color="#ffffff"
          pointSize={0.05}
        />
      )}
    </group>
  );
}
