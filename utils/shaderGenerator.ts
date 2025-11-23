// utils/shaderGenerator.ts
import { Node, Edge } from 'reactflow';

interface NodeData {
  color?: string;
  texturePath?: string;
  [key: string]: any;
}

interface GeneratedMaterialProps {
  color?: string;
  texturePath?: string;
}

export const generateMaterialProps = (nodes: Node<NodeData>[], edges: Edge[]): GeneratedMaterialProps => {
  let materialColor: string | undefined = undefined;
  let materialTexturePath: string | undefined = undefined;

  const outputNode = nodes.find(node => node.type === 'output');

  if (outputNode) {
    // Find edges connecting to the output node
    const connectedEdges = edges.filter(edge => edge.target === outputNode.id);

    connectedEdges.forEach(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode) {
        if (sourceNode.type === 'color' && sourceNode.data?.color !== undefined) {
          materialColor = sourceNode.data.color;
        } else if (sourceNode.type === 'texture' && sourceNode.data?.texturePath !== undefined) {
          materialTexturePath = sourceNode.data.texturePath;
        }
      }
    });
  }
  console.log('generateMaterialProps output: color =', materialColor, ', texturePath =', materialTexturePath);
  return {
    color: materialColor,
    texturePath: materialTexturePath,
  };
};