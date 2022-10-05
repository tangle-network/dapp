import { Half2Icon } from '@radix-ui/react-icons';
import { useDarkMode } from '@webb-dapp/webb-ui-components/hooks';
import { MoonLine, SunLine } from '@webb-dapp/webb-ui-components/icons';
import { useMemo } from 'react';

import { MenuItem } from '../MenuItem';

type ThemeSwitcherItemProps = {
  className?: string;
};

const ThemeSwitcherItem = (props: ThemeSwitcherItemProps) => {
  const [isDarkMode, toggleThemeMode] = useDarkMode();

  const Icon = useMemo(() => {
    const preferredTheme = isDarkMode ? 'dark' : 'light';
    switch (preferredTheme) {
      case 'light':
        return <SunLine size='lg' />;
      case 'dark':
        return <MoonLine size='lg' />;
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

export default ThemeSwitcherItem;
