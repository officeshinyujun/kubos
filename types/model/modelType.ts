export type ModelType = {
    name: string;
    type: "mesh";
    locate: {
        x: number;
        y: number;
        z: number;
    };
    rotate: {
        x: number;
        y: number;
        z: number;
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
    color?: string; // Add color property here
    texturePath?: string; // Add texture path property for image texturing
} & (
    | { type: 'mesh'; shader: string; mesh: string }
    | { type: Exclude<TypeType, 'mesh'>; shader?: string; mesh?: never }
);

export type LightType = {
    name: string;
    type: "light";
    color: string;
    intensity: number;
    locate: {
        x: number;
        y: number;
        z: number;
    };
    rotate: {
        x: number;
        y: number;
        z: number;
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
    light : "ambient" | "directional" | "point" | "spot";
    angle?: number; // For spot lights
}

export type CameraType = {
    name: string;
    type: "camera";
    locate: {
        x: number;
        y: number;
        z: number;
    };
    rotate: {
        x: number;
        y: number;
        z: number;
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
    camera : "perspective" | "orthographic";
    fov?: number;
    target?: { // Optional target property for camera lookAt
        x: number;
        y: number;
        z: number;
    };
    zoom?: number; // Optional zoom property for camera
}

export type GroupType = {
    name: string;
    type: "group";
    locate: { // Add locate for group position
        x: number;
        y: number;
        z: number;
    };
    rotate: { // Add rotate for group rotation
        x: number;
        y: number;
        z: number;
    };
    scale: { // Add scale for group scale
        x: number;
        y: number;
        z: number;
    };
    children: SceneObject[]; // Allow children to be any SceneObject
}

export type TypeType = "mesh" | "group" | "light" | "camera";

type SceneObject = ModelType | GroupType | LightType | CameraType; // Define SceneObject here for GroupType children
