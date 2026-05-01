import React from 'react';
import { ThreatModelProvider } from './context/ThreatModelContext';
import DiagramCanvas from './components/DiagramCanvas';
import Toolbar from './components/Toolbar';
import ThreatPanel from './components/ThreatPanel';
import { ReactFlowProvider } from 'reactflow';

function App() {
  return (
    <ThreatModelProvider>
      <div className="app-container">
        <ReactFlowProvider>
          <Toolbar />
          <DiagramCanvas />
        </ReactFlowProvider>
        <ThreatPanel />
      </div>
    </ThreatModelProvider>
  );
}

export default App;
