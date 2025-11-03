'use client'

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useEditorStore } from "@/stores/useEditStore";

export default function ArrowMoveControl() {
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const MOVE = 0.1;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedObjectId) return;

      const obj = scene.getObjectByProperty("uuid", selectedObjectId);
      if (!obj) return;

      // 그룹 단위 이동
      const group = obj.parent;
      if (!group) return;

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
  }, [selectedObjectId, scene]);

  return null;
}
