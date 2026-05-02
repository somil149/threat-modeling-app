import React, { useState, useRef, useEffect } from 'react';
import { useThreatModel } from '../context/ThreatModelContext';
import { KeyRound, Send, Bot, Shield, Trash2, Loader2, AlertTriangle, Settings, RefreshCw, Zap } from 'lucide-react';

const PROVIDERS = {
  OpenAI: { baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  OpenRouter: { baseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'anthropic/claude-3.7-sonnet' },
  OpenRouterFree: { baseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'openrouter/free' },
  Groq: { baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama3-70b-8192' },
  Custom: { baseUrl: 'http://localhost:11434/v1', defaultModel: 'llama3' }
};

export default function AICopilotPanel() {
  const { 
    nodes, setNodes, 
    edges, setEdges, 
    threats, addThreat, 
    setCurrentMode, 
    aiConfig, setAiConfig 
  } = useThreatModel();
  
  const [showSettings, setShowSettings] = useState(!aiConfig);
  const [tempConfig, setTempConfig] = useState(
    aiConfig || { provider: 'OpenAI', baseUrl: PROVIDERS.OpenAI.baseUrl, apiKey: '', model: PROVIDERS.OpenAI.defaultModel }
  );
  
  const [availableModels, setAvailableModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Agentic Security Copilot. I can draw architecture, map threats, and navigate the app for you. What would you like me to do?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleProviderChange = (e) => {
    const prov = e.target.value;
    setTempConfig(prev => ({
      ...prev,
      provider: prov,
      baseUrl: PROVIDERS[prov].baseUrl,
      model: PROVIDERS[prov].defaultModel
    }));
    setAvailableModels([]); // Reset models on provider change
  };

  const handleFetchModels = async () => {
    if (!tempConfig.baseUrl) return;
    setIsFetchingModels(true);
    try {
      const headers = {};
      if (tempConfig.apiKey) headers['Authorization'] = `Bearer ${tempConfig.apiKey}`;
      
      const response = await fetch(`${tempConfig.baseUrl}/models`, { headers });
      if (!response.ok) throw new Error("API Error");
      
      const data = await response.json();
      if (data && data.data) {
        const modelsList = data.data.map(m => ({ id: m.id, name: m.name || m.id }));
        setAvailableModels(modelsList);
        if (modelsList.length > 0 && !modelsList.find(m => m.id === tempConfig.model)) {
          setTempConfig(prev => ({...prev, model: modelsList[0].id}));
        }
      }
    } catch (e) {
      alert("Could not discover models automatically. You may need to enter an API key first, or you can just type the Model ID manually.");
      setAvailableModels([]);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!tempConfig.apiKey && tempConfig.provider !== 'Custom') {
      alert("API Key is required for cloud providers.");
      return;
    }
    setAiConfig(tempConfig);
    setShowSettings(false);
  };

  const handleDisconnect = () => {
    setAiConfig(null);
    setTempConfig({ provider: 'OpenAI', baseUrl: PROVIDERS.OpenAI.baseUrl, apiKey: '', model: PROVIDERS.OpenAI.defaultModel });
    setShowSettings(true);
  };

  const handleAgentAction = (actionPayload) => {
    try {
      switch (actionPayload.action) {
        case 'addNode':
          const newNode = {
            id: actionPayload.id || \`node-\${Date.now()}\`,
            type: actionPayload.type || 'process',
            position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
            data: { label: actionPayload.label || 'New Node', confidentiality: 'Medium', integrity: 'Medium', availability: 'Medium' }
          };
          setNodes((nds) => [...nds, newNode]);
          return \`Added \${newNode.type} node: "\${newNode.data.label}"\`;
          
        case 'connectNodes':
          const newEdge = {
            id: \`edge-\${Date.now()}\`,
            source: actionPayload.source,
            target: actionPayload.target,
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 }
          };
          setEdges((eds) => [...eds, newEdge]);
          return \`Connected node "\${actionPayload.source}" to "\${actionPayload.target}"\`;
          
        case 'addThreat':
          const threat = {
            id: \`threat-\${Date.now()}\`,
            title: actionPayload.title,
            category: actionPayload.category || 'Spoofing',
            status: 'Open',
            severity: actionPayload.severity || 'Medium',
            description: actionPayload.description || ''
          };
          addThreat(actionPayload.nodeId, threat);
          return \`Mapped "\${threat.category}" threat to node \${actionPayload.nodeId}\`;
          
        case 'changeMode':
          setCurrentMode(actionPayload.mode);
          return \`Navigated to \${actionPayload.mode.replace('_', ' ')}\`;
          
        default:
          return \`Unknown action requested: \${actionPayload.action}\`;
      }
    } catch (e) {
      console.error("Agent action execution failed", e);
      return \`Failed to execute action: \${actionPayload.action}\`;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !aiConfig) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const systemContext = \`
You are an expert Security Architect and DevSecOps Agentic Copilot.
You have access to the user's current threat model architecture.

--- AGENTIC CAPABILITIES ---
You can physically manipulate the application state on behalf of the user. 
To take an action, output a JSON block wrapped EXACTLY in \\\`\\\`\\\`agent_action ... \\\`\\\`\\\`
Supported actions:
1. Add Node: \\\`\\\`\\\`agent_action
{"action": "addNode", "id": "node-123", "type": "process", "label": "Web Server"}
\\\`\\\`\\\` (types: process, datastore, externalEntity)
2. Connect Nodes: \\\`\\\`\\\`agent_action
{"action": "connectNodes", "source": "node-123", "target": "node-456"}
\\\`\\\`\\\`
3. Add Threat: \\\`\\\`\\\`agent_action
{"action": "addThreat", "nodeId": "node-123", "title": "SQL Injection", "category": "Tampering", "severity": "High", "description": "Unsanitized inputs"}
\\\`\\\`\\\`
4. Change View: \\\`\\\`\\\`agent_action
{"action": "changeMode", "mode": "RISK_MATRIX"}
\\\`\\\`\\\` (modes: ARCHITECTURE, THREATS, RISK_MATRIX, EXPORT)

You can output multiple action blocks if needed. Always explain what you are doing in regular markdown text alongside the actions.

--- CURRENT ARCHITECTURE CONTEXT ---
NODES: \${JSON.stringify(nodes.map(n => ({ id: n.id, type: n.type, label: n.data.label, cia: { c: n.data.confidentiality, i: n.data.integrity, a: n.data.availability } })))}
EDGES (Data Flows): \${JSON.stringify(edges.map(e => ({ source: e.source, target: e.target })))}
MAPPED THREATS: \${JSON.stringify(threats)}
------------------------------------
\`;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (aiConfig.apiKey) {
        headers['Authorization'] = \`Bearer \${aiConfig.apiKey}\`;
      }
      if (aiConfig.provider === 'OpenRouter' || aiConfig.provider === 'OpenRouterFree') {
        headers['HTTP-Referer'] = window.location.href;
        headers['X-Title'] = 'Security Architect Copilot';
      }

      const response = await fetch(\`\${aiConfig.baseUrl}/chat/completions\`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            { role: 'system', content: systemContext },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.2,
        })
      });

      if (!response.ok) {
        throw new Error(\`API Error: \${response.status}\`);
      }

      const data = await response.json();
      const aiReplyRaw = data.choices[0].message.content;
      
      // Parse Agent Actions
      const actionRegex = /\\\`\\\`\\\`agent_action\\n([\\s\\S]*?)\\n\\\`\\\`\\\`/g;
      let match;
      const actionsTaken = [];
      let cleanedReply = aiReplyRaw;
      
      while ((match = actionRegex.exec(aiReplyRaw)) !== null) {
        try {
          const payloadStr = match[1].trim();
          const actionPayload = JSON.parse(payloadStr);
          const result = handleAgentAction(actionPayload);
          actionsTaken.push(result);
        } catch (err) {
          console.error("Failed to parse agent action", err);
        }
      }
      
      // Remove action blocks from the chat display so it looks clean
      cleanedReply = cleanedReply.replace(actionRegex, '').trim();
      
      if (!cleanedReply && actionsTaken.length > 0) {
        cleanedReply = "I have executed the requested actions.";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: cleanedReply, actions: actionsTaken }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: \`**Error:** Failed to communicate with API. Please check your config or network connection. (\${error.message})\` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSettings) {
    return (
      <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', overflowY: 'auto' }}>
        <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '40px', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Bot size={48} color="#8b5cf6" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Universal AI Copilot</h2>
            <p style={{ color: 'var(--text-muted)' }}>Configure your Bring Your Own Key (BYOK) Gateway</p>
          </div>
          
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
            <Shield size={24} color="#ef4444" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>
              <strong>Zero Backend Privacy:</strong> Your configuration is stored exclusively in your browser's local memory. It is never sent to our servers.
            </div>
          </div>

          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>AI Provider</label>
              <select 
                value={tempConfig.provider} 
                onChange={handleProviderChange}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              >
                <option value="OpenAI">OpenAI</option>
                <option value="OpenRouter">OpenRouter (Claude, Gemini, etc.)</option>
                <option value="OpenRouterFree">OpenRouter (100% Free Models)</option>
                <option value="Groq">Groq (Fast Llama 3)</option>
                <option value="Custom">Custom / Local (Ollama, LM Studio)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Base URL</label>
              <input 
                type="text" 
                value={tempConfig.baseUrl}
                onChange={e => setTempConfig({...tempConfig, baseUrl: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: 'bold' }}>Model ID</label>
                <button type="button" onClick={handleFetchModels} disabled={isFetchingModels} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <RefreshCw size={12} className={isFetchingModels ? "spin-anim" : ""} /> Auto-Discover Models
                </button>
              </div>
              
              {availableModels.length > 0 ? (
                <select 
                  value={tempConfig.model}
                  onChange={e => setTempConfig({...tempConfig, model: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                >
                  {availableModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  value={tempConfig.model}
                  onChange={e => setTempConfig({...tempConfig, model: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                />
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>API Key {tempConfig.provider === 'Custom' && '(Optional)'}</label>
              <input 
                type="password" 
                placeholder="sk-..." 
                value={tempConfig.apiKey}
                onChange={e => setTempConfig({...tempConfig, apiKey: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              {aiConfig && (
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '16px' }} onClick={() => setShowSettings(false)}>
                  Cancel
                </button>
              )}
              <button type="submit" className="btn" style={{ flex: 1, justifyContent: 'center', background: '#8b5cf6', padding: '12px', fontSize: '16px' }}>
                <KeyRound size={18} /> {aiConfig ? 'Update Config' : 'Connect Copilot'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--panel-border)', background: 'var(--panel-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={24} color="#8b5cf6" fill="#8b5cf6" /> Agentic AI Copilot
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Connected to <strong>{aiConfig.provider}</strong> ({aiConfig.model})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setShowSettings(true)} title="Settings">
            <Settings size={16} /> Config
          </button>
          <button className="btn btn-danger" onClick={handleDisconnect} title="Remove Configuration">
            <Trash2 size={16} /> Disconnect
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', maxWidth: '800px', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? '#8b5cf6' : 'var(--panel-bg)', padding: '20px', borderRadius: '12px', border: m.role === 'assistant' ? '1px solid var(--panel-border)' : 'none' }}>
            {m.role === 'assistant' && <Bot size={24} color="#8b5cf6" style={{ flexShrink: 0 }} />}
            <div style={{ color: 'var(--text-main)', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', width: '100%' }}>
              {m.content}
              {m.actions && m.actions.length > 0 && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid #8b5cf6', borderRadius: '8px', fontSize: '13px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#c4b5fd' }}>
                    <Zap size={14} fill="#c4b5fd" /> Agent Actions Executed:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)' }}>
                    {m.actions.map((act, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{act}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', gap: '16px', maxWidth: '800px', alignSelf: 'flex-start', background: 'var(--panel-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
            <Loader2 size={24} color="#8b5cf6" className="spin-anim" style={{ flexShrink: 0 }} />
            <div style={{ color: 'var(--text-muted)' }}>Analyzing architecture and executing tasks...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '20px 40px', borderTop: '1px solid var(--panel-border)', background: 'var(--panel-bg)' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', maxWidth: '1000px', margin: '0 auto' }}>
          <input 
            type="text" 
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="E.g., Create a web server and connect it to a database..."
            style={{ flexGrow: 1, padding: '16px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '16px' }}
            disabled={isLoading}
          />
          <button type="submit" className="btn" style={{ background: '#8b5cf6', padding: '0 24px' }} disabled={isLoading || !inputMessage.trim()}>
            <Send size={20} />
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={12} /> AI can make mistakes. Verify agent actions before trusting the architecture.
        </div>
      </div>
      
      <style>{`
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
