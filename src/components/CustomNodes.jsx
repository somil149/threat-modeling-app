import React from 'react';
import { Handle, Position } from 'reactflow';
import { Database, Server, User } from 'lucide-react';

const NodeWrapper = ({ title, icon, typeClass, selected }) => (
  <div className={`custom-node ${typeClass} ${selected ? 'selected' : ''}`}>
    <Handle type="target" position={Position.Top} style={{ background: '#888' }} />
    <Handle type="target" position={Position.Left} style={{ background: '#888' }} id="left" />
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      {icon}
      <span style={{ fontSize: '12px', textAlign: 'center' }}>{title}</span>
    </div>
    <Handle type="source" position={Position.Right} style={{ background: '#888' }} id="right" />
    <Handle type="source" position={Position.Bottom} style={{ background: '#888' }} />
  </div>
);

export const ProcessNode = ({ data, selected }) => (
  <NodeWrapper title={data.label} icon={<Server size={20} />} typeClass="node-process" selected={selected} />
);

export const DataStoreNode = ({ data, selected }) => (
  <NodeWrapper title={data.label} icon={<Database size={20} />} typeClass="node-datastore" selected={selected} />
);

export const EntityNode = ({ data, selected }) => (
  <NodeWrapper title={data.label} icon={<User size={20} />} typeClass="node-entity" selected={selected} />
);

export const nodeTypes = {
  process: ProcessNode,
  datastore: DataStoreNode,
  entity: EntityNode
};
