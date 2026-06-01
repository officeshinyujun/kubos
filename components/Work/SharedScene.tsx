'use client';

import { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { useSceneStore } from '@/stores/useSceneStore';
import Model from '@/components/Work/model';
import LightRenderer from '@/components/Work/LightRenderer';
import CameraRenderer from '@/components/Work/CameraRenderer';
import { ModelType, LightType, CameraType, GLTFType, EditableMeshType } from '@/types/model/modelType';
import { GeometryType } from '@/types/model/modelDefinitions';
import EditableMeshRenderer from '@/components/Work/model/EditableMeshRenderer';

function GltfModel({ url, position, scale, rotation }: { url: string, position: [number, number, number], scale: [number, number, number], rotation: [number, number, number] }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={position} scale={scale} rotation={rotation} />;
}

// This component renders the shared scene objects for both viewports.
export const SharedScene = () => {
  const { objects, updateObject } = useSceneStore();
  
  // These handlers are passed to the Model component for the EdgeBox controls.
  // A better refactor could move this state management, but for now, it's passed down.
  const handleHeightChange = (modelId: string, deltaY: number) => {
    const model = objects.find(obj => obj.name === modelId) as ModelType;
    if (!model) return;
    const newScale = { ...model.scale, y: model.scale.y + deltaY };
    updateObject(modelId, { scale: newScale });
  };
  const handleWidthChange = (modelId:string, deltaX: number) => {
    const model = objects.find(obj => obj.name === modelId) as ModelType;
    if (!model) return;
    const newScale = { ...model.scale, x: model.scale.x + deltaX };
    updateObject(modelId, { scale: newScale });
  };
  const handleDepthChange = (modelId: string, deltaX: number) => {
    const model = objects.find(obj => obj.name === modelId) as ModelType;
    if (!model) return;
    const newScale = { ...model.scale, z: model.scale.z + deltaX };
    updateObject(modelId, { scale: newScale });
  };

  return (
    <Suspense fallback={null}>
      {objects.map((obj) => {
        if (obj.type === 'mesh') {
          return (
            <Model
              key={obj.name}
              name={obj.name}
              geometryType={obj.mesh as GeometryType}
              position={[obj.locate.x, obj.locate.y, obj.locate.z]}
              scale={[obj.scale.x, obj.scale.y, obj.scale.z]}
              materialType={obj.shader as any}
              texturePath={obj.texturePath}
              materialProps={{ 
                color: obj.color,
              }}
              onHeightChange={(deltaY) => handleHeightChange(obj.name, deltaY)}
              onWidthChange={(deltaX) => handleWidthChange(obj.name, deltaX)}
              onDepthChange={(deltaX) => handleDepthChange(obj.name, deltaX)}
            />
          )
        }
        if (obj.type === 'light') {
          return <LightRenderer key={obj.name} light={obj as LightType} />
        }
        if (obj.type === 'camera') {
          return <CameraRenderer key={obj.name} camera={obj as CameraType} />
        }
        if (obj.type === 'gltf') {
          const gltfObj = obj as GLTFType;
          return <GltfModel 
            key={gltfObj.name} 
            url={gltfObj.url}
            position={[gltfObj.locate.x, gltfObj.locate.y, gltfObj.locate.z]}
            scale={[gltfObj.scale.x, gltfObj.scale.y, gltfObj.scale.z]}
            rotation={[gltfObj.rotate.x, gltfObj.rotate.y, gltfObj.rotate.z]}
          />
        }
        if (obj.type === 'editableMesh') {
          const emObj = obj as EditableMeshType;
          return (
            <EditableMeshRenderer
              key={emObj.name}
              name={emObj.name}
              meshData={emObj.meshData}
              position={[emObj.locate.x, emObj.locate.y, emObj.locate.z]}
              rotation={[emObj.rotate.x, emObj.rotate.y, emObj.rotate.z]}
              scale={[emObj.scale.x, emObj.scale.y, emObj.scale.z]}
            />
          );
        }
        return null;
      })}
    </Suspense>
  )
}