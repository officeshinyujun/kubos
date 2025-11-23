// components/Work/ShaderPanel/index.tsx
'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useEditorStore } from '@/stores/useEditStore';
import { useSceneStore } from '@/stores/useSceneStore';

const ShaderPanel: React.FC = () => {
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const { objects, updateObject } = useSceneStore();

  const selectedObject = useMemo(
    () => objects.find((obj) => obj.name === selectedObjectId),
    [objects, selectedObjectId]
  );

  if (!selectedObject) {
    return (
      <div className="no-selection">
        <p>Select an object to edit its material</p>
      </div>
    );
  }

  return (
    <div className="shader-panel">
      <h3>Shader Editor for {selectedObject.name}</h3>

      {/* Color Editing Card */}
      <div className="shader-card">
        <h4>Color</h4>
        <input
          type="color"
          value={selectedObject.color || '#ffffff'}
          onChange={(e) => {
            updateObject(selectedObject.name, { color: e.target.value });
          }}
        />
      </div>

      {/* Texture Editing Card */}
      <div className="shader-card">
        <h4>Texture</h4>
        {selectedObject.texturePath && (
          <div>
            <img src={selectedObject.texturePath} alt="texture preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
            <button onClick={() => updateObject(selectedObject.name, { texturePath: undefined })}>Clear Texture</button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const newTexturePath = event.target?.result as string;
                console.log(`Updating texturePath for ${selectedObject.name}:`, newTexturePath);
                updateObject(selectedObject.name, { texturePath: newTexturePath });
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>

    </div>
  );
};

export default ShaderPanel;