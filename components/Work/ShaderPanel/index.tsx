import s from './style.module.scss';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
  Node,
  Edge,
  Connection,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { useEditorStore } from '@/stores/useEditStore';
import { useSceneStore } from '@/stores/useSceneStore';
import { generateMaterialProps } from '@/utils/shaderGenerator';

import ColorNode from './nodes/ColorNode';
import TextureNode from './nodes/TextureNode';
import OutputNode from './nodes/OutputNode';

// Placeholder for node types - will be recreated
const nodeTypes = {
  color: ColorNode,
  texture: TextureNode,
  output: OutputNode,
}; 

interface ShaderNodeData {
  onChange?: (data: any) => void;
  color?: string;
  texturePath?: string;
  label?: string;
  [key: string]: any;
}

// Inner component to use useReactFlow hook
const FlowRenderer = () => {
  const { setViewport } = useReactFlow();
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const { objects, updateObject } = useSceneStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<ShaderNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const selectedObject = useMemo(
    () => objects.find((obj) => obj.name === selectedObjectId),
    [objects, selectedObjectId]
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onAddNode = useCallback(
    (type: string) => {
      const position = {
        x: Math.floor(Math.random() * 200) + 100,
        y: Math.floor(Math.random() * 200) + 100,
      };

      const id = `node-${uuidv4()}`;

      const onChange = (newData: any) => {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, ...newData } }
              : node
          )
        );
      };

      const newNode: Node<ShaderNodeData> = {
        id: id,
        type: type,
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          onChange: (value: any) => {
            if (type === 'color') {
              onChange({ color: value });
            } else if (type === 'texture') {
              onChange({ texturePath: value });
            }
          },
          ...(type === 'color' && { color: '#ffffff' }),
          ...(type === 'texture' && { texturePath: undefined }),
        },
      };

      console.log('Adding node:', newNode);
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // Initial nodes (e.g., an output node)
  useEffect(() => {
    if (!nodes.length && selectedObject) {
      setNodes([
        {
          id: 'output-node',
          type: 'output',
          position: { x: 400, y: 200 },
          data: { label: 'Material Output' },
        },
      ]);
    }
  }, [nodes.length, selectedObject, setNodes]);

  // Update object's material properties when nodes or edges change
  useEffect(() => {
    if (selectedObject) {
      const { color, texturePath } = generateMaterialProps(nodes as Node<ShaderNodeData>[], edges);
      console.log(`FlowRenderer: Calling updateObject for ${selectedObject.name} with color = ${color}, texturePath = ${texturePath}`);
      updateObject(selectedObject.name, { color, texturePath });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, selectedObject?.name, updateObject]); // Simplify dependencies slightly for debugging

  if (!selectedObject) {
    return (
      <div className={s.noSelection}>
        <p>Select an object to edit its material</p>
      </div>
    );
  }

  return (
    <div className={s.shaderPanel} ref={reactFlowWrapper}>
      <div className={s.toolbar}>
        <button onClick={() => onAddNode('color')}>Add Color Node</button>
        <button onClick={() => onAddNode('texture')}>Add Texture Node</button>
      </div>
      <div className={s.flowContainer} style={{ width: '100%', height: 'calc(100% - 40px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

const ShaderPanel: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowRenderer />
    </ReactFlowProvider>
  );
};

export default ShaderPanel;