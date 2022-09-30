import * as constants from '@webb-dapp/page-statistics/constants';
import { DropdownMenu, Logo, ThemeSwitcher } from '@webb-dapp/webb-ui-components';
import cx from 'classnames';
import { ComponentProps, FC, useCallback, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * The statistic `Header` for `Layout` container
 */

// type AppBarProps = {
//   toggleSidebarDisplay: () => void;
// };

// const AppBar: React.FC<AppBarProps> = ({ toggleSidebarDisplay })

type HeaderProps = {
  connectedEndpoint: string;
  availableEndpoints: string[];
  setConnectedEndpoint: (endpoint: string) => void;
};

export const Header: FC<HeaderProps> = ({ availableEndpoints, connectedEndpoint, setConnectedEndpoint }) => {
  const { name, ...webbAppConfig } = constants.webbAppConfig;
  const index = availableEndpoints.indexOf(localStorage.getItem('stats-endpoint') ?? connectedEndpoint);
  const [selectedIdx, setSelectedIdx] = useState(index);

  const endpointMenuOptions = useMemo<ComponentProps<typeof DropdownMenu>['menuOptions']>(
    () =>
      availableEndpoints.reduce((acc, cur) => {
        return [...acc, { value: cur }];
      }, [] as ComponentProps<typeof DropdownMenu>['menuOptions']),
    [availableEndpoints]
  );

  const changeEndpoint = useCallback(
    (nextVal: string) => {
      localStorage.setItem('stats-endpoint', nextVal);
      setSelectedIdx(availableEndpoints.indexOf(nextVal));
      setConnectedEndpoint(nextVal);
    },
    [availableEndpoints, setConnectedEndpoint]
  );

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
          <DropdownMenu
            menuOptions={endpointMenuOptions}
            size='sm'
            value={endpointMenuOptions[selectedIdx].value}
            onChange={changeEndpoint}
          />
          <ThemeSwitcher />
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
    <NavLink to={path} className={({ isActive }) => cx(isActive && 'cursor-not-allowed')}>
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
