'use client';

import { useCallback, useEffect, useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';

type SupportTheme = 'light' | 'dark';

function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}

export type ToggleThemeModeFunc = (
  nextThemeMode?: SupportTheme | undefined,
) => void;

/**
 * Hook to get the current theme mode and a function to toggle the theme mode
 * @returns `[isDarkMode, toggleThemeMode]`
 */
export function useDarkMode(
  defaultTheme: SupportTheme = 'dark',
): [boolean, ToggleThemeModeFunc] {
  const [theme, setTheme] = useLocalStorageState('theme', {
    defaultValue: defaultTheme,
  });

  const isDarkMode = useMemo(() => theme === 'dark', [theme]);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    if (
      theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Only set the default theme if there's no theme in localStorage
  useEffect(() => {
    if (!isBrowser() || localStorage.getItem('theme')) {
      return;
    }
    setTheme(defaultTheme);
  }, [defaultTheme, setTheme]);

  const toggleThemeMode = useCallback<ToggleThemeModeFunc>(
    (nextThemeMode?: SupportTheme | undefined) => {
      if (!isBrowser()) return;

      const _nextThemeMode =
        (nextThemeMode ?? theme === 'dark') ? 'light' : 'dark';

      if (_nextThemeMode === theme) return;

      switch (_nextThemeMode) {
        case 'dark': {
          document.documentElement.classList.add('dark');
          break;
        }

        case 'light': {
          document.documentElement.classList.remove('dark');
          break;
        }
      }

      setTheme(_nextThemeMode);
    },
    [theme, setTheme],
  );

  return [isDarkMode, toggleThemeMode];
}
