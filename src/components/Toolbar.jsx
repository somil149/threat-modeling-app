import React, { useRef } from 'react';
import { useThreatModel } from '../context/ThreatModelContext';
import { Download, Upload, Server, Database, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { TEMPLATES } from '../templates';

export default function Toolbar() {
  const { setNodes, exportData, importData, loadTemplate } = useThreatModel();
  const fileInputRef = useRef(null);

  const addNode = (type, label) => {
    const newNode = {
      id: uuidv4(),
      type,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      importData(e.target.result);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="toolbar glass-panel">
      <button className="btn btn-secondary" onClick={() => addNode('entity', 'New Entity')} title="Add External Entity">
        <User size={16} /> Entity
      </button>
      <button className="btn btn-secondary" onClick={() => addNode('process', 'New Process')} title="Add Process">
        <Server size={16} /> Process
      </button>
      <button className="btn btn-secondary" onClick={() => addNode('datastore', 'New Data Store')} title="Add Data Store">
        <Database size={16} /> Store
      </button>
      
      <div className="toolbar-separator" />
      
      <select 
        onChange={(e) => {
          if(e.target.value) {
            loadTemplate(TEMPLATES[e.target.value].data());
            e.target.value = ''; // reset selection
          }
        }}
        style={{ width: '150px', marginBottom: 0, padding: '8px', background: 'rgba(0,0,0,0.4)', color: 'white', border: '1px solid var(--panel-border)', borderRadius: '6px' }}
      >
        <option value="">Templates...</option>
        {Object.entries(TEMPLATES).map(([key, t]) => (
          <option key={key} value={key}>{t.name}</option>
        ))}
      </select>
      
      <div className="toolbar-separator" />
      
      <button className="btn" onClick={exportData} title="Export to JSON">
        <Download size={16} /> Export
      </button>
      <button className="btn" onClick={() => fileInputRef.current?.click()} title="Import from JSON">
        <Upload size={16} /> Import
      </button>
      <input 
        type="file" 
        accept=".json" 
        style={{ display: 'none' }} 
        ref={fileInputRef}
        onChange={handleImport}
      />
    </div>
  );
}
