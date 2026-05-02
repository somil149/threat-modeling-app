import React, { useRef, useState } from 'react';
import { useThreatModel } from '../context/ThreatModelContext';
import { Download, Upload, Server, Database, User, LayoutTemplate } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import TemplateModal from './TemplateModal';

export default function Toolbar() {
  const { nodes, setNodes, exportData, importData } = useThreatModel();
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addNode = (type, label) => {
    const offset = (nodes.length % 10) * 30;
    const newNode = {
      id: uuidv4(),
      type,
      position: { x: 100 + offset, y: 100 + offset },
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
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <>
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
        
        <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)} style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
          <LayoutTemplate size={16} /> Browse Templates
        </button>
        
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
      <TemplateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
