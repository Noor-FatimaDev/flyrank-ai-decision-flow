'use client';

import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import PromptNode from './PromptNode';

const initialNodes = [
  {
    id: '1',
    type: 'promptNode',
    data: { label: 'Start Node' },
    position: { x: 250, y: 100 },
  },
];

const initialEdges: Edge[] = [];

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(2);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const updateNodeLabel = useCallback(
    (id: string, value: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, label: value } } : node
        )
      );
    },
    [setNodes]
  );

  const addNode = () => {
    const newNode = {
      id: String(nodeId),
      type: 'promptNode',
      data: { label: '' },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((id) => id + 1);
  };

  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: { ...node.data, onChange: (value: string) => updateNodeLabel(node.id, value) },
  }));

  const nodeTypes = useMemo(() => ({ promptNode: PromptNode }), []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button
        onClick={addNode}
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, padding: '8px 16px' }}
      >
        Add Node
      </button>
      <ReactFlow
        nodes={nodesWithHandlers}
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
  );
}