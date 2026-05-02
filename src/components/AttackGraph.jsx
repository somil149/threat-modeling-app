import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { useThreatModel } from '../context/ThreatModelContext';
import { calculateRisk, getSeverityFromRisk } from './ThreatPanel';

// Simple deterministic engine to map architecture DFD to Attack Paths
const generateAttackGraph = (nodes, edges, threats) => {
  const attackNodes = [];
  const attackEdges = [];
  
  // Create nodes for each asset/component that has threats
  nodes.forEach((n, idx) => {
    attackNodes.push({
      id: `ap-${n.id}`,
      data: { label: `${n.data.label}\n(${n.type})` },
      position: { x: (idx % 3) * 350 + 100, y: Math.floor(idx / 3) * 250 + 100 },
      style: {
        background: '#1e293b',
        color: '#f3f4f6',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        padding: '10px',
        textAlign: 'center',
        width: 150
      }
    });
  });

  // Create an attacker entry node
  attackNodes.push({
    id: 'attacker-root',
    data: { label: 'External Attacker\n(Internet)' },
    position: { x: 300, y: 10 },
    style: { background: '#ef4444', color: 'white', fontWeight: 'bold', padding: '10px', borderRadius: '8px', textAlign: 'center' }
  });

  // Map edges
  edges.forEach((e) => {
    const sourceThreats = threats[e.source] || [];
    const maxRisk = sourceThreats.reduce((acc, t) => Math.max(acc, calculateRisk(t.likelihood||3, t.impact||3)), 0);
    
    attackEdges.push({
      id: `ae-${e.id}`,
      source: `ap-${e.source}`,
      target: `ap-${e.target}`,
      label: maxRisk > 0 ? `Lateral Movement\nRisk: ${maxRisk}` : 'Trust Path',
      animated: maxRisk >= 10,
      style: { stroke: maxRisk >= 10 ? '#ef4444' : '#3b82f6', strokeWidth: maxRisk >= 10 ? 3 : 1 },
      labelBgStyle: { fill: '#0b0d11', fillOpacity: 0.8 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      labelStyle: { fill: '#fff', fontWeight: 600 }
    });
  });

  // Connect attacker to external entities
  const externalEntities = nodes.filter(n => n.type === 'entity');
  externalEntities.forEach(ent => {
    attackEdges.push({
      id: `entry-${ent.id}`,
      source: 'attacker-root',
      target: `ap-${ent.id}`,
      label: 'Initial Access',
      animated: true,
      style: { stroke: '#ef4444', strokeWidth: 2 },
      labelBgStyle: { fill: '#0b0d11', fillOpacity: 0.8 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      labelStyle: { fill: '#ef4444', fontWeight: 700 }
    });
  });

  return { nodes: attackNodes, edges: attackEdges };
};

export default function AttackGraphPanel() {
  const { nodes, edges, threats } = useThreatModel();

  const { attackNodes, attackEdges } = useMemo(() => {
    const graph = generateAttackGraph(nodes, edges, threats);
    return { attackNodes: graph.nodes, attackEdges: graph.edges };
  }, [nodes, edges, threats]);

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--panel-border)', background: 'var(--panel-bg)' }}>
        <h2>Attack Path Simulation</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Deterministic graph illustrating potential lateral movement and initial access vectors based on your STRIDE/OWASP threat model.
        </p>
      </div>
      <div style={{ flexGrow: 1 }}>
        <ReactFlow nodes={attackNodes} edges={attackEdges} fitView>
          <Background color="#333" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
