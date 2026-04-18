import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ThemeContext } from './themeContextInternal';
import type { ThemeContextValue, ThemeName } from './themeTypes';

const STORAGE_KEY = 'll.theme';
const DEFAULT_THEME: ThemeName = 'tactical';

function readStoredTheme(): ThemeName {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'minimal' || stored === 'tactical') return stored;
  } catch {
    // ignore storage failures (private mode, etc.)
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) {
      meta.content = theme === 'tactical' ? '#05110a' : '#0b0b0d';
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'minimal' ? 'tactical' : 'minimal'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
