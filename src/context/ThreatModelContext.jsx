import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';

const ThreatModelContext = createContext();

export function ThreatModelProvider({ children }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [threats, setThreats] = useState({}); // key: nodeId, value: Array of threats
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentMode, setCurrentMode] = useState('ARCHITECTURE');
  const [aiConfig, setAiConfig] = useState(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('threatModelData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNodes(parsed.nodes || []);
        setEdges(parsed.edges || []);
        setThreats(parsed.threats || {});
        if (parsed.currentMode) setCurrentMode(parsed.currentMode);
        if (parsed.aiConfig) {
          setAiConfig(parsed.aiConfig);
        } else if (parsed.openAiKey) {
          setAiConfig({ provider: 'OpenAI', baseUrl: 'https://api.openai.com/v1', apiKey: parsed.openAiKey, model: 'gpt-4o' });
        }
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    const timeout = setTimeout(() => {
      const data = { nodes, edges, threats, currentMode, aiConfig };
      localStorage.setItem('threatModelData', JSON.stringify(data));
    }, 500);
    return () => clearTimeout(timeout);
  }, [nodes, edges, threats, currentMode, aiConfig]);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const addThreat = (nodeId, threat) => {
    setThreats(prev => {
      const nodeThreats = prev[nodeId] || [];
      return { ...prev, [nodeId]: [...nodeThreats, threat] };
    });
  };

  const updateThreat = (nodeId, threatId, updatedThreat) => {
    setThreats(prev => {
      const nodeThreats = prev[nodeId] || [];
      return {
        ...prev,
        [nodeId]: nodeThreats.map(t => t.id === threatId ? { ...t, ...updatedThreat } : t)
      };
    });
  };

  const deleteThreat = (nodeId, threatId) => {
    setThreats(prev => {
      const nodeThreats = prev[nodeId] || [];
      return {
        ...prev,
        [nodeId]: nodeThreats.filter(t => t.id !== threatId)
      };
    });
  };

  const importData = (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
      setThreats(parsed.threats || {});
      setSelectedNode(null);
    } catch (e) {
      alert("Invalid JSON file");
    }
  };

  const exportData = () => {
    const data = { nodes, edges, threats };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'threat-model.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadTemplate = (templateData) => {
    if (confirm("Are you sure you want to load this template? This will replace your current diagram.")) {
      setNodes(templateData.nodes || []);
      setEdges(templateData.edges || []);
      setThreats(templateData.threats || {});
      setSelectedNode(null);
    }
  };

  const deleteNode = (nodeId) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    setThreats(prev => {
      const newThreats = { ...prev };
      delete newThreats[nodeId];
      return newThreats;
    });
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  return (
    <ThreatModelContext.Provider value={{
      nodes, setNodes, onNodesChange,
      edges, setEdges, onEdgesChange,
      threats, setThreats,
      selectedNode, setSelectedNode,
      currentMode, setCurrentMode,
      aiConfig, setAiConfig,
      addThreat, updateThreat, deleteThreat,
      importData, exportData, loadTemplate, deleteNode
    }}>
      {children}
    </ThreatModelContext.Provider>
  );
}

export function useThreatModel() {
  return useContext(ThreatModelContext);
}
