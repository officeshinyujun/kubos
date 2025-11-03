'use client'

import { useMemo } from "react";
import * as THREE from "three";

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
  // BoxGeometry 생성 (항상 중심이 0,0,0)
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(...size), [size]);

  // EdgesGeometry 생성
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(boxGeometry), [boxGeometry]);

  // 클릭 포인트 계산 (모서리 + 선 중간)
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const positions = edgesGeometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 6) {
      const start = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      const end = new THREE.Vector3(positions[i + 3], positions[i + 4], positions[i + 5]);
      pts.push(start, end, new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5));
    }
    return pts;
  }, [edgesGeometry]);

  return (
    <group position={position}>
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>

      {points.map((p, idx) => (
        <mesh key={idx} position={p} onClick={() => console.log("Clicked point:", p)}>
          <sphereGeometry args={[pointSize, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}
