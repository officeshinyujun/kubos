// EdgeBox.tsx
'use client'

import { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

interface EdgeBoxProps {
  size: [number, number, number];
  position?: [number, number, number];
  color?: string;
  pointSize?: number;
}

export default function EdgeBox({
  size,
  position = [0, 0, 0],
  color = "red",
  pointSize = 0.05,
}: EdgeBoxProps) {
  // BoxGeometry 생성
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(...size), [size]);

  // Edges 추출
  const edges = useMemo(() => new THREE.EdgesGeometry(boxGeometry), [boxGeometry]);

  // 클릭 가능한 점 좌표 계산 (모서리 + 각 선의 중간)
  const points = useMemo(() => {
    //@ts-ignore
    const vertices = edges.attributes.position.array as number[];
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < vertices.length; i += 6) {
      // 각 edge의 양 끝 점
      const start = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
      const end = new THREE.Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);

      pts.push(start); // 시작점
      pts.push(end);   // 끝점

      // 중간점
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      pts.push(mid);
    }
    return pts;
  }, [edges]);

  return (
    <group position={position}>
      {/* Edge만 표시 */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>

      {/* 클릭 가능한 점 표시 */}
      {points.map((p, idx) => (
        <mesh
          key={idx}
          position={p}
          onClick={() => console.log("Clicked point:", p)}
        >
          <sphereGeometry args={[pointSize, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}
