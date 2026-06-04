'use client'

import { useEditorStore } from '@/stores/useEditStore';

interface GizmoOverlayProps {
  visible: boolean;
  size?: number;
}

export default function GizmoOverlay({ visible, size = 0.8 }: GizmoOverlayProps) {
  const activeTool = useEditorStore((s) => s.activeTool);

  if (!visible) return null;

  const ringRadius = size;
  const tubeRadius = 0.008;
  const segments = 64;

  if (activeTool === 'rotate') {
    return (
      <group>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[ringRadius, tubeRadius, 8, segments]} />
          <meshBasicMaterial color="#FF4444" transparent opacity={0.7} depthTest={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[ringRadius, tubeRadius, 8, segments]} />
          <meshBasicMaterial color="#33FF33" transparent opacity={0.7} depthTest={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[ringRadius, tubeRadius, 8, segments]} />
          <meshBasicMaterial color="#4a9eff" transparent opacity={0.7} depthTest={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[ringRadius * 1.15, tubeRadius * 0.8, 8, segments]} />
          <meshBasicMaterial color="#888888" transparent opacity={0.4} depthTest={false} />
        </mesh>
      </group>
    );
  }

  if (activeTool === 'move') {
    const arrowLength = size * 1.2;
    const arrowHeadSize = size * 0.12;
    return (
      <group>
        <group>
          <mesh position={[arrowLength / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, arrowLength, 8]} />
            <meshBasicMaterial color="#FF4444" transparent opacity={0.8} depthTest={false} />
          </mesh>
          <mesh position={[arrowLength, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[arrowHeadSize, arrowHeadSize * 2, 8]} />
            <meshBasicMaterial color="#FF4444" transparent opacity={0.8} depthTest={false} />
          </mesh>
        </group>
        <group>
          <mesh position={[0, arrowLength / 2, 0]}>
            <cylinderGeometry args={[0.01, 0.01, arrowLength, 8]} />
            <meshBasicMaterial color="#33FF33" transparent opacity={0.8} depthTest={false} />
          </mesh>
          <mesh position={[0, arrowLength, 0]}>
            <coneGeometry args={[arrowHeadSize, arrowHeadSize * 2, 8]} />
            <meshBasicMaterial color="#33FF33" transparent opacity={0.8} depthTest={false} />
          </mesh>
        </group>
        <group>
          <mesh position={[0, 0, arrowLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.01, arrowLength, 8]} />
            <meshBasicMaterial color="#4a9eff" transparent opacity={0.8} depthTest={false} />
          </mesh>
          <mesh position={[0, 0, arrowLength]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[arrowHeadSize, arrowHeadSize * 2, 8]} />
            <meshBasicMaterial color="#4a9eff" transparent opacity={0.8} depthTest={false} />
          </mesh>
        </group>
      </group>
    );
  }

  if (activeTool === 'scale') {
    const axisLength = size * 1.0;
    const cubeSize = size * 0.08;
    return (
      <group>
        <group>
          <mesh position={[axisLength / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, axisLength, 8]} />
            <meshBasicMaterial color="#FF4444" transparent opacity={0.8} depthTest={false} />
          </mesh>
          <mesh position={[axisLength, 0, 0]}>
            <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
            <meshBasicMaterial color="#FF4444" transparent opacity={0.8} depthTest={false} />
          </mesh>
        </group>
        <group>
          <mesh position={[0, axisLength / 2, 0]}>
            <cylinderGeometry args={[0.01, 0.01, axisLength, 8]} />
            <meshBasicMaterial color="#33FF33" transparent opacity={0.8} depthTest={false} />
          </mesh>
          <mesh position={[0, axisLength, 0]}>
            <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
            <meshBasicMaterial color="#33FF33" transparent opacity={0.8} depthTest={false} />
          </mesh>
        </group>
        <group>
          <mesh position={[0, 0, axisLength / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.01, 0.01, axisLength, 8]} />
            <meshBasicMaterial color="#4a9eff" transparent opacity={0.8} depthTest={false} />
          </mesh>
          <mesh position={[0, 0, axisLength]}>
            <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
            <meshBasicMaterial color="#4a9eff" transparent opacity={0.8} depthTest={false} />
          </mesh>
        </group>
      </group>
    );
  }

  return null;
}
