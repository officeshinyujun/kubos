import { create } from "zustand";

type SceneState = {
  uuid: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

interface StackStore {
  undoStack: SceneState[];
  redoStack: SceneState[];
  push(state: SceneState): void;
  undo(): SceneState | null;
  redo(): SceneState | null;
}

export const useStackStore = create<StackStore>((set, get) => ({
  undoStack: [],
  redoStack: [],

  push(state) {
    set({
      undoStack: [...get().undoStack, state],
      redoStack: [], // 새 history가 쌓이면 redo 스택은 초기화
    });
  },

  undo() {
    const { undoStack, redoStack } = get();
    if (undoStack.length <= 1) return null;

    const newUndo = [...undoStack];
    const cur = newUndo.pop()!; // 현재 상태
    const prev = newUndo[newUndo.length - 1]; // 되돌릴 상태

    set({
      undoStack: newUndo,
      redoStack: [...redoStack, cur],
    });

    return prev;
  },

  redo() {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return null;

    const newRedo = [...redoStack];
    const next = newRedo.pop()!;

    set({
      undoStack: [...undoStack, next],
      redoStack: newRedo,
    });

    return next;
  },
}));
