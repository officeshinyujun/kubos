// 시나리오를 고쳤을 때만 다시 돌린다: npx tsx tools/dc-remeasure/gen-data.mts
import { analyzeDrawCalls } from '../../engine/drawCallAnalyzer.ts';
import { findInstancedMeshCandidates, estimateInstancedMeshSavings } from '../../engine/instancedMeshConverter.ts';
import { SCENARIOS } from './scenarios.mjs';
import fs from 'node:fs'; import path from 'node:path';
const analysis: any = {}, candidates: any = {};
for (const [k, objs] of Object.entries(SCENARIOS as any)) {
  const rep: any = analyzeDrawCalls(objs as any);
  const c = findInstancedMeshCandidates(objs as any);
  rep.candidateSavings = c.map(x => ({ sig: x.meshSignature, n: x.instances.length, ...estimateInstancedMeshSavings(x) }));
  analysis[k] = rep; candidates[k] = c;
}
const out = path.join(import.meta.dirname, 'data.json');
fs.writeFileSync(out, JSON.stringify({ scenarios: SCENARIOS, analysis, candidates }, null, 2));
console.log('생성:', out);
