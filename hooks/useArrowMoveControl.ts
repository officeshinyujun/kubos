'use client'

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useEditorStore } from "@/stores/useEditStore";
import { useStackStore } from "@/stores/useStackStore";
import * as THREE from "three";

export default function ArrowMoveControl() {
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const { scene, camera } = useThree();
  const push = useStackStore((s) => s.push);
  const undo = useStackStore((s) => s.undo);
  const redo = useStackStore((s) => s.redo);

  useEffect(() => {
    const MOVE = 0.1;

    const saveState = (group: THREE.Object3D) => {
      push({
        uuid: group.uuid,
        position: [group.position.x, group.position.y, group.position.z],
        rotation: [group.rotation.x, group.rotation.y, group.rotation.z],
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedObjectId) return;

      const obj = scene.getObjectByProperty("uuid", selectedObjectId);
      if (!obj) return;

      const group = obj.parent;
      if (!group) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        const prev = undo();
        if (prev && prev.uuid === group.uuid) {
          group.position.set(...prev.position);
          group.rotation.set(...prev.rotation);
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === "Y" || (e.shiftKey && e.key === "Z"))) {
        const next = redo();
        if (next && next.uuid === group.uuid) {
          group.position.set(...next.position);
          group.rotation.set(...next.rotation);
        }
        return;
      }

      const isArrowKey = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key);
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

      let moveAxis = new THREE.Vector3();
      let moveDirection = 0;

      if (Math.abs(forward.x) >= Math.abs(forward.z)) {
        // Dominant axis is X for forward/backward, Z for left/right
        switch (e.key) {
            case "ArrowUp":
                moveAxis.set(1, 0, 0);
                moveDirection = Math.sign(forward.x) || 1;
                break;
            case "ArrowDown":
                moveAxis.set(1, 0, 0);
                moveDirection = -Math.sign(forward.x) || -1;
                break;
            case "ArrowLeft":
                moveAxis.set(0, 0, 1);
                moveDirection = -Math.sign(right.z) || -1;
                break;
            case "ArrowRight":
                moveAxis.set(0, 0, 1);
                moveDirection = Math.sign(right.z) || 1;
                break;
        }
      } else {
        // Dominant axis is Z for forward/backward, X for left/right
        switch (e.key) {
            case "ArrowUp":
                moveAxis.set(0, 0, 1);
                moveDirection = Math.sign(forward.z) || -1;
                break;
            case "ArrowDown":
                moveAxis.set(0, 0, 1);
                moveDirection = -Math.sign(forward.z) || 1;
                break;
            case "ArrowLeft":
                moveAxis.set(1, 0, 0);
                moveDirection = -Math.sign(right.x) || -1;
                break;
            case "ArrowRight":
                moveAxis.set(1, 0, 0);
                moveDirection = Math.sign(right.x) || 1;
                break;
        }
      }
      
      const moveVector = moveAxis.multiplyScalar(moveDirection * MOVE);
      group.position.add(moveVector);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjectId, scene, camera, push, undo, redo]);

  return null;
}
