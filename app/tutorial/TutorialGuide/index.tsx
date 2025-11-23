'use client';

import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { useTutorialStore } from '@/stores/useTutorialStore';
import styles from './style.module.scss';
import { useSceneStore } from '@/stores/useSceneStore';
import { useRouter } from 'next/navigation';

const TutorialGuide = () => {
  const { isTutorialActive, currentStepConfig, nextStep, endTutorial } = useTutorialStore();
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 });
  const guideBoxRef = useRef<HTMLDivElement>(null);
  const objects = useSceneStore((state) => state.objects);
  const router = useRouter();

  const { highlightedComponentId, description, autoAdvance } = currentStepConfig;

  useEffect(() => {
    if (!isTutorialActive || !highlightedComponentId) {
      setHighlightedElement(null);
      return;
    }

    let componentId = highlightedComponentId;
    if (componentId === 'delete-button-last-object') {
        const lastObject = objects.find(obj => obj.name.startsWith('정육면체'));
        if (lastObject) {
            componentId = `delete-button-${lastObject.name}`;
        }
    }

    const element = document.querySelector(`[data-tutorial-id="${componentId}"]`) as HTMLElement;
    setHighlightedElement(element);

  }, [isTutorialActive, highlightedComponentId, objects]);

  useLayoutEffect(() => {
    if (highlightedElement && guideBoxRef.current) {
      const elemRect = highlightedElement.getBoundingClientRect();
      const boxRect = guideBoxRef.current.getBoundingClientRect();

      let left = elemRect.left + elemRect.width + 20;
      if (left + boxRect.width > window.innerWidth) {
        left = elemRect.left - boxRect.width - 20;
      }

      setBoxPosition({
        top: elemRect.top + elemRect.height / 2,
        left: left,
      });
    } else {
        setBoxPosition({
            top: window.innerHeight / 2,
            left: window.innerWidth / 2,
        })
    }
  }, [highlightedElement]);

  if (!isTutorialActive) {
    return null;
  }

  if (currentStepConfig.nextState === 'IDLE' && isTutorialActive) {
    return (
        <div
            className={styles.guideBox}
            style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }}
        >
            <p>{description}</p>
            <button onClick={() => {
                endTutorial();
                router.push('/');
            }}>메인으로 돌아가기</button>
        </div>
    )
  }

  const { top, left, width, height } = highlightedElement?.getBoundingClientRect() || { top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0 };

  return (
    <div>
      {highlightedElement && (
        <div
          className={styles.highlightOverlay}
          style={{
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${height}px`,
          }}
        />
      )}
      <div
        ref={guideBoxRef}
        className={styles.guideBox}
        style={{
          top: `${boxPosition.top}px`,
          left: `${boxPosition.left}px`,
          transform: 'translateY(-50%)'
        }}
      >
        <p>{description}</p>
        {/* <button onClick={prevStep} disabled={!isTutorialActive}>이전</button> */}
        {!autoAdvance && <button onClick={nextStep}>다음</button>}
        <button onClick={endTutorial}>튜토리얼 종료</button>
      </div>
    </div>
  );
};

export default TutorialGuide;
