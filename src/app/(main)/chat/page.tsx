'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/misc';
import { getAllPersonas, type PersonaCore } from '@/lib/personas';

const CONVERSATION_MODES = [
  { id: 'solo', label: '独思', icon: '💭', color: '#D4A853' },
  { id: 'prism', label: '折射', icon: '🌈', color: '#7CA1D4' },
  { id: 'roundtable', label: '圆桌', icon: '🎭', color: '#82C49A' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  personaId?: string;
  confidence?: number;
  streaming?: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState('solo');
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(['confucius']);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const personas = getAllPersonas();
  const selectedPersonaData = personas.find(p => selectedPersonas[0] === p.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    if (selectedPersonaData?.level && selectedPersonaData.level > 0) {
      alert('此人物需要更高级别订阅');
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({
          personaId: selectedPersonas[0],
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          mode: selectedMode,
          stream: true,
        }),
      });

      if (response.status === 402) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '请先在设置中配置您的 API Key，以开始对话。',
          confidence: 1,
        }]);
        setLoading(false);
        return;
      }

      if (!response.body) throw new Error('No response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        personaId: selectedPersonas[0],
        streaming: true,
      };
      setMessages(prev => [...prev, assistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsg.id ? { ...m, content: `错误: ${parsed.content}`, streaming: false } : m
              ));
              return;
            }
            if (parsed.type === 'text' && parsed.content) {
              fullContent += parsed.content;
              setMessages(prev => prev.map(m =>
                m.id === assistantMsg.id ? { ...m, content: fullContent } : m
              ));
            }
            if (parsed.type === 'done') {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsg.id ? { ...m, content: fullContent || '...', streaming: false } : m
              ));
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `抱歉，发生了错误: ${err}`,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, selectedPersonas, selectedMode, messages, selectedPersonaData]);

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg-base)]">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[var(--color-prism-amber)]">
          ← Prismatic Pro
        </Link>

        {/* Mode selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--color-bg-elevated)]">
          {CONVERSATION_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedMode === mode.id
                  ? 'bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
              }`}
              style={selectedMode === mode.id ? { color: mode.color } : {}}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Persona selector */}
        <button
          onClick={() => setShowPersonaPicker(!showPersonaPicker)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          {selectedPersonaData ? (
            <>
              <Avatar name={selectedPersonaData.name} size="sm" ring domainColor="#D4A853" />
              <span className="text-sm">{selectedPersonaData.name}</span>
            </>
          ) : (
            <span className="text-sm text-[var(--color-text-secondary)]">选择人物</span>
          )}
          <span className="text-xs text-[var(--color-text-tertiary)]">▼</span>
        </button>
      </header>

      {/* ── Persona Picker Dropdown ── */}
      {showPersonaPicker && (
        <div className="absolute right-6 top-14 z-50 w-80 max-h-96 overflow-y-auto rounded-xl border border-[var(--color-border-bright)] bg-[var(--color-bg-surface)] shadow-lg p-2 animate-fade-in">
          <div className="text-xs text-[var(--color-text-tertiary)] px-2 py-1.5 font-medium uppercase tracking-wider">
            选择对话人物
          </div>
          {personas.filter(p => p.level <= 0).map(persona => (
            <button
              key={persona.id}
              onClick={() => {
                setSelectedPersonas([persona.id]);
                setShowPersonaPicker(false);
              }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors hover:bg-[var(--color-bg-hover)] ${
                selectedPersonas.includes(persona.id) ? 'bg-[var(--color-bg-hover)]' : ''
              }`}
            >
              <Avatar name={persona.name} size="sm" ring={selectedPersonas.includes(persona.id)} />
              <div className="text-left">
                <div className="text-sm font-medium">{persona.name}</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">{persona.domain.join(', ')}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4">
              {selectedPersonaData ? selectedPersonaData.name[0] : '💭'}
            </div>
            <h2 className="text-xl font-semibold">
              与 {selectedPersonaData?.name || '思想家'} 对话
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2 max-w-sm">
              {selectedPersonaData?.shortBio || '选择一个话题，开始深度对话'}
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl animate-fade-in ${
              msg.role === 'user' ? 'ml-auto' : ''
            }`}
          >
            {msg.role === 'assistant' && (
              <Avatar
                name={selectedPersonaData?.name || 'AI'}
                size="sm"
                ring
                domainColor="#D4A853"
                className="shrink-0 mt-1"
              />
            )}
            <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div
                className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-prism-amber)] text-[var(--color-bg-base)] rounded-br-md'
                    : 'bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-bl-md'
                }`}
              >
                {msg.content}
                {msg.streaming && <span className="ml-1 inline-block w-1.5 h-3.5 bg-current animate-pulse rounded-sm opacity-50" />}
              </div>
            </div>
            {msg.role === 'user' && (
              <Avatar name="You" size="sm" className="shrink-0 mt-1" />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`向 ${selectedPersonaData?.name || '思想家'} 提问...`}
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl resize-none text-sm
                bg-[var(--color-bg-elevated)] border border-[var(--color-border)]
                text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]
                focus:outline-none focus:border-[var(--color-prism-amber)] focus:ring-1 focus:ring-[var(--color-prism-amber)]
                transition-colors"
              style={{ minHeight: '48px', maxHeight: '160px' }}
            />
          </div>
          <Button onClick={sendMessage} disabled={!input.trim() || loading} className="shrink-0">
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              '发送'
            )}
          </Button>
        </div>
        <p className="text-xs text-center text-[var(--color-text-tertiary)] mt-2">
          按 Enter 发送，Shift+Enter 换行 · 对话由您的 API Key 驱动
        </p>
      </div>
    </div>
  );
}
