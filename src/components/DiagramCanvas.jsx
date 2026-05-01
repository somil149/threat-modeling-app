import React, { useCallback } from 'react';
import ReactFlow, { Background, Controls, addEdge, ConnectionMode } from 'reactflow';
import 'reactflow/dist/style.css';
import { useThreatModel } from '../context/ThreatModelContext';
import { nodeTypes } from './CustomNodes';

export default function DiagramCanvas() {
  const { nodes, edges, setEdges, onNodesChange, onEdgesChange, setSelectedNode } = useThreatModel();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="diagram-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background color="#444" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
