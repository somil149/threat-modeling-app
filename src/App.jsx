import React from 'react';
import { ThreatModelProvider, useThreatModel } from './context/ThreatModelContext';
import { ReactFlowProvider } from 'reactflow';
import { LayoutDashboard, ShieldAlert, GitMerge, FileOutput, Activity, Grid, Bot } from 'lucide-react';

// Components
import DiagramCanvas from './components/DiagramCanvas';
import Toolbar from './components/Toolbar';
import ThreatPanel from './components/ThreatPanel';
import AttackGraphPanel from './components/AttackGraph';
import ExportPanel from './components/ExportPanel';
import DevSecOpsPanel from './components/DevSecOpsPanel';
import RiskMatrixPanel from './components/RiskMatrixPanel';
import AICopilotPanel from './components/AICopilotPanel';

const SidebarNav = () => {
  const { currentMode, setCurrentMode } = useThreatModel();
  
  const navItems = [
    { mode: 'ARCHITECTURE', icon: <LayoutDashboard size={20} />, label: 'Architecture' },
    { mode: 'SIMULATION', icon: <GitMerge size={20} />, label: 'Attack Graph' },
    { mode: 'RISK_MATRIX', icon: <Grid size={20} />, label: 'Risk Matrix' },
    { mode: 'DEVSECOPS', icon: <Activity size={20} />, label: 'DevSecOps' },
    { mode: 'COPILOT', icon: <Bot size={20} />, label: 'AI Copilot' },
    { mode: 'EXPORT', icon: <FileOutput size={20} />, label: 'Exports' }
  ];

  return (
    <div className="global-nav glass-panel">
      <div className="nav-logo">
        <ShieldAlert size={28} color="var(--accent)" />
      </div>
      <div className="nav-items">
        {navItems.map(item => (
          <button 
            key={item.mode}
            className={`nav-btn ${currentMode === item.mode ? 'active' : ''}`}
            onClick={() => setCurrentMode(item.mode)}
            title={item.label}
          >
            {item.icon}
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const AppContent = () => {
  const { currentMode } = useThreatModel();

  return (
    <div className="app-container">
      <SidebarNav />
      <div className="main-content-area">
        {currentMode === 'ARCHITECTURE' && (
          <>
            <ReactFlowProvider>
              <Toolbar />
              <DiagramCanvas />
            </ReactFlowProvider>
            <ThreatPanel />
          </>
        )}
        {currentMode === 'SIMULATION' && <AttackGraphPanel />}
        {currentMode === 'RISK_MATRIX' && <RiskMatrixPanel />}
        {currentMode === 'DEVSECOPS' && <DevSecOpsPanel />}
        {currentMode === 'COPILOT' && <AICopilotPanel />}
        {currentMode === 'EXPORT' && <ExportPanel />}
      </div>
    </div>
  );
};

function App() {
  return (
    <ThreatModelProvider>
      <AppContent />
    </ThreatModelProvider>
  );
}

export default App;
