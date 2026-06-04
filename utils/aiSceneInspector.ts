import type {
  CameraType,
  EditableMeshType,
  GLTFType,
  GroupType,
  LightType,
  ModelType,
  SceneObject,
} from '@/types/model/modelType';

export type InspectorSeverity = 'low' | 'medium' | 'high';

export interface SceneSummary {
  totalObjects: number;
  rootObjects: number;
  meshCount: number;
  groupCount: number;
  lightCount: number;
  cameraCount: number;
  gltfCount: number;
  editableMeshCount: number;
  maxDepth: number;
}

export interface SceneRecommendation {
  id: string;
  title: string;
  description: string;
  severity: InspectorSeverity;
  actionLabel?: string;
  groupName?: string;
  objectNames?: string[];
}

export interface SelectedObjectInsight {
  name: string;
  type: string;
  tag: string;
  note: string;
}

export interface SceneInspectionResult {
  summary: SceneSummary;
  selectedObject: SelectedObjectInsight | null;
  repeatedMeshClusters: Array<{
    key: string;
    mesh: string;
    count: number;
    objectNames: string[];
  }>;
  recommendations: SceneRecommendation[];
}

const flattenScene = (
  objects: SceneObject[],
  depth = 0,
): Array<{ object: SceneObject; depth: number }> => {
  const flattened: Array<{ object: SceneObject; depth: number }> = [];

  for (const object of objects) {
    flattened.push({ object, depth });

    if (object.type === 'group') {
      flattened.push(...flattenScene((object as GroupType).children, depth + 1));
    }
  }

  return flattened;
};

const findObjectByName = (objects: SceneObject[], name: string): SceneObject | null => {
  for (const object of objects) {
    if (object.name === name) {
      return object;
    }

    if (object.type === 'group') {
      const found = findObjectByName((object as GroupType).children, name);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

const getMeshSignature = (mesh: ModelType) => {
  return [
    mesh.mesh,
    mesh.shader,
    mesh.color ?? 'default-color',
    mesh.scale.x.toFixed(3),
    mesh.scale.y.toFixed(3),
    mesh.scale.z.toFixed(3),
  ].join('|');
};

const getObjectTag = (object: SceneObject): string => {
  if (object.type === 'mesh') {
    return `${(object as ModelType).mesh} Primitive`;
  }

  if (object.type === 'gltf') {
    return 'Imported GLTF Asset';
  }

  if (object.type === 'editableMesh') {
    return 'Editable Mesh';
  }

  if (object.type === 'light') {
    const light = object as LightType;
    return `${light.light} Light`;
  }

  if (object.type === 'camera') {
    const camera = object as CameraType;
    return `${camera.camera} Camera`;
  }

  return object.name.startsWith('AI Group') ? 'Optimization Group' : 'Scene Group';
};

const getObjectNote = (object: SceneObject): string => {
  if (object.type === 'mesh') {
    return 'Primitive meshes can already be clustered into optimization groups and later upgraded into instancing candidates.';
  }

  if (object.type === 'gltf') {
    return 'Imported assets still need a later vision/model pass for trustworthy semantic labeling.';
  }

  if (object.type === 'editableMesh') {
    return 'Editable mesh topology is available for future geometric analysis, but not yet for batching.';
  }

  if (object.type === 'group') {
    return 'Groups are the safest current optimization boundary in this editor core.';
  }

  if (object.type === 'light') {
    return 'Lights affect render cost indirectly; keep counts intentional as the scene grows.';
  }

  return 'Cameras are viewpoint objects and stay outside batching recommendations.';
};

export const inspectScene = (
  objects: SceneObject[],
  selectedObjectId: string | null,
): SceneInspectionResult => {
  const flattened = flattenScene(objects);
  const meshes = flattened.filter((item) => item.object.type === 'mesh').map((item) => item.object as ModelType);
  const groups = flattened.filter((item) => item.object.type === 'group');
  const lights = flattened.filter((item) => item.object.type === 'light');
  const cameras = flattened.filter((item) => item.object.type === 'camera');
  const gltfs = flattened.filter((item) => item.object.type === 'gltf');
  const editableMeshes = flattened.filter((item) => item.object.type === 'editableMesh');

  const rootMeshes = objects.filter((object) => object.type === 'mesh') as ModelType[];
  const repeatedMeshMap = new Map<string, { mesh: string; objectNames: string[] }>();

  for (const mesh of rootMeshes) {
    const key = getMeshSignature(mesh);
    const existing = repeatedMeshMap.get(key);

    if (existing) {
      existing.objectNames.push(mesh.name);
    } else {
      repeatedMeshMap.set(key, {
        mesh: mesh.mesh,
        objectNames: [mesh.name],
      });
    }
  }

  const repeatedMeshClusters = Array.from(repeatedMeshMap.entries())
    .map(([key, value]) => ({
      key,
      mesh: value.mesh,
      count: value.objectNames.length,
      objectNames: value.objectNames,
    }))
    .filter((cluster) => cluster.count >= 3)
    .sort((left, right) => right.count - left.count);

  const recommendations: SceneRecommendation[] = repeatedMeshClusters.map((cluster, index) => ({
    id: `repeat-${index}`,
    title: `${cluster.mesh} ${cluster.count}개를 하나의 최적화 그룹으로 묶기`,
    description:
      '현재 에디터에는 InstancedMesh 코어가 없어서, 우선 루트 레벨 중복 메시를 그룹화해 구조를 단순화하고 이후 인스턴싱 단계로 넘길 준비를 합니다.',
    severity: cluster.count >= 6 ? 'high' : 'medium',
    actionLabel: '자동 그룹화',
    groupName: `AI Group · ${cluster.mesh}`,
    objectNames: cluster.objectNames,
  }));

  if (flattened.length >= 12) {
    recommendations.push({
      id: 'scene-complexity',
      title: '씬 복잡도 증가 감지',
      description:
        '객체 수가 늘어나고 있어 선택/탐색 비용이 커질 수 있습니다. 다음 단계로는 BVH 또는 spatial index를 붙일 자리가 생깁니다.',
      severity: flattened.length >= 20 ? 'high' : 'low',
    });
  }

  if (gltfs.length > 0) {
    recommendations.push({
      id: 'gltf-vision-gap',
      title: '업로드 자산 의미 태깅은 후속 비전 파이프라인 필요',
      description:
        'GLTF는 현재 구조 정보만 있으므로, 진짜 객체 분류를 하려면 같은 WebGL 컨텍스트 기반 TF.js 또는 서버 모델 연동이 추가되어야 합니다.',
      severity: 'low',
    });
  }

  const selectedObject = selectedObjectId ? findObjectByName(objects, selectedObjectId) : null;

  return {
    summary: {
      totalObjects: flattened.length,
      rootObjects: objects.length,
      meshCount: meshes.length,
      groupCount: groups.length,
      lightCount: lights.length,
      cameraCount: cameras.length,
      gltfCount: gltfs.length,
      editableMeshCount: editableMeshes.length,
      maxDepth: flattened.reduce((maxDepth, item) => Math.max(maxDepth, item.depth), 0),
    },
    selectedObject: selectedObject
      ? {
          name: selectedObject.name,
          type: selectedObject.type,
          tag: getObjectTag(selectedObject),
          note: getObjectNote(selectedObject),
        }
      : null,
    repeatedMeshClusters,
    recommendations,
  };
};
