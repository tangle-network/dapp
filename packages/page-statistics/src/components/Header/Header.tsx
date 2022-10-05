import * as constants from '@webb-dapp/page-statistics/constants';
import {
  Button,
  Collapsible,
  CollapsibleButton,
  CollapsibleContent,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Input,
  Logo,
  MenuItem,
} from '@webb-dapp/webb-ui-components';
import { MoonLine } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import cx from 'classnames';
import { FC, useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';

type HeaderProps = {
  connectedEndpoint: string;
  setConnectedEndpoint: (endpoint: string) => Promise<void>;
};

/**
 * The statistic `Header` for `Layout` container
 */
export const Header: FC<HeaderProps> = ({ connectedEndpoint, setConnectedEndpoint }) => {
  const { name, ...webbAppConfig } = constants.webbAppConfig;

  // This state variable tracks the user input of the 'Custom Data Source'
  const [endpointUserInput, setEndpointUserInput] = useState(connectedEndpoint);

  // A function to verify the user input before setting the connection.
  const verifyEndpoint = async (maybeEndpoint: string) => {
    // verify graphql service at endpoint:
    const req = await fetch(`${maybeEndpoint}?query=%7B__typename%7D`);
    if (req.ok) {
      return true;
    } else {
      throw false;
    }
  };

  const setEndpoint = useCallback(
    async (endpoint: string) => {
      const verified = await verifyEndpoint(endpoint);
      if (verified) {
        localStorage.setItem('statsEndpoint', endpoint);
        await setConnectedEndpoint(endpoint);
      } else {
        setEndpointUserInput(connectedEndpoint);
      }
    },
    [connectedEndpoint, setConnectedEndpoint]
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
          <Button size='sm' className='block' {...webbAppConfig}>
            <Typography variant='body1' fw='bold' className='!text-inherit' component='span'>
              {name}
            </Typography>
          </Button>

          <div>
            <Dropdown className='flex items-center justify-center'>
              <DropdownBasicButton>
                <svg
                  width={24}
                  height={24}
                  className='fill-mono-180 dark:fill-mono-0'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' />
                </svg>
              </DropdownBasicButton>

              <DropdownBody
                className='pt-2 pb-4 mt-6'
                onInteractOutside={async () => await setEndpoint(endpointUserInput)}
              >
                <SettingItem>
                  <Typography variant='h5' fw='bold'>
                    Settings
                  </Typography>
                </SettingItem>

                <MenuItem icon={<MoonLine size='lg' />}>Dark Theme</MenuItem>

                <MenuItem
                  icon={
                    <svg width={24} height={24} className='fill-current' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M13 21v2h-2v-2H3a1 1 0 01-1-1V4a1 1 0 011-1h6a3.99 3.99 0 013 1.354A3.99 3.99 0 0115 3h6a1 1 0 011 1v16a1 1 0 01-1 1h-8zm7-2V5h-5a2 2 0 00-2 2v12h7zm-9 0V7a2 2 0 00-2-2H4v14h7z' />
                    </svg>
                  }
                >
                  Docs
                </MenuItem>

                <Collapsible>
                  <CollapsibleButton>Keygen Threshold</CollapsibleButton>
                  <CollapsibleContent className='p-0'>
                    <div className='flex items-center justify-between px-4 py-2'>
                      <Typography variant='body1'>Custom Data Source</Typography>

                      <Button
                        size='sm'
                        variant='link'
                        onClick={() => {
                          setEndpointUserInput(connectedEndpoint);
                        }}
                      >
                        Reset
                      </Button>
                    </div>

                    <Input
                      id='endpoint'
                      className='px-4 py-2'
                      onChange={(val) => setEndpointUserInput(val.toString())}
                      value={endpointUserInput}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </DropdownBody>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

const SettingItem: FC = ({ children }) => (
  <div className='px-4 py-2 w-[298px] flex items-center justify-between text-mono-180 dark:text-mono-0'>{children}</div>
);

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
