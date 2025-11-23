'use client'

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useEditorStore } from "@/stores/useEditStore";
import { useStackStore } from "@/stores/useStackStore";
import { useSceneStore } from "@/stores/useSceneStore";
import { ModelType } from "@/types/model/modelType";
import * as THREE from "three";

export default function ArrowMoveControl() {
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const { scene, camera } = useThree();
  const push = useStackStore((s) => s.push);
  const undo = useStackStore((s) => s.undo);
  const redo = useStackStore((s) => s.redo);
  const { updateObject } = useSceneStore();
  const { isOrbitEnabled, setOrbitEnabled } = useEditorStore();

  useEffect(() => {
    const GRID_SNAP_SIZE = 0.1; // Define grid snap size
    const MOVE = GRID_SNAP_SIZE;

    const saveState = (group: THREE.Object3D) => {
      push({
        uuid: group.uuid,
        position: [group.position.x, group.position.y, group.position.z],
        rotation: [group.rotation.x, group.rotation.y, group.rotation.z],
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedObjectId) return;

      const group = scene.getObjectByName(selectedObjectId);
      if (!group) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        const prev = undo();
        if (prev && prev.uuid === group.uuid) {
          group.position.set(...prev.position);
          group.rotation.set(...prev.rotation);
          updateObject(selectedObjectId, {
            locate: {
              x: prev.position[0],
              y: prev.position[1],
              z: prev.position[2],
            },
            rotate: {
              x: prev.rotation[0],
              y: prev.rotation[1],
              z: prev.rotation[2],
            },
          });
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === "Y" || (e.shiftKey && e.key === "Z"))) {
        const next = redo();
        if (next && next.uuid === group.uuid) {
          group.position.set(...next.position);
          group.rotation.set(...next.rotation);
          updateObject(selectedObjectId, {
            locate: {
              x: next.position[0],
              y: next.position[1],
              z: next.position[2],
            },
            rotate: {
              x: next.rotation[0],
              y: next.rotation[1],
              z: next.rotation[2],
            },
          });
        }
        return;
      }

      const isArrowKey = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key);
      if (isArrowKey && isOrbitEnabled) {
        setOrbitEnabled(false);
      }
      if (!isArrowKey) {
        return;
      }
      
      saveState(group);

      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      const forward = new THREE.Vector3(
        cameraDirection.x,
        0,
        cameraDirection.z
      ).normalize();
      const right = new THREE.Vector3(-forward.z, 0, forward.x);

      let finalMoveVector = new THREE.Vector3(); // Declare once

      if (e.shiftKey) { // Handle vertical movement with Shift
        if (e.key === "ArrowUp") {
          finalMoveVector.set(0, MOVE, 0);
        } else if (e.key === "ArrowDown") {
          finalMoveVector.set(0, -MOVE, 0);
        }
      } else { // Handle horizontal (forward/backward/left/right) movement
        switch (e.key) {
          case "ArrowUp": // Forward
            finalMoveVector.copy(forward).multiplyScalar(MOVE);
            break;
          case "ArrowDown": // Backward
            finalMoveVector.copy(forward).multiplyScalar(-MOVE);
            break;
          case "ArrowLeft": // Left
            finalMoveVector.copy(right).multiplyScalar(-MOVE);
            break;
          case "ArrowRight": // Right
            finalMoveVector.copy(right).multiplyScalar(MOVE);
            break;
        }
      }
      
      group.position.add(finalMoveVector);

      // Apply grid snapping
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
  }, [selectedObjectId, scene, camera, push, undo, redo, updateObject, isOrbitEnabled, setOrbitEnabled]);

  return null;
}
