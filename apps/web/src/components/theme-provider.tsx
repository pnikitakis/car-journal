'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Theme, getTheme, setTheme, getEffectiveTheme, watchSystemTheme, initializeTheme } from '../lib/theme';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Initialize theme on mount
    const currentTheme = getTheme();
    setThemeState(currentTheme);
    setEffectiveTheme(getEffectiveTheme());
    
    initializeTheme();
    
    // Watch for system theme changes
    const cleanup = watchSystemTheme((isDark) => {
      setEffectiveTheme(isDark ? 'dark' : 'light');
    });
    
    return cleanup;
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
    setEffectiveTheme(getEffectiveTheme());
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        setTheme: handleSetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}