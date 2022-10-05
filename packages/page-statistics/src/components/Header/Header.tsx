import * as constants from '@webb-dapp/page-statistics/constants';
import { Button, DropdownMenu, Logo, ThemeSwitcherButton } from '@webb-dapp/webb-ui-components';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import cx from 'classnames';
import { ComponentProps, FC, useCallback, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

import MenuIcon from './MenuIcon';
import { SettingsDropdown } from './SettingsDropdown';
import { SettingsPopover } from './SettingsPopover';

/**
 * The statistic `Header` for `Layout` container
 */

type HeaderProps = {
  connectedEndpoint: string;
  setConnectedEndpoint: (endpoint: string) => void;
};

export const Header: FC<HeaderProps> = ({ connectedEndpoint, setConnectedEndpoint }) => {
  const { name, ...webbAppConfig } = constants.webbAppConfig;

  return (
    <header className='bg-mono-0 dark:bg-mono-180'>
      <div className='relative flex items-center justify-between py-4 mb-6 max-w-[1160px] mx-auto'>
        <NavLink to={constants.logoConfig.path}>
          <Logo />
        </NavLink>

        {/** Center the nav */}
        <nav className='absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'>
          <ul className='flex items-center space-x-9'>
            {constants.headerNavs.map(({ name, path }) => (
              <NavButton key={`${name}-${path}`} path={path}>
                {name}
              </NavButton>
            ))}
          </ul>
        </nav>

        <div className='flex items-center space-x-4'>
          <Button size='sm' className='block' {...webbAppConfig}>
            <Typography variant='body1' fw='bold' className='!text-inherit' component='span'>
              {name}
            </Typography>
          </Button>
          <SettingsDropdown
            connectedEndpoint={connectedEndpoint}
            setConnectedEndpoint={setConnectedEndpoint}
            buttonIcon={<MenuIcon />}
          />
        </div>
      </div>
    </header>
  );
};

/***********************
 * Internal components *
 ***********************/

const NavButton: FC<{ path: string }> = ({ children, path }) => (
  <li>
    <NavLink to={path}>
      {({ isActive }) => (
        <span
          className={cx(
            'px-3 py-1 font-bold rounded-full body1',
            'bg-mono-0 dark:bg-mono-180',
            isActive ? 'text-blue dark:text-blue-40' : 'text-mono-160 dark:text-mono-40',
            isActive && 'pointer-events-none',
            !isActive && ' hover:bg-blue-0 dark:hover:bg-blue-120 dark:hover:text-blue-10 ',
            !isActive && 'active:bg-blue-0 active:text-blue dark:active:bg-blue-120 dark:active:text-blue-30'
          )}
        >
          {children}
        </span>
      )}
    </NavLink>
  </li>
);
