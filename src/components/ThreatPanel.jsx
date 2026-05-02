import React, { useState } from 'react';
import { useThreatModel } from '../context/ThreatModelContext';
import { ShieldAlert, Plus, Trash2, AlertTriangle, BookOpen } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const FRAMEWORKS = {
  STRIDE: ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'],
  OWASP: ['Broken Access Control', 'Cryptographic Failures', 'Injection', 'Insecure Design', 'Security Misconfiguration', 'Vulnerable Components', 'Authentication Failures', 'Data Integrity Failures', 'Logging Failures', 'SSRF'],
  OWASP_LLM: ['Prompt Injection', 'Insecure Output Handling', 'Training Data Poisoning', 'Model Denial of Service', 'Supply Chain Vulnerabilities', 'Sensitive Information Disclosure', 'Insecure Plugin Design', 'Excessive Agency', 'Overreliance', 'Model Theft']
};

const getSuggestions = (nodeType, framework) => {
  if (framework === 'STRIDE') {
    switch(nodeType) {
      case 'datastore': return [{ category: 'Information Disclosure', title: 'Data exposure at rest', desc: 'Sensitive data might be read by unauthorized users.', severity: 'High' }];
      case 'process': return [{ category: 'Elevation of Privilege', title: 'Unauthorized access', desc: 'Process runs with higher privileges than necessary.', severity: 'High' }];
      case 'entity': return [{ category: 'Spoofing', title: 'Entity impersonation', desc: 'Attacker pretends to be this entity.', severity: 'High' }];
      default: return [];
    }
  } else if (framework === 'OWASP_LLM') {
    return [
      { category: 'Prompt Injection', title: 'Direct Prompt Injection', desc: 'Attacker manipulates LLM via malicious inputs.', severity: 'High' },
      { category: 'Sensitive Information Disclosure', title: 'LLM Data Leakage', desc: 'LLM reveals sensitive info from training data or context.', severity: 'High' },
      { category: 'Excessive Agency', title: 'Unintended Tool Execution', desc: 'LLM agent takes destructive actions autonomously.', severity: 'High' }
    ];
  } else if (framework === 'OWASP') {
    switch(nodeType) {
      case 'datastore': return [{ category: 'Cryptographic Failures', title: 'Unencrypted Data', desc: 'Data is not encrypted at rest.', severity: 'High' }];
      case 'process': return [{ category: 'Injection', title: 'Command/SQL Injection', desc: 'Untrusted data is sent to an interpreter.', severity: 'High' }];
      default: return [];
    }
  }
  return [];
};

export default function ThreatPanel() {
  const { selectedNode, setNodes, threats, addThreat, updateThreat, deleteThreat } = useThreatModel();
  const [isAdding, setIsAdding] = useState(false);
  const [activeFramework, setActiveFramework] = useState('STRIDE');
  const [newThreat, setNewThreat] = useState({ title: '', category: 'Spoofing', severity: 'Medium', desc: '', status: 'Open' });

  if (!selectedNode) {
    return (
      <div className="sidebar glass-panel">
        <div className="sidebar-header" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <ShieldAlert size={48} color="var(--panel-border)" style={{ marginBottom: '16px' }} />
          <h2 style={{ justifyContent: 'center' }}>Threat Modeling</h2>
          <p>Select a component on the canvas to start mapping threats.</p>
        </div>
      </div>
    );
  }

  const nodeThreats = threats[selectedNode.id] || [];
  const suggestions = getSuggestions(selectedNode.type, activeFramework).filter(
    s => !nodeThreats.some(t => t.title === s.title)
  );

  const handleSaveThreat = () => {
    if (!newThreat.title) return;
    addThreat(selectedNode.id, { ...newThreat, id: uuidv4() });
    setIsAdding(false);
    setNewThreat({ title: '', category: FRAMEWORKS[activeFramework][0], severity: 'Medium', desc: '', status: 'Open' });
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
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} /> Threat Framework</label>
          <select 
            value={activeFramework} 
            onChange={e => {
              setActiveFramework(e.target.value);
              setNewThreat(prev => ({ ...prev, category: FRAMEWORKS[e.target.value][0] }));
            }}
          >
            <option value="STRIDE">STRIDE Framework</option>
            <option value="OWASP">OWASP Top 10</option>
            <option value="OWASP_LLM">OWASP LLM Top 10</option>
          </select>
        </div>

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
            
            <label>Category ({activeFramework})</label>
            <select value={newThreat.category} onChange={e => setNewThreat({...newThreat, category: e.target.value})}>
              {FRAMEWORKS[activeFramework].map(c => <option key={c} value={c}>{c}</option>)}
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

        {nodeThreats.length === 0 && !isAdding && suggestions.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '14px' }}>
            No threats mapped in this framework yet.
          </div>
        )}
      </div>
    </div>
  );
}
