
export type TutorialState = 
  | 'IDLE'
  | 'FIRST_STEP_START'
  | 'FIRST_STEP_MAIN_VIEW'
  | 'FIRST_STEP_STRUCTURE_TAB'
  | 'FIRST_STEP_PROPERTIES_TAB'
  | 'FIRST_STEP_ADD_CUBE'
  | 'FIRST_STEP_MODIFY_POSITION'
  | 'FIRST_STEP_DELETE_OBJECT'
  | 'FIRST_STEP_END'
  | 'LIGHT_TUTORIAL_START'
  | 'LIGHT_TUTORIAL_ADD_LIGHT'
  | 'LIGHT_TUTORIAL_MODIFY_LIGHT'
  | 'LIGHT_TUTORIAL_END';

export interface TutorialStepConfig {
    description: string;
    highlightedComponentId?: string;
    autoAdvance?: boolean;
    onEnter?: () => void;
    onExit?: () => void;
    requirements?: (payload?: any) => boolean;
    nextState: TutorialState;
}

export const tutorialFsmConfig: Record<TutorialState, TutorialStepConfig> = {
    IDLE: {
        description: '',
        nextState: 'IDLE',
    },
    FIRST_STEP_START: {
        description: '안녕하세요! Kubos의 튜토리얼에 오신 것을 환영합니다. 이 튜토리얼에서는 기본적인 조작법을 배우게 됩니다.',
        nextState: 'FIRST_STEP_MAIN_VIEW',
    },
    FIRST_STEP_MAIN_VIEW: {
        description: '이곳은 3D 모델을 보고 조작할 수 있는 메인 뷰입니다. 마우스를 사용하여 확대, 축소, 회전할 수 있습니다.',
        highlightedComponentId: 'main-window',
        nextState: 'FIRST_STEP_STRUCTURE_TAB',
    },
    FIRST_STEP_STRUCTURE_TAB: {
        description: '이 탭에서는 씬에 추가된 모든 객체의 목록을 볼 수 있습니다. 객체를 선택하거나 그룹화하거나 삭제할 수 있습니다.',
        highlightedComponentId: 'structure-tab',
        nextState: 'FIRST_STEP_PROPERTIES_TAB',
    },
    FIRST_STEP_PROPERTIES_TAB: {
        description: '이 탭에서는 선택한 객체의 위치, 회전, 크기, 색상 등 다양한 속성을 수정할 수 있습니다.',
        highlightedComponentId: 'properties-tab',
        nextState: 'FIRST_STEP_ADD_CUBE',
    },
    FIRST_STEP_ADD_CUBE: {
        description: '이제 첫 번째 객체를 추가해 봅시다. 하단의 "메시" 탭에서 "정육면체"를 클릭하여 씬에 추가하세요.',
        highlightedComponentId: 'cube-card',
        autoAdvance: true,
        requirements: (payload) => payload.type === 'addObject' && payload.object.name.startsWith('정육면체'),
        nextState: 'FIRST_STEP_MODIFY_POSITION',
    },
    FIRST_STEP_MODIFY_POSITION: {
        description: '방금 추가한 정육면체가 선택된 상태입니다. "속성" 탭으로 이동하여 위치, 회전, 크기를 변경해 보세요. 위치를 변경하면 다음 단계로 넘어갑니다.',
        highlightedComponentId: 'position-control',
        autoAdvance: true,
        requirements: (payload) => payload.type === 'updateObject' && payload.updated.locate,
        nextState: 'FIRST_STEP_DELETE_OBJECT',
    },
    FIRST_STEP_DELETE_OBJECT: {
        description: '이제 객체를 삭제해 보겠습니다. "구조" 탭으로 돌아가서 정육면체 항목의 삭제 버튼을 클릭하세요.',
        highlightedComponentId: 'delete-button-last-object',
        autoAdvance: true,
        requirements: (payload) => payload.type === 'removeObject',
        nextState: 'FIRST_STEP_END',
    },
    FIRST_STEP_END: {
        description: '축하합니다! 첫걸음 튜토리얼을 완료했습니다.',
        nextState: 'IDLE',
    },
    LIGHT_TUTORIAL_START: {
        description: '빛 튜토리얼에 오신 것을 환영합니다. 이 튜토리얼에서는 빛을 추가하고 조작하는 방법을 배웁니다.',
        nextState: 'LIGHT_TUTORIAL_ADD_LIGHT',
    },
    LIGHT_TUTORIAL_ADD_LIGHT: {
        description: '하단의 "라이트" 탭에서 "포인트" 라이트를 클릭하여 씬에 추가하세요.',
        highlightedComponentId: 'light-button-포인트',
        autoAdvance: true,
        requirements: (payload) => payload.type === 'addLight' && payload.light.name.startsWith('포인트'),
        nextState: 'LIGHT_TUTORIAL_MODIFY_LIGHT',
    },
    LIGHT_TUTORIAL_MODIFY_LIGHT: {
        description: '방금 추가한 빛이 선택된 상태입니다. "속성" 탭에서 빛의 위치와 색상을 변경해보세요. 빛의 색상을 변경하면 튜토리얼이 종료됩니다.',
        highlightedComponentId: 'light-color-control',
        autoAdvance: true,
        requirements: (payload) => payload.type === 'updateObject' && payload.updated.color,
        nextState: 'LIGHT_TUTORIAL_END',
    },
    LIGHT_TUTORIAL_END: {
        description: '축하합니다! 빛 튜토리얼을 완료했습니다.',
        nextState: 'IDLE',
    }
};
