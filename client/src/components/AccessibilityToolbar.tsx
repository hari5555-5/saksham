import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, Plus, Minus,
  Sun, Moon, Contrast, Type, Sparkles } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

interface AccessibilityToolbarProps {
  textToRead?: string;
  paragraphs?: string[];
}

const FONT_SIZES = ['small', 'medium', 'large', 'xl', '2xl'] as const;
const FONT_SIZE_LABELS: Record<string, string> = { small: 'S', medium: 'M', large: 'L', xl: 'XL', '2xl': '2XL' };

export default function AccessibilityToolbar({ textToRead = '', paragraphs = [] }: AccessibilityToolbarProps) {
  const { prefs, updatePrefs } = useAccessibility();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef(window.speechSynthesis);

  const speak = useCallback((text: string) => {
    if (!text.trim()) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = prefs.speechSpeed;
    utterance.lang = 'en-IN';
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    speechRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  }, [prefs.speechSpeed]);

  const handlePlay = () => {
    const text = paragraphs.length > 0 ? paragraphs[currentParagraph] : textToRead;
    speak(text);
  };

  const handlePause = () => {
    if (synthRef.current.speaking) {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
      } else {
        synthRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleStop = () => {
    synthRef.current.cancel();
    setIsPlaying(false);
  };

  const handlePrev = () => {
    const prev = Math.max(0, currentParagraph - 1);
    setCurrentParagraph(prev);
    speak(paragraphs[prev] || textToRead);
  };

  const handleNext = () => {
    const next = Math.min(paragraphs.length - 1, currentParagraph + 1);
    setCurrentParagraph(next);
    speak(paragraphs[next] || textToRead);
  };

  const changeFontSize = (direction: 'up' | 'down') => {
    const idx = FONT_SIZES.indexOf(prefs.fontSize);
    const newIdx = direction === 'up' ? Math.min(FONT_SIZES.length - 1, idx + 1) : Math.max(0, idx - 1);
    updatePrefs({ fontSize: FONT_SIZES[newIdx] });
  };

  useEffect(() => {
    return () => synthRef.current.cancel();
  }, []);

  return (
    <aside
      className="sticky top-16 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      role="region"
      aria-label="Accessibility controls"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* TTS Controls */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner" role="group" aria-label="Text to speech controls">
            <span className="px-2.5 text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1 hidden sm:inline-flex">
              <Volume2 size={14} className="text-indigo-400" aria-hidden="true" />
              TTS
            </span>
            {paragraphs.length > 0 && (
              <button onClick={handlePrev} className="btn-ghost p-1.5 !px-2 text-slate-400 hover:text-white" aria-label="Previous paragraph" disabled={currentParagraph === 0}>
                <SkipBack size={15} aria-hidden="true" />
              </button>
            )}
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className={`p-1.5 px-3 rounded-lg text-xs font-bold transition-all ${isPlaying ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 animate-pulse' : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30'}`}
              aria-label={isPlaying ? 'Pause reading' : 'Play text to speech'}
              aria-pressed={isPlaying}
            >
              {isPlaying ? <Pause size={14} className="inline mr-1" aria-hidden="true" /> : <Play size={14} className="inline mr-1" aria-hidden="true" />}
              {isPlaying ? 'Pause' : 'Listen'}
            </button>
            <button onClick={handleStop} className="btn-ghost p-1.5 !px-2 text-slate-400 hover:text-red-400" aria-label="Stop reading">
              <Square size={14} aria-hidden="true" />
            </button>
            {paragraphs.length > 0 && (
              <button onClick={handleNext} className="btn-ghost p-1.5 !px-2 text-slate-400 hover:text-white" aria-label="Next paragraph" disabled={currentParagraph >= paragraphs.length - 1}>
                <SkipForward size={15} aria-hidden="true" />
              </button>
            )}
            {/* Speed */}
            <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-slate-800">
              <label htmlFor="speech-speed" className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Speed</label>
              <input
                id="speech-speed"
                type="range"
                min="0.5" max="2" step="0.25"
                value={prefs.speechSpeed}
                onChange={e => updatePrefs({ speechSpeed: parseFloat(e.target.value) })}
                className="w-16 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                aria-label={`Speech speed: ${prefs.speechSpeed}x`}
              />
              <span className="text-[11px] font-bold text-indigo-300 w-7">{prefs.speechSpeed}x</span>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800 hidden sm:block" aria-hidden="true" />

          {/* Font size */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner" role="group" aria-label="Font size controls">
            <Type size={13} className="text-slate-400 mx-1.5 hidden sm:block" aria-hidden="true" />
            <button onClick={() => changeFontSize('down')} className="btn-ghost p-1.5 !px-2 text-slate-400 hover:text-white" aria-label="Decrease font size">
              <Minus size={14} aria-hidden="true" />
            </button>
            <span className="text-xs font-black text-indigo-300 w-8 text-center" aria-label={`Font size: ${prefs.fontSize}`}>
              {FONT_SIZE_LABELS[prefs.fontSize]}
            </span>
            <button onClick={() => changeFontSize('up')} className="btn-ghost p-1.5 !px-2 text-slate-400 hover:text-white" aria-label="Increase font size">
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>

          {/* High Contrast Mode */}
          <button
            onClick={() => updatePrefs({ highContrast: !prefs.highContrast })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              prefs.highContrast
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            aria-label={prefs.highContrast ? 'Disable high contrast' : 'Enable high contrast'}
            aria-pressed={prefs.highContrast}
          >
            <Contrast size={14} aria-hidden="true" />
            <span className="hidden sm:inline">High Contrast</span>
          </button>
        </div>

        {/* Paragraph indicator if in reading mode */}
        {paragraphs.length > 0 && (
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20" aria-live="polite" aria-atomic="true">
            Section {currentParagraph + 1} of {paragraphs.length}
          </span>
        )}
      </div>
    </aside>
  );
}

