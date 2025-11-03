'use client'

import { useMemo, useState, useEffect } from "react";
import * as THREE from "three";

interface EdgeBoxProps {
  size: [number, number, number];
  position?: [number, number, number];
  color?: string; // EdgeBox 기본 색상
  pointSize?: number;
  coneSize?: number;
  orbitControlSetter?: (enabled: boolean) => void;
}

export default function EdgeBox({
  size,
  position = [0, 0, 0],
  color = "white",
  pointSize = 0.05,
  coneSize = 0.2,
  orbitControlSetter,
}: EdgeBoxProps) {
  const [moveMode, setMoveMode] = useState(false);
  const [parentGroup, setParentGroup] = useState<THREE.Group | null>(null);

  const [width, height, depth] = size;

  const boxGeometry = useMemo(() => new THREE.BoxGeometry(...size), [size]);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(boxGeometry), [boxGeometry]);

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

  const conePosition: [number, number, number] = [0, height / 2 + coneSize / 2, 0];

  // 휠 이동
  const onWheel = (e: WheelEvent) => {
    if (!moveMode || !parentGroup) return;
    e.preventDefault();
    parentGroup.position.y += e.deltaY * -0.01;
  };

  // 외부 클릭 시 이동 모드 종료
  const onClickOutside = () => {
    if (!moveMode) return;
    setMoveMode(false);
  };

  useEffect(() => {
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [moveMode, parentGroup]);

  // OrbitControls 제어
  useEffect(() => {
    orbitControlSetter?.(!moveMode);
  }, [moveMode]);

  return (
    <group
      position={position}
      ref={(g) => g && setParentGroup(g.parent as THREE.Group)}
    >
      {/* Edge 선 */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>

      {/* 클릭 포인트 */}
      {points.map((p, idx) => (
        <mesh key={idx} position={p}>
          <sphereGeometry args={[pointSize, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}

      {/* 상단 중앙 원뿔 */}
      <mesh
        position={conePosition}
        onClick={(e) => {
          e.stopPropagation();
          setMoveMode(true);
        }}
      >
        <coneGeometry args={[coneSize / 2, coneSize, 16]} />
        <meshBasicMaterial color={moveMode ? "red" : color} />
      </mesh>
    </group>
  );
}
