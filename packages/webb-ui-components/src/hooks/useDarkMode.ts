import { useCallback, useEffect, useState } from 'react';

/**
 * Function to toggle or change the theme mode (possible value: `light`, `dark`, `undefined`)
 */
export type ToggleThemeModeFunc = (nextThemeMode?: 'light' | 'dark' | undefined) => void;

/**
 * Hook to get the current theme mode and a function to toggle the theme mode
 * @returns `[isDarkMode, toggleThemeMode]`
 */
export function useDarkMode(): [boolean, ToggleThemeModeFunc] {
  const [preferredTheme, setPreferredTheme] = useState<null | 'dark' | 'light'>(null);

  useEffect(() => {
    if (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setPreferredTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setPreferredTheme('light');
    }
  }, []);

  const toggleThemeMode = useCallback<ToggleThemeModeFunc>(
    (nextThemeMode?: 'light' | 'dark' | undefined) => {
      let _nextThemeMode: 'light' | 'dark';
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
          }
          break;
        }

        case 'light': {
          if (localStorage.getItem('theme') !== _nextThemeMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', _nextThemeMode);
          }
          break;
        }
      }

      setPreferredTheme(_nextThemeMode);
    },
    [preferredTheme]
  );

  return [preferredTheme === 'dark', toggleThemeMode];
}
