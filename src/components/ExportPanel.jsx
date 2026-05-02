import React from 'react';
import { useThreatModel } from '../context/ThreatModelContext';
import { exportToPDF, exportToCSV, exportToMarkdown } from '../utils/exportEngine';
import { calculateRisk, getSeverityFromRisk } from './ThreatPanel';
import { FileText, Table, FileCode, Download, Copy } from 'lucide-react';

export default function ExportPanel() {
  const { nodes, threats, exportData } = useThreatModel();

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--panel-border)', background: 'var(--panel-bg)' }}>
        <h2>Report & Export Generation</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Generate 100% offline, deterministic security reports directly from your browser.
        </p>
      </div>
      
      <div style={{ padding: '40px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', width: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FileText size={32} color="#ef4444" />
            <h3 style={{ fontSize: '18px' }}>Executive PDF</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            A formal, CISO-ready PDF report including summary metrics and detailed threat mappings.
          </p>
          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => exportToPDF(nodes, threats)}>
            <Download size={16} /> Generate PDF
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', width: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Table size={32} color="#10b981" />
            <h3 style={{ fontSize: '18px' }}>Flattened CSV</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Tabular format of all threats, perfect for importing into Jira, Excel, or custom compliance tools.
          </p>
          <button className="btn" style={{ width: '100%', justifyContent: 'center', background: '#10b981' }} onClick={() => exportToCSV(nodes, threats)}>
            <Download size={16} /> Generate CSV
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', width: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FileCode size={32} color="#3b82f6" />
            <h3 style={{ fontSize: '18px' }}>Markdown Report</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Generates a standard GitHub-ready SECURITY.md file detailing the entire threat model.
          </p>
          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => exportToMarkdown(nodes, threats)}>
            <Download size={16} /> Generate MD
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', width: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Table size={32} color="#8b5cf6" />
            <h3 style={{ fontSize: '18px' }}>Jira Markdown</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Copy a Jira-compatible Markdown table to your clipboard for instant ticket creation.
          </p>
          <button className="btn" style={{ width: '100%', justifyContent: 'center', background: '#8b5cf6' }} onClick={() => {
            let md = '|| Component || Threat || Category || Severity || Risk ||\n';
            nodes.forEach(n => {
              const nodeThreats = threats[n.id] || [];
              nodeThreats.forEach(t => {
                const risk = calculateRisk(t.likelihood||3, t.impact||3);
                md += `| ${n.data.label} | ${t.title} | ${t.category} | ${getSeverityFromRisk(risk)} | ${risk} |\n`;
              });
            });
            navigator.clipboard.writeText(md);
            alert("Jira Markdown copied to clipboard!");
          }}>
            <Copy size={16} /> Copy to Clipboard
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', width: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FileCode size={32} color="#f59e0b" />
            <h3 style={{ fontSize: '18px' }}>JSON Engine State</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Export the raw deterministic engine state. Can be imported later to restore the model.
          </p>
          <button className="btn" style={{ width: '100%', justifyContent: 'center', background: '#f59e0b' }} onClick={exportData}>
            <Download size={16} /> Export JSON
          </button>
        </div>

      </div>
    </div>
  );
}
