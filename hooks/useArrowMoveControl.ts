'use client'

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useEditorStore } from "@/stores/useEditStore";
import * as THREE from "three";

export default function ArrowMoveControl() {
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const MOVE = 0.1;
    const cameraDir = new THREE.Vector3();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedObjectId) return;

      const obj = scene.getObjectByProperty("uuid", selectedObjectId);
      if (!obj) return;

      const group = obj.parent;
      if (!group) return;

      // ✅ 카메라 방향 가져오기
      camera.getWorldDirection(cameraDir);

      // ✅ 정면(-Z)을 0°로 기준 맞춤
      let angle = Math.atan2(cameraDir.x, -cameraDir.z) * (180 / Math.PI);

      let moveX = 0;
      let moveZ = 0;

      // -45° ~ 45° : 정면
      if (angle >= -45 && angle < 45) {
        if (e.key === "ArrowLeft") moveX -= MOVE;
        if (e.key === "ArrowRight") moveX += MOVE;
        if (e.key === "ArrowUp") moveZ -= MOVE;
        if (e.key === "ArrowDown") moveZ += MOVE;
      }
      // 45° ~ 135° : 오른쪽
      else if (angle >= 45 && angle < 135) {
        if (e.key === "ArrowLeft") moveZ -= MOVE;
        if (e.key === "ArrowRight") moveZ += MOVE;
        if (e.key === "ArrowUp") moveX += MOVE;
        if (e.key === "ArrowDown") moveX -= MOVE;
      }
      // 135° ~ -135° : 뒤
      else if (angle >= 135 || angle < -135) {
        if (e.key === "ArrowLeft") moveX += MOVE;
        if (e.key === "ArrowRight") moveX -= MOVE;
        if (e.key === "ArrowUp") moveZ += MOVE;
        if (e.key === "ArrowDown") moveZ -= MOVE;
      }
      // -135° ~ -45° : 왼쪽
      else if (angle >= -135 && angle < -45) {
        if (e.key === "ArrowLeft") moveZ += MOVE;
        if (e.key === "ArrowRight") moveZ -= MOVE;
        if (e.key === "ArrowUp") moveX -= MOVE;
        if (e.key === "ArrowDown") moveX += MOVE;
      }

      group.position.x += moveX;
      group.position.z += moveZ;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjectId, scene, camera]);

  return null;
}
