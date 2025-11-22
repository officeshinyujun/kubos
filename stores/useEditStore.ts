import { create } from 'zustand';

interface EditorState {
  selectedObjectId: string | null;   // 현재 선택된 오브젝트 ID
  isOrbitEnabled: boolean; // OrbitControls 활성화 여부

  selectObject: (id: string | null) => void; 
  clearSelection: () => void;
  setOrbitEnabled: (enabled: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedObjectId: null,
  isOrbitEnabled: true,

  selectObject: (id) =>
    set(() => ({
      selectedObjectId: id
    })),

  clearSelection: () =>
    set(() => ({
      selectedObjectId: null
    })),
  
  setOrbitEnabled: (enabled) =>
    set(() => ({
      isOrbitEnabled: enabled
    })),
}));
