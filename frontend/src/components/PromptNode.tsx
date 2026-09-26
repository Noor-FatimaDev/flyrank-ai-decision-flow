'use client';

import { Handle, Position } from 'reactflow';

export default function PromptNode({ data }: { data: { label: string; onChange: (value: string) => void } }) {
  return (
    <div style={{ border: '1px solid #777', borderRadius: 6, padding: 10, background: 'white', minWidth: 180 }}>
      <Handle type="target" position={Position.Left} />

      <textarea
        className="nodrag"
        value={data.label}
        onChange={(e) => data.onChange(e.target.value)}
        placeholder="Enter decision prompt..."
        style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 13 }}
        rows={3}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4 }}>
        <span style={{ color: 'red' }}>NO</span>
        <span style={{ color: 'green' }}>YES</span>
      </div>

      <Handle type="source" position={Position.Bottom} id="no" style={{ left: '25%', background: 'red' }} />
      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: '75%', background: 'green' }} />
    </div>
  );
}