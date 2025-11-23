
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { SceneObject, ModelType, LightType } from '@/types/model/modelType';

function createThreeJsObject(obj: SceneObject): THREE.Object3D | null {
    let threeObj: THREE.Object3D | null = null;

    if (obj.type === 'mesh') {
        const model = obj as ModelType;
        let geometry: THREE.BufferGeometry;
        switch (model.mesh) {
            case '정육면체':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                break;
            case '구':
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
            case '평면':
                geometry = new THREE.PlaneGeometry(1, 1);
                break;
            case '원판':
                geometry = new THREE.CircleGeometry(1, 32);
                break;
            case '원기둥':
                geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
                break;
            case '도넛':
                geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
                break;
            case '꼬인 도넛':
                geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
                break;
            case '12면체':
                geometry = new THREE.DodecahedronGeometry(1);
                break;
            case '8면체':
                geometry = new THREE.OctahedronGeometry(1);
                break;
            case '20면체':
                geometry = new THREE.IcosahedronGeometry(1);
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1); // Default to box
        }
        
        const material = new THREE.MeshStandardMaterial({ color: model.color || '#ffffff' });
        threeObj = new THREE.Mesh(geometry, material);

    } else if (obj.type === 'light') {
        const light = obj as LightType;
        switch(light.light) {
            case 'point':
                threeObj = new THREE.PointLight(light.color, light.intensity);
                break;
            case 'directional':
                threeObj = new THREE.DirectionalLight(light.color, light.intensity);
                break;
            // Add other light types if needed
        }
    }
    
    if (threeObj) {
        threeObj.name = obj.name;
        if(obj.locate) threeObj.position.set(obj.locate.x, obj.locate.y, obj.locate.z);
        if(obj.rotate) threeObj.rotation.set(obj.rotate.x, obj.rotate.y, obj.rotate.z);
        if(obj.scale) threeObj.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);
    }

    return threeObj;
}


export function exportToGLTF(sceneObjects: SceneObject[]) {
    const scene = new THREE.Scene();

    // Add objects from store to the Three.js scene
    sceneObjects.forEach(obj => {
        const threeObj = createThreeJsObject(obj);
        if (threeObj) {
            scene.add(threeObj);
        }
    });

    const exporter = new GLTFExporter();

    exporter.parse(
        scene,
        (gltf) => {
            const output = JSON.stringify(gltf, null, 2);
            const blob = new Blob([output], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'scene.gltf';
            link.click();
        },
        (error) => {
            console.error('An error happened during parsing', error);
        },
        {
            trs: false,
            onlyVisible: true,
            truncateDrawRange: true,
            binary: false, // Set to true for GLB
            maxTextureSize: 4096
        }
    );
}
