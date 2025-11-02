import { create } from "zustand";
import { ModelType, GroupType, LightType, CameraType } from "@/types/model/modelType";

type SceneObject = ModelType | GroupType | LightType | CameraType;

interface SceneState {
  objects: SceneObject[];

  loadScene: (data: SceneObject[]) => void;

  addObject: (parentName: string | null, obj: Omit<ModelType, "name"> & { name: string }) => void;
  addGroup: (parentName: string | null, groupName: string) => void;
  addLight: (parentName: string | null, light: Omit<LightType, "name"> & { name: string }) => void;
  addCamera: (parentName: string | null, camera: Omit<CameraType, "name"> & { name: string }) => void;

  removeObject: (name: string) => void;
  updateObject: (name: string, updated: Partial<SceneObject>) => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  objects: [],

  loadScene: (data) => set(() => ({ objects: structuredClone(data) })),

  // ---------------------- Add Object ----------------------
  addObject: (parentName, obj) => {
    const { objects } = get();
    const count = objects.filter((o) => o.type === "mesh").length;
    const newObj = { ...obj, name: `${obj.name}-${count}` } as ModelType;

    if (!parentName) return set({ objects: [...objects, newObj] });

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

    set({ objects: addToGroup(objects) });
  },

  addGroup: (parentName, groupName) => {
    const { objects } = get();
    const newGroup: GroupType = { name: groupName, type: "group", children: [] };

    if (!parentName) return set({ objects: [...objects, newGroup] });

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

    set({ objects: addToGroup(objects) });
  },

  addLight: (parentName, light) => {
    const { objects } = get();
    const count = objects.filter((o) => o.type === "light").length;
    const lightObj: LightType = { ...light, name: `${light.name}-${count}`, type: "light" };

    if (!parentName) return set({ objects: [...objects, lightObj] });

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

    set({ objects: addToGroup(objects) });
  },

  addCamera: (parentName, camera) => {
    const { objects } = get();
    const count = objects.filter((o) => o.type === "camera").length;
    const camObj: CameraType = { ...camera, name: `${camera.name}-${count}`, type: "camera" };

    if (!parentName) return set({ objects: [...objects, camObj] });

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

    set({ objects: addToGroup(objects) });
  },

  // ---------------------- Remove / Update ----------------------
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

    set({ objects: removeRecursive(get().objects) });
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

    set({ objects: updateRecursive(get().objects) });
  },
}));
