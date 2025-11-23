import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface TextureNodeProps {
  data: {
    label: string;
    texturePath?: string;
    onChange: (texturePath: string | undefined) => void;
  };
}

const TextureNode: React.FC<TextureNodeProps> = ({ data }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        data.onChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      data.onChange(undefined);
    }
  };

  return (
    <div style={{ padding: 10, border: '1px solid #696969', borderRadius: 5, background: '#111' }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ color: '#fff' }}>{data.label || 'Texture Node'}</div>
      {data.texturePath && (
        <div>
          <img src={data.texturePath} alt="texture preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
          <button onClick={() => data.onChange(undefined)}>Clear</button>
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(TextureNode);