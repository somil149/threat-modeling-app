import React, { useMemo } from 'react';
import { useThreatModel } from '../context/ThreatModelContext';
import { calculateRisk, getSeverityFromRisk } from './ThreatPanel';
import { Activity, CheckCircle, XCircle, AlertCircle, ShieldCheck, ClipboardList } from 'lucide-react';

export default function DevSecOpsPanel() {
  const { threats } = useThreatModel();

  const { metrics, pipelineStatus, backlog } = useMemo(() => {
    const allThreats = Object.values(threats).flat();
    
    let criticalCount = 0;
    let highCount = 0;
    const backlogItems = [];

    allThreats.forEach(t => {
      const risk = calculateRisk(t.likelihood||3, t.impact||3);
      const severity = getSeverityFromRisk(risk);
      
      if (t.status === 'Open') {
        if (severity === 'Critical') criticalCount++;
        if (severity === 'High') highCount++;
        
        backlogItems.push({
          id: `SEC-${Math.floor(Math.random() * 10000)}`,
          title: `Mitigate ${severity} Risk: ${t.title}`,
          severity,
          category: t.category
        });
      }
    });

    const passed = criticalCount === 0 && highCount === 0;

    return {
      metrics: { critical: criticalCount, high: highCount },
      pipelineStatus: passed ? 'PASSED' : 'FAILED',
      backlog: backlogItems.sort((a, b) => (a.severity === 'Critical' ? -1 : 1))
    };
  }, [threats]);

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--panel-border)', background: 'var(--panel-bg)' }}>
        <h2>DevSecOps Simulation</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Simulated continuous security pipeline and automated backlog generation.
        </p>
      </div>
      
      <div style={{ padding: '40px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Pipeline Status */}
        <div style={{ flex: 1, minWidth: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <ShieldCheck size={24} />
            <h3>GitHub Actions Security Check</h3>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', borderLeft: pipelineStatus === 'PASSED' ? '4px solid #10b981' : '4px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Threat Model Policy Gate</span>
              {pipelineStatus === 'PASSED' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 'bold' }}>
                  <CheckCircle size={20} /> PASSED
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 'bold' }}>
                  <XCircle size={20} /> FAILED
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              The security policy enforces that zero (0) Open Critical or High threats are permitted in the main branch.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px' }}>
              $ check-threat-model --strict<br/>
              &gt; Found {metrics.critical} Critical threats.<br/>
              &gt; Found {metrics.high} High threats.<br/>
              &gt; Policy Evaluation: {pipelineStatus === 'PASSED' ? 'OK' : 'BLOCKING MERGE'}
            </div>
          </div>
        </div>

        {/* Security Backlog */}
        <div style={{ flex: 1, minWidth: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <ClipboardList size={24} color="#3b82f6" />
            <h3>Generated Jira / Security Backlog</h3>
          </div>

          <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
            {backlog.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                <CheckCircle size={32} color="#10b981" style={{ marginBottom: '12px' }} />
                <p>No open threats. Backlog is clear!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {backlog.map(item => (
                  <div key={item.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-main)' }}>{item.id}: {item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Category: {item.category}</div>
                    </div>
                    <span className={`badge badge-${item.severity.toLowerCase()}`}>{item.severity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
