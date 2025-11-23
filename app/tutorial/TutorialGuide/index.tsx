'use client';

import { useEffect, useState } from 'react';
import { useTutorialStore } from '@/stores/useTutorialStore';
import styles from './style.module.scss';
import { useSceneStore } from '@/stores/useSceneStore';

const TutorialGuide = () => {
  const { isTutorialActive, currentStepIndex, steps, nextStep, prevStep, endTutorial } = useTutorialStore();
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const objects = useSceneStore((state) => state.objects);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!isTutorialActive || !currentStep?.highlightedComponentId) {
      setHighlightedElement(null);
      return;
    }

    let componentId = currentStep.highlightedComponentId;
    if (componentId === 'delete-button-last-object') {
        const lastObject = objects[objects.length - 1];
        if (lastObject) {
            componentId = `delete-button-${lastObject.name}`;
        }
    }

    const element = document.querySelector(`[data-tutorial-id="${componentId}"]`) as HTMLElement;
    setHighlightedElement(element);

  }, [isTutorialActive, currentStep, objects]);

  if (!isTutorialActive || !currentStep) {
    return null;
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
        className={styles.guideBox}
        style={{
          top: top + height / 2,
          left: left + width + 20,
          transform: 'translateY(-50%)'
        }}
      >
        <h4>{currentStep.title}</h4>
        <p>{currentStep.description}</p>
        <div className={styles.buttonGroup}>
          <button onClick={prevStep} disabled={currentStepIndex === 0}>이전</button>
          {!currentStep.autoAdvance && <button onClick={nextStep}>다음</button>}
          <button onClick={endTutorial}>튜토리얼 종료</button>
        </div>
      </div>
    </div>
  );
};

export default TutorialGuide;

