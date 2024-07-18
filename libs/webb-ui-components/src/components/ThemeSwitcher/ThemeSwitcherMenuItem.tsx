import { Half2Icon } from '@radix-ui/react-icons';
import { useDarkMode } from '../../hooks';
import { MoonLine, SunLine } from '@webb-tools/icons';
import { useMemo } from 'react';

import DropdownMenuItem from '../Dropdown/DropdownMenuItem';

type ThemeSwitcherMenuItemProps = {
  className?: string;
};

const ThemeSwitcherMenuItem = (props: ThemeSwitcherMenuItemProps) => {
  const [isDarkMode, toggleThemeMode] = useDarkMode();

  const Icon = useMemo(() => {
    const currentTheme = isDarkMode ? 'dark' : 'light';
    switch (currentTheme) {
      case 'light':
        return <MoonLine size="lg" />;
      case 'dark':
        return <SunLine size="lg" />;
      default:
        return (
          <Half2Icon className="w-6 h-6 fill-mono-200 dark:fill-mono-40" />
        );
    }
  }, [isDarkMode]);

  return (
    <DropdownMenuItem
      onClick={() => toggleThemeMode()}
      rightIcon={Icon}
      className={props.className}
    >
      {isDarkMode ? 'Light Theme' : 'Dark Theme'}
    </DropdownMenuItem>
  );
};

export default ThemeSwitcherMenuItem;
