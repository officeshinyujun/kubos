import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface ColorNodeProps {
  data: {
    label: string;
    color: string;
    onChange: (color: string) => void;
  };
}

const ColorNode: React.FC<ColorNodeProps> = ({ data }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    data.onChange(event.target.value);
  };

  return (
    <div style={{ padding: 10, border: '1px solid #ccc', borderRadius: 5, background: '#fff' }}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label || 'Color Node'}</div>
      <input type="color" value={data.color || '#ffffff'} onChange={handleChange} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(ColorNode);