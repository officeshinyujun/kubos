import { create } from "zustand";
import { ModelType, GroupType, LightType, CameraType } from "@/types/model/modelType";

type SceneObject = ModelType | GroupType | LightType | CameraType;

interface SceneState {
  objects: SceneObject[];

  // 씬 전체 불러오기
  loadScene: (data: SceneObject[]) => void;

  // Mesh / Group / Light / Camera 추가
  addObject: (parentName: string | null, obj: SceneObject) => void;
  addGroup: (parentName: string | null, groupName: string) => void;
  addLight: (parentName: string | null, light: Omit<LightType, 'name'>) => void;
  addCamera: (parentName: string | null, camera: Omit<CameraType, 'name'>) => void;

  // 삭제
  removeObject: (name: string) => void;

  // 수정
  updateObject: (name: string, updated: Partial<SceneObject>) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  objects: [],

  loadScene: (data) => set(() => ({ objects: structuredClone(data) })),

  addObject: (parentName, obj) =>
    set((state) => {
      if (!parentName) return { objects: [...state.objects, obj] };

      const addToGroup = (items: SceneObject[]): SceneObject[] =>
        items.map((item) => {
          if (item.type === "group" && item.name === parentName) {
            return { ...item, children: [...item.children, obj] } as GroupType;
          }
          if (item.type === "group") {
            return { ...item, children: addToGroup(item.children) } as GroupType;
          }
          return item;
        });

      return { objects: addToGroup(state.objects) };
    }),

  addGroup: (parentName, groupName) => {
    const newGroup: GroupType = { name: groupName, type: "group", children: [] };
    set((state) => {
      if (!parentName) return { objects: [...state.objects, newGroup] };

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

      return { objects: addToGroup(state.objects) };
    });
  },

  // ✅ Light 추가
  addLight: (parentName, light) => {
    const lightObj: LightType = { ...light, name: `light-${Date.now()}`, type: "light" };
    set((state) => {
      if (!parentName) return { objects: [...state.objects, lightObj] };

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

      return { objects: addToGroup(state.objects) };
    });
  },

  // ✅ Camera 추가
  addCamera: (parentName, camera) => {
    const camObj: CameraType = { ...camera, name: `camera-${Date.now()}`, type: "camera" };
    set((state) => {
      if (!parentName) return { objects: [...state.objects, camObj] };

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

      return { objects: addToGroup(state.objects) };
    });
  },

  removeObject: (name) => {
    const removeRecursive = (items: SceneObject[]): SceneObject[] =>
      items
        .filter((item) => item.name !== name)
        .map((item) => {
          if (item.type === "group") {
            return { ...item, children: removeRecursive(item.children) } as GroupType;
          }
          return item;
        });

    set((state) => ({ objects: removeRecursive(state.objects) }));
  },

  updateObject: (name, updated) => {
    const updateRecursive = (items: SceneObject[]): SceneObject[] =>
      //@ts-ignore
      items.map((item) => {
        if (item.name === name) return { ...item, ...updated };
        if (item.type === "group") {
          return { ...item, children: updateRecursive(item.children) } as GroupType;
        }
        return item;
      });

    set((state) => ({ objects: updateRecursive(state.objects) }));
  },
}));
