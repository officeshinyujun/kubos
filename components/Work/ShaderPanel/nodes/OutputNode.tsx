import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface OutputNodeProps {
  data: {
    label: string;
  };
}

const OutputNode: React.FC<OutputNodeProps> = ({ data }) => {
  return (
    <div style={{ padding: 10, border: '1px solid #ccc', borderRadius: 5, background: '#fff' }}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label || 'Output Node'}</div>
    </div>
  );
};

export default memo(OutputNode);