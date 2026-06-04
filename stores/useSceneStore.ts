import { create } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import * as THREE from 'three';
//@ts-ignore
import { ModelType, GroupType, LightType, CameraType, SceneObject, GLTFType, EditableMeshType } from "@/types/model/modelType";
import { useEditorStore } from './useEditStore';
import { primitiveToEditableMesh } from '@/utils/meshConversion';

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
  groupObjectsAtRoot: (groupName: string, objectNames: string[]) => boolean;
  removeObject: (name: string) => void;
  updateObject: (name: string, updated: Partial<SceneObject>) => void;
  convertToEditable: (name: string) => void;
  updateMeshSelection: (name: string, updates: { vertexIds?: string[]; edgeIds?: string[]; faceIds?: string[] }, additive?: boolean) => void;
  clearMeshSelection: (name: string) => void;
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

      groupObjectsAtRoot: (groupName, objectNames) => {
        if (objectNames.length < 2) {
          return false;
        }

        const collectNames = (items: SceneObject[]): string[] => {
          return items.flatMap((item) => {
            if (item.type === 'group') {
              return [item.name, ...collectNames((item as GroupType).children)];
            }

            return [item.name];
          });
        };

        const existingNames = new Set(collectNames(get().objects));
        let resolvedGroupName = groupName;
        let suffix = 1;

        while (existingNames.has(resolvedGroupName)) {
          resolvedGroupName = `${groupName}-${suffix}`;
          suffix += 1;
        }

        let didGroup = false;

        set((state) => {
          const targetNames = new Set(objectNames);
          const groupedChildren: SceneObject[] = [];
          const remainingObjects: SceneObject[] = [];
          let insertionIndex = -1;

          state.objects.forEach((item) => {
            if (targetNames.has(item.name)) {
              if (insertionIndex === -1) {
                insertionIndex = remainingObjects.length;
              }
              groupedChildren.push(item);
              return;
            }

            remainingObjects.push(item);
          });

          if (groupedChildren.length < 2) {
            return;
          }

          const newGroup: GroupType = {
            name: resolvedGroupName,
            type: 'group',
            locate: { x: 0, y: 0, z: 0 },
            rotate: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            children: groupedChildren,
          };

          remainingObjects.splice(insertionIndex === -1 ? remainingObjects.length : insertionIndex, 0, newGroup);
          state.objects = remainingObjects;
          state.selectedObject = resolvedGroupName;
          didGroup = true;
        });

        if (didGroup) {
          useEditorStore.getState().selectObject(resolvedGroupName);
        }

        return didGroup;
      },

      updateMeshSelection: (name, updates, additive = false) => {
        set((state) => {
          const findAndUpdate = (items: SceneObject[]): void => {
            for (const item of items) {
              if (item.name === name && item.type === 'editableMesh') {
                const mesh = (item as EditableMeshType).meshData;
                if (!additive) {
                  mesh.vertices.forEach((v) => v.selected = false);
                  mesh.edges.forEach((e) => e.selected = false);
                  mesh.faces.forEach((f) => f.selected = false);
                }
                if (updates.vertexIds) {
                  mesh.vertices.forEach((v) => {
                    if (updates.vertexIds!.includes(v.id)) v.selected = !v.selected || !additive;
                  });
                }
                if (updates.edgeIds) {
                  mesh.edges.forEach((e) => {
                    if (updates.edgeIds!.includes(e.id)) e.selected = !e.selected || !additive;
                  });
                }
                if (updates.faceIds) {
                  mesh.faces.forEach((f) => {
                    if (updates.faceIds!.includes(f.id)) f.selected = !f.selected || !additive;
                  });
                }
                return;
              }
              if (item.type === 'group') {
                findAndUpdate((item as GroupType).children);
              }
            }
          };
          findAndUpdate(state.objects);
        });
      },

      clearMeshSelection: (name) => {
        set((state) => {
          const findAndClear = (items: SceneObject[]): void => {
            for (const item of items) {
              if (item.name === name && item.type === 'editableMesh') {
                const mesh = (item as EditableMeshType).meshData;
                mesh.vertices.forEach((v) => v.selected = false);
                mesh.edges.forEach((e) => e.selected = false);
                mesh.faces.forEach((f) => f.selected = false);
                return;
              }
              if (item.type === 'group') {
                findAndClear((item as GroupType).children);
              }
            }
          };
          findAndClear(state.objects);
        });
      },

      convertToEditable: (name) => {
        const { objects } = get();

        const findObj = (items: SceneObject[]): SceneObject | null => {
          for (const item of items) {
            if (item.name === name) return item;
            if (item.type === 'group') {
              const found = findObj((item as GroupType).children);
              if (found) return found;
            }
          }
          return null;
        };

        const obj = findObj(objects);
        if (!obj || obj.type !== 'mesh') return;

        const meshObj = obj as ModelType;
        const meshData = primitiveToEditableMesh(
          meshObj.mesh,
          [meshObj.scale.x, meshObj.scale.y, meshObj.scale.z]
        );

        set((state) => {
          const replaceInList = (items: SceneObject[]): void => {
            for (let i = 0; i < items.length; i++) {
              if (items[i].name === name) {
                const editable: EditableMeshType = {
                  name: meshObj.name,
                  type: 'editableMesh',
                  locate: { ...meshObj.locate },
                  rotate: { ...meshObj.rotate },
                  scale: { x: 1, y: 1, z: 1 },
                  meshData,
                };
                items[i] = editable;
                return;
              }
              if (items[i].type === 'group') {
                replaceInList((items[i] as GroupType).children);
              }
            }
          };
          replaceInList(state.objects);
        });
      },
    })),
    { limit: 100 }
  )
);

export const undo = () => useSceneStore.temporal.getState().undo();
export const redo = () => useSceneStore.temporal.getState().redo();
