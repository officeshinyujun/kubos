export interface TutorialStep {
  title: string;
  description: string;
  highlightedComponentId?: string;
  autoAdvance?: boolean;
}

export const tutorialSteps: TutorialStep[] = [
    {
        title: '1. 첫걸음',
        description: '안녕하세요! Kubos의 튜토리얼에 오신 것을 환영합니다. 이 튜토리얼에서는 기본적인 조작법을 배우게 됩니다.',
    },
    {
        title: '메인 뷰',
        description: '이곳은 3D 모델을 보고 조작할 수 있는 메인 뷰입니다. 마우스를 사용하여 확대, 축소, 회전할 수 있습니다.',
        highlightedComponentId: 'main-window',
    },
    {
        title: '구조 탭',
        description: '이 탭에서는 씬에 추가된 모든 객체의 목록을 볼 수 있습니다. 객체를 선택하거나 그룹화하거나 삭제할 수 있습니다.',
        highlightedComponentId: 'structure-tab',
    },
    {
        title: '속성 탭',
        description: '이 탭에서는 선택한 객체의 위치, 회전, 크기, 색상 등 다양한 속성을 수정할 수 있습니다.',
        highlightedComponentId: 'properties-tab',
    },
    {
        title: '정육면체 추가하기',
        description: '이제 첫 번째 객체를 추가해 봅시다. 하단의 "메시" 탭에서 "정육면체"를 클릭하여 씬에 추가하세요.',
        highlightedComponentId: 'cube-card',
        autoAdvance: true,
    },
    {
        title: '속성 변경하기',
        description: '방금 추가한 정육면체가 선택된 상태입니다. "속성" 탭으로 이동하여 위치, 회전, 크기를 변경해 보세요. 위치를 변경하면 다음 단계로 넘어갑니다.',
        highlightedComponentId: 'position-control',
        autoAdvance: true,
    },
    {
        title: '객체 삭제하기',
        description: '이제 객체를 삭제해 보겠습니다. "구조" 탭으로 돌아가서 정육면체 항목의 삭제 버튼을 클릭하세요.',
        highlightedComponentId: 'delete-button-last-object',
        autoAdvance: true,
    },
    {
        title: '튜토리얼 완료',
        description: '축하합니다! 모든 기본 조작법을 배웠습니다. 이제 다음으로,  빛을 배워봅시다.',
    },
];