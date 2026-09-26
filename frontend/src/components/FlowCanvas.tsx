'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state once, when the page first opens
  useEffect(() => {
    const saved = localStorage.getItem('flowState');
    if (saved) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
      setNodes(savedNodes);
      setEdges(savedEdges);
    }
    setIsLoaded(true);
  }, []);

  // Save state — but only after loading has finished
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('flowState', JSON.stringify({ nodes, edges }));
  }, [nodes, edges, isLoaded]);

  const onConnect = useCallback(
    (params: Connection) => {
      const isYes = params.sourceHandle === 'yes';
      const newEdge = {
        ...params,
        label: isYes ? 'YES' : 'NO',
        style: { stroke: isYes ? 'green' : 'red' },
        labelStyle: { fill: isYes ? 'green' : 'red', fontWeight: 700 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
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