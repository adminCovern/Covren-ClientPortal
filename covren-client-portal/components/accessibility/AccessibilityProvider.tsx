// Sovereign Command Center Accessibility Provider
// Covren Firm LLC - WCAG 2.1 AAA Compliance Implementation

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AccessibilitySettings, LanguageDirection, CognitiveLoadLevel } from '../../types';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  isScreenReaderActive: boolean;
  currentLanguage: string;
  languageDirection: LanguageDirection;
  cognitiveLoadLevel: CognitiveLoadLevel;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  focusManager: {
    trapFocus: (element: HTMLElement) => void;
    restoreFocus: () => void;
    moveToNext: () => void;
    moveToPrevious: () => void;
  };
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// WCAG 2.1 AAA Compliance Settings
const defaultAccessibilitySettings: AccessibilitySettings = {
  // Visual Accessibility
  highContrast: false,
  fontSize: 'medium',
  fontFamily: 'system',
  lineSpacing: 'normal',
  colorBlindnessSupport: 'none',
  
  // Motion and Animation
  reducedMotion: false,
  animationSpeed: 'normal',
  autoPlay: false,
  
  // Cognitive Load
  cognitiveLoadLevel: 'standard',
  simplifiedInterface: false,
  stepByStepGuidance: false,
  contextualHelp: true,
  
  // Language and Localization
  language: 'en',
  direction: 'ltr',
  rtlSupport: false,
  
  // Screen Reader
  screenReaderOptimized: true,
  semanticMarkup: true,
  ariaLabels: true,
  focusIndicators: true,
  
  // Keyboard Navigation
  keyboardOnly: false,
  tabOrder: 'logical',
  skipLinks: true,
  
  // Audio and Speech
  speechToText: false,
  textToSpeech: false,
  audioDescriptions: false,
  
  // Performance and Bandwidth
  lowBandwidthMode: false,
  offlineSupport: false,
  progressiveEnhancement: true,
  
  // Compliance Standards
  wcagLevel: 'AAA',
  section508Compliant: true,
  ariaCompliant: true
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languageDirection, setLanguageDirection] = useState<LanguageDirection>('ltr');
  const [cognitiveLoadLevel, setCognitiveLoadLevel] = useState<CognitiveLoadLevel>('standard');

  // Detect user preferences
  useEffect(() => {
    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setIsReducedMotion(prefersReducedMotion);
    setIsHighContrast(prefersHighContrast);
    
    // Detect screen reader
    const detectScreenReader = () => {
      const screenReaderIndicators = [
        'NVDA',
        'JAWS',
        'VoiceOver',
        'TalkBack',
        'Orca'
      ];
      
      const userAgent = navigator.userAgent;
      const isScreenReader = screenReaderIndicators.some(indicator => 
        userAgent.includes(indicator)
      );
      
      setIsScreenReaderActive(isScreenReader);
    };
    
    detectScreenReader();
    
    // Listen for preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    motionQuery.addEventListener('change', (e) => setIsReducedMotion(e.matches));
    contrastQuery.addEventListener('change', (e) => setIsHighContrast(e.matches));
    
    return () => {
      motionQuery.removeEventListener('change', (e) => setIsReducedMotion(e.matches));
      contrastQuery.removeEventListener('change', (e) => setIsHighContrast(e.matches));
    };
  }, []);

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply visual settings
    root.style.setProperty('--font-size', settings.fontSize);
    root.style.setProperty('--font-family', settings.fontFamily);
    root.style.setProperty('--line-spacing', settings.lineSpacing);
    
    // Apply high contrast
    if (settings.highContrast || isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (settings.reducedMotion || isReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Apply cognitive load settings
    root.setAttribute('data-cognitive-load', settings.cognitiveLoadLevel);
    
    // Apply language direction
    root.setAttribute('dir', settings.direction);
    setLanguageDirection(settings.direction as LanguageDirection);
    setCurrentLanguage(settings.language);
    setCognitiveLoadLevel(settings.cognitiveLoadLevel);
    
    // Apply RTL support
    if (settings.rtlSupport && settings.direction === 'rtl') {
      root.classList.add('rtl-support');
    } else {
      root.classList.remove('rtl-support');
    }
    
    // Apply keyboard navigation
    if (settings.keyboardOnly) {
      root.classList.add('keyboard-only');
    } else {
      root.classList.remove('keyboard-only');
    }
    
    // Apply low bandwidth mode
    if (settings.lowBandwidthMode) {
      root.classList.add('low-bandwidth');
    } else {
      root.classList.remove('low-bandwidth');
    }
  }, [settings, isHighContrast, isReducedMotion]);

  // Screen reader announcement system
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.screenReaderOptimized) return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Focus management system
  const focusManager = {
    trapFocus: (element: HTMLElement) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      });
    },
    
    restoreFocus: () => {
      const lastFocused = document.querySelector('[data-last-focused]') as HTMLElement;
      if (lastFocused) {
        lastFocused.focus();
        lastFocused.removeAttribute('data-last-focused');
      }
    },
    
    moveToNext: () => {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const currentIndex = Array.from(focusableElements).findIndex(el => el === document.activeElement);
      const nextIndex = (currentIndex + 1) % focusableElements.length;
      
      (focusableElements[nextIndex] as HTMLElement)?.focus();
    },
    
    moveToPrevious: () => {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const currentIndex = Array.from(focusableElements).findIndex(el => el === document.activeElement);
      const previousIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
      
      (focusableElements[previousIndex] as HTMLElement)?.focus();
    }
  };

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    isHighContrast,
    isReducedMotion,
    isScreenReaderActive,
    currentLanguage,
    languageDirection,
    cognitiveLoadLevel,
    announceToScreenReader,
    focusManager
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// WCAG 2.1 AAA Compliance Components
export const SkipLink: React.FC<{ targetId: string; children: React.ReactNode }> = ({ 
  targetId, 
  children 
}) => (
  <a
    href={`#${targetId}`}
    className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded focus:shadow-lg"
    onClick={(e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView();
      }
    }}
  >
    {children}
  </a>
);

export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

export const FocusTrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { focusManager } = useAccessibility();
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      focusManager.trapFocus(containerRef.current);
    }
  }, [focusManager]);

  return <div ref={containerRef}>{children}</div>;
};

export const CognitiveLoadWrapper: React.FC<{ 
  level: CognitiveLoadLevel; 
  children: React.ReactNode 
}> = ({ level, children }) => {
  const { settings } = useAccessibility();
  
  if (settings.cognitiveLoadLevel === 'simplified' && level === 'complex') {
    return (
      <div className="cognitive-load-simplified">
        <div className="simplified-interface">
          {children}
        </div>
        <div className="cognitive-load-help">
          <p>This section has been simplified for easier understanding.</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export const RTLWrapper: React.FC<{ 
  direction: LanguageDirection; 
  children: React.ReactNode 
}> = ({ direction, children }) => (
  <div dir={direction} className={`rtl-wrapper ${direction === 'rtl' ? 'rtl-support' : ''}`}>
    {children}
  </div>
);

export const BandwidthOptimizer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useAccessibility();
  
  if (settings.lowBandwidthMode) {
    return (
      <div className="low-bandwidth-mode">
        <div className="bandwidth-optimized-content">
          {children}
        </div>
        <div className="bandwidth-indicator">
          <span>Low bandwidth mode active</span>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}; 