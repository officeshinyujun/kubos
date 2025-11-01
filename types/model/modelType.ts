export type ModelType = {
    name: string;
    type: TypeType;
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

export type GroupType = {
    name: string;
    type: TypeType;
    children: ModelType[];
}

export type TypeType = "mesh" | "group" | "light" | "camera" | "cube";
