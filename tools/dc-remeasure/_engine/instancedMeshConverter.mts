// (원본의 type-only import 제거: @/types/model/modelType)

export interface InstancedMeshCandidate {
  meshSignature: string;
  geometryType: string;
  materialType: string;
  color: string;
  instances: Array<{
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  }>;
  estimatedDrawCallReduction: number;
}

function getMeshSignature(mesh: ModelType): string {
  return [mesh.mesh, mesh.shader, mesh.color ?? 'default-color'].join('|');
}

function flattenMeshes(objects: SceneObject[]): ModelType[] {
  const meshes: ModelType[] = [];

  for (const obj of objects) {
    if (obj.type === 'mesh') {
      meshes.push(obj as ModelType);
    } else if (obj.type === 'group') {
      meshes.push(...flattenMeshes((obj as GroupType).children));
    }
  }

  return meshes;
}

export function findInstancedMeshCandidates(objects: SceneObject[]): InstancedMeshCandidate[] {
  const meshes = flattenMeshes(objects);
  const groups = new Map<string, ModelType[]>();

  for (const mesh of meshes) {
    const sig = getMeshSignature(mesh);
    const existing = groups.get(sig);
    if (existing) {
      existing.push(mesh);
    } else {
      groups.set(sig, [mesh]);
    }
  }

  const candidates: InstancedMeshCandidate[] = [];

  for (const [signature, group] of groups) {
    if (group.length < 3) continue;

    const first = group[0];
    candidates.push({
      meshSignature: signature,
      geometryType: first.mesh,
      materialType: first.shader,
      color: first.color ?? 'default-color',
      instances: group.map((m) => ({
        name: m.name,
        position: [m.locate.x, m.locate.y, m.locate.z],
        rotation: [m.rotate.x, m.rotate.y, m.rotate.z],
        scale: [m.scale.x, m.scale.y, m.scale.z],
      })),
      estimatedDrawCallReduction: group.length - 1,
    });
  }

  return candidates.sort((a, b) => b.instances.length - a.instances.length);
}

export function generateInstancedMeshCode(candidate: InstancedMeshCandidate): string {
  const lines: string[] = [];
  const varName = `instanced${candidate.geometryType.charAt(0).toUpperCase()}${candidate.geometryType.slice(1)}`;
  const count = candidate.instances.length;

  lines.push(`// InstancedMesh for ${count}x ${candidate.geometryType} (${candidate.materialType})`);
  lines.push(`const ${varName}Geometry = new THREE.${getGeometryConstructor(candidate.geometryType)}();`);
  lines.push(`const ${varName}Material = new THREE.${getMaterialConstructor(candidate.materialType)}({ color: '${candidate.color}' });`);
  lines.push(`const ${varName} = new THREE.InstancedMesh(${varName}Geometry, ${varName}Material, ${count});`);
  lines.push('');
  lines.push('const matrix = new THREE.Matrix4();');
  lines.push('const position = new THREE.Vector3();');
  lines.push('const rotation = new THREE.Euler();');
  lines.push('const quaternion = new THREE.Quaternion();');
  lines.push('const scale = new THREE.Vector3();');
  lines.push('');

  candidate.instances.forEach((instance, i) => {
    lines.push(`position.set(${instance.position[0]}, ${instance.position[1]}, ${instance.position[2]});`);
    lines.push(`rotation.set(${instance.rotation[0]}, ${instance.rotation[1]}, ${instance.rotation[2]});`);
    lines.push(`quaternion.setFromEuler(rotation);`);
    lines.push(`scale.set(${instance.scale[0]}, ${instance.scale[1]}, ${instance.scale[2]});`);
    lines.push(`matrix.compose(position, quaternion, scale);`);
    lines.push(`${varName}.setMatrixAt(${i}, matrix);`);
    lines.push('');
  });

  lines.push(`${varName}.instanceMatrix.needsUpdate = true;`);
  lines.push(`scene.add(${varName});`);

  return lines.join('\n');
}

export function estimateInstancedMeshSavings(candidate: InstancedMeshCandidate): { drawCalls: number; vertexMemoryKB: number } {
  const vertexCounts: Record<string, number> = {
    box: 24,
    sphere: 768,
    cylinder: 96,
    cone: 64,
    torus: 1024,
    plane: 4,
    circle: 33,
    ring: 80,
    dodecahedron: 60,
    icosahedron: 12,
    octahedron: 6,
    tetrahedron: 4,
  };

  const verticesPerMesh = vertexCounts[candidate.geometryType] ?? 100;
  const bytesPerVertex = 32;
  const duplicateCount = candidate.instances.length - 1;
  const savedBytes = duplicateCount * verticesPerMesh * bytesPerVertex;

  return {
    drawCalls: candidate.estimatedDrawCallReduction,
    vertexMemoryKB: Math.round(savedBytes / 1024),
  };
}

function getGeometryConstructor(geometryType: string): string {
  const map: Record<string, string> = {
    box: 'BoxGeometry',
    sphere: 'SphereGeometry',
    cylinder: 'CylinderGeometry',
    cone: 'ConeGeometry',
    torus: 'TorusGeometry',
    plane: 'PlaneGeometry',
    circle: 'CircleGeometry',
    ring: 'RingGeometry',
    dodecahedron: 'DodecahedronGeometry',
    icosahedron: 'IcosahedronGeometry',
    octahedron: 'OctahedronGeometry',
    tetrahedron: 'TetrahedronGeometry',
  };
  return map[geometryType] ?? 'BufferGeometry';
}

function getMaterialConstructor(materialType: string): string {
  const map: Record<string, string> = {
    standard: 'MeshStandardMaterial',
    basic: 'MeshBasicMaterial',
    phong: 'MeshPhongMaterial',
    lambert: 'MeshLambertMaterial',
    physical: 'MeshPhysicalMaterial',
    toon: 'MeshToonMaterial',
    normal: 'MeshNormalMaterial',
  };
  return map[materialType] ?? 'MeshStandardMaterial';
}
