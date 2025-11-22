'use client';

import s from './style.module.scss';
import WorkHeader from '@/components/Work/header';
import WorkSideBar from '@/components/Work/sideBar';
import WorkBottomBar from '@/components/Work/bottomBar';
import { useEffect, useRef, Suspense } from 'react';
import { useSceneStore } from '@/stores/useSceneStore';
import { useEditorStore } from '@/stores/useEditStore';
import toast from 'react-hot-toast';
import { Canvas } from '@react-three/fiber';
import { View, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Model from '@/components/Work/model';
import LightRenderer from '@/components/Work/LightRenderer';
import CameraRenderer from '@/components/Work/CameraRenderer';
import ArrowMoveControl from '@/hooks/useArrowMoveControl';
import { ModelType, LightType, CameraType } from '@/types/model/modelType';
import { GeometryType } from '@/types/model/modelDefinitions';

// This component renders the shared scene objects for both viewports.
const SharedScene = () => {
  const { objects, updateObject } = useSceneStore();
  
  // These handlers are passed to the Model component for the EdgeBox controls.
  // A better refactor could move this state management, but for now, it's passed down.
  const handleHeightChange = (modelId: string, deltaY: number) => {
    const model = objects.find(obj => obj.name === modelId) as ModelType;
    if (!model) return;
    const newScale = { ...model.scale, y: model.scale.y + deltaY };
    updateObject(modelId, { scale: newScale });
  };
  const handleWidthChange = (modelId:string, deltaX: number) => {
    const model = objects.find(obj => obj.name === modelId) as ModelType;
    if (!model) return;
    const newScale = { ...model.scale, x: model.scale.x + deltaX };
    updateObject(modelId, { scale: newScale });
  };
  const handleDepthChange = (modelId: string, deltaX: number) => {
    const model = objects.find(obj => obj.name === modelId) as ModelType;
    if (!model) return;
    const newScale = { ...model.scale, z: model.scale.z + deltaX };
    updateObject(modelId, { scale: newScale });
  };

  return (
    <Suspense fallback={null}>
      {objects.map((obj) => {
        if (obj.type === 'mesh') {
          return (
            <Model
              key={obj.name}
              name={obj.name}
              geometryType={obj.mesh as GeometryType}
              position={[obj.locate.x, obj.locate.y, obj.locate.z]}
              scale={[obj.scale.x, obj.scale.y, obj.scale.z]}
              materialType={obj.shader as any}
              // @ts-ignore
              materialProps={{ color: obj.color }}
              onHeightChange={(deltaY) => handleHeightChange(obj.name, deltaY)}
              onWidthChange={(deltaX) => handleWidthChange(obj.name, deltaX)}
              onDepthChange={(deltaX) => handleDepthChange(obj.name, deltaX)}
            />
          )
        }
        if (obj.type === 'light') {
          return <LightRenderer key={obj.name} light={obj as LightType} />
        }
        if (obj.type === 'camera') {
          return <CameraRenderer key={obj.name} camera={obj as CameraType} />
        }
        return null;
      })}
    </Suspense>
  )
}

export default function WorkList() {
  const { undo, redo } = useSceneStore();
  const { clearSelection } = useEditorStore();
  const mainViewRef = useRef<HTMLDivElement>(null!);
  const renderViewRef = useRef<HTMLDivElement>(null!);
  
  const { selectedObjectId, activeRenderCameraId } = useEditorStore();
  const { objects } = useSceneStore();

  const selectedObject = selectedObjectId
    ? objects.find((obj) => obj.name === selectedObjectId)
    : null;
  const isLightSelected = selectedObject?.type === 'light';

  const renderCamera = activeRenderCameraId 
    ? objects.find((obj) => obj.name === activeRenderCameraId && obj.type === 'camera') as CameraType
    : null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSelection();
        return;
      }
      // ... other keydown logic
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  //@ts-ignore
  type SceneObject = ModelType | LightType | CameraType | GroupType ;

  const geometryMapR3F: Record<GeometryType, string> = {
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

  const materialMapR3F: Record<string, string> = {
    "Standard": "meshStandardMaterial",
    "Basic": "meshBasicMaterial",
    // Add other materials as needed
  };

  const geometryMapThreeJS: Record<GeometryType, string> = {
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

  const materialMapThreeJS: Record<string, string> = {
    "Standard": "MeshStandardMaterial",
    "Basic": "MeshBasicMaterial",
    // Add other materials as needed
  };

  const generateR3FCode = (objects: SceneObject[]): string => {
    let r3fObjectsCode = '';
    let imports = new Set<string>();
    imports.add("React");
    imports.add("Canvas");
    imports.add("useThree"); // For camera controls in a more general sense if needed
    imports.add("OrbitControls"); // If we want to include controls

    objects.forEach(obj => {
      if (obj.type === 'mesh') {
        const geometryComponent = geometryMapR3F[obj.mesh as GeometryType];
        const materialComponent = materialMapR3F[obj.shader || 'Standard']; // Default to Standard if undefined
        if (geometryComponent) imports.add(geometryComponent);
        if (materialComponent) imports.add(materialComponent);

        r3fObjectsCode += `
        <${geometryComponent}
          position={[${obj.locate.x}, ${obj.locate.y}, ${obj.locate.z}]}
          scale={[${obj.scale.x}, ${obj.scale.y}, ${obj.scale.z}]}
          rotation={[${obj.rotate.x}, ${obj.rotate.y}, ${obj.rotate.z}]}
        >
          <${materialComponent} color="${(obj as ModelType & {color?: string}).color || '#ffffff'}" />
        </${geometryComponent}>`;
      } else if (obj.type === 'light') {
        imports.add("ambientLight"); // Assuming common light components
        imports.add("pointLight");
        imports.add("directionalLight");
        imports.add("spotLight");

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
        imports.add("PerspectiveCamera"); // Assuming main camera is perspective
        imports.add("OrthographicCamera"); // Assuming orthographic camera might be used

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
      // GroupType is more complex for direct R3F component generation without helper components
    });

    const r3fImports = Array.from(imports).filter(i => i !== "Canvas").map(i => {
      // Differentiate between @react-three/fiber and @react-three/drei imports
      if (["Canvas", "useThree", "useFrame"].includes(i)) {
        return `  ${i},`;
      } else if (["Box", "Sphere", "Cylinder", "Plane", "Circle", "Torus", "TorusKnot", "Dodecahedron", "Octahedron", "Icosahedron", "OrbitControls", "PerspectiveCamera", "OrthographicCamera"].includes(i)) {
        return `  ${i},`;
      }
      // Material components are usually nested, not direct imports from drei
      return '';
    }).filter(Boolean).join('\n');
    
    let dreiImports = Array.from(imports).filter(i => ["Box", "Sphere", "Cylinder", "Plane", "Circle", "Torus", "TorusKnot", "Dodecahedron", "Octahedron", "Icosahedron", "OrbitControls", "PerspectiveCamera", "OrthographicCamera"].includes(i)).join(', ');
    if (dreiImports) {
        dreiImports = `import { ${dreiImports} } from '@react-three/drei';`;
    }

    return `import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
${dreiImports}

const Scene = () => {
  // Access camera for controls if needed, or other scene elements
  // const { camera } = useThree(); 

  return (
    <>
      <OrbitControls />
      <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={75} />
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

  const generateVanillaThreeJSCode = (objects: SceneObject[]): string => {
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
    threeJSComponents.add('Group'); // Add Group for handling groups

    Object.values(geometryMapThreeJS).forEach(cls => { if (cls) threeJSComponents.add(cls); });
    Object.values(materialMapThreeJS).forEach(cls => { if (cls) threeJSComponents.add(cls); });

    let sceneSetupCode = `
const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(5, 5, 5); // Default camera position

const ambientLight = new AmbientLight(0xffffff, 0.5); // Add a soft white ambient light
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 0.8); // Add a directional light
directionalLight.position.set(3, 10, 5);
scene.add(directionalLight);
`;
    let generatedObjectCode = ''; // Accumulate all object-related code here

    const generateObjectCodeRecursive = (
      items: SceneObject[],
      parentVarName: string,
      indent: string = ''
    ): string => {
      let code = '';
      items.forEach((obj) => {
        const sanitizedName = obj.name.replace(/[^a-zA-Z0-9_]/g, '_'); // Sanitize name for JS variable

        if (obj.type === 'mesh') {
          const geometryClass = geometryMapThreeJS[obj.mesh as GeometryType];
          const materialClass = materialMapThreeJS[obj.shader || 'Standard'];
          
          if (!geometryClass || !materialClass) {
              console.warn(`Skipping mesh ${obj.name} due to undefined geometry (${obj.mesh}) or material (${obj.shader})`);
              return;
          }

          code += `
${indent}const ${sanitizedName}Geometry = new ${geometryClass}();
${indent}const ${sanitizedName}Material = new ${materialClass}({ color: '${obj.color || '#ffffff'}' });
${indent}const ${sanitizedName}Mesh = new Mesh(${sanitizedName}Geometry, ${sanitizedName}Material);
${indent}${sanitizedName}Mesh.position.set(${obj.locate.x}, ${obj.locate.y}, ${obj.locate.z});
${indent}${sanitizedName}Mesh.scale.set(${obj.scale.x}, ${obj.scale.y}, ${obj.scale.z});
${indent}${sanitizedName}Mesh.rotation.set(${obj.rotate.x}, ${obj.rotate.y}, ${obj.rotate.z});
${indent}${parentVarName}.add(${sanitizedName}Mesh);
`;
        } else if (obj.type === 'light') {
          let lightClass = '';
          if (obj.light === 'ambient') lightClass = 'AmbientLight';
          else if (obj.light === 'point') lightClass = 'PointLight';
          else if (obj.light === 'directional') lightClass = 'DirectionalLight';
          else if (obj.light === 'spot') lightClass = 'SpotLight';

          if (lightClass) {
            code += `
${indent}const ${sanitizedName}Light = new ${lightClass}('${obj.color}', ${obj.intensity});
${indent}${sanitizedName}Light.position.set(${obj.locate.x}, ${obj.locate.y}, ${obj.locate.z});
${indent}${parentVarName}.add(${sanitizedName}Light);
`;
          }
        } else if (obj.type === 'camera') {
            // For now, cameras are not added to groups or the scene in a traditional sense for rendering purposes
            // If needed, they could be added as helpers or for specific viewports
        } else if (obj.type === 'group') {
          code += `
${indent}const ${sanitizedName}Group = new Group();
${indent}${sanitizedName}Group.position.set(${obj.locate.x}, ${obj.locate.y}, ${obj.locate.z});
${indent}${sanitizedName}Group.scale.set(${obj.scale.x}, ${obj.scale.y}, ${obj.scale.z});
${indent}${sanitizedName}Group.rotation.set(${obj.rotate.x}, ${obj.rotate.y}, ${obj.rotate.z});
${indent}${parentVarName}.add(${sanitizedName}Group);
`;
          code += generateObjectCodeRecursive(obj.children, `${sanitizedName}Group`, indent + '  ');
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);`;
  };

  const reactCode = generateR3FCode(objects);
  const vanillaCode = generateVanillaThreeJSCode(objects);


  return (
    <div className={s.container}>
      <WorkHeader/>
      <div className={s.contents}>
        <div className={s.three}>
          <div className={s.viewports}>
            {/* The two divs that will contain our views */}
            <div ref={mainViewRef} className={s.window} />
            <div ref={renderViewRef} className={s.renderWindow} />
          </div>
          <div className={s.add}>
            <WorkBottomBar/>
          </div>

          <Canvas
            className={s.canvas}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            eventSource={mainViewRef} // Main view drives events
          >
            {/* Main Editor View */}
            <View index={1} track={mainViewRef}>
              <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
              <ArrowMoveControl />
              <SharedScene />
              <gridHelper args={[10, 10]} />
              <axesHelper args={[5]} />
              <OrbitControls makeDefault enabled={!isLightSelected} />
            </View>
            
            {/* Second Render View */}
            <View index={2} track={renderViewRef}>
              {renderCamera ? (
                <PerspectiveCamera
                  makeDefault
                  position={[renderCamera.locate.x, renderCamera.locate.y, renderCamera.locate.z]}
                  rotation={[renderCamera.rotate.x, renderCamera.rotate.y, renderCamera.rotate.z]}
                  fov={renderCamera.fov || 50}
                />
              ) : (
                <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={50} />
              )}
              <SharedScene />
            </View>
          </Canvas>
        </div>
        <WorkSideBar reactCode={reactCode} vanillaCode={vanillaCode} /> {/* Pass code props */}
      </div>
    </div>
  );
}