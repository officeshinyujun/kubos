import { create } from 'zustand';

type EditorMode = 'object' | 'edit';
type SelectionMode = 'object' | 'vertex' | 'edge' | 'face';
type ActiveTool = 'select' | 'move' | 'rotate' | 'scale' | 'extrude' | 'inset' | 'loopCut' | 'bevel';
type PivotMode = 'median' | 'individualOrigins';
type OrientationMode = 'global' | 'local';

interface EditorState {
  selectedObjectId: string | null;
  isOrbitEnabled: boolean;
  activeRenderCameraId: string | null;
  editorMode: EditorMode;
  selectionMode: SelectionMode;
  activeTool: ActiveTool;
  snapEnabled: boolean;
  snapIncrement: number;
  pivotMode: PivotMode;
  orientationMode: OrientationMode;

  selectObject: (id: string | null) => void;
  clearSelection: () => void;
  setOrbitEnabled: (enabled: boolean) => void;
  setActiveRenderCamera: (id: string | null) => void;
  setEditorMode: (mode: EditorMode) => void;
  setSelectionMode: (mode: SelectionMode) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setSnapIncrement: (increment: number) => void;
  setPivotMode: (mode: PivotMode) => void;
  setOrientationMode: (mode: OrientationMode) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedObjectId: null,
  isOrbitEnabled: true,
  activeRenderCameraId: null,
  editorMode: 'object',
  selectionMode: 'object',
  activeTool: 'select',
  snapEnabled: false,
  snapIncrement: 0.1,
  pivotMode: 'median',
  orientationMode: 'global',

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
  
  setEditorMode: (mode) =>
    set(() =>
      mode === 'edit'
        ? {
            editorMode: mode,
            selectionMode: 'face',
          }
        : {
            editorMode: mode,
            selectionMode: 'object',
            activeTool: 'select',
          }
    ),

  setSelectionMode: (mode) =>
    set(() => ({
      selectionMode: mode
    })),

  setActiveTool: (tool) =>
    set(() => ({
      activeTool: tool
    })),

  setSnapEnabled: (enabled) =>
    set(() => ({
      snapEnabled: enabled
    })),

  setSnapIncrement: (increment) =>
    set(() => ({
      snapIncrement: increment
    })),

  setPivotMode: (mode) =>
    set(() => ({
      pivotMode: mode
    })),

  setOrientationMode: (mode) =>
    set(() => ({
      orientationMode: mode
    })),
}));
