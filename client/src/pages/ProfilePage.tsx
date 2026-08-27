import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, Mail, Save, Sun, Moon, Contrast, Type, Volume2,
  Eye, HandMetal, Zap, Check, Loader2, AlertCircle, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { prefs, updatePrefs, savePrefs } = useAccessibility();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await savePrefs();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Could not save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const fontSizes = [
    { value: 'small', label: 'Small', desc: 'Compact text (87.5%)' },
    { value: 'medium', label: 'Medium', desc: 'Default text (100%)' },
    { value: 'large', label: 'Large', desc: 'Larger text (112.5%)' },
    { value: 'xl', label: 'Extra Large', desc: 'Very large text (125%)' },
    { value: '2xl', label: '2X Large', desc: 'Maximum size (150%)' },
  ];

  const lineSpacings = [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal' },
    { value: 'relaxed', label: 'Relaxed' },
    { value: 'loose', label: 'Loose' },
  ];

  const letterSpacings = [
    { value: 'tight', label: 'Tight' },
    { value: 'normal', label: 'Normal' },
    { value: 'wide', label: 'Wide' },
  ];

  return (
    <div className="page-container max-w-3xl">
      {/* Header */}
      <section aria-labelledby="profile-heading" className="mb-8">
        <h1 id="profile-heading" className="section-title mb-1">Profile & Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Customize your APD EQUILEARN experience</p>
      </section>

      {/* User info */}
      <section aria-labelledby="user-info-heading" className="card p-6 mb-6">
        <h2 id="user-info-heading" className="text-lg font-bold text-slate-900 dark:text-white mb-4">Account Information</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black" aria-hidden="true">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-400" aria-hidden="true" />
              <span className="font-semibold text-slate-900 dark:text-white">{user?.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Mail size={16} className="text-slate-400" aria-hidden="true" />
              <span className="text-slate-600 dark:text-slate-400 text-sm">{user?.email}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      {error && (
        <div role="alert" aria-live="polite" className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 mb-6 text-sm">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </div>
      )}
      {saved && (
        <div role="status" aria-live="polite" className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 mb-6 text-sm">
          <Check size={16} aria-hidden="true" /> Accessibility preferences saved successfully!
        </div>
      )}

      {/* Appearance */}
      <section aria-labelledby="appearance-heading" className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sun size={20} className="text-primary-500" aria-hidden="true" />
          <h2 id="appearance-heading" className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Light Mode', icon: Sun, action: () => updatePrefs({ darkMode: false, highContrast: false }), active: !prefs.darkMode && !prefs.highContrast },
            { label: 'Dark Mode', icon: Moon, action: () => updatePrefs({ darkMode: true, highContrast: false }), active: prefs.darkMode && !prefs.highContrast },
            { label: 'High Contrast', icon: Contrast, action: () => updatePrefs({ highContrast: !prefs.highContrast }), active: prefs.highContrast },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={opt.action}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                opt.active
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 text-slate-600 dark:text-slate-400'
              }`}
              aria-pressed={opt.active}
            >
              <opt.icon size={20} aria-hidden="true" />
              <span className="font-medium text-sm">{opt.label}</span>
              {opt.active && <Check size={16} className="ml-auto shrink-0" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </section>

      {/* Text settings */}
      <section aria-labelledby="text-heading" className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Type size={20} className="text-primary-500" aria-hidden="true" />
          <h2 id="text-heading" className="text-lg font-bold text-slate-900 dark:text-white">Text & Typography</h2>
        </div>

        {/* Font size */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Font Size</label>
          <div className="flex flex-wrap gap-2">
            {fontSizes.map(fs => (
              <button
                key={fs.value}
                onClick={() => updatePrefs({ fontSize: fs.value as any })}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  prefs.fontSize === fs.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                }`}
                aria-pressed={prefs.fontSize === fs.value}
                title={fs.desc}
              >
                {fs.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Preview: <span style={{ fontSize: `${prefs.fontSize === 'small' ? 14 : prefs.fontSize === 'medium' ? 16 : prefs.fontSize === 'large' ? 18 : prefs.fontSize === 'xl' ? 20 : 24}px` }}>The quick brown fox</span></p>
        </div>

        {/* Line spacing */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Line Spacing</label>
          <div className="flex flex-wrap gap-2">
            {lineSpacings.map(ls => (
              <button
                key={ls.value}
                onClick={() => updatePrefs({ lineSpacing: ls.value as any })}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  prefs.lineSpacing === ls.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                }`}
                aria-pressed={prefs.lineSpacing === ls.value}
              >
                {ls.label}
              </button>
            ))}
          </div>
        </div>

        {/* Letter spacing */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Letter Spacing</label>
          <div className="flex flex-wrap gap-2">
            {letterSpacings.map(ls => (
              <button
                key={ls.value}
                onClick={() => updatePrefs({ letterSpacing: ls.value as any })}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  prefs.letterSpacing === ls.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                }`}
                aria-pressed={prefs.letterSpacing === ls.value}
              >
                {ls.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Audio settings */}
      <section aria-labelledby="audio-heading" className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 size={20} className="text-primary-500" aria-hidden="true" />
          <h2 id="audio-heading" className="text-lg font-bold text-slate-900 dark:text-white">Audio & Speech</h2>
        </div>

        <div className="space-y-4">
          {/* TTS toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">Text-to-Speech</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Automatically read AI responses aloud</p>
            </div>
            <button
              onClick={() => updatePrefs({ textToSpeech: !prefs.textToSpeech })}
              className={`relative w-11 h-6 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 ${prefs.textToSpeech ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
              role="switch"
              aria-checked={prefs.textToSpeech}
              aria-label="Toggle text-to-speech"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs.textToSpeech ? 'translate-x-5' : ''}`} aria-hidden="true" />
            </button>
          </div>

          {/* Speech speed */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="speech-speed-profile" className="font-medium text-slate-900 dark:text-white text-sm">Speech Speed</label>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{prefs.speechSpeed}x</span>
            </div>
            <input
              id="speech-speed-profile"
              type="range"
              min="0.5" max="2" step="0.25"
              value={prefs.speechSpeed}
              onChange={e => updatePrefs({ speechSpeed: parseFloat(e.target.value) })}
              className="w-full accent-primary-600"
              aria-label={`Speech speed: ${prefs.speechSpeed}x`}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Slow (0.5x)</span>
              <span>Normal (1x)</span>
              <span>Fast (2x)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility features */}
      <section aria-labelledby="a11y-heading" className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={20} className="text-primary-500" aria-hidden="true" />
          <h2 id="a11y-heading" className="text-lg font-bold text-slate-900 dark:text-white">Accessibility Features</h2>
        </div>
        <div className="space-y-3">
          {[
            { key: 'screenReaderMode', label: 'Screen Reader Optimization', desc: 'Enhance ARIA labels and semantic structure', icon: Eye },
            { key: 'signLanguageSupport', label: 'Sign Language Support', desc: 'Show ISL video content when available', icon: HandMetal },
            { key: 'reducedMotion', label: 'Reduce Motion', desc: 'Minimize animations and transitions', icon: Zap },
          ].map(opt => (
            <div key={opt.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-start gap-3">
                <opt.icon size={18} className="text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{opt.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                </div>
              </div>
              <button
                onClick={() => updatePrefs({ [opt.key]: !prefs[opt.key as keyof typeof prefs] })}
                className={`relative w-11 h-6 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 shrink-0 ${prefs[opt.key as keyof typeof prefs] ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                role="switch"
                aria-checked={!!prefs[opt.key as keyof typeof prefs]}
                aria-label={`Toggle ${opt.label}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs[opt.key as keyof typeof prefs] ? 'translate-x-5' : ''}`} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
          aria-busy={isSaving}
        >
          {isSaving ? (
            <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Saving...</>
          ) : saved ? (
            <><Check size={18} aria-hidden="true" /> Saved!</>
          ) : (
            <><Save size={18} aria-hidden="true" /> Save Preferences</>
          )}
        </button>
      </div>
    </div>
  );
}
