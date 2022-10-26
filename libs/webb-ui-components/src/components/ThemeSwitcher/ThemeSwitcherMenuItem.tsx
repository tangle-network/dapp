import { Half2Icon } from '@radix-ui/react-icons';
import { useDarkMode } from '../../hooks';
import { MoonLine, SunLine } from '../../icons';
import { useMemo } from 'react';

import { MenuItem } from '../MenuItem';

type ThemeSwitcherMenuItemProps = {
  className?: string;
};

const ThemeSwitcherMenuItem = (props: ThemeSwitcherMenuItemProps) => {
  const [isDarkMode, toggleThemeMode] = useDarkMode();

  const Icon = useMemo(() => {
    const currentTheme = isDarkMode ? 'dark' : 'light';
    switch (currentTheme) {
      case 'light':
        return <MoonLine size='lg' />;
      case 'dark':
        return <SunLine size='lg' />;
      default:
        return <Half2Icon className='w-6 h-6 fill-mono-200 dark:fill-mono-40' />;
    }
  }, [isDarkMode]);

  return (
    <MenuItem onClick={() => toggleThemeMode(isDarkMode ? 'light' : 'dark')} icon={Icon} className={props.className}>
      {isDarkMode ? 'Light Theme' : 'Dark Theme'}
    </MenuItem>
  );
};

export default ThemeSwitcherMenuItem;
