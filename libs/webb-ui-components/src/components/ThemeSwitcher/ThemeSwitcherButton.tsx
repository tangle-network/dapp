import { Half2Icon } from '@radix-ui/react-icons';
import { useDarkMode } from '../../hooks';
import { MoonLine, SunLine } from '@webb-tools/icons';
import { useMemo } from 'react';

const ThemeSwitcherButton = () => {
  const [isDarkMode, toggleThemeMode] = useDarkMode();

  const Icon = useMemo(() => {
    const preferredTheme = isDarkMode ? 'dark' : 'light';
    switch (preferredTheme) {
      case 'dark':
        return <SunLine size="lg" />;
      case 'light':
        return <MoonLine size="lg" />;
      default:
        return (
          <Half2Icon className="w-6 h-6 fill-mono-200 dark:fill-mono-40" />
        );
    }
  }, [isDarkMode]);

  return (
    <button
      className="relative inline-block text-left"
      onClick={() => toggleThemeMode()}
    >
      {Icon}
    </button>
  );
};

export default ThemeSwitcherButton;
