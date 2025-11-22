// stores/useSceneStore.ts
import { create } from 'zustand';
import { ModelType, GroupType, LightType, CameraType } from "@/types/model/modelType";

type SceneObject = ModelType | GroupType | LightType | CameraType;

interface SceneState {
  objects: SceneObject[];
  selectedObject: string | null;
  loadScene: (data: SceneObject[]) => void;
  setSelectedObject: (id: string | null) => void;
  addObject: (parentName: string | null, obj: Omit<ModelType, "name"> & { name: string }) => void;
  addGroup: (parentName: string | null, groupName: string) => void;
  addLight: (parentName: string | null, light: Omit<LightType, "name"> & { name: string }) => void;
  addCamera: (parentName: string | null, camera: Omit<CameraType, "name"> & { name: string }) => void;
  removeObject: (name: string) => void;
  updateObject: (name: string, updated: Partial<SceneObject>) => void;
  undo: () => void;
  redo: () => void;
}

export const useSceneStore = create<SceneState>((set, get) => {
  // History tracking
  const history: { objects: SceneObject[]; selectedObject: string | null }[] = [];
  let historyIndex = -1;

  const saveState = (state: { objects: SceneObject[]; selectedObject: string | null }) => {
    const currentState = { 
      objects: JSON.parse(JSON.stringify(state.objects)),
      selectedObject: state.selectedObject 
    };
    
    if (historyIndex >= 0 && JSON.stringify(history[historyIndex]) === JSON.stringify(currentState)) {
      return;
    }

    // Remove redo history if we're not at the end
    if (historyIndex < history.length - 1) {
      history.length = historyIndex + 1;
    }

    history.push(currentState);
    historyIndex = history.length - 1;
  };

  const applyState = (state: { objects: SceneObject[]; selectedObject: string | null }) => {
    return {
      objects: JSON.parse(JSON.stringify(state.objects)),
      selectedObject: state.selectedObject,
    };
  };

  const undo = () => {
    if (historyIndex > 0) {
      historyIndex--;
      const previousState = history[historyIndex];
      set(applyState(previousState));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      const nextState = history[historyIndex];
      set(applyState(nextState));
    }
  };

  // Expose undo/redo to window
  if (typeof window !== 'undefined') {
    (window as any).__SCENE_STORE__ = { undo, redo };
  }

  return {
    objects: [],
    selectedObject: null,

    loadScene: (data: SceneObject[]) => {
      const newState = {
        objects: JSON.parse(JSON.stringify(data)),
        selectedObject: null,
      };
      saveState(newState);
      set(newState);
    },

    setSelectedObject: (id: string | null) => {
      set({ selectedObject: id });
    },

    addObject: (parentName, obj) => {
      const { objects } = get();
      const count = objects.filter((o) => o.type === "mesh").length;
      const newObj = {
        ...obj,
        name: `${obj.name}-${count}`,
        type: 'mesh' as const,
        locate: obj.locate || { x: 0, y: 0, z: 0 },
        rotate: obj.rotate || { x: 0, y: 0, z: 0 },
        scale: obj.scale || { x: 1, y: 1, z: 1 },
      } as ModelType;

      const addToGroup = (items: SceneObject[]): SceneObject[] =>
        items.map((item) => {
          if (item.type === "group" && item.name === parentName) {
            return { ...item, children: [...item.children, newObj] } as GroupType;
          }
          if (item.type === "group") {
            return { ...item, children: addToGroup(item.children) } as GroupType;
          }
          return item;
        });

      const newObjects = parentName ? addToGroup(objects) : [...objects, newObj];
      const newState = { objects: newObjects };
      saveState(newState);
      set(newState);
    },

    addGroup: (parentName, groupName) => {
      const { objects } = get();
      const newGroup: GroupType = {
        name: groupName,
        type: "group",
        children: [],
        //@ts-ignore
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
      };

      const addToGroup = (items: SceneObject[]): SceneObject[] =>
        items.map((item) => {
          if (item.type === "group" && item.name === parentName) {
            return { ...item, children: [...item.children, newGroup] } as GroupType;
          }
          if (item.type === "group") {
            return { ...item, children: addToGroup(item.children) } as GroupType;
          }
          return item;
        });

      const newObjects = parentName ? addToGroup(objects) : [...objects, newGroup];
      const newState = { objects: newObjects };
      saveState(newState);
      set(newState);
    },

    addLight: (parentName, light) => {
      const { objects } = get();
      const count = objects.filter((o) => o.type === "light").length;
      const lightObj: LightType = { ...light, name: `${light.name}-${count}`, type: "light" };

      const addToGroup = (items: SceneObject[]): SceneObject[] =>
        items.map((item) => {
          if (item.type === "group" && item.name === parentName) {
            return { ...item, children: [...item.children, lightObj] } as GroupType;
          }
          if (item.type === "group") {
            return { ...item, children: addToGroup(item.children) } as GroupType;
          }
          return item;
        });

      const newObjects = parentName ? addToGroup(objects) : [...objects, lightObj];
      const newState = { objects: newObjects };
      saveState(newState);
      set(newState);
    },

    addCamera: (parentName, camera) => {
      const { objects } = get();
      const count = objects.filter((o) => o.type === "camera").length;
      const camObj: CameraType = { ...camera, name: `${camera.name}-${count}`, type: "camera" };

      const addToGroup = (items: SceneObject[]): SceneObject[] =>
        items.map((item) => {
          if (item.type === "group" && item.name === parentName) {
            return { ...item, children: [...item.children, camObj] } as GroupType;
          }
          if (item.type === "group") {
            return { ...item, children: addToGroup(item.children) } as GroupType;
          }
          return item;
        });

      const newObjects = parentName ? addToGroup(objects) : [...objects, camObj];
      const newState = { objects: newObjects };
      saveState(newState);
      set(newState);
    },

    removeObject: (name) => {
      const { objects, selectedObject } = get();
      
      const removeFromGroup = (items: SceneObject[]): SceneObject[] =>
        items
          .filter((item) => item.name !== name)
          .map((item) => {
            if (item.type === "group") {
              return { ...item, children: removeFromGroup(item.children) } as GroupType;
            }
            return item;
          });

      const newObjects = removeFromGroup(objects);
      const newSelection = selectedObject === name ? null : selectedObject;
      const newState = { 
        objects: newObjects,
        selectedObject: newSelection
      };
      saveState(newState);
      set(newState);
    },

    updateObject: (name, updated) => {
      const { objects } = get();

      const updateInGroup = (items: SceneObject[]): SceneObject[] =>
        items.map((item) => {
          if (item.name === name) {
            return { ...item, ...updated } as SceneObject;
          }
          if (item.type === "group") {
            return { ...item, children: updateInGroup(item.children) } as GroupType;
          }
          return item;
        });

      const newObjects = updateInGroup(objects);
      const newState = { objects: newObjects };
      saveState(newState);
      set(newState);
    },

    undo,
    redo,
  };
});

// Export undo/redo functions
export const undo = () => {
  if ((window as any).__SCENE_STORE__?.undo) {
    (window as any).__SCENE_STORE__.undo();
  }
};

export const redo = () => {
  if ((window as any).__SCENE_STORE__?.redo) {
    (window as any).__SCENE_STORE__.redo();
  }
};