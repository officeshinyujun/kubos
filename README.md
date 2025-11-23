# DNA Kubos

DNA Kubos는 Next.js, React 및 `@react-three/fiber` 라이브러리를 통해 Three.js로 구축된 웹 기반 3D 씬 에디터입니다. 사용자가 3D 씬을 만들고 조작할 수 있도록 하며, 3D 모델 상호 작용 및 코드 생성을 위한 동적인 환경을 제공합니다.

## 기능

*   **대화형 3D 에디터**: 브라우저에서 직접 3D 씬을 구축하고 조작합니다.
*   **실시간 렌더링**: `@react-three/fiber` 및 `@react-three/drei`를 활용하여 효율적이고 고성능의 3D 렌더링을 제공합니다.
*   **컴포넌트 기반 씬 관리**: 3D 개체, 조명 및 카메라를 쉽게 추가하고 구성합니다.
*   **코드 생성**: 씬에서 직접 React Three Fiber (R3F) 및 바닐라 Three.js 코드를 생성합니다.
*   **직관적인 UI**: 프로젝트 관리, 튜토리얼 및 3D 작업 공간을 위한 전용 섹션이 있는 깔끔하고 반응형 사용자 인터페이스.
*   **상태 관리**: 강력하고 확장 가능한 상태 처리를 위해 Zustand로 구동됩니다.

## 사용된 기술

*   **Next.js**: 프로덕션을 위한 React 프레임워크.
*   **React**: 사용자 인터페이스 구축을 위한 JavaScript 라이브러리.
*   **TypeScript**: JavaScript의 강력한 타입 슈퍼셋.
*   **@react-three/fiber**: Three.js용 React 렌더러.
*   **@react-three/drei**: `@react-three/fiber`를 위한 유용한 헬퍼 및 추상화 컬렉션.
*   **Zustand**: 작고 빠르며 확장 가능한 베어본 상태 관리 솔루션.
*   **SCSS Modules**: 모듈식 및 유지 보수 가능한 스타일링을 위해.

## 시작하기

다음 지침에 따라 프로젝트를 로컬로 설정하십시오.

### 전제 조건

Node.js 및 npm (또는 yarn)이 설치되어 있는지 확인하십시오.

*   Node.js (>= 18.x)
*   npm (>= 9.x) 또는 yarn (>= 1.x)

### 설치

1.  **리포지토리 복제**:
    ```bash
    git clone https://github.com/your-username/dna_kubos.git
    cd dna_kubos
    ```

2.  **의존성 설치**:
    ```bash
    npm install
    # 또는
    yarn install
    ```

### 개발 서버 실행

개발 모드에서 애플리케이션을 실행하려면:

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하십시오.

변경 사항을 적용하면 애플리케이션이 자동으로 다시 로드됩니다.

## 프로젝트 구조

*   `app/`: Next.js 페이지 및 라우팅을 포함합니다.
*   `components/`: 재사용 가능한 React 컴포넌트.
*   `assets/`: 이미지와 같은 정적 자산.
*   `constants/`: 상수 값 (색상, 글꼴, 간격).
*   `hooks/`: 사용자 정의 React 훅.
*   `stores/`: 상태 관리를 위한 Zustand 스토어 정의.
*   `types/`: TypeScript 타입 정의.
*   `utils/`: 유틸리티 함수 (예: 코드 생성).

## 기여

기여를 환영합니다! 언제든지 이슈를 열거나 풀 리퀘스트를 제출해 주십시오.

## 라이선스

[여기에 라이선스를 명시하십시오. 예: MIT License]
