import { create } from 'zustand';
import { tutorialFsmConfig, TutorialState, TutorialStepConfig } from '@/app/tutorial/fsm';
import { useSceneStore } from './useSceneStore';

interface TutorialStore {
  currentState: TutorialState;
  currentStepConfig: TutorialStepConfig;
  isTutorialActive: boolean;
  startTutorial: (startState: TutorialState) => void;
  endTutorial: () => void;
  dispatchEvent: (event: { type: string; [key: string]: any }) => void;
  nextStep: () => void;
}

const useTutorialStore = create<TutorialStore>((set, get) => {
  const store: TutorialStore = {
    currentState: 'IDLE',
    currentStepConfig: tutorialFsmConfig['IDLE'],
    isTutorialActive: false,
    
    startTutorial: (startState) => {
      useSceneStore.getState().clearScene();
      set({
        currentState: startState,
        currentStepConfig: tutorialFsmConfig[startState],
        isTutorialActive: true,
      });
    },

    endTutorial: () => {
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
        set({
          currentState: nextState,
          currentStepConfig: tutorialFsmConfig[nextState],
        });
      }
    },

    nextStep: () => {
        const { currentState, currentStepConfig } = get();
        if (currentStepConfig.autoAdvance) return;

        const nextState = currentStepConfig.nextState;
        set({
            currentState: nextState,
            currentStepConfig: tutorialFsmConfig[nextState],
        });
    }
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