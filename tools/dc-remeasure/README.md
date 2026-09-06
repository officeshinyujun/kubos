# Draw Call 재측정 하네스

`docs/AI_Scene_Inspector_Report.md` 5장 「실험 및 검증」의 표는 전부 추정값이었다.
이 하네스는 같은 시나리오를 실제로 렌더링해 `renderer.info.render.calls` 와
정점 버퍼 바이트를 재고, `engine/drawCallAnalyzer.ts` 의 추정값을 나란히 놓는다.

## 돌리는 법

```bash
node tools/dc-remeasure/serve.mjs        # 저장소 루트에서
# → http://localhost:8099/tools/dc-remeasure/page.html 을 브라우저로 연다
```

시나리오(`scenarios.mjs`)를 고쳤으면 먼저:

```bash
node --experimental-strip-types tools/dc-remeasure/gen-data.mjs
```

## 구성

| 파일 | 하는 일 |
|---|---|
| `scenarios.mjs` | 보고서 5.1의 시나리오 A·B·C를 에디터가 실제로 만드는 SceneObject 형태로 옮긴 것. D는 보고서 그림 4가 가정한 씬 |
| `gen-data.mjs` | `engine/drawCallAnalyzer.ts` · `instancedMeshConverter.ts` 를 **원본 그대로** 불러 추정값과 인스턴싱 후보를 `data.json` 에 굽는다 |
| `harness.js` | Three.js 로 변환 전/후 씬을 세우고 3회 워밍업 뒤 5회 렌더해 Draw Call 중앙값을 잰다 |
| `page.html` | 결과 표를 그린다 |

## 측정 규칙

Libet `StatsCollector` 의 규칙을 그대로 가져왔다. 3회 워밍업으로 셰이더 컴파일과
버퍼 업로드를 측정에서 뺀 뒤, 5회 렌더의 중앙값을 쓴다. Draw Call 수와 정점 버퍼
바이트는 GPU 성능에 의존하지 않으므로 기기가 달라도 같은 값이 나온다.

## 씬 재현에서 지킨 것

- 지오메트리 인자는 `components/Work/model/GeometryFactory/index.tsx` 그대로
- 재질은 `MaterialFactory` 그대로 (`shader: 'standard'` → `MeshStandardMaterial`, 기본색 `#ffffff`)
- 그림자는 켜지 않았다. KUBOS 어디에도 `shadows` · `castShadow` · `shadowMap` 설정이 없다
- 변환 후 씬에는 `InstancedMesh.instanceMatrix` 의 바이트(인스턴스당 64B)도 정점 메모리에 넣었다

## 대체한 것

시나리오 C의 "GLTF 에셋 포함"은 원본 에셋이 남아 있지 않아 고밀도 절차적 메시
(`꼬인 도넛`) 2개로 대체했다. Draw Call 수에는 영향이 없고 정점 바이트에는 있다.
