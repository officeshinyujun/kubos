'use client'

import s from './style.module.scss';
import { useEditorStore } from '@/stores/useEditStore';
import { useSceneStore } from '@/stores/useSceneStore';
import { ModelType } from '@/types/model/modelType';
import React from 'react';

// Helper function to find an object recursively
const findObject = (objects: any[], id: string): any | null => {
  for (const obj of objects) {
    if (obj.name === id) return obj;
    if (obj.children) {
      const found = findObject(obj.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Vector input component
const VectorInput = ({ label, value, onChange }: { label: string, value: { x: number, y: number, z: number }, onChange: (axis: 'x' | 'y' | 'z', value: number) => void }) => {
  return (
    <div>
      <p className={s.title}>{label}</p>
      <div className={s.vectorInput}>
        <label>X</label>
        <input type="number" step="0.1" value={value.x} onChange={(e) => onChange('x', parseFloat(e.target.value))} />
        <label>Y</label>
        <input type="number" step="0.1" value={value.y} onChange={(e) => onChange('y', parseFloat(e.target.value))} />
        <label>Z</label>
        <input type="number" step="0.1" value={value.z} onChange={(e) => onChange('z', parseFloat(e.target.value))} />
      </div>
    </div>
  );
};

// Color input component
const ColorInput = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    return (
        <div>
            <p className={s.title}>Color</p>
            <div className={s.colorInput}>
                <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
            </div>
        </div>
    )
}

export default function EditPanel() {
  const { selectedObjectId } = useEditorStore();
  const { objects, updateObject } = useSceneStore();

  const selectedObject = selectedObjectId ? findObject(objects, selectedObjectId) : null;

  if (!selectedObject || selectedObject.type !== 'mesh') {
    return (
      <div className={s.container}>
        <p className={s.noObject}>Select a model to edit its properties.</p>
      </div>
    );
  }

  // Cast to ModelType for type safety
  const model = selectedObject as ModelType;

  const handleVectorChange = (prop: 'locate' | 'rotate' | 'scale', axis: 'x' | 'y' | 'z', value: number) => {
    if (!selectedObjectId || isNaN(value)) return;
    const updatedProp = { ...model[prop], [axis]: value };
    updateObject(selectedObjectId, { [prop]: updatedProp });
  };

  const handleColorChange = (color: string) => {
    if (!selectedObjectId) return;
    // Assuming 'shader' property holds the color. This might need adjustment.
    // Let's create a new property 'color' for simplicity, assuming the renderer will handle it.
    updateObject(selectedObjectId, { color });
  }

  return (
    <div className={s.container}>
      <VectorInput
        label="Position"
        value={model.locate}
        onChange={(axis, value) => handleVectorChange('locate', axis, value)}
      />
      <VectorInput
        label="Rotation"
        value={model.rotate}
        onChange={(axis, value) => handleVectorChange('rotate', axis, value)}
      />
      <VectorInput
        label="Scale"
        value={model.scale}
        onChange={(axis, value) => handleVectorChange('scale', axis, value)}
      />
      <ColorInput
        // @ts-ignore - Assuming color property exists for simplicity
        value={model.color || '#ffffff'}
        onChange={handleColorChange}
      />
    </div>
  );
}
