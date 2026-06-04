'use client';

import s from './style.module.scss';
import WorkHeader from '@/components/Work/header';
import WorkSideBar from '@/components/Work/sideBar';
import WorkBottomBar from '@/components/Work/bottomBar';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSceneStore } from '@/stores/useSceneStore';
import { useEditorStore } from '@/stores/useEditStore';
import { Canvas } from '@react-three/fiber';
import { View, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import ArrowMoveControl from '@/hooks/useArrowMoveControl';
import { CameraType } from '@/types/model/modelType'; // Needed for renderCamera and objects type
import { generateR3FCode, generateVanillaThreeJSCode } from '@/utils/codeGeneration';

import { SharedScene } from '@/components/Work/SharedScene';
import TutorialGuide from '@/app/tutorial/TutorialGuide';
import { useSearchParams } from 'next/navigation';
import { useTutorialStore } from '@/stores/useTutorialStore';
import FocusToggle from '@/components/Work/FocusToggle';

function WorkListInner() {
  const { clearSelection } = useEditorStore();
  const mainViewRef = useRef<HTMLDivElement>(null!);
  const renderViewRef = useRef<HTMLDivElement>(null!);
  const [isFocused, setIsFocused] = useState(false);
  
  const { selectedObjectId, activeRenderCameraId, isOrbitEnabled } = useEditorStore();
  const { objects } = useSceneStore();

  const searchParams = useSearchParams();
  const { startTutorial, isTutorialActive } = useTutorialStore();

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

  useEffect(() => {
    const tutorial = searchParams.get('tutorial');
    if (tutorial && !isTutorialActive) {
      if (tutorial === 'first_step') {
        startTutorial('FIRST_STEP_START');
      } else if (tutorial === 'light') {
        startTutorial('LIGHT_TUTORIAL_START');
      }
    }
  }, [searchParams, isTutorialActive, startTutorial]);

  const reactCode = generateR3FCode(objects);
  const vanillaCode = generateVanillaThreeJSCode(objects);


  return (
    <div className={s.container}>
      <TutorialGuide />
      <WorkHeader/>
      <div className={s.contents}>
        <div className={s.three}>
          <FocusToggle isFocused={isFocused} onToggle={setIsFocused} />
          <div className={s.viewports}>
            {/* The two divs that will contain our views */}
            <div ref={mainViewRef} className={s.window} data-tutorial-id="main-window" />
            <div ref={renderViewRef} className={s.renderWindow} />
          </div>
          <div className={s.add}>
            <WorkBottomBar/>
          </div>

          <Canvas
            className={s.canvas}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            eventSource={mainViewRef}
          >
            {/* Main Editor View */}
            <View index={1} track={mainViewRef}>
              <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
              <ArrowMoveControl />
              <SharedScene />
              <gridHelper args={[10, 10]} />
              <axesHelper args={[5]} />
              <OrbitControls makeDefault enabled={!isLightSelected && isOrbitEnabled} />
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
        {!isFocused && <WorkSideBar reactCode={reactCode} vanillaCode={vanillaCode} />} {/* Pass code props */}
      </div>
    </div>
  );
}

export default function WorkList() {
  return (
    <Suspense fallback={null}>
      <WorkListInner />
    </Suspense>
  );
}
