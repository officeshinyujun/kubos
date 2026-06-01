import { create } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import * as THREE from 'three';
//@ts-ignore
import { ModelType, GroupType, LightType, CameraType, SceneObject, GLTFType } from "@/types/model/modelType";
import { useEditorStore } from './useEditStore';

interface SceneState {
  objects: SceneObject[];
  selectedObject: string | null;
  loadScene: (data: SceneObject[]) => void;
  setSelectedObject: (id: string | null) => void;
  clearScene: () => void;
  addObject: (parentName: string | null, obj: Omit<ModelType, "name"> & { name: string }) => void;
  addGroup: (parentName: string | null, groupName: string) => void;
  addLight: (parentName: string | null, light: Omit<LightType, "name"> & { name: string }) => void;
  addCamera: (parentName: string | null, camera: Omit<CameraType, "name"> & { name: string }) => void;
  addGltf: (parentName: string | null, url: string) => void;
  removeObject: (name: string) => void;
  updateObject: (name: string, updated: Partial<SceneObject>) => void;
}

export const useSceneStore = create<SceneState>()(
  temporal(
    immer((set, get) => ({
      objects: [],
      selectedObject: null,

      loadScene: (data: SceneObject[]) => {
        set((state) => {
          state.objects = JSON.parse(JSON.stringify(data));
          state.selectedObject = null;
        });
      },

      clearScene: () => {
        set((state) => {
          state.objects = [];
          state.selectedObject = null;
        });
      },

      setSelectedObject: (id: string | null) => {
        set((state) => {
          state.selectedObject = id;
        });
      },

      addObject: (parentName, obj) => {
        const { objects } = get();
        const count = objects.filter((o) => o.type === "mesh" && o.name.startsWith(obj.name)).length;
        const newObj = {
          ...obj,
          name: `${obj.name}-${count}`,
          type: 'mesh' as const,
          locate: obj.locate || { x: 0, y: 0, z: 0 },
          rotate: obj.rotate || { x: 0, y: 0, z: 0 },
          scale: obj.scale || { x: 1, y: 1, z: 1 },
          color: obj.color || '#ffffff',
        } as ModelType;
        useEditorStore.getState().selectObject(newObj.name);

        set((state) => {
          if (parentName) {
            const addToGroup = (items: SceneObject[]): void => {
              for (let i = 0; i < items.length; i++) {
                if (items[i].type === "group" && items[i].name === parentName) {
                  (items[i] as GroupType).children.push(newObj);
                  return;
                }
                if (items[i].type === "group") {
                  addToGroup((items[i] as GroupType).children);
                }
              }
            };
            addToGroup(state.objects);
          } else {
            state.objects.push(newObj);
          }
        });
      },

      addGroup: (parentName, groupName) => {
        const newGroup: GroupType = {
          name: groupName,
          type: "group",
          children: [],
          locate: { x: 0, y: 0, z: 0 },
          rotate: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        };

        set((state) => {
          if (parentName) {
            const addToGroup = (items: SceneObject[]): void => {
              for (let i = 0; i < items.length; i++) {
                if (items[i].type === "group" && items[i].name === parentName) {
                  (items[i] as GroupType).children.push(newGroup);
                  return;
                }
                if (items[i].type === "group") {
                  addToGroup((items[i] as GroupType).children);
                }
              }
            };
            addToGroup(state.objects);
          } else {
            state.objects.push(newGroup);
          }
        });
      },

      addLight: (parentName, light) => {
        const { objects } = get();
        const count = objects.filter((o) => o.type === "light" && o.name.startsWith(light.name)).length;
        const lightObj: LightType = {
          ...light,
          name: `${light.name}-${count}`,
          type: "light",
          color: '#ffffff',
          intensity: 1,
          locate: light.locate || { x: 0, y: 2, z: 0 },
          rotate: light.rotate || { x: 0, y: 0, z: 0 },
          scale: light.scale || { x: 1, y: 1, z: 1 },
          angle: light.angle || (light.light === 'spot' ? Math.PI / 6 : undefined),
        };

        set((state) => {
          if (parentName) {
            const addToGroup = (items: SceneObject[]): void => {
              for (let i = 0; i < items.length; i++) {
                if (items[i].type === "group" && items[i].name === parentName) {
                  (items[i] as GroupType).children.push(lightObj);
                  return;
                }
                if (items[i].type === "group") {
                  addToGroup((items[i] as GroupType).children);
                }
              }
            };
            addToGroup(state.objects);
          } else {
            state.objects.push(lightObj);
          }
        });
        useEditorStore.getState().selectObject(lightObj.name);
      },

      addCamera: (parentName, camera) => {
        const { objects } = get();
        const count = objects.filter((o) => o.type === "camera").length;

        const initialCameraPosition = { x: 0, y: 0, z: 5 };

        const tempObject = new THREE.Object3D();
        tempObject.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z);
        tempObject.lookAt(0, 0, 0);

        const camObj: CameraType = {
          ...camera,
          name: `${camera.name}-${count}`,
          type: "camera",
          fov: 50,
          locate: initialCameraPosition,
          rotate: {
            x: tempObject.rotation.x,
            y: tempObject.rotation.y,
            z: tempObject.rotation.z,
          },
        };

        set((state) => {
          if (parentName) {
            const addToGroup = (items: SceneObject[]): void => {
              for (let i = 0; i < items.length; i++) {
                if (items[i].type === "group" && items[i].name === parentName) {
                  (items[i] as GroupType).children.push(camObj);
                  return;
                }
                if (items[i].type === "group") {
                  addToGroup((items[i] as GroupType).children);
                }
              }
            };
            addToGroup(state.objects);
          } else {
            state.objects.push(camObj);
          }
        });
      },

      removeObject: (name) => {
        set((state) => {
          const removeFromGroup = (items: SceneObject[]): SceneObject[] =>
            items
              .filter((item) => item.name !== name)
              .map((item) => {
                if (item.type === "group") {
                  return { ...item, children: removeFromGroup(item.children) } as GroupType;
                }
                return item;
              });

          state.objects = removeFromGroup(state.objects);
          if (state.selectedObject === name) {
            state.selectedObject = null;
          }
        });
      },

      updateObject: (name, updated) => {
        set((state) => {
          const updateInGroup = (items: SceneObject[]): void => {
            for (let i = 0; i < items.length; i++) {
              if (items[i].name === name) {
                items[i] = { ...items[i], ...updated } as SceneObject;
                return;
              }
              if (items[i].type === "group") {
                updateInGroup((items[i] as GroupType).children);
              }
            }
          };
          updateInGroup(state.objects);
        });
      },

      addGltf: (parentName, url) => {
        const { objects } = get();
        const count = objects.filter((o) => o.type === "gltf").length;
        const newObj: GLTFType = {
          name: `gltf-${count}`,
          type: 'gltf',
          url,
          locate: { x: 0, y: 0, z: 0 },
          rotate: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        };
        useEditorStore.getState().selectObject(newObj.name);

        set((state) => {
          if (parentName) {
            const addToGroup = (items: SceneObject[]): void => {
              for (let i = 0; i < items.length; i++) {
                if (items[i].type === "group" && items[i].name === parentName) {
                  (items[i] as GroupType).children.push(newObj);
                  return;
                }
                if (items[i].type === "group") {
                  addToGroup((items[i] as GroupType).children);
                }
              }
            };
            addToGroup(state.objects);
          } else {
            state.objects.push(newObj);
          }
        });
      },
    })),
    { limit: 100 }
  )
);

export const undo = () => useSceneStore.temporal.getState().undo();
export const redo = () => useSceneStore.temporal.getState().redo();
