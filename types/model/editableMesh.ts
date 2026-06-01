export interface MeshVector3 {
  x: number;
  y: number;
  z: number;
}

export interface MeshVector2 {
  x: number;
  y: number;
}

export interface Vertex {
  id: string;
  position: MeshVector3;
  normal: MeshVector3;
  selected: boolean;
}

export interface Edge {
  id: string;
  vertexIds: [string, string];
  faceIds: string[];
  selected: boolean;
}

export interface Face {
  id: string;
  vertexIds: string[];  // supports quads and triangles
  normal: MeshVector3;
  selected: boolean;
}

export interface EditableMesh {
  id: string;
  vertices: Vertex[];
  edges: Edge[];
  faces: Face[];
}
