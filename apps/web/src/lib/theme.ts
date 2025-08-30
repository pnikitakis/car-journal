/**
 * Theme management utilities
 */

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'car-journal-theme';

/**
 * Get the current theme preference
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
  return stored || 'system';
}

/**
 * Set theme preference
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    // Use system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(systemPrefersDark ? 'dark' : 'light');
  } else {
    root.classList.add(theme);
  }
}

/**
 * Get the effective theme (resolves 'system' to actual theme)
 */
export function getEffectiveTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  const theme = getTheme();
  
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  return theme;
}

/**
 * Listen for system theme changes
 */
export function watchSystemTheme(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
    
    // If using system theme, update the applied theme
    if (getTheme() === 'system') {
      applyTheme('system');
    }
  };
  
  mediaQuery.addEventListener('change', handler);
  
  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
}

/**
 * Initialize theme on app start
 */
export function initializeTheme(): void {
  if (typeof window === 'undefined') return;
  
  const theme = getTheme();
  applyTheme(theme);
  
  // Watch for system theme changes
  watchSystemTheme(() => {
    if (getTheme() === 'system') {
      applyTheme('system');
    }
  });
}