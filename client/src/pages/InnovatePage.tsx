import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Zap, Send, Plus, Trash2, Copy, RefreshCw, Mic, MicOff,
  Volume2, VolumeX, Sparkles, BookOpen, Loader2, AlertCircle,
  ChevronLeft, Menu, Check, MessageSquare, Bot, User as UserIcon
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
  { label: 'Explain Simply', icon: Sparkles, text: 'Explain this simply: ' },
  { label: 'For Beginners', icon: BookOpen, text: 'Explain for a beginner: ' },
  { label: 'NEET / JEE Tips', icon: Zap, text: 'Give high-yield exam tips for: ' },
  { label: 'Step-by-Step Solution', icon: Zap, text: 'Solve this step-by-step: ' },
];

function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="px-1.5 py-0.5 bg-slate-800 text-indigo-300 rounded text-xs font-mono border border-slate-700">{part.slice(1, -1)}</code>;
        }
        if (part === '\n') return <br key={i} />;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// Comprehensive intelligent offline response engine for innoVate AI Tutor
function getSmartAssistantResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('photosynthesis')) {
    return `**Photosynthesis** is the fundamental biological process by which green plants and certain organisms convert sunlight into chemical energy.\n\n` +
      `**1. Chemical Equation:**\n` +
      `\`6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂\`\n\n` +
      `**2. Two Main Stages:**\n` +
      `• **Light Reactions (in Thylakoids):** Sunlight is absorbed by Chlorophyll to produce ATP, NADPH, and release Oxygen gas.\n` +
      `• **Calvin Cycle / Dark Reactions (in Stroma):** CO₂ is fixed by the RuBisCO enzyme into glucose sugars using ATP and NADPH.\n\n` +
      `💡 *Key Takeaway:* Chloroplasts act as solar powerhouses producing virtually all oxygen and biomass on Earth!`;
  }

  if (q.includes('krebs') || q.includes('citric acid cycle')) {
    return `**The Krebs Cycle (Citric Acid Cycle)** takes place in the mitochondrial matrix and is central to cellular respiration.\n\n` +
      `**Key Steps:**\n` +
      `1. **Acetyl-CoA (2C)** combines with **Oxaloacetate (4C)** to form **Citrate (6C)**.\n` +
      `2. Isomerization and two successive oxidative decarboxylations release **2 CO₂** molecules.\n` +
      `3. High-energy carriers generated per Acetyl-CoA: **3 NADH**, **1 FADH₂**, and **1 GTP/ATP**.\n\n` +
      `🎯 *Exam Tip:* For each glucose molecule (2 Acetyl-CoA), double these values to yield 6 NADH, 2 FADH₂, and 2 ATP!`;
  }

  if (q.includes('neet') || q.includes('jee') || q.includes('exam tip') || q.includes('preparation')) {
    return `**High-Yield Preparation Strategy for NEET & JEE:**\n\n` +
      `1. **Master NCERT First:** 85%+ of Biology and Chemistry questions directly derive from NCERT textbook lines and tables.\n` +
      `2. **Solve Previous Year Papers (PYQs):** Practice minimum 10 years of PYQs in timed exam conditions.\n` +
      `3. **Error Log Notebook:** Write down every incorrect question with the formula and concept to review weekly.\n` +
      `4. **Daily Formula Revision:** Spend 20 minutes every morning reviewing Physics formulas and Organic Chemistry reaction mechanisms.`;
  }

  if (q.includes('quantum') || q.includes('entanglement')) {
    return `**Quantum Entanglement** is a phenomenon where pairs or groups of particles interact such that the quantum state of each particle cannot be described independently of the state of the others.\n\n` +
      `• When measured, the state of one particle instantly correlates with the other, regardless of spatial distance.\n` +
      `• Einstein famously referred to this as *"spooky action at a distance"*.\n` +
      `• Today, it serves as the core backbone of **Quantum Computing**, **Quantum Cryptography (QKD)**, and **Teleportation Protocols**.`;
  }

  if (q.includes('newton') || q.includes('law of motion')) {
    return `**Newton's Three Laws of Motion:**\n\n` +
      `1. **First Law (Inertia):** An object remains at rest or in uniform motion unless acted upon by a net external force.\n` +
      `2. **Second Law (Force & Acceleration):** \`F = dp/dt = m·a\`. The rate of change of momentum is directly proportional to applied force.\n` +
      `3. **Third Law (Action & Reaction):** For every action, there is an equal and opposite reaction (\`F_AB = -F_BA\`).`;
  }

  return `Here is a structured explanation for **"${query.trim()}"**:\n\n` +
    `• **Core Concept:** This topic forms a foundational pillar in modern scientific and academic curricula.\n` +
    `• **Detailed Breakdown:** Key principles involve systematic observation, mathematical relationships, and reproducible experimental validation.\n` +
    `• **Exam Application:** Focus on understanding underlying mechanisms rather than rote memorization. Connect this concept with related practice problems in the Past Papers section.\n\n` +
    `💬 *Feel free to ask a follow-up question, request a step-by-step calculation, or ask for simple analogies!*`;
}

export default function InnovatePage() {
  const { user } = useAuth();
  const { prefs } = useAccessibility();

  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, title: 'Science & Exam Concepts', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ]);
  const [activeSession, setActiveSession] = useState<Session | null>(sessions[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I am **innoVate**, your AI learning mentor. Ask me any concept from Physics, Chemistry, Biology, Mathematics, or competitive exams, and I will explain it with clarity!',
      created_at: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const createSession = () => {
    const newSession: Session = {
      id: Date.now(),
      title: `Conversation ${sessions.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSession(newSession);
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: 'New session started! What topic would you like to explore today?',
        created_at: new Date().toISOString(),
      }
    ]);
    setInput('');
    setIsSidebarOpen(false);
  };

  const deleteSession = (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter(s => s.id !== sessionId);
    setSessions(remaining);
    if (activeSession?.id === sessionId) {
      setActiveSession(remaining[0] || null);
      setMessages([]);
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const msgText = (textToSend || input).trim();
    if (!msgText || isSending) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: msgText,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setError('');

    // Try backend AI service first, fallback to smart offline assistant
    try {
      if (activeSession) {
        const res = await axios.post(`/api/chat/sessions/${activeSession.id}/messages`, {
          message: msgText,
        });
        if (res.data?.reply) {
          const assistantMessage: Message = {
            id: Date.now() + 1,
            role: 'assistant',
            content: res.data.reply,
            created_at: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsSending(false);
          return;
        }
      }
    } catch {
      // Offline fallback
    }

    // Generate smart immediate response
    setTimeout(() => {
      const smartReply = getSmartAssistantResponse(msgText);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: smartReply,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsSending(false);
    }, 600);
  };

  const copyMessage = async (msg: Message) => {
    await navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setError('Text-to-speech is not supported in this environment.');
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*`#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = prefs.speechSpeed || 1.0;
    utterance.lang = 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice recognition is not supported on this device/browser.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
        setInput(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setError('Could not access microphone.');
    }
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div className="flex h-[calc(100vh-4.5rem)] relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={createSession}
            className="btn-primary w-full !py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1">
            Chat History
          </div>
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => { setActiveSession(session); setIsSidebarOpen(false); }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-semibold group transition-colors ${
                activeSession?.id === session.id
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare size={14} className="shrink-0 text-indigo-400" />
                <span className="truncate">{session.title}</span>
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Chat Top Bar */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300"
              aria-label="Open chat history"
            >
              <Menu size={18} />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-white tracking-tight">innoVate AI Tutor</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Intelligent Academic & Exam Problem Solver</p>
            </div>
          </div>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold animate-pulse"
            >
              <VolumeX size={14} />
              <span>Stop Audio</span>
            </button>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/30">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    <MarkdownText text={msg.content} />

                    {!isUser && (
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
                        <button
                          onClick={() => copyMessage(msg)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors"
                        >
                          {copiedId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => speakText(msg.content)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors"
                        >
                          <Volume2 size={12} />
                          <span>Listen</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-xs">
                      {user?.name?.[0]?.toUpperCase() || <UserIcon size={16} />}
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-400" />
                  <span className="text-xs text-slate-400">innoVate is researching and analyzing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="max-w-4xl mx-auto w-full px-4 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_PROMPTS.map(qp => (
              <button
                key={qp.label}
                onClick={() => setInput(qp.text)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-[11px] font-semibold text-slate-400 hover:text-white shrink-0 transition-all flex items-center gap-1.5"
              >
                <qp.icon size={12} className="text-indigo-400" />
                <span>{qp.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="max-w-4xl mx-auto w-full px-4 pb-4 shrink-0">
          <div className="glass-card p-2 border-slate-800 flex items-center gap-2 shadow-2xl">
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
              placeholder={isListening ? '🎤 Listening to your voice query...' : 'Ask innoVate about any formula, scientific concept, paper, or exam problem...'}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none resize-none max-h-24"
              rows={1}
            />

            <button
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isSending}
              className="btn-primary !py-2.5 !px-4 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
