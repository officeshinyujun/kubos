'use client'

import { useMemo, useState, useEffect, useRef } from "react";
import * as THREE from "three";

interface EdgeBoxProps {
  size: [number, number, number];
  position?: [number, number, number];
  color?: string; // EdgeBox 기본 색상
  pointSize?: number;
  coneSize?: number;
  orbitControlSetter?: (enabled: boolean) => void;
  onHeightChange?: (deltaY: number) => void; // 높이 변경 콜백
}

export default function EdgeBox({
  size,
  position = [0, 0, 0],
  color = "white",
  pointSize = 0.05,
  coneSize = 0.2,
  orbitControlSetter,
  onHeightChange, // 새로 추가된 prop
}: EdgeBoxProps) {
  const [moveMode, setMoveMode] = useState(false);
  const [isResizingHeight, setIsResizingHeight] = useState(false); // 높이 조절 모드
  const [parentGroup, setParentGroup] = useState<THREE.Group | null>(null);
  const lastMouseY = useRef(0); // 마우스 Y 위치 추적

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

  // 핸들 위치 계산
  const conePosition: [number, number, number] = [0, height / 2 + coneSize / 2, 0];
  const heightHandleSize = 0.15;
  const heightHandlePosition: [number, number, number] = [
    0,
    height / 2 + coneSize + heightHandleSize / 2 + 0.05, // 원뿔 + 핸들크기 + 약간의 여백
    0,
  ];

  // 휠 이동, 마우스 드래그, 외부 클릭 이벤트 핸들러
  useEffect(() => {
    // 휠 이동
    const onWheel = (e: WheelEvent) => {
      if (!moveMode || !parentGroup) return;
      e.preventDefault();
      parentGroup.position.y += e.deltaY * -0.01;
    };

    // 외부 클릭 시 이동 모드 종료
    const onClickOutside = (e: MouseEvent) => {
      if (moveMode) {
        setMoveMode(false);
      }
    };

    // 높이 조절 마우스 이동
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingHeight) return;
      
      // 마우스 이동량(delta) 계산 (위로 가면 +)
      const deltaY = (lastMouseY.current - e.clientY) * 0.02; // 감도 조절
      onHeightChange?.(deltaY);
      lastMouseY.current = e.clientY;
    };

    // 높이 조절 종료
    const onMouseUp = () => {
      if (isResizingHeight) {
        setIsResizingHeight(false);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mousedown", onClickOutside);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [moveMode, parentGroup, isResizingHeight, onHeightChange]);

  // OrbitControls 제어 (이동 모드 또는 리사이즈 모드일 때 비활성화)
  useEffect(() => {
    orbitControlSetter?.(!moveMode && !isResizingHeight);
  }, [moveMode, isResizingHeight, orbitControlSetter]);
  

  return (
    <group
      position={position}
      // @ts-ignore
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

      {/* 상단 중앙 원뿔 (Y축 이동) */}
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

      {/* 상단 중앙 큐브 (Height 조절) */}
      <mesh
        position={heightHandlePosition}
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsResizingHeight(true);
          lastMouseY.current = e.clientY; // 현재 마우스 Y위치 저장
        }}
      >
        <boxGeometry args={[heightHandleSize, heightHandleSize, heightHandleSize]} />
        <meshBasicMaterial color={isResizingHeight ? "blue" : color} />
      </mesh>
    </group>
  );
}