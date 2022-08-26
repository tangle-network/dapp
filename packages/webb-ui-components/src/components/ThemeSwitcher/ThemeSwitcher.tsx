import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Half2Icon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useDarkMode } from '@webb-dapp/webb-ui-components/hooks';
import cx from 'classnames';
import React, { useMemo } from 'react';

export interface Props {}

const themes = [
  {
    key: 'light' as const,
    label: 'Light',
    icon: <SunIcon />,
  },
  {
    key: 'dark' as const,
    label: 'Dark',
    icon: <MoonIcon />,
  },
];

const ThemeSwitcher = () => {
  const [isDarkMode, toggleThemeMode] = useDarkMode();

  const Icon = useMemo(() => {
    const preferredTheme = isDarkMode ? 'dark' : 'light';
    switch (preferredTheme) {
      case 'light':
        return <SunIcon className='h-5 w-5 text-gray-700 dark:text-gray-300' />;
      case 'dark':
        return <MoonIcon className='h-5 w-5 text-gray-700 dark:text-gray-300' />;
      default:
        return <Half2Icon className='h-5 w-5 text-gray-700 dark:text-gray-300' />;
    }
  }, [isDarkMode]);

  return (
    <div className='relative inline-block text-left'>
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger
          className={cx(
            'inline-flex select-none justify-center rounded-md px-2.5 py-2 text-sm font-medium',
            'bg-white text-gray-900 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 hover:dark:bg-gray-600',
            'border border-gray-300 dark:border-transparent',
            'focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75'
          )}
        >
          {Icon}
        </DropdownMenuPrimitive.Trigger>

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align='end'
            sideOffset={5}
            className={cx(
              ' radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down',
              'w-48 rounded-lg px-1.5 py-1 shadow-md md:w-56',
              'bg-gray-50 dark:bg-gray-700'
            )}
          >
            {themes.map(({ icon, key, label }, i) => {
              return (
                <DropdownMenuPrimitive.Item
                  key={`theme-${i}`}
                  className={cx(
                    'flex w-full cursor-default select-none items-center rounded-md px-2 py-2 text-xs outline-none',
                    'text-gray-500 focus:bg-gray-200 dark:text-gray-400 dark:focus:bg-gray-800'
                  )}
                  onClick={() => {
                    toggleThemeMode(key);
                  }}
                >
                  {React.cloneElement(icon, {
                    className: 'w-5 h-5 mr-2 text-gray-700 dark:text-gray-300',
                  })}
                  <span className='flex-grow text-gray-700 dark:text-gray-300'>{label}</span>
                </DropdownMenuPrimitive.Item>
              );
            })}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
};

export default ThemeSwitcher;
