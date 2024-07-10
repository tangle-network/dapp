'use client';

import { MoonLine, SunLine } from '@webb-tools/icons';
import cx from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';
import {
  useNextDarkMode,
  useDarkMode as useNormalDarkMode,
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
    [useNextThemes],
  );

  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, toggleThemeMode] = useDarkMode();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If we use next themes, we don't want to show the UI
  // until the compoennt is mounted, this prevents
  // hydration mismatch
  // Check: https://github.com/pacocoursey/next-themes#avoid-hydration-mismatch
  if (!isMounted && useNextThemes) {
    return null;
  }

  return (
    <div
      className={cx(
        'relative inline-block w-14 h-8 align-middle',
        'select-none transition duration-200 ease-in rounded-full',
        '[&_*]:cursor-pointer shadow-md',
        {
          'bg-mono-120': isDarkMode,
          'bg-mono-60': !isDarkMode,
        },
      )}
      onClick={(eve) => {
        eve.preventDefault();
        toggleThemeMode();
      }}
    >
      <input
        type="checkbox"
        name="toggle"
        id="toggle"
        className="hidden"
        checked={isDarkMode}
        onChange={(eve) => {
          eve.stopPropagation();
          toggleThemeMode();
        }}
      />
      <label
        htmlFor="toggle"
        className="block h-6 overflow-hidden rounded-full"
      />
      <div
        className={cx(
          'absolute inset-y-0 left-0 flex items-center transition-transform duration-200 ease-in',
          {
            'translate-x-full': isDarkMode,
          },
        )}
      >
        {isDarkMode ? (
          <MoonLine className="h-7 w-7 -ml-0.5 bg-mono-0 rounded-full p-[3px] !fill-mono-200" />
        ) : (
          <SunLine className="h-7 w-7 ml-[3px] bg-blue-100 rounded-full p-0.5 !fill-mono-20" />
        )}
      </div>
    </div>
  );
};
