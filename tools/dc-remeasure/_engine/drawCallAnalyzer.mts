// (원본의 type-only import 제거: @/types/model/modelType)

export interface DrawCallReport {
  estimatedDrawCalls: number;
  breakdown: {
    meshes: number;
    lights: number;
    cameras: number;
    postProcessing: number;
  };
  bottlenecks: Array<{
    type: 'high-poly' | 'duplicate-materials' | 'excessive-lights' | 'deep-hierarchy';
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedObjects: string[];
  }>;
  optimizedEstimate: number;
  savings: number;
}

interface FlattenedObject {
  object: SceneObject;
  depth: number;
}

function flattenScene(objects: SceneObject[], depth = 0): FlattenedObject[] {
  const result: FlattenedObject[] = [];
  for (const obj of objects) {
    result.push({ object: obj, depth });
    if (obj.type === 'group') {
      result.push(...flattenScene((obj as GroupType).children, depth + 1));
    }
  }
  return result;
}

export function analyzeDrawCalls(objects: SceneObject[]): DrawCallReport {
  const flattened = flattenScene(objects);
  const meshes = flattened.filter((f) => f.object.type === 'mesh');
  const lights = flattened.filter((f) => f.object.type === 'light');
  const cameras = flattened.filter((f) => f.object.type === 'camera');

  const meshDrawCalls = meshes.length;
  const shadowCastingLights = lights.filter((l) => {
    const light = l.object as LightType;
    return light.light === 'directional' || light.light === 'spot';
  });
  const lightDrawCalls = shadowCastingLights.length * meshes.length;
  const cameraDrawCalls = Math.max(0, cameras.length - 1);

  const estimatedDrawCalls = meshDrawCalls + lightDrawCalls + cameraDrawCalls;

  const bottlenecks: DrawCallReport['bottlenecks'] = [];

  const materialMap = new Map<string, string[]>();
  for (const item of meshes) {
    const mesh = item.object as ModelType;
    const matKey = `${mesh.shader}|${mesh.color ?? 'default-color'}`;
    const existing = materialMap.get(matKey);
    if (existing) {
      existing.push(mesh.name);
    } else {
      materialMap.set(matKey, [mesh.name]);
    }
  }

  const duplicateMaterials = Array.from(materialMap.entries()).filter(
    ([, names]) => names.length >= 3
  );
  if (duplicateMaterials.length > 0) {
    const allAffected = duplicateMaterials.flatMap(([, names]) => names);
    bottlenecks.push({
      type: 'duplicate-materials',
      severity: allAffected.length >= 10 ? 'high' : 'medium',
      description: `${duplicateMaterials.length} material group(s) with 3+ identical meshes could be batched or instanced.`,
      affectedObjects: allAffected,
    });
  }

  if (lights.length > 4) {
    bottlenecks.push({
      type: 'excessive-lights',
      severity: lights.length > 8 ? 'high' : 'medium',
      description: `${lights.length} lights detected. Shadow-casting lights multiply draw calls per mesh.`,
      affectedObjects: lights.map((l) => l.object.name),
    });
  }

  const maxDepth = flattened.reduce((max, f) => Math.max(max, f.depth), 0);
  if (maxDepth > 4) {
    const deepObjects = flattened
      .filter((f) => f.depth > 4)
      .map((f) => f.object.name);
    bottlenecks.push({
      type: 'deep-hierarchy',
      severity: maxDepth > 6 ? 'high' : 'medium',
      description: `Scene hierarchy depth of ${maxDepth} increases traversal cost. Consider flattening.`,
      affectedObjects: deepObjects,
    });
  }

  const highPolyThreshold = 10000;
  const highPolyGeometries: Record<string, number> = {
    sphere: 768,
    torus: 1024,
  };
  const highPolyMeshes = meshes.filter((m) => {
    const mesh = m.object as ModelType;
    const baseVerts = highPolyGeometries[mesh.mesh] ?? 100;
    return baseVerts * mesh.scale.x * mesh.scale.y * mesh.scale.z > highPolyThreshold;
  });
  if (highPolyMeshes.length > 0) {
    bottlenecks.push({
      type: 'high-poly',
      severity: highPolyMeshes.length > 5 ? 'high' : 'low',
      description: `${highPolyMeshes.length} mesh(es) with high effective vertex count detected.`,
      affectedObjects: highPolyMeshes.map((m) => m.object.name),
    });
  }

  let potentialSavings = 0;
  for (const [, names] of duplicateMaterials) {
    potentialSavings += names.length - 1;
  }

  const optimizedEstimate = Math.max(1, estimatedDrawCalls - potentialSavings);
  const savings =
    estimatedDrawCalls > 0
      ? Math.round(((estimatedDrawCalls - optimizedEstimate) / estimatedDrawCalls) * 100)
      : 0;

  return {
    estimatedDrawCalls,
    breakdown: {
      meshes: meshDrawCalls,
      lights: lightDrawCalls,
      cameras: cameraDrawCalls,
      postProcessing: 0,
    },
    bottlenecks,
    optimizedEstimate,
    savings,
  };
}
