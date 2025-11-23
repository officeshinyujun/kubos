import { create } from 'zustand';

type TransformMode = 'translate' | 'rotate';

interface EditorState {
  selectedObjectId: string | null;   // 현재 선택된 오브젝트 ID
  isOrbitEnabled: boolean; // OrbitControls 활성화 여부
  activeRenderCameraId: string | null; // 렌더 뷰에 사용될 카메라 ID
  transformMode: TransformMode; // TransformControls 모드

  selectObject: (id: string | null) => void; 
  clearSelection: () => void;
  setOrbitEnabled: (enabled: boolean) => void;
  setActiveRenderCamera: (id: string | null) => void;
  setTransformMode: (mode: TransformMode) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedObjectId: null,
  isOrbitEnabled: true,
  activeRenderCameraId: null,
  transformMode: 'translate',

  selectObject: (id) =>
    set(() => ({
      selectedObjectId: id
    })),

  clearSelection: () =>
    set(() => ({
      selectedObjectId: null,
      isOrbitEnabled: true, // Re-enable OrbitControls when nothing is selected
    })),
  
  setOrbitEnabled: (enabled) =>
    set(() => ({
      isOrbitEnabled: enabled
    })),

  setActiveRenderCamera: (id) =>
    set(() => ({
      activeRenderCameraId: id
    })),
  
  setTransformMode: (mode) =>
    set(() => ({
      transformMode: mode
    })),
}));
