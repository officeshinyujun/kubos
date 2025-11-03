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
  onWidthChange?: (deltaX: number) => void; // 폭 변경 콜백 (X)
  onDepthChange?: (deltaX: number) => void; // 깊이 변경 콜백 (Z)
}

export default function EdgeBox({
  size,
  position = [0, 0, 0],
  color = "white",
  pointSize = 0.05,
  coneSize = 0.2,
  orbitControlSetter,
  onHeightChange, // 새로 추가된 prop
  onWidthChange,
  onDepthChange,
}: EdgeBoxProps) {
  const [moveMode, setMoveMode] = useState(false);
  const [isResizingHeight, setIsResizingHeight] = useState(false); // 높이 조절 모드
  const [isResizingWidth, setIsResizingWidth] = useState<null | 'left' | 'right'>(null); // 폭 조절 모드
  const [isResizingDepth, setIsResizingDepth] = useState<null | 'front' | 'back'>(null); // 깊이 조절 모드
  const [parentGroup, setParentGroup] = useState<THREE.Group | null>(null);
  const lastMouseY = useRef(0); // 마우스 Y 위치 추적
  const lastMouseX = useRef(0); // 마우스 X 위치 추적

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

  // 좌/우 엣지 핸들 (X축 폭 변경) – 상자 중앙 높이(y=0)에서 배치
  const edgeHandleSize = 0.12;
  const leftHandlePosition: [number, number, number] = [-(width / 2 + edgeHandleSize / 2), 0, 0];
  const rightHandlePosition: [number, number, number] = [(width / 2 + edgeHandleSize / 2), 0, 0];

  // 앞/뒤 엣지 핸들 (Z축 깊이 변경)
  const frontHandlePosition: [number, number, number] = [0, 0, -(depth / 2 + edgeHandleSize / 2)];
  const backHandlePosition: [number, number, number] = [0, 0, (depth / 2 + edgeHandleSize / 2)];

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

    // 높이/폭/깊이 조절 마우스 이동
    const onMouseMove = (e: MouseEvent) => {
      // Height
      if (isResizingHeight) {
        const deltaY = (lastMouseY.current - e.clientY) * 0.02; // 감도 조절
        onHeightChange?.(deltaY);
        lastMouseY.current = e.clientY;
      }
      // Width (X) – 좌/우에 따라 방향 부호 보정
      if (isResizingWidth) {
        const rawDeltaX = (e.clientX - lastMouseX.current) * 0.02; // 감도 조절
        const signedDeltaX = isResizingWidth === 'left' ? -rawDeltaX : rawDeltaX;
        onWidthChange?.(signedDeltaX);
        lastMouseX.current = e.clientX;
      }
      // Depth (Z) – 전/후에 따라 방향 부호 보정 (마우스 X에 매핑)
      if (isResizingDepth) {
        const rawDeltaX = (e.clientX - lastMouseX.current) * 0.02; // 감도 조절
        const signedDeltaZ = isResizingDepth === 'front' ? -rawDeltaX : rawDeltaX;
        onDepthChange?.(signedDeltaZ);
        lastMouseX.current = e.clientX;
      }
    };

    // 리사이즈 종료
    const onMouseUp = () => {
      if (isResizingHeight) setIsResizingHeight(false);
      if (isResizingWidth) setIsResizingWidth(null);
      if (isResizingDepth) setIsResizingDepth(null);
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
  }, [moveMode, parentGroup, isResizingHeight, isResizingWidth, isResizingDepth, onHeightChange, onWidthChange, onDepthChange]);

  // OrbitControls 제어 (이동 모드 또는 리사이즈 모드일 때 비활성화)
  useEffect(() => {
    orbitControlSetter?.(!moveMode && !isResizingHeight && !isResizingWidth && !isResizingDepth);
  }, [moveMode, isResizingHeight, isResizingWidth, isResizingDepth, orbitControlSetter]);
  

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

      {/* 좌측 엣지 핸들 (Width -) */}
      <mesh
        position={leftHandlePosition}
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsResizingWidth('left');
          lastMouseX.current = e.clientX;
        }}
      >
        <boxGeometry args={[edgeHandleSize, edgeHandleSize, edgeHandleSize]} />
        <meshBasicMaterial color={isResizingWidth === 'left' ? "#4fc3f7" : color} />
      </mesh>

      {/* 우측 엣지 핸들 (Width +) */}
      <mesh
        position={rightHandlePosition}
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsResizingWidth('right');
          lastMouseX.current = e.clientX;
        }}
      >
        <boxGeometry args={[edgeHandleSize, edgeHandleSize, edgeHandleSize]} />
        <meshBasicMaterial color={isResizingWidth === 'right' ? "#4fc3f7" : color} />
      </mesh>

      {/* 전면 엣지 핸들 (Depth -) */}
      <mesh
        position={frontHandlePosition}
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsResizingDepth('front');
          lastMouseX.current = e.clientX;
        }}
      >
        <boxGeometry args={[edgeHandleSize, edgeHandleSize, edgeHandleSize]} />
        <meshBasicMaterial color={isResizingDepth === 'front' ? "#81c784" : color} />
      </mesh>

      {/* 후면 엣지 핸들 (Depth +) */}
      <mesh
        position={backHandlePosition}
        onPointerDown={(e) => {
          e.stopPropagation();
          setIsResizingDepth('back');
          lastMouseX.current = e.clientX;
        }}
      >
        <boxGeometry args={[edgeHandleSize, edgeHandleSize, edgeHandleSize]} />
        <meshBasicMaterial color={isResizingDepth === 'back' ? "#81c784" : color} />
      </mesh>
    </group>
  );
}