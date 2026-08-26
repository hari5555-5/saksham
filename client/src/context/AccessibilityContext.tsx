import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AccessibilityPrefs {
  fontSize: 'small' | 'medium' | 'large' | 'xl' | '2xl';
  highContrast: boolean;
  darkMode: boolean;
  textToSpeech: boolean;
  speechSpeed: number;
  screenReaderMode: boolean;
  signLanguageSupport: boolean;
  reducedMotion: boolean;
  lineSpacing: 'compact' | 'normal' | 'relaxed' | 'loose';
  letterSpacing: 'tight' | 'normal' | 'wide';
}

interface AccessibilityContextType {
  prefs: AccessibilityPrefs;
  updatePrefs: (updates: Partial<AccessibilityPrefs>) => void;
  savePrefs: () => Promise<void>;
}

const defaultPrefs: AccessibilityPrefs = {
  fontSize: 'medium',
  highContrast: false,
  darkMode: false,
  textToSpeech: false,
  speechSpeed: 1.0,
  screenReaderMode: false,
  signLanguageSupport: false,
  reducedMotion: false,
  lineSpacing: 'normal',
  letterSpacing: 'normal',
};

const fontSizeMap = {
  small: 0.875,
  medium: 1,
  large: 1.125,
  xl: 1.25,
  '2xl': 1.5,
};

const lineSpacingMap = {
  compact: 1.4,
  normal: 1.6,
  relaxed: 1.8,
  loose: 2.0,
};

const letterSpacingMap = {
  tight: '-0.02em',
  normal: '0em',
  wide: '0.05em',
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(() => {
    const saved = localStorage.getItem('saksham_a11y');
    return saved ? { ...defaultPrefs, ...JSON.parse(saved) } : defaultPrefs;
  });

  useEffect(() => {
    applyPrefs(prefs);
    localStorage.setItem('saksham_a11y', JSON.stringify(prefs));
  }, [prefs]);

  function applyPrefs(p: AccessibilityPrefs) {
    const root = document.documentElement;

    // Dark mode
    if (p.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // High contrast
    if (p.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Reduced motion
    if (p.reducedMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }

    // Font size
    root.style.setProperty('--font-size-multiplier', String(fontSizeMap[p.fontSize] || 1));

    // Line spacing
    root.style.setProperty('--line-spacing', String(lineSpacingMap[p.lineSpacing] || 1.6));

    // Letter spacing
    root.style.setProperty('--letter-spacing', letterSpacingMap[p.letterSpacing] || '0em');
  }

  const updatePrefs = (updates: Partial<AccessibilityPrefs>) => {
    setPrefs(prev => ({ ...prev, ...updates }));
  };

  const savePrefs = async () => {
    try {
      await axios.put('/api/profile/preferences', {
        fontSize: prefs.fontSize,
        highContrast: prefs.highContrast,
        darkMode: prefs.darkMode,
        textToSpeech: prefs.textToSpeech,
        speechSpeed: prefs.speechSpeed,
        screenReaderMode: prefs.screenReaderMode,
        signLanguageSupport: prefs.signLanguageSupport,
        reducedMotion: prefs.reducedMotion,
        lineSpacing: prefs.lineSpacing,
        letterSpacing: prefs.letterSpacing,
      });
    } catch (err) {
      console.error('Could not save preferences to server:', err);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ prefs, updatePrefs, savePrefs }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}
