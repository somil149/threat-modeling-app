import React, { useCallback } from 'react';
import ReactFlow, { Background, Controls, addEdge, ConnectionMode } from 'reactflow';
import 'reactflow/dist/style.css';
import { useThreatModel } from '../context/ThreatModelContext';
import { nodeTypes } from './CustomNodes';

export default function DiagramCanvas() {
  const { nodes, edges, setEdges, onNodesChange, onEdgesChange, setSelectedNode, deleteNode } = useThreatModel();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onSelectionChange = useCallback(({ nodes }) => {
    if (nodes.length > 0) {
      setSelectedNode(nodes[0]);
    } else {
      setSelectedNode(null);
    }
  }, [setSelectedNode]);

  const onNodesDelete = useCallback((deleted) => {
    deleted.forEach(d => deleteNode(d.id));
  }, [deleteNode]);

  return (
    <div className="diagram-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodesDelete={onNodesDelete}
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
