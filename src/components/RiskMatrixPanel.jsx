import React, { useMemo } from 'react';
import { useThreatModel } from '../context/ThreatModelContext';
import { calculateRisk, getSeverityFromRisk } from './ThreatPanel';

export default function RiskMatrixPanel() {
  const { threats } = useThreatModel();

  const matrix = useMemo(() => {
    // Initialize 5x5 grid (Likelihood 1-5, Impact 1-5)
    // grid[likelihood][impact] array of threats
    const grid = Array(6).fill(null).map(() => Array(6).fill([]));
    
    Object.values(threats).flat().forEach(t => {
      if (t.status === 'Open') {
        const l = t.likelihood || 3;
        const i = t.impact || 3;
        grid[l][i] = [...grid[l][i], t];
      }
    });
    return grid;
  }, [threats]);

  const getColor = (likelihood, impact) => {
    const risk = calculateRisk(likelihood, impact);
    const severity = getSeverityFromRisk(risk);
    if (severity === 'Critical') return '#ef4444'; // Red
    if (severity === 'High') return '#f97316'; // Orange
    if (severity === 'Medium') return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--panel-border)', background: 'var(--panel-bg)' }}>
        <h2>Risk Matrix Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          5x5 Heatmap plotting Open threats by Likelihood vs Impact.
        </p>
      </div>
      
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          
          <div style={{ position: 'absolute', left: '-40px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontWeight: 'bold' }}>
            Likelihood
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[5, 4, 3, 2, 1].map(l => (
              <div key={l} style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{l}</div>
                {[1, 2, 3, 4, 5].map(i => {
                  const items = matrix[l][i];
                  return (
                    <div 
                      key={`${l}-${i}`}
                      style={{
                        width: '80px', height: '80px',
                        background: getColor(l, i),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '4px',
                        opacity: items.length > 0 ? 1 : 0.2,
                        boxShadow: items.length > 0 ? '0 0 10px rgba(0,0,0,0.5)' : 'none',
                        cursor: items.length > 0 ? 'pointer' : 'default',
                        position: 'relative'
                      }}
                      title={items.length > 0 ? items.map(x => x.title).join('\n') : ''}
                    >
                      {items.length > 0 && (
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'rgba(0,0,0,0.7)' }}>
                          {items.length}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', marginLeft: '24px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ width: '80px', textAlign: 'center', fontWeight: 'bold' }}>{i}</div>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>
              Impact
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
