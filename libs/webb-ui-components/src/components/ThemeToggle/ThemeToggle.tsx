import { MoonLine, SunLine } from '@webb-tools/icons';
import { useDarkMode } from '../../hooks/useDarkMode';

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
      className={`relative inline-block w-14 h-8 align-middle select-none transition duration-200 ease-in rounded-full ${
        isDarkMode ? 'bg-mono-0' : 'bg-mono-200'
      }`}
    >
      <input
        type="checkbox"
        name="toggle"
        id="toggle"
        className="toggle-checkbox hidden"
        checked={isDarkMode}
        onChange={() => toggleThemeMode()}
      />
      <label
        htmlFor="toggle"
        className="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer"
      ></label>
      <div
        className={`toggle-icon absolute inset-y-0 left-0 flex items-center transition-transform duration-200 ease-in  ${
          isDarkMode ? 'translate-x-full' : ''
        }`}
      >
        {isDarkMode ? (
          <MoonLine className="h-7 w-7 -ml-0.5 bg-mono-200 rounded-full p-[3px]" />
        ) : (
          <SunLine className="h-7 w-7 ml-[3px] bg-blue-30 rounded-full p-0.5" />
        )}
      </div>
    </div>
  );
};
