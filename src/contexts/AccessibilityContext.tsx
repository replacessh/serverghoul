import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  colorScheme: 'default' | 'blue-yellow' | 'black-white';
  disableStyles: boolean;
  readableFont: boolean;
  lineSpacing: number;
  letterSpacing: number;
  underlineLinks: boolean;
  reduceMotion: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 1,
  highContrast: false,
  colorScheme: 'default',
  disableStyles: false,
  readableFont: false,
  lineSpacing: 1,
  letterSpacing: 1,
  underlineLinks: false,
  reduceMotion: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));

    // Применяем настройки к документу
    document.documentElement.style.setProperty('--font-size-multiplier', settings.fontSize.toString());
    document.documentElement.style.setProperty('--line-height-multiplier', settings.lineSpacing.toString());
    document.documentElement.style.setProperty('--letter-spacing-multiplier', `${settings.letterSpacing}px`);
    
    if (settings.readableFont) {
      document.documentElement.style.setProperty('--font-family', 'Arial, Verdana, sans-serif');
    } else {
      document.documentElement.style.removeProperty('--font-family');
    }

    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (settings.disableStyles) {
      document.documentElement.classList.add('disable-styles');
    } else {
      document.documentElement.classList.remove('disable-styles');
    }

    if (settings.underlineLinks) {
      document.documentElement.classList.add('underline-links');
    } else {
      document.documentElement.classList.remove('underline-links');
    }

    if (settings.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    // Применяем цветовую схему
    document.documentElement.classList.remove('color-scheme-default', 'color-scheme-blue-yellow', 'color-scheme-black-white');
    document.documentElement.classList.add(`color-scheme-${settings.colorScheme}`);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityContext; 