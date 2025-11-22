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
}

export type GroupType = {
    name: string;
    type: "group";
    children: ModelType[];
}

export type TypeType = "mesh" | "group" | "light" | "camera";
