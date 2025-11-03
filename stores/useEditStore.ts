import { create } from 'zustand';

interface EditorState {
  selectedObjectId: string | null;   // 현재 선택된 오브젝트 ID

  selectObject: (id: string | null) => void; 
  clearSelection: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedObjectId: null,

  selectObject: (id) =>
    set(() => ({
      selectedObjectId: id
    })),

  clearSelection: () =>
    set(() => ({
      selectedObjectId: null
    })),
}));
