import { FC, useMemo } from 'react';
import { MoonLine, SunLine } from '@webb-tools/icons';
import {
  useDarkMode as useNormalDarkMode,
  useNextDarkMode,
} from '../../hooks/useDarkMode';

import { ThemeToggleProps } from './types';

/**
 * ThemeToggle (Dark/Light) Component
 *
 * ```jsx
 *  // Example
 *  <ThemeToggle />
 * ```
 */

export const ThemeToggle: FC<ThemeToggleProps> = ({
  useNextThemes = false,
}) => {
  const useDarkMode = useMemo(
    () => (useNextThemes ? useNextDarkMode : useNormalDarkMode),
    [useNextThemes]
  );

  // const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, toggleThemeMode] = useDarkMode();

  return (
    <div
      className={`relative inline-block w-14 h-8 align-middle select-none transition duration-200 ease-in rounded-full ${
        isDarkMode ? 'bg-mono-200' : 'bg-blue-10'
      }`}
      onClick={(eve) => {
        eve.preventDefault();
        toggleThemeMode();
      }}
    >
      <input
        type="checkbox"
        name="toggle"
        id="toggle"
        className="hidden toggle-checkbox"
        checked={isDarkMode}
        onChange={(eve) => {
          eve.stopPropagation();
          toggleThemeMode();
        }}
      />
      <label
        htmlFor="toggle"
        className="block h-6 overflow-hidden rounded-full cursor-pointer toggle-label"
      />
      <div
        className={`toggle-icon absolute inset-y-0 left-0 flex items-center transition-transform duration-200 ease-in  ${
          !isDarkMode ? 'translate-x-full' : ''
        }`}
      >
        {isDarkMode ? (
          <SunLine className="h-7 w-7 ml-[3px] bg-blue-30 rounded-full p-0.5 !fill-mono-200" />
        ) : (
          <MoonLine className="h-7 w-7 -ml-0.5 bg-mono-200 rounded-full p-[3px] !fill-mono-0" />
        )}
      </div>
    </div>
  );
};
