import { useCallback, useEffect, useMemo, useState } from 'react';

type SupportTheme = 'light' | 'dark';

/**
 * Function to toggle or change the theme mode (possible value: `light`, `dark`, `undefined`)
 */
export type ToggleThemeModeFunc = (
  nextThemeMode?: SupportTheme | undefined
) => void;

/**
 * Hook to get the current theme mode and a function to toggle the theme mode
 * @returns `[isDarkMode, toggleThemeMode]`
 */
export function useDarkMode(
  defaultTheme: SupportTheme = 'dark'
): [boolean, ToggleThemeModeFunc] {
  const [preferredTheme, setPreferredTheme] =
    useState<SupportTheme>(defaultTheme);

  const isDarkMode =
    localStorage.getItem('theme') !== null
      ? localStorage.getItem('theme') === 'dark'
      : preferredTheme === 'dark';

  useEffect(() => {
    if (localStorage.getItem('theme') === null) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      window.dispatchEvent(new Event('storage'));
    }

    if (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setPreferredTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setPreferredTheme('light');
    }
  }, []);

  const toggleThemeMode = useCallback<ToggleThemeModeFunc>(
    (nextThemeMode?: SupportTheme | undefined) => {
      let _nextThemeMode: SupportTheme;
      if (!nextThemeMode) {
        _nextThemeMode = preferredTheme === 'dark' ? 'light' : 'dark';
      } else {
        _nextThemeMode = nextThemeMode;
      }

      switch (_nextThemeMode) {
        case 'dark': {
          if (localStorage.getItem('theme') !== _nextThemeMode) {
            document.documentElement.classList.add(_nextThemeMode);
            localStorage.setItem('theme', _nextThemeMode);
            window.dispatchEvent(new Event('storage'));
          }
          break;
        }

        case 'light': {
          if (localStorage.getItem('theme') !== _nextThemeMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', _nextThemeMode);
            window.dispatchEvent(new Event('storage'));
          }
          break;
        }
      }

      setPreferredTheme(_nextThemeMode);
    },
    [preferredTheme]
  );

  return [isDarkMode, toggleThemeMode];
}
