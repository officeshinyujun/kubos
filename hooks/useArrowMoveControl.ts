'use client'

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useEditorStore } from "@/stores/useEditStore";
import { useSceneStore } from "@/stores/useSceneStore";
import * as THREE from "three";

export default function ArrowMoveControl() {
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const { scene, camera } = useThree();
  const { updateObject } = useSceneStore();
  const { isOrbitEnabled, setOrbitEnabled } = useEditorStore();

  useEffect(() => {
    const GRID_SNAP_SIZE = 0.1;
    const MOVE = GRID_SNAP_SIZE;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedObjectId) return;

      const group = scene.getObjectByName(selectedObjectId);
      if (!group) return;

      const isArrowKey = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key);
      if (isArrowKey && isOrbitEnabled) {
        setOrbitEnabled(false);
      }
      if (!isArrowKey) {
        return;
      }

      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      const forward = new THREE.Vector3(
        cameraDirection.x,
        0,
        cameraDirection.z
      ).normalize();
      const right = new THREE.Vector3(-forward.z, 0, forward.x);

      let finalMoveVector = new THREE.Vector3();

      if (e.shiftKey) {
        if (e.key === "ArrowUp") {
          finalMoveVector.set(0, MOVE, 0);
        } else if (e.key === "ArrowDown") {
          finalMoveVector.set(0, -MOVE, 0);
        }
      } else {
        switch (e.key) {
          case "ArrowUp":
            finalMoveVector.copy(forward).multiplyScalar(MOVE);
            break;
          case "ArrowDown":
            finalMoveVector.copy(forward).multiplyScalar(-MOVE);
            break;
          case "ArrowLeft":
            finalMoveVector.copy(right).multiplyScalar(-MOVE);
            break;
          case "ArrowRight":
            finalMoveVector.copy(right).multiplyScalar(MOVE);
            break;
        }
      }
      
      group.position.add(finalMoveVector);

      group.position.set(
        Math.round(group.position.x / GRID_SNAP_SIZE) * GRID_SNAP_SIZE,
        Math.round(group.position.y / GRID_SNAP_SIZE) * GRID_SNAP_SIZE,
        Math.round(group.position.z / GRID_SNAP_SIZE) * GRID_SNAP_SIZE
      );

      updateObject(selectedObjectId, {
        locate: {
          x: group.position.x,
          y: group.position.y,
          z: group.position.z,
        },
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const isArrowKey = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key);
      if (isArrowKey && !isOrbitEnabled) {
        setOrbitEnabled(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedObjectId, scene, camera, updateObject, isOrbitEnabled, setOrbitEnabled]);

  return null;
}
