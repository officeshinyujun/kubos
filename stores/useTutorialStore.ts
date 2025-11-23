import { create } from 'zustand';
import { tutorialSteps, TutorialStep } from '@/app/tutorial/steps';

interface TutorialState {
  isTutorialActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endTutorial: () => void;
  setStep: (index: number) => void;
}

export const useTutorialStore = create<TutorialState>((set) => ({
  isTutorialActive: false,
  currentStepIndex: 0,
  steps: tutorialSteps,
  startTutorial: () => set({ isTutorialActive: true, currentStepIndex: 0 }),
  nextStep: () =>
    set((state) => ({
      currentStepIndex: Math.min(state.currentStepIndex + 1, state.steps.length - 1),
    })),
  prevStep: () =>
    set((state) => ({
      currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
    })),
  endTutorial: () => set({ isTutorialActive: false }),
    setStep: (index) =>
    set((state) => ({
        currentStepIndex: Math.max(0, Math.min(index, state.steps.length - 1)),
    })),
}));
