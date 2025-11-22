'use client';

import s from './style.module.scss';
import WorkHeader from '@/components/Work/header';
import WorkSideBar from '@/components/Work/sideBar';
import WorkBottomBar from '@/components/Work/bottomBar';
import { useEffect, useRef, Suspense } from 'react';
import { useSceneStore } from '@/stores/useSceneStore';
import { useEditorStore } from '@/stores/useEditStore';
import toast from 'react-hot-toast';
import { Canvas } from '@react-three/fiber';
import { View, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Model from '@/components/Work/model';
import LightRenderer from '@/components/Work/LightRenderer';
import CameraRenderer from '@/components/Work/CameraRenderer';
import ArrowMoveControl from '@/hooks/useArrowMoveControl';
import { ModelType, LightType, CameraType } from '@/types/model/modelType';
import { GeometryType } from '@/types/model/modelDefinitions';

// This component renders the shared scene objects for both viewports.
const SharedScene = () => {
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
              materialType={obj.shader as MaterialType}
              // @ts-ignore
              materialProps={{ color: obj.color }}
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
        return null;
      })}
    </Suspense>
  )
}

export default function WorkList() {
  const { undo, redo } = useSceneStore();
  const { clearSelection } = useEditorStore();
  const mainViewRef = useRef<HTMLDivElement>(null!);
  const renderViewRef = useRef<HTMLDivElement>(null!);
  
  const { selectedObjectId, activeRenderCameraId } = useEditorStore();
  const { objects } = useSceneStore();

  const selectedObject = selectedObjectId
    ? objects.find((obj) => obj.name === selectedObjectId)
    : null;
  const isLightSelected = selectedObject?.type === 'light';

  const renderCamera = activeRenderCameraId 
    ? objects.find((obj) => obj.name === activeRenderCameraId && obj.type === 'camera') as CameraType
    : null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSelection();
        return;
      }
      // ... other keydown logic
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  return (
    <div className={s.container}>
      <WorkHeader/>
      <div className={s.contents}>
        <div className={s.three}>
          <div className={s.viewports}>
            {/* The two divs that will contain our views */}
            <div ref={mainViewRef} className={s.window} />
            <div ref={renderViewRef} className={s.renderWindow} />
          </div>
          <div className={s.add}>
            <WorkBottomBar/>
          </div>

          <Canvas
            className={s.canvas}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            eventSource={mainViewRef} // Main view drives events
          >
            {/* Main Editor View */}
            <View index={1} track={mainViewRef}>
              <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
              <ArrowMoveControl />
              <SharedScene />
              <gridHelper args={[10, 10]} />
              <axesHelper args={[5]} />
              <OrbitControls makeDefault enabled={!isLightSelected} />
            </View>
            
            {/* Second Render View */}
            <View index={2} track={renderViewRef}>
              {renderCamera ? (
                <PerspectiveCamera
                  makeDefault
                  position={[renderCamera.locate.x, renderCamera.locate.y, renderCamera.locate.z]}
                  rotation={[renderCamera.rotate.x, renderCamera.rotate.y, renderCamera.rotate.z]}
                  fov={renderCamera.fov || 50}
                />
              ) : (
                <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={50} />
              )}
              <SharedScene />
            </View>
          </Canvas>
        </div>
        <WorkSideBar/>
      </div>
    </div>
  );
}