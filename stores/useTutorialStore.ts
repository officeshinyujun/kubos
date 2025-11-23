import { create } from 'zustand';
import { tutorialFsmConfig, TutorialState, TutorialStepConfig } from '@/app/tutorial/fsm';
import { useSceneStore } from './useSceneStore';

interface TutorialStore {
  currentState: TutorialState;
  currentStepConfig: TutorialStepConfig;
  isTutorialActive: boolean;
  completedTutorials: Record<string, boolean>;
  startTutorial: (startState: TutorialState) => void;
  endTutorial: (tutorialName?: string) => void;
  dispatchEvent: (event: { type: string; [key: string]: any }) => void;
  nextStep: () => void;
  markTutorialComplete: (tutorialName: string) => void;
}

const useTutorialStore = create<TutorialStore>((set, get) => {
  const store: TutorialStore = {
    currentState: 'IDLE',
    currentStepConfig: tutorialFsmConfig['IDLE'],
    isTutorialActive: false,
    completedTutorials: {},
    
    startTutorial: (startState) => {
      useSceneStore.getState().clearScene();
      set({
        currentState: startState,
        currentStepConfig: tutorialFsmConfig[startState],
        isTutorialActive: true,
      });
    },

    endTutorial: (tutorialName) => {
      if (tutorialName) {
        get().markTutorialComplete(tutorialName);
      }
      set({
        currentState: 'IDLE',
        currentStepConfig: tutorialFsmConfig['IDLE'],
        isTutorialActive: false,
      });
    },

    dispatchEvent: (event) => {
      const { currentState, currentStepConfig } = get();
      if (!currentStepConfig.autoAdvance || !currentStepConfig.requirements) return;

      if (currentStepConfig.requirements(event)) {
        const nextState = currentStepConfig.nextState;
        if (nextState === 'IDLE') {
          // Determine which tutorial ended
          if (currentState === 'FIRST_STEP_END') {
            get().endTutorial('firstStepTutorial');
          } else if (currentState === 'LIGHT_TUTORIAL_END') {
            get().endTutorial('lightTutorial');
          } else {
            get().endTutorial();
          }
        } else {
          set({
            currentState: nextState,
            currentStepConfig: tutorialFsmConfig[nextState],
          });
        }
      }
    },

    nextStep: () => {
        const { currentState, currentStepConfig } = get();
        if (currentStepConfig.autoAdvance) return;

        const nextState = currentStepConfig.nextState;
        if (nextState === 'IDLE') {
          // Determine which tutorial ended
          if (currentState === 'FIRST_STEP_END') {
            get().endTutorial('firstStepTutorial');
          } else if (currentState === 'LIGHT_TUTORIAL_END') {
            get().endTutorial('lightTutorial');
          } else {
            get().endTutorial();
          }
        } else {
          set({
              currentState: nextState,
              currentStepConfig: tutorialFsmConfig[nextState],
          });
        }
    },

    markTutorialComplete: (tutorialName: string) => {
      set((state) => ({
        completedTutorials: {
          ...state.completedTutorials,
          [tutorialName]: true,
        },
      }));
    },
  };

  return store;
});

// Subscribe to scene store changes to dispatch events to the tutorial FSM
useSceneStore.subscribe(
  (state, prevState) => {
    const { dispatchEvent, isTutorialActive } = useTutorialStore.getState();
    if (!isTutorialActive) return;

    // Check for added objects
    if (state.objects.length > prevState.objects.length) {
        const lastObject = state.objects[state.objects.length - 1];
        if (lastObject.type === 'mesh') {
            dispatchEvent({ type: 'addObject', object: lastObject });
        } else if (lastObject.type === 'light') {
            dispatchEvent({ type: 'addLight', light: lastObject });
        }
    }

    // Check for removed objects
    if (state.objects.length < prevState.objects.length) {
        const removedObject = prevState.objects.find(obj => !state.objects.some(o => o.name === obj.name));
        if (removedObject) {
            dispatchEvent({ type: 'removeObject', object: removedObject });
        }
    }
    
    // Check for updated objects
    for (const object of state.objects) {
        const prevObject = prevState.objects.find(o => o.name === object.name);
        if (prevObject && JSON.stringify(object) !== JSON.stringify(prevObject)) {
            const updatedProps = Object.keys(object).reduce((acc, key) => {
                // @ts-ignore
                if (JSON.stringify(object[key]) !== JSON.stringify(prevObject[key])) {
                    // @ts-ignore
                    acc[key] = object[key];
                }
                return acc;
            }, {} as Partial<typeof object>);

            dispatchEvent({ type: 'updateObject', object, updated: updatedProps });
        }
    }
  }
);


export { useTutorialStore };