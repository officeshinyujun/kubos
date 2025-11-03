'use client'

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useEditorStore } from "@/stores/useEditStore";
import { useStackStore } from "@/stores/useStackStore";
import * as THREE from "three";

export default function ArrowMoveControl() {
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const scene = useThree((state) => state.scene);
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

      // CMD + Z 또는 CTRL + Z → Undo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        const prev = undo();
        if (prev && prev.uuid === group.uuid) {
          group.position.set(...prev.position);
          group.rotation.set(...prev.rotation);
        }
        return;
      }

      // CMD + SHIFT + Z 또는 CTRL + SHIFT + Z → Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "Z") {
        const next = redo();
        if (next && next.uuid === group.uuid) {
          group.position.set(...next.position);
          group.rotation.set(...next.rotation);
        }
        return;
      }

      // 이동 전 상태 저장
      saveState(group);

      switch (e.key) {
        case "ArrowLeft":
          group.position.x -= MOVE;
          break;
        case "ArrowRight":
          group.position.x += MOVE;
          break;
        case "ArrowUp":
          group.position.z -= MOVE;
          break;
        case "ArrowDown":
          group.position.z += MOVE;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjectId, scene, push, undo, redo]);

  return null;
}
