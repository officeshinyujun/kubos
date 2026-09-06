// 시나리오를 고쳤을 때 다시 돌린다:
//   node --experimental-strip-types tools/dc-remeasure/gen-data.mjs
// engine/*.ts 를 _engine/*.mts 로 복사(타입 전용 import 한 줄만 제거)한 뒤 그대로 불러 쓴다.
// 추정값은 반드시 원본 모듈에서 나와야 하므로 로직을 다시 옮겨 적지 않는다.
import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
const engine = path.resolve(here, '../../engine');
fs.mkdirSync(path.join(here, '_engine'), { recursive: true });
for (const f of ['drawCallAnalyzer', 'instancedMeshConverter']) {
  const src = fs.readFileSync(path.join(engine, `${f}.ts`), 'utf8')
    .replace(/^import type .*from '@\/types\/model\/modelType';$/m,
             '// (원본의 type-only import 제거: @/types/model/modelType)');
  fs.writeFileSync(path.join(here, '_engine', `${f}.mts`), src);
}

const { analyzeDrawCalls } = await import('./_engine/drawCallAnalyzer.mts');
const { findInstancedMeshCandidates, estimateInstancedMeshSavings } =
  await import('./_engine/instancedMeshConverter.mts');
const { SCENARIOS } = await import('./scenarios.mjs');

const analysis = {}, candidates = {};
for (const [k, objs] of Object.entries(SCENARIOS)) {
  const rep = analyzeDrawCalls(objs);
  const c = findInstancedMeshCandidates(objs);
  rep.candidateSavings = c.map(x => ({
    sig: x.meshSignature, n: x.instances.length, ...estimateInstancedMeshSavings(x),
  }));
  analysis[k] = rep; candidates[k] = c;
}
const out = path.join(here, 'data.json');
fs.writeFileSync(out, JSON.stringify({ scenarios: SCENARIOS, analysis, candidates }, null, 2));
console.log('생성:', out);
