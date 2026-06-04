# Kubos 블렌더 모델링 기능 도입 — 실행 체크리스트

> **목표**: 3D 초보도 쉽게 쓸 수 있는 브라우저 박스 모델링 에디터
> **타겟**: 데스크톱, 저폴리(~10k verts), 가벼운 웹 성능
> **핵심 레퍼런스**: [`vibe-stack/three-maps`](https://github.com/vibe-stack/three-maps) (MIT, Zustand+R3F+immer+zundo)
> **보조 레퍼런스**: [`sengchor/kokraf`](https://github.com/sengchor/kokraf) (Three.js mesh editor, command pattern)

---

## 신규 의존성 (Phase 0에서 설치)

| 패키지 | 용도 | 비고 |
|--------|------|------|
| `immer` | 불변 상태 업데이트 | zustand/middleware/immer |
| `zundo` | temporal undo/redo middleware | useSceneStore 대체 |
| `nanoid` | 고유 ID 생성 (vertex/edge/face) | 현재 uuid 사용 중이므로 선택적 |
| `three-mesh-bvh` | 빠른 raycasting / face picking | 저폴리에서도 정확한 선택 |

---

## Phase 0 — 기반 정리 (EdgeBox 대체 + undo 통합 + 모드 시스템)

### 0-1. 새 의존성 설치
- [ ] `npm install immer zundo three-mesh-bvh`
- [ ] `tsconfig.json`에 path alias 확인

### 0-2. Editable Mesh 타입 정의
- [ ] `types/model/editableMesh.ts` 생성
  ```ts
  interface Vector3 { x: number; y: number; z: number }
  interface Vertex { id: string; position: Vector3; normal: Vector3; selected: boolean }
  interface Edge { id: string; vertexIds: [string, string]; faceIds: string[]; selected: boolean }
  interface Face { id: string; vertexIds: string[]; normal: Vector3; selected: boolean }
  interface EditableMesh { id: string; vertices: Vertex[]; edges: Edge[]; faces: Face[] }
  ```
- [ ] `types/model/modelType.ts`에 `EditableMeshType` 추가
  ```ts
  type EditableMeshType = {
    name: string; type: "editableMesh";
    locate: Vec3; rotate: Vec3; scale: Vec3;
    meshData: EditableMesh;
  }
  type SceneObject = ModelType | GroupType | LightType | CameraType | GLTFType | EditableMeshType;
  ```

### 0-3. useEditStore 확장 — 에디터 모드 시스템
- [ ] `stores/useEditStore.ts` 수정
  ```ts
  editorMode: 'object' | 'edit'
  selectionMode: 'object' | 'vertex' | 'edge' | 'face'
  activeTool: 'select' | 'move' | 'rotate' | 'scale' | 'extrude' | 'inset' | 'loopCut' | 'bevel'
  snapEnabled: boolean
  snapIncrement: number  // default 0.1
  pivotMode: 'median' | 'individualOrigins'
  orientationMode: 'global' | 'local'
  ```
- [ ] 기존 `transformMode` → `activeTool`로 마이그레이션
- [ ] `setEditorMode`, `setSelectionMode`, `setActiveTool` 액션 추가

### 0-4. Undo/Redo 통합 (zundo temporal)
- [ ] `stores/useSceneStore.ts` → `temporal()` middleware 적용
  ```ts
  import { temporal } from 'zundo';
  export const useSceneStore = create<SceneState>()(
    temporal(immer((set, get) => ({ ... })))
  );
  ```
- [ ] 기존 내부 `history[]` / `historyIndex` 제거
- [ ] `stores/useStackStore.ts` 삭제
- [ ] `hooks/useKeyboardShortcut.ts` → `useSceneStore.temporal.getState().undo/redo` 사용
- [ ] `hooks/useArrowMoveControl.ts` → `useStackStore` 참조 제거, store 직접 업데이트

### 0-5. Mesh에 TransformControls 추가 (EdgeBox 대체)
- [ ] `components/Work/model/index.tsx` 수정
  - object mode + selected → `TransformControls` 렌더 (light/camera 패턴 따라감)
  - `EdgeBox` 조건부 렌더: primitive 전용 quick-resize로만 유지하거나 제거
- [ ] `useEditStore.activeTool`에 따라 TransformControls mode 결정
  - `'move'` → `'translate'`
  - `'rotate'` → `'rotate'`
  - `'scale'` → `'scale'`

### 0-6. QA 검증
- [ ] 큐브 추가 → 뷰포트/사이드바에서 선택 → gizmo로 이동/회전/스케일
- [ ] Cmd+Z / Cmd+Shift+Z → 정확히 이전 상태로 복원
- [ ] `useStackStore` 참조 0개 확인 (grep)

---

## Phase 1 — Object Mode 완성

### 1-1. Snap 시스템
- [ ] `hooks/useSnapping.ts` 생성
  - `snapValue(value: number, increment: number): number`
  - TransformControls `onObjectChange`에서 snap 적용
- [ ] UI: bottom bar 또는 header에 snap 토글 + increment 입력

### 1-2. Pivot / Orientation 컨트롤
- [ ] `components/Work/Toolbar/PivotSelector.tsx`
  - median / individual origins 선택
- [ ] `components/Work/Toolbar/OrientationSelector.tsx`
  - global / local 선택
- [ ] TransformControls에 `space` prop 연동 (`'world'` | `'local'`)

### 1-3. 모드 전환 UI (헤더)
- [ ] `components/Work/header/ModeToggle.tsx` 생성
  - Object / Edit 모드 토글 버튼
  - Tab 키 단축키 연동
- [ ] Edit 모드 진입 조건: 선택된 오브젝트가 `editableMesh` 타입일 때만

### 1-4. Primitive → EditableMesh 변환
- [ ] `utils/meshConversion.ts` 생성
  - `primitiveToEditableMesh(geometryType, geometryArgs, scale): EditableMesh`
  - Three.js `BufferGeometry`에서 vertex/face 추출
  - edge는 face에서 파생 (`buildEdgesFromFaces`)
- [ ] 사이드바 또는 우클릭 메뉴에 "편집 모드로 변환" 버튼
- [ ] 변환 시: `SceneObject`의 type을 `editableMesh`로 교체, 동일 name 유지

### 1-5. QA 검증
- [ ] 큐브 생성 → "편집 모드로 변환" → type이 `editableMesh`로 변경됨
- [ ] 변환 후에도 동일 위치/회전/스케일 유지
- [ ] snap on/off 토글 → gizmo 이동 시 스냅 동작 확인
- [ ] Tab 키 → 모드 전환 (editableMesh 선택 시만)

---

## Phase 2 — Edit Mode MVP (Extrude + Inset + Bevel + Loop Cut)

### 2-1. EditableMesh 렌더러
- [ ] `components/Work/model/EditableMeshRenderer/index.tsx` 생성
  - `EditableMesh` → `THREE.BufferGeometry` 변환 렌더
  - face normal 기반 shading
- [ ] `components/Work/SharedScene.tsx`에 `editableMesh` 타입 디스패치 추가

### 2-2. Selection Overlay (vertex/edge/face 시각화)
- [ ] `components/Work/model/EditableMeshRenderer/SelectionOverlay.tsx`
  - vertex mode: 선택된 vertex에 sphere dot 렌더
  - edge mode: 선택된 edge에 Line2 하이라이트
  - face mode: 선택된 face에 반투명 컬러 오버레이
- [ ] `three-mesh-bvh` 활용한 face/vertex picking
  - raycaster → face index → face id 매핑
  - shift+click → additive selection

### 2-3. Selection Mode 전환 UI
- [ ] `components/Work/Toolbar/SelectionModeBar.tsx`
  - Vertex / Edge / Face 버튼 3개
  - 단축키: 1 / 2 / 3
- [ ] Edit Mode 진입 시에만 표시

### 2-4. Extrude 구현
- [ ] `utils/meshOperations/extrude.ts`
  - 선택된 face들의 vertex 복제
  - 새 face 생성 (측면)
  - normal 방향으로 offset 적용
  - edge 재계산
- [ ] `components/Work/model/EditableMeshRenderer/tools/useExtrude.ts` hook
  - mouse drag → extrude amount 계산
  - commit 시 geometry store 업데이트

### 2-5. Inset 구현
- [ ] `utils/meshOperations/inset.ts`
  - 선택된 face 내부에 축소된 새 face 생성
  - 원래 face → 테두리 quad들로 분할
- [ ] `components/Work/model/EditableMeshRenderer/tools/useInset.ts` hook

### 2-6. Bevel 구현
- [ ] `utils/meshOperations/bevel.ts`
  - 선택된 edge를 따라 vertex split
  - 새 face 생성 (chamfer)
  - segments 파라미터 지원 (초기: 1)
- [ ] `components/Work/model/EditableMeshRenderer/tools/useBevel.ts` hook

### 2-7. Loop Cut 구현
- [ ] `utils/meshOperations/loopCut.ts`
  - edge loop 탐색 (quad 기반)
  - 각 face를 edge 중점에서 분할
  - 새 vertex/edge/face 생성
- [ ] `components/Work/model/EditableMeshRenderer/tools/useLoopCut.ts` hook
  - hover 시 preview line 표시
  - click으로 commit
  - segments 파라미터 (scroll wheel)

### 2-8. Delete Selection
- [ ] `utils/meshOperations/deleteSelection.ts`
  - 선택된 vertex/edge/face 삭제
  - 연결된 topology 정리
- [ ] X 키 또는 Delete 키 바인딩

### 2-9. QA 검증
- [ ] 큐브 → 변환 → Edit Mode → face 선택 → Extrude → 돌출 확인
- [ ] Inset → 내부 face 생성 확인
- [ ] Bevel → edge chamfer 확인
- [ ] Loop Cut → hover preview → click → 분할 확인
- [ ] 각 작업 후 Undo → 정확히 이전 상태 복원
- [ ] Object Mode 복귀 → 편집된 mesh 정상 렌더

---

## Phase 3 — 쉬운 UX 레이어

### 3-1. 모델링 툴바 (Bottom Bar 확장)
- [ ] `components/Work/bottomBar/index.tsx` 수정
  - Edit Mode 시: 기존 메시/라이트/카메라 대신 **도구 팔레트** 표시
  - 도구: Select / Move / Rotate / Scale / Extrude / Inset / Bevel / Loop Cut
  - 각 버튼에 아이콘 + 짧은 한글 라벨
- [ ] `activeTool` 상태와 연동

### 3-2. Context-Aware EditPanel
- [ ] `components/Work/EditPanel/index.tsx` 수정
  - Object Mode: 기존 position/rotation/scale
  - Edit Mode: 선택된 요소 정보 + 도구별 파라미터
    - Extrude: offset amount
    - Inset: thickness
    - Bevel: width, segments
    - Loop Cut: segments

### 3-3. 단축키 확장
- [ ] `hooks/useKeyboardShortcut.ts` 확장
  - `Tab`: Object ↔ Edit 모드 전환
  - `1/2/3`: Vertex/Edge/Face 선택 모드
  - `G`: Move tool
  - `R`: Rotate tool
  - `S`: Scale tool
  - `E`: Extrude tool
  - `I`: Inset tool
  - `Ctrl+B`: Bevel tool
  - `Ctrl+R`: Loop Cut tool
  - `X` / `Delete`: Delete selection

### 3-4. Focus Mode
- [ ] `components/Work/FocusToggle.tsx`
  - 사이드바 숨기기/보이기 토글
  - 뷰포트 최대화
- [ ] 단축키: `Shift+Space` 또는 별도 버튼

### 3-5. 튜토리얼 확장
- [ ] `app/tutorial/steps.ts`에 모델링 튜토리얼 스텝 추가
  - "큐브 생성 → 편집 모드 진입 → face 선택 → Extrude"
- [ ] `app/tutorial/fsm.ts`에 새 튜토리얼 FSM 추가

### 3-6. QA 검증
- [ ] 처음 사용자 시뮬레이션: 튜토리얼만 따라서 extrude 완료 가능
- [ ] 모든 도구가 toolbar에서 클릭만으로 사용 가능 (단축키 없이)
- [ ] Focus mode 토글 → UI 정상 숨김/복원
- [ ] 모바일 접근 차단 또는 데스크톱 전용 안내 표시

---

## 파일 변경 요약

### 새로 생성하는 파일

| 파일 | 역할 |
|------|------|
| `types/model/editableMesh.ts` | EditableMesh 도메인 타입 |
| `utils/meshConversion.ts` | Primitive → EditableMesh 변환 |
| `utils/meshOperations/extrude.ts` | Extrude 로직 |
| `utils/meshOperations/inset.ts` | Inset 로직 |
| `utils/meshOperations/bevel.ts` | Bevel 로직 |
| `utils/meshOperations/loopCut.ts` | Loop Cut 로직 |
| `utils/meshOperations/deleteSelection.ts` | Delete 로직 |
| `hooks/useSnapping.ts` | Snap 유틸 |
| `components/Work/model/EditableMeshRenderer/index.tsx` | 편집 가능 메시 렌더러 |
| `components/Work/model/EditableMeshRenderer/SelectionOverlay.tsx` | 선택 시각화 |
| `components/Work/model/EditableMeshRenderer/tools/useExtrude.ts` | Extrude hook |
| `components/Work/model/EditableMeshRenderer/tools/useInset.ts` | Inset hook |
| `components/Work/model/EditableMeshRenderer/tools/useBevel.ts` | Bevel hook |
| `components/Work/model/EditableMeshRenderer/tools/useLoopCut.ts` | Loop Cut hook |
| `components/Work/Toolbar/PivotSelector.tsx` | Pivot 선택 UI |
| `components/Work/Toolbar/OrientationSelector.tsx` | Orientation 선택 UI |
| `components/Work/Toolbar/SelectionModeBar.tsx` | V/E/F 선택 모드 UI |
| `components/Work/header/ModeToggle.tsx` | Object/Edit 모드 전환 |
| `components/Work/FocusToggle.tsx` | Focus mode 토글 |

### 수정하는 기존 파일

| 파일 | 변경 내용 |
|------|-----------|
| `package.json` | immer, zundo, three-mesh-bvh 추가 |
| `stores/useEditStore.ts` | 모드/도구/snap/pivot 상태 확장 |
| `stores/useSceneStore.ts` | temporal middleware 적용, 내부 history 제거 |
| `types/model/modelType.ts` | EditableMeshType 추가, SceneObject union 확장 |
| `components/Work/SharedScene.tsx` | editableMesh 렌더 디스패치 |
| `components/Work/model/index.tsx` | TransformControls 추가, EdgeBox 조건부 |
| `components/Work/bottomBar/index.tsx` | Edit Mode 시 도구 팔레트 |
| `components/Work/EditPanel/index.tsx` | 모드별 context-aware 패널 |
| `components/Work/sideBar/index.tsx` | "편집 모드로 변환" 버튼 |
| `hooks/useKeyboardShortcut.ts` | 모델링 단축키 확장 |
| `hooks/useArrowMoveControl.ts` | useStackStore 참조 제거 |
| `app/tutorial/steps.ts` | 모델링 튜토리얼 스텝 |
| `app/tutorial/fsm.ts` | 모델링 튜토리얼 FSM |

### 삭제하는 파일

| 파일 | 이유 |
|------|------|
| `stores/useStackStore.ts` | zundo temporal로 대체 |

---

## 기술 결정 요약

| 결정 | 선택 | 이유 |
|------|------|------|
| Undo/Redo | `zundo` temporal middleware | vibe-stack/three-maps 검증됨, 코드량 최소 |
| Mesh 데이터 구조 | `Vertex/Edge/Face` with string IDs | vibe-stack/three-maps 패턴, immer 호환 |
| Face picking | `three-mesh-bvh` | 저폴리에서 정확하고 빠름 |
| 상태 관리 | Zustand + immer | 기존 패턴 유지 + 불변 업데이트 |
| EdgeBox | 유지하되 primitive 전용 | 새 시스템은 TransformControls 기반 |
| 모드 전환 UI | 헤더 배치 | 항상 보이는 위치 |
| 도구 팔레트 | Bottom bar 확장 | 기존 UI 패턴 활용 |

---

## 성공 기준

1. 큐브 생성 → 30초 내에 Edit Mode 진입 방법을 이해할 수 있음
2. Object/Edit 모드 전환이 혼란 없이 동작
3. Face 선택 → Extrude/Inset/Bevel/Loop Cut을 블렌더 문서 없이 수행 가능
4. Undo/Redo가 transform과 topology 편집 모두 안정적으로 복원
5. 모든 핵심 기능이 toolbar 클릭만으로 사용 가능 (단축키는 가속기)
6. 10k vertex 이하 메시에서 60fps 유지

---

## 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| topology 연산 버그 | quad-only mesh로 제한, 비정상 topology 시 경고 표시 |
| undo 깨짐 | zundo temporal이 전체 state snapshot → 안전하지만 메모리 주의 |
| 성능 저하 | 10k vert 제한, BVH 사용, face 수 경고 |
| UX 복잡도 폭발 | progressive disclosure: 기본 4개 도구만 노출 |
| 기존 기능 깨짐 | Phase 0 QA에서 기존 동작 회귀 테스트 |
