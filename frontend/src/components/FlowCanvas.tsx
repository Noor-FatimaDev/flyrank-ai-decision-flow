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
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('flowState');
    if (saved) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
      setNodes(savedNodes);
      setEdges(savedEdges);
    }
    setIsLoaded(true);
  }, []);

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

  const runWorkflow = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await fetch('http://localhost:8000/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setIsRunning(false);
    }
  };

  const nodesWithHandlers = nodes.map((node) => ({
    ...node,
    data: { ...node.data, onChange: (value: string) => updateNodeLabel(node.id, value) },
  }));

  const nodeTypes = useMemo(() => ({ promptNode: PromptNode }), []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: 8 }}>
        <button onClick={addNode} style={{ padding: '8px 16px' }}>
          Add Node
        </button>
        <button onClick={runWorkflow} disabled={isRunning} style={{ padding: '8px 16px' }}>
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>

      {result && (
        <pre
          style={{
            position: 'absolute',
            top: 60,
            left: 10,
            zIndex: 10,
            background: 'white',
            border: '1px solid #ccc',
            padding: 10,
            maxWidth: 400,
            maxHeight: 300,
            overflow: 'auto',
            fontSize: 12,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

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