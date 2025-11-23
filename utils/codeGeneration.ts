//@ts-ignore
import { ModelType, LightType, CameraType, GroupType, SceneObject } from "@/types/model/modelType";
import { GeometryType } from "@/types/model/modelDefinitions";

export const geometryMapR3F: Record<GeometryType, string> = {
  "정육면체": "Box",
  "구": "Sphere",
  "원기둥": "Cylinder",
  "평면": "Plane",
  "원판": "Circle",
  "도넛": "Torus",
  "꼬인 도넛": "TorusKnot",
  "12면체": "Dodecahedron",
  "8면체": "Octahedron",
  "20면체": "Icosahedron",
};

export const materialMapR3F: Record<string, string> = {
  "Standard": "meshStandardMaterial",
  "standard": "meshStandardMaterial",
  "Basic": "meshBasicMaterial",
  "basic": "meshBasicMaterial",
  // Add other materials as needed
};

export const geometryMapThreeJS: Record<GeometryType, string> = {
  "정육면체": "BoxGeometry",
  "구": "SphereGeometry",
  "원기둥": "CylinderGeometry",
  "평면": "PlaneGeometry",
  "원판": "CircleGeometry",
  "도넛": "TorusGeometry",
  "꼬인 도넛": "TorusKnotGeometry",
  "12면체": "DodecahedronGeometry",
  "8면체": "OctahedronGeometry",
  "20면체": "IcosahedronGeometry",
};

export const materialMapThreeJS: Record<string, string> = {
  "Standard": "MeshStandardMaterial",
  "standard": "MeshStandardMaterial",
  "Basic": "MeshBasicMaterial",
  "basic": "MeshBasicMaterial",
  // Add other materials as needed
};

export const generateR3FCode = (objects: SceneObject[]): string => {
  let r3fObjectsCode = '';
  let imports = new Set<string>();
  imports.add("Canvas");
  imports.add("OrbitControls");

  objects.forEach(obj => {
    if (obj.type === 'mesh' && obj.mesh) {
      const geometryComponent = geometryMapR3F[obj.mesh as GeometryType];
      const materialComponent = materialMapR3F[obj.shader || 'Standard'];
      
      if (!geometryComponent) {
        console.warn(`Unknown geometry type: ${obj.mesh}`);
        return;
      }
      
      if (geometryComponent) imports.add(geometryComponent);

      r3fObjectsCode += `
      <mesh
        position={[${obj.locate.x}, ${obj.locate.y}, ${obj.locate.z}]}
        scale={[${obj.scale.x}, ${obj.scale.y}, ${obj.scale.z}]}
        rotation={[${obj.rotate.x}, ${obj.rotate.y}, ${obj.rotate.z}]}
      >
        <${geometryComponent.toLowerCase()}Geometry />
        <${materialComponent} attach="material" color="${(obj as ModelType & {color?: string}).color || '#ffffff'}" />
      </mesh>`;
    } else if (obj.type === 'light') {
      let lightType = '';
      if (obj.light === 'ambient') lightType = 'ambientLight';
      else if (obj.light === 'point') lightType = 'pointLight';
      else if (obj.light === 'directional') lightType = 'directionalLight';
      else if (obj.light === 'spot') lightType = 'spotLight';

      if (lightType) {
        r3fObjectsCode += `
      <${lightType}
        position={[${obj.locate.x}, ${obj.locate.y}, ${obj.locate.z}]}
        color="${obj.color}"
        intensity={${obj.intensity}}
        ${obj.light === 'spot' && obj.angle ? `angle={${obj.angle}}` : ''}
      />`;
      }
    } else if (obj.type === 'camera') {
      imports.add("PerspectiveCamera");
      imports.add("OrthographicCamera");

      let cameraType = '';
      if (obj.camera === 'perspective') cameraType = 'PerspectiveCamera';
      else if (obj.camera === 'orthographic') cameraType = 'OrthographicCamera';

      if (cameraType) {
        r3fObjectsCode += `
      <${cameraType}
        makeDefault
        position={[${obj.locate.x}, ${obj.locate.y}, ${obj.locate.z}]}
        rotation={[${obj.rotate.x}, ${obj.rotate.y}, ${obj.rotate.z}]}
        fov={${obj.fov || 50}}
      />`;
      }
    }
  });

  const dreiComponents = ["Box", "Sphere", "Cylinder", "Plane", "Circle", "Torus", "TorusKnot", "Dodecahedron", "Octahedron", "Icosahedron", "OrbitControls", "PerspectiveCamera", "OrthographicCamera"];
  const dreiImports = Array.from(imports).filter(i => dreiComponents.includes(i)).join(', ');
  const dreiImportLine = dreiImports ? `import { ${dreiImports} } from '@react-three/drei';` : '';

  return `import React from 'react';
import { Canvas } from '@react-three/fiber';
${dreiImportLine}

const Scene = () => {
  return (
    <>
      <OrbitControls />
      <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={75} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      ${r3fObjectsCode}
    </>
  );
};

export default function App() {
  return (
    <Canvas style={{ background: '#111' }}>
      <Scene />
    </Canvas>
  );
}`;
};

export const generateVanillaThreeJSCode = (objects: SceneObject[]): string => {
  let generatedObjectCode = '';
  
  const threeJSComponents = new Set<string>();
  threeJSComponents.add('Scene');
  threeJSComponents.add('PerspectiveCamera');
  threeJSComponents.add('OrthographicCamera');
  threeJSComponents.add('WebGLRenderer');
  threeJSComponents.add('AmbientLight');
  threeJSComponents.add('DirectionalLight');
  threeJSComponents.add('PointLight');
  threeJSComponents.add('SpotLight');
  threeJSComponents.add('Mesh');
  threeJSComponents.add('Group');

  Object.values(geometryMapThreeJS).forEach(cls => { if (cls) threeJSComponents.add(cls); });
  Object.values(materialMapThreeJS).forEach(cls => { if (cls) threeJSComponents.add(cls); });

  // Serialize the objects array to be used within the generated JS code
  const sceneObjectsJson = JSON.stringify(objects);

  let sceneSetupCode = `
const scene = new Scene();
let camera;
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const objects = JSON.parse('${sceneObjectsJson}'); // Parse the objects back into an array


// Find the first camera object in the scene
const cameraObj = objects.find(obj => obj.type === 'camera');

if (cameraObj && cameraObj.camera === 'perspective') {
  camera = new PerspectiveCamera(cameraObj.fov || 75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(cameraObj.locate.x, cameraObj.locate.y, cameraObj.locate.z);
  if (cameraObj.target) {
    camera.lookAt(cameraObj.target.x, cameraObj.target.y, cameraObj.target.z);
  } else {
    camera.rotation.set(cameraObj.rotate.x, cameraObj.rotate.y, cameraObj.rotate.z);
  }
} else if (cameraObj && cameraObj.camera === 'orthographic') {
  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 10; // This value might need to be dynamic or configured in CameraType
  camera = new OrthographicCamera(
    -frustumSize * aspect / 2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    -frustumSize / 2,
    0.1,
    1000
  );
  camera.position.set(cameraObj.locate.x, cameraObj.locate.y, cameraObj.locate.z);
  if (cameraObj.target) {
    camera.lookAt(cameraObj.target.x, cameraObj.target.y, cameraObj.target.z);
  } else {
    camera.rotation.set(cameraObj.rotate.x, cameraObj.rotate.y, cameraObj.rotate.z);
  }
} else {
  // Default perspective camera if no camera object is found or recognized
  camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0); // 원점을 바라보도록 설정
}

const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(3, 10, 5);
scene.add(directionalLight);
`;

  const generateObjectCodeRecursive = (
    items: SceneObject[],
    parentVarName: string,
    indent: string = ''
  ): string => {
    let code = '';
    items.forEach((obj) => {
      const sanitizedName = obj.name.replace(/[^a-zA-Z0-9_]/g, '_');

      // 메시인 경우
      if (obj.type === 'mesh' && 'mesh' in obj && obj.mesh) {
        const geometryClass = geometryMapThreeJS[obj.mesh as GeometryType];
        const materialClass = materialMapThreeJS[obj.shader || 'Standard'];
        
        if (!geometryClass || !materialClass) {
          console.warn(`Skipping mesh "${obj.name}": geometry="${obj.mesh}", shader="${obj.shader}"`);
          return;
        }

        // color 속성 안전하게 접근
        const color = ('color' in obj && obj.color) ? obj.color : '#ffffff';

        code += `
${indent}const ${sanitizedName}Geometry = new ${geometryClass}();
${indent}const ${sanitizedName}Material = new ${materialClass}({ color: '${color}' });
${indent}const ${sanitizedName}Mesh = new Mesh(${sanitizedName}Geometry, ${sanitizedName}Material);
${indent}${sanitizedName}Mesh.position.set(${obj.locate.x}, ${obj.locate.y}, ${obj.locate.z});
${indent}${sanitizedName}Mesh.scale.set(${obj.scale.x}, ${obj.scale.y}, ${obj.scale.z});
${indent}${sanitizedName}Mesh.rotation.set(${obj.rotate.x}, ${obj.rotate.y}, ${obj.rotate.z});
${indent}${parentVarName}.add(${sanitizedName}Mesh);
`;
      } 
      // 라이트인 경우
      else if (obj.type === 'light' && 'light' in obj && obj.light) {
        let lightClass = '';
        if (obj.light === 'ambient') lightClass = 'AmbientLight';
        else if (obj.light === 'point') lightClass = 'PointLight';
        else if (obj.light === 'directional') lightClass = 'DirectionalLight';
        else if (obj.light === 'spot') lightClass = 'SpotLight';

        if (lightClass) {
          const color = ('color' in obj && obj.color) ? obj.color : '#ffffff';
          const intensity = ('intensity' in obj && obj.intensity) ? obj.intensity : 1.0;
          
          code += `
${indent}const ${sanitizedName}Light = new ${lightClass}('${color}', ${intensity});
${indent}${sanitizedName}Light.position.set(${obj.locate.x}, ${obj.locate.y}, ${obj.locate.z});
${indent}${parentVarName}.add(${sanitizedName}Light);
`;
        }
      } 
      // 그룹인 경우
      else if (obj.type === 'group') {
        code += `
${indent}const ${sanitizedName}Group = new Group();
${indent}${sanitizedName}Group.position.set(${obj.locate.x}, ${obj.locate.y}, ${obj.locate.z});
${indent}${sanitizedName}Group.scale.set(${obj.scale.x}, ${obj.scale.y}, ${obj.scale.z});
${indent}${sanitizedName}Group.rotation.set(${obj.rotate.x}, ${obj.rotate.y}, ${obj.rotate.z});
${indent}${parentVarName}.add(${sanitizedName}Group);
`;
        if ('children' in obj && obj.children && obj.children.length > 0) {
          code += generateObjectCodeRecursive(obj.children, `${sanitizedName}Group`, indent + '  ');
        }
      }
    });
    return code;
  };

  generatedObjectCode = generateObjectCodeRecursive(objects, 'scene');

  const threeJsImports = Array.from(threeJSComponents).join(', ');

  return `import { ${threeJsImports} } from 'https://unpkg.com/three@0.158.0/build/three.module.js';

${sceneSetupCode}

${generatedObjectCode}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  const newAspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (camera instanceof PerspectiveCamera) {
    camera.aspect = newAspect;
    camera.updateProjectionMatrix();
  } else if (camera instanceof OrthographicCamera) {
    // Re-calculate frustum for orthographic camera on resize
    const frustumSize = 10; // Must match the value used during initialization
    camera.left = -frustumSize * newAspect / 2;
    camera.right = frustumSize * newAspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
  }
}, false);
`;
};