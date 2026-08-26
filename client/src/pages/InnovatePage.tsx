import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Zap, Send, Plus, Trash2, Copy, RefreshCw, Mic, MicOff,
  Volume2, VolumeX, Sparkles, BookOpen, Loader2, AlertCircle,
  ChevronLeft, Menu, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Session {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

const QUICK_PROMPTS = [
  { label: 'Explain Simply', icon: Sparkles, mode: 'simple', text: 'Explain this topic simply: ' },
  { label: 'For Beginners', icon: BookOpen, mode: 'beginner', text: 'Explain for a complete beginner: ' },
  { label: 'Study Plan', icon: Zap, mode: undefined, text: 'Create a study plan for: ' },
  { label: 'Exam Tips', icon: Zap, mode: undefined, text: 'Give me exam tips for: ' },
];

function MarkdownText({ text }: { text: string }) {
  // Simple markdown: bold, code, line breaks
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
        }
        if (part === '\n') return <br key={i} />;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function InnovatePage() {
  const { user } = useAuth();
  const { prefs } = useAccessibility();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [error, setError] = useState('');
  const [chatMode, setChatMode] = useState<string | undefined>(undefined);
  const [isDemo, setIsDemo] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const res = await axios.get('/api/chat/sessions');
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Could not load sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const createSession = async () => {
    try {
      const res = await axios.post('/api/chat/sessions');
      const session = res.data.session;
      setSessions(prev => [session, ...prev]);
      setActiveSession(session);
      setMessages([]);
      setInput('');
    } catch (err) {
      setError('Could not create new conversation. Please try again.');
    }
  };

  const selectSession = async (session: Session) => {
    setActiveSession(session);
    try {
      const res = await axios.get(`/api/chat/sessions/${session.id}/messages`);
      setMessages(res.data.messages || []);
    } catch (err) {
      setError('Could not load messages.');
    }
    setIsSidebarOpen(false);
  };

  const deleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/chat/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
        setMessages([]);
      }
    } catch (err) {
      setError('Could not delete conversation.');
    }
  };

  const sendMessage = async (messageText?: string, mode?: string) => {
    const text = messageText || input.trim();
    if (!text || isSending) return;

    let currentSession: Session | null = activeSession;
    if (!currentSession) {
      try {
        const res = await axios.post('/api/chat/sessions');
        const newSession: Session = res.data.session;
        if (newSession) {
          currentSession = newSession;
          setSessions(prev => [newSession, ...prev]);
          setActiveSession(newSession);
        }
      } catch {
        setError('Could not start conversation.');
        return;
      }
    }

    if (!currentSession) {
      setError('Could not start conversation.');
      return;
    }

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);
    setError('');

    try {
      const res = await axios.post(`/api/chat/sessions/${currentSession.id}/messages`, {
        message: text,
        mode: mode || chatMode,
      });
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.response,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsDemo(res.data.isDemo);

      // Auto-speak if TTS enabled
      if (prefs.textToSpeech && res.data.response) {
        speakText(res.data.response);
      }

      // Update session title in list
      loadSessions();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'innoVate is temporarily unavailable. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, '').replace(/`/g, ''));
    utterance.rate = prefs.speechSpeed;
    utterance.lang = 'en-IN';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const copyMessage = async (msg: Message) => {
    await navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { setIsListening(false); setError('Voice input error. Please try again.'); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} md:w-72 transition-all duration-300 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col shrink-0`}
        aria-label="Conversation history"
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <button onClick={createSession} className="btn-primary w-full text-sm py-2.5" aria-label="Start new conversation">
            <Plus size={16} aria-hidden="true" /> New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoadingSessions ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary-500" aria-hidden="true" /></div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8 px-4">No conversations yet. Start a new chat!</p>
          ) : (
            <ul role="list" aria-label="Conversation list">
              {sessions.map(session => (
                <li key={session.id}>
                  <button
                    onClick={() => selectSession(session)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 group flex items-center justify-between gap-2 transition-colors ${
                      activeSession?.id === session.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                    aria-current={activeSession?.id === session.id ? 'true' : undefined}
                  >
                    <span className="text-sm truncate">{session.title}</span>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-500 transition-all shrink-0"
                      aria-label={`Delete conversation: ${session.title}`}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden btn-ghost p-2 !px-2"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-orange-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-sm">
                inno<span className="text-accent-500">V</span>ate
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI Educational Assistant</p>
            </div>
          </div>
          {isDemo && (
            <span className="badge-demo text-xs" title="Using demo responses. Add OpenAI API key for full AI.">Demo Mode</span>
          )}
          {isSpeaking && (
            <button onClick={stopSpeaking} className="btn-ghost p-2 !px-2 text-primary-500" aria-label="Stop speaking">
              <Volume2 size={18} className="animate-pulse" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4" role="log" aria-label="Chat messages" aria-live="polite">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-orange-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-accent-500/20" aria-hidden="true">
                <Zap size={36} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">
                inno<span className="text-accent-500">V</span>ate
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                Your AI-powered educational assistant. Ask anything about science, math, competitive exams, research, or any topic you want to learn about.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {[
                  'Explain photosynthesis simply',
                  'How does the Krebs cycle work?',
                  'Tips for NEET preparation',
                  'What is quantum entanglement?',
                  'Help me understand calculus',
                  'Explain Newton\'s laws',
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                    className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 hover:border-accent-300 dark:hover:border-accent-600 hover:text-accent-600 dark:hover:text-accent-400 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3 animate-slide-up`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0 mt-1" aria-hidden="true">
                  <Zap size={14} className="text-white" />
                </div>
              )}
              <div className={`max-w-[80%] group`}>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}>
                  <MarkdownText text={msg.content} />
                </div>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyMessage(msg)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                      aria-label="Copy response"
                    >
                      {copiedId === msg.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} aria-hidden="true" />}
                    </button>
                    <button
                      onClick={() => speakText(msg.content)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                      aria-label="Read this response aloud"
                    >
                      <Volume2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shrink-0 mt-1 text-white text-xs font-bold" aria-hidden="true">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 animate-fade-in" aria-live="polite" aria-label="innoVate is thinking">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0" aria-hidden="true">
                <Zap size={14} className="text-white" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1.5 items-center h-4">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} aria-hidden="true" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} aria-hidden="true" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} aria-hidden="true" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div role="alert" aria-live="polite" className="mx-4 mb-2 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            <AlertCircle size={16} aria-hidden="true" />
            {error}
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600" aria-label="Dismiss error">×</button>
          </div>
        )}

        {/* Quick prompts */}
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(qp => (
            <button
              key={qp.label}
              onClick={() => { setChatMode(qp.mode); setInput(qp.text); inputRef.current?.focus(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
                chatMode === qp.mode && qp.mode
                  ? 'bg-accent-500 text-white border-accent-500'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-accent-300'
              }`}
              aria-label={qp.label}
              aria-pressed={chatMode === qp.mode && !!qp.mode}
            >
              <qp.icon size={12} aria-hidden="true" />
              {qp.label}
            </button>
          ))}
          {chatMode && (
            <button onClick={() => setChatMode(undefined)} className="px-3 py-1.5 text-xs rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700" aria-label="Clear mode">
              ✕ Clear mode
            </button>
          )}
        </div>

        {/* Input area */}
        <div className="px-4 pb-4">
          <div className="flex items-end gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? '🎤 Listening...' : 'Ask innoVate anything... (Enter to send, Shift+Enter for new line)'}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 max-h-32 py-2 px-2"
              rows={1}
              aria-label="Message input"
              aria-multiline="true"
              style={{ height: 'auto', minHeight: '40px' }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 128) + 'px';
              }}
            />
            <div className="flex items-center gap-1">
              <button
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                aria-pressed={isListening}
              >
                {isListening ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isSending}
                className="p-2 rounded-xl bg-gradient-to-br from-accent-500 to-orange-600 text-white hover:opacity-90 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
                aria-busy={isSending}
              >
                {isSending ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-center text-slate-400 mt-2">
            innoVate is an AI assistant. Always verify important information from authoritative sources.
          </p>
        </div>
      </div>
    </div>
  );
}
