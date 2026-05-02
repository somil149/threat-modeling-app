import React, { useState } from 'react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../templates';
import { useThreatModel } from '../context/ThreatModelContext';
import { X, LayoutTemplate } from 'lucide-react';

export default function TemplateModal({ isOpen, onClose }) {
  const { loadTemplate } = useThreatModel();
  const [activeCategory, setActiveCategory] = useState(TEMPLATE_CATEGORIES.AIML);

  if (!isOpen) return null;

  const categories = Object.values(TEMPLATE_CATEGORIES);
  const templatesInCategory = Object.values(TEMPLATES).filter(t => t.category === activeCategory);

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h2><LayoutTemplate size={20} /> Browse Architecture Templates</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="modal-sidebar">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="modal-grid">
            {templatesInCategory.map(t => (
              <div key={t.name} className="template-card" onClick={() => {
                loadTemplate(t.data());
                onClose();
              }}>
                <h3>{t.name}</h3>
                <p>{t.desc}</p>
                <div className="template-badge">Use Template</div>
              </div>
            ))}
            {templatesInCategory.length === 0 && (
              <p style={{color: 'var(--text-muted)', padding: '20px'}}>More templates coming soon...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
