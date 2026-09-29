'use client';

import { Handle, Position } from 'reactflow';

export default function PromptNode({ data }: { data: { label: string; onChange: (value: string) => void } }) {
  return (
    <div
      style={{
        border: '1px solid #d0d0d0',
        borderRadius: 10,
        background: 'white',
        minWidth: 200,
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />

      <div
        style={{
          background: '#f5f5f7',
          padding: '6px 10px',
          fontSize: 11,
          fontWeight: 600,
          color: '#666',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          borderBottom: '1px solid #e5e5e5',
        }}
      >
        Decision Node
      </div>

      <div style={{ padding: 10 }}>
        <textarea
          className="nodrag"
          value={data.label}
          onChange={(e) => data.onChange(e.target.value)}
          placeholder="Enter decision prompt..."
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: 13,
            fontFamily: 'inherit',
            color: '#222',
          }}
          rows={3}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          fontWeight: 600,
          padding: '6px 10px',
          background: '#fafafa',
          borderTop: '1px solid #eee',
        }}
      >
        <span style={{ color: '#c0392b' }}>NO</span>
        <span style={{ color: '#27865e' }}>YES</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: '25%', background: '#c0392b', width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: '75%', background: '#27865e', width: 10, height: 10 }}
      />
    </div>
  );
}