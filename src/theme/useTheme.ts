import { useContext } from 'react';
import { ThemeContext } from './themeContextInternal';
import type { ThemeContextValue } from './themeTypes';

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
