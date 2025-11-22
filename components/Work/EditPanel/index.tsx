'use client'

import s from './style.module.scss';
import { useEditorStore } from '../../../stores/useEditStore';
import { useSceneStore } from '@/stores/useSceneStore';
import { ModelType, LightType } from '@/types/model/modelType';
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

// Slider input component
const SliderInput = ({ label, value, onChange, min = 0, max = 2, step = 0.1 }: { label: string, value: number, onChange: (value: number) => void, min?: number, max?: number, step?: number }) => {
    const { setOrbitEnabled } = useEditorStore();
    return (
        <div>
            <p className={s.title}>{label}</p>
            <div className={s.sliderInput}>
                <input 
                  type="range" 
                  min={min} 
                  max={max} 
                  step={step} 
                  value={value} 
                  onChange={(e) => onChange(parseFloat(e.target.value))}
                  onMouseDown={() => setOrbitEnabled(false)}
                  onMouseUp={() => setOrbitEnabled(true)}
                />
                <span>{value.toFixed(2)}</span>
            </div>
        </div>
    )
}


export default function EditPanel() {
  const { selectedObjectId } = useEditorStore();
  const { objects, updateObject } = useSceneStore();

  const selectedObject = selectedObjectId ? findObject(objects, selectedObjectId) : null;

  if (!selectedObject) {
    return (
      <div className={s.container}>
        <p className={s.noObject}>Select an object to edit its properties.</p>
      </div>
    );
  }

  const handleVectorChange = (prop: 'locate' | 'rotate' | 'scale', axis: 'x' | 'y' | 'z', value: number) => {
    if (!selectedObjectId || isNaN(value)) return;
    const currentObject = findObject(objects, selectedObjectId);
    if (!currentObject) return;
    const updatedProp = { ...currentObject[prop], [axis]: value };
    updateObject(selectedObjectId, { [prop]: updatedProp });
  };

  const handleValueChange = (prop: string, value: any) => {
    if (!selectedObjectId) return;
    updateObject(selectedObjectId, { [prop]: value });
  }

  // Mesh-specific panel
  if (selectedObject.type === 'mesh') {
    const model = selectedObject as ModelType;
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
          onChange={(value) => handleValueChange('color', value)}
        />
      </div>
    );
  }

  // Light-specific panel
  if (selectedObject.type === 'light') {
    const light = selectedObject as LightType;
    return (
      <div className={s.container}>
        <VectorInput
            label="Position"
            value={light.locate}
            onChange={(axis, value) => handleVectorChange('locate', axis, value)}
        />
        <VectorInput
            label="Rotation"
            value={light.rotate}
            onChange={(axis, value) => handleVectorChange('rotate', axis, value)}
        />
        <ColorInput
          value={light.color || '#ffffff'}
          onChange={(value) => handleValueChange('color', value)}
        />
        <SliderInput
            label="Intensity"
            value={light.intensity}
            onChange={(value) => handleValueChange('intensity', value)}
        />
        {light.light === 'spot' && (
            <SliderInput
                label="Angle"
                min={0}
                max={Math.PI / 2}
                step={0.01}
                value={light.angle || 0}
                onChange={(value) => handleValueChange('angle', value)}
            />
        )}
      </div>
    );
  }

  return (
    <div className={s.container}>
      <p className={s.noObject}>This object type cannot be edited.</p>
    </div>
  );
}
