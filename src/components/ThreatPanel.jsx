import React, { useState } from 'react';
import { useThreatModel } from '../context/ThreatModelContext';
import { ShieldAlert, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const STRIDE_CATEGORIES = ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'];

const getSuggestions = (nodeType) => {
  switch(nodeType) {
    case 'datastore':
      return [
        { category: 'Information Disclosure', title: 'Data exposure at rest', desc: 'Sensitive data might be read by unauthorized users.', severity: 'High' },
        { category: 'Tampering', title: 'Data tampering at rest', desc: 'Data can be modified without authorization.', severity: 'Medium' }
      ];
    case 'process':
      return [
        { category: 'Elevation of Privilege', title: 'Unauthorized access', desc: 'Process runs with higher privileges than necessary.', severity: 'High' },
        { category: 'Denial of Service', title: 'Resource exhaustion', desc: 'Process can be flooded with requests.', severity: 'Medium' }
      ];
    case 'entity':
      return [
        { category: 'Spoofing', title: 'Entity impersonation', desc: 'Attacker pretends to be this entity.', severity: 'High' },
        { category: 'Repudiation', title: 'Action denial', desc: 'Entity can deny performing an action.', severity: 'Medium' }
      ];
    default:
      return [];
  }
};

export default function ThreatPanel() {
  const { selectedNode, setNodes, threats, addThreat, updateThreat, deleteThreat } = useThreatModel();
  const [isAdding, setIsAdding] = useState(false);
  const [newThreat, setNewThreat] = useState({ title: '', category: 'Spoofing', severity: 'Medium', desc: '', status: 'Open' });

  if (!selectedNode) {
    return (
      <div className="sidebar glass-panel">
        <div className="sidebar-header">
          <h2><ShieldAlert size={20} /> Threat Models</h2>
          <p>Select a node to view or add threats.</p>
        </div>
      </div>
    );
  }

  const nodeThreats = threats[selectedNode.id] || [];
  const suggestions = getSuggestions(selectedNode.type).filter(
    s => !nodeThreats.some(t => t.title === s.title)
  );

  const handleSaveThreat = () => {
    if (!newThreat.title) return;
    addThreat(selectedNode.id, { ...newThreat, id: uuidv4() });
    setIsAdding(false);
    setNewThreat({ title: '', category: 'Spoofing', severity: 'Medium', desc: '', status: 'Open' });
  };

  const handleUpdateLabel = (e) => {
    const newLabel = e.target.value;
    setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: newLabel } } : n));
    selectedNode.data.label = newLabel; 
  };

  return (
    <div className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2><ShieldAlert size={20} /> Properties</h2>
        <input 
          type="text" 
          value={selectedNode.data?.label || ''} 
          onChange={handleUpdateLabel}
          style={{ marginTop: '12px', marginBottom: 0 }}
        />
        <p style={{ textTransform: 'capitalize', fontSize: '12px', color: 'var(--text-muted)' }}>Type: {selectedNode.type}</p>
      </div>

      <div className="sidebar-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Threats ({nodeThreats.length})</h3>
          <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setIsAdding(true)}>
            <Plus size={14} /> Add
          </button>
        </div>

        {isAdding && (
          <div className="threat-card" style={{ borderColor: 'var(--accent)' }}>
            <label>Title</label>
            <input value={newThreat.title} onChange={e => setNewThreat({...newThreat, title: e.target.value})} placeholder="Threat title" />
            
            <label>Category (STRIDE)</label>
            <select value={newThreat.category} onChange={e => setNewThreat({...newThreat, category: e.target.value})}>
              {STRIDE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <label>Severity</label>
            <select value={newThreat.severity} onChange={e => setNewThreat({...newThreat, severity: e.target.value})}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            
            <label>Description</label>
            <textarea value={newThreat.desc} onChange={e => setNewThreat({...newThreat, desc: e.target.value})} rows={3} />
            
            <div className="threat-actions">
              <button className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
              <button className="btn" onClick={handleSaveThreat}>Save</button>
            </div>
          </div>
        )}

        {suggestions.length > 0 && !isAdding && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={12} /> Suggestions
            </h4>
            {suggestions.map((s, i) => (
              <div key={i} className="threat-card" style={{ borderStyle: 'dashed', cursor: 'pointer', opacity: 0.8 }} onClick={() => {
                setNewThreat({ ...s, status: 'Open' });
                setIsAdding(true);
              }}>
                <div className="threat-header">
                  <span className="threat-title" style={{ color: 'var(--accent)' }}>+ {s.title}</span>
                  <span className={`badge badge-${s.severity.toLowerCase()}`}>{s.severity}</span>
                </div>
                <div className="threat-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        )}

        {nodeThreats.map(threat => (
          <div key={threat.id} className="threat-card">
            <div className="threat-header">
              <span className="threat-title">{threat.title}</span>
              <span className={`badge badge-${threat.severity.toLowerCase()}`}>{threat.severity}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '8px', fontWeight: '500' }}>{threat.category}</div>
            <div className="threat-desc">{threat.desc}</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--panel-border)' }}>
              <select 
                value={threat.status} 
                onChange={(e) => updateThreat(selectedNode.id, threat.id, { status: e.target.value })}
                style={{ width: '120px', marginBottom: 0, padding: '4px', fontSize: '12px' }}
              >
                <option value="Open">🔴 Open</option>
                <option value="Mitigated">🟢 Mitigated</option>
                <option value="Accepted">⚪ Accepted</option>
              </select>
              <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => deleteThreat(selectedNode.id, threat.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
