import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface OutputNodeProps {
  data: {
    label: string;
  };
}

const OutputNode: React.FC<OutputNodeProps> = ({ data }) => {
  return (
    <div style={{ padding: 10, border: '1px solid #696969', borderRadius: 5, background: '#111' }}>
      <Handle type="target" position={Position.Top} />
      <div style={{ color: '#fff' }}>{data.label || 'Output Node'}</div>
    </div>
  );
};

export default memo(OutputNode);