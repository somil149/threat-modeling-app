import React, { useState, useRef, useEffect } from 'react';
import { useThreatModel } from '../context/ThreatModelContext';
import { KeyRound, Send, Bot, Shield, Trash2, Loader2, AlertTriangle, Settings } from 'lucide-react';

const PROVIDERS = {
  OpenAI: { baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  OpenRouter: { baseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'anthropic/claude-3.5-sonnet' },
  Groq: { baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama3-70b-8192' },
  Custom: { baseUrl: 'http://localhost:11434/v1', defaultModel: 'llama3' }
};

export default function AICopilotPanel() {
  const { nodes, edges, threats, aiConfig, setAiConfig } = useThreatModel();
  
  const [showSettings, setShowSettings] = useState(!aiConfig);
  const [tempConfig, setTempConfig] = useState(
    aiConfig || { provider: 'OpenAI', baseUrl: PROVIDERS.OpenAI.baseUrl, apiKey: '', model: PROVIDERS.OpenAI.defaultModel }
  );

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Security Copilot. I have full context of your architecture. How can I help you threat model today?' }
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !aiConfig) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const systemContext = `
You are an expert Security Architect and DevSecOps Copilot.
You have access to the user's current threat model architecture.
Always provide actionable, specific security advice and Terraform/AWS CLI remediation code where applicable.

--- CURRENT ARCHITECTURE CONTEXT ---
NODES: ${JSON.stringify(nodes.map(n => ({ id: n.id, type: n.type, label: n.data.label, cia: { c: n.data.confidentiality, i: n.data.integrity, a: n.data.availability } })))}
EDGES (Data Flows): ${JSON.stringify(edges.map(e => ({ source: e.source, target: e.target })))}
MAPPED THREATS: ${JSON.stringify(threats)}
------------------------------------
`;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (aiConfig.apiKey) {
        headers['Authorization'] = `Bearer ${aiConfig.apiKey}`;
      }
      // OpenRouter specific headers (optional but recommended)
      if (aiConfig.provider === 'OpenRouter') {
        headers['HTTP-Referer'] = window.location.href;
        headers['X-Title'] = 'Security Architect Copilot';
      }

      const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
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
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: aiReply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** Failed to communicate with API. Please check your config or network connection. (${error.message})` }]);
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Model ID</label>
              <input 
                type="text" 
                value={tempConfig.model}
                onChange={e => setTempConfig({...tempConfig, model: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
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
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bot size={24} color="#8b5cf6" /> Security Copilot</h2>
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
            <div style={{ color: 'var(--text-main)', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', gap: '16px', maxWidth: '800px', alignSelf: 'flex-start', background: 'var(--panel-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
            <Loader2 size={24} color="#8b5cf6" className="spin-anim" style={{ flexShrink: 0 }} />
            <div style={{ color: 'var(--text-muted)' }}>Analyzing architecture...</div>
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
            placeholder="E.g., What are the biggest risks to my Customer Database?"
            style={{ flexGrow: 1, padding: '16px', borderRadius: '8px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '16px' }}
            disabled={isLoading}
          />
          <button type="submit" className="btn" style={{ background: '#8b5cf6', padding: '0 24px' }} disabled={isLoading || !inputMessage.trim()}>
            <Send size={20} />
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={12} /> AI can make mistakes. Verify security recommendations before deploying.
        </div>
      </div>
      
      <style>{`
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
