import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Half2Icon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import cx from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';

export interface Props {}

const themes = [
  {
    key: 'light',
    label: 'Light',
    icon: <SunIcon />,
  },
  {
    key: 'dark',
    label: 'Dark',
    icon: <MoonIcon />,
  },
];

const ThemeSwitcher = () => {
  const [preferredTheme, setPreferredTheme] = useState<null | string>(null);

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

  const toggleTheme = useCallback((key: string) => {
    switch (key) {
      case 'dark': {
        if (localStorage.getItem('theme') !== key) {
          document.documentElement.classList.add(key);
          localStorage.setItem('theme', key);
        }
        break;
      }

      case 'light': {
        if (localStorage.getItem('theme') !== key) {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', key);
        }
        break;
      }
    }
  }, []);

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
          {(function () {
            switch (preferredTheme) {
              case 'light':
                return <SunIcon className='h-5 w-5 text-gray-700 dark:text-gray-300' />;
              case 'dark':
                return <MoonIcon className='h-5 w-5 text-gray-700 dark:text-gray-300' />;
              default:
                return <Half2Icon className='h-5 w-5 text-gray-700 dark:text-gray-300' />;
            }
          })()}
          {/* {isDark ? "dark" : "light"} */}
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
                    toggleTheme(key);
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
