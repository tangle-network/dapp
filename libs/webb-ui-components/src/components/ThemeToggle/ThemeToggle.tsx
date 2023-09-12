import { MoonLine, SunLine } from '@webb-tools/icons';
import { useDarkMode } from '../../hooks/useDarkMode';
import cx from 'classnames';

/**
 * ThemeToggle (Dark/Light) Component
 *
 * ```jsx
 *  // Example
 *  <ThemeToggle />
 * ```
 */
export const ThemeToggle = () => {
  const [isDarkMode, toggleThemeMode] = useDarkMode();

  return (
    <div
      className={cx(
        'relative inline-block w-14 h-8 align-middle',
        'select-none transition duration-200 ease-in rounded-full',
        '[&_*]:cursor-pointer',
        {
          'bg-mono-200': isDarkMode,
          'bg-blue-10': !isDarkMode,
        }
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
            'translate-x-full': !isDarkMode,
          }
        )}
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
