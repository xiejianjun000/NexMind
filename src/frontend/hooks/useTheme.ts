// useTheme - 主题管理系统Hook
// 支持暗色/亮色/系统主题切换

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  primary: string;
  primaryVariant: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

const darkTheme: ThemeColors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  primary: '#00BCD4',
  primaryVariant: '#0097A7',
  secondary: '#3B82F6',
  accent: '#8B5CF6',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#475569',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

const lightTheme: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  primary: '#0891B2',
  primaryVariant: '#0E7490',
  secondary: '#2563EB',
  accent: '#7C3AED',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
};

const STORAGE_KEY = 'nexmind-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as Theme) || 'dark';
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => updateResolvedTheme();
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    const colors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
    const root = document.documentElement;

    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-surface-variant', colors.surfaceVariant);
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-variant', colors.primaryVariant);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);

    document.body.className = `${resolvedTheme}-theme`;
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    console.log(`[Theme] 主题切换为: ${newTheme}`);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  const colors = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  return {
    theme,
    resolvedTheme,
    colors,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };
}
