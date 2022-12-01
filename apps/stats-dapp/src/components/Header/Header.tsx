import * as constants from '@webb-tools/webb-ui-components/constants';
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
  ThemeSwitcherMenuItem,
  Divider,
  ThemeSwitcherButton,
} from '@webb-tools/webb-ui-components';
import {
  BookOpenLineIcon,
  ThreeDotsVerticalIcon,
  ExternalLinkLine,
} from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import cx from 'classnames';
import { FC, useCallback, useState, PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';

type HeaderProps = {
  connectedEndpoint: string;
  setConnectedEndpoint: (endpoint: string) => Promise<void>;
};

/**
 * The statistic `Header` for `Layout` container
 */
export const Header: FC<HeaderProps> = ({
  connectedEndpoint,
  setConnectedEndpoint,
}) => {
  const { webbApiConfig, webbAppConfig } = constants;

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
    <header className="bg-mono-0 dark:bg-mono-180">
      <div className="relative flex items-center justify-between py-4 mb-6 max-w-[1160px] mx-auto">
        <NavLink to={constants.logoConfig.path}>
          <Logo />
        </NavLink>

        {/** Center the nav */}
        <nav className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full bg-mono-20 dark:bg-mono-140 py-1.5">
          <ul className="flex items-center space-x-9">
            {constants.headerNavs.map(({ name, path }) => (
              <NavButton key={`${name}-${path}`} path={path}>
                {name}
              </NavButton>
            ))}
          </ul>
        </nav>

        <div className="flex items-center space-x-4">
          <Button size="sm" className="block" {...webbAppConfig}>
            <Typography
              variant="body1"
              fw="bold"
              className="!text-inherit"
              component="span"
            >
              {webbAppConfig.name}
            </Typography>
          </Button>

          <ThemeSwitcherButton />

          <div>
            <Dropdown className="flex items-center justify-center">
              <DropdownBasicButton>
                <ThreeDotsVerticalIcon size="lg" />
              </DropdownBasicButton>

              <DropdownBody
                className="mt-6 w-[260px]"
                onInteractOutside={async () =>
                  await setEndpoint(endpointUserInput)
                }
              >
                <MenuItem
                  className="px-4 py-3.5 pt-4 border-b border-mono-40 dark:border-mono-140"
                  icon={<ExternalLinkLine size="lg" />}
                  onClick={() => {
                    window.open(webbApiConfig.href, '_blank');
                  }}
                >
                  <Typography variant="label" fw="bold">
                    {webbApiConfig.name}
                  </Typography>
                </MenuItem>

                <MenuItem
                  className="px-4 py-3.5 border-b border-mono-40 dark:border-mono-140"
                  icon={<BookOpenLineIcon size="lg" />}
                  onClick={() => {
                    window.open('https://docs.webb.tools', '_blank');
                  }}
                >
                  <Typography variant="label" fw="bold">
                    Documentation
                  </Typography>
                </MenuItem>

                <MenuItem className="px-4 py-2">
                  <Typography variant="label" fw="bold">
                    ADVANCED
                  </Typography>

                  <div className="flex items-center justify-between pt-4">
                    <Typography variant="body1">Custom Data Source</Typography>

                    <Button
                      size="sm"
                      variant="link"
                      onClick={() => {
                        setEndpointUserInput(connectedEndpoint);
                      }}
                    >
                      Reset
                    </Button>
                  </div>

                  <Input
                    id="endpoint"
                    className="pt-2 pb-4"
                    onChange={(val) => setEndpointUserInput(val.toString())}
                    value={endpointUserInput}
                  />
                </MenuItem>
              </DropdownBody>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

const SettingItem: FC<PropsWithChildren> = ({ children }) => (
  <div className="px-4 py-2 w-[298px] flex items-center justify-between text-mono-180 dark:text-mono-0">
    {children}
  </div>
);

/***********************
 * Internal components *
 ***********************/

const NavButton: FC<PropsWithChildren<{ path: string }>> = ({
  children,
  path,
}) => (
  <li>
    <NavLink to={path}>
      {({ isActive }) => (
        <span
          className={cx(
            'px-3 py-1.5 font-bold rounded-full body1',
            isActive
              ? 'bg-mono-180 text-mono-20 dark:bg-mono-20 dark:text-mono-160 pointer-events-none'
              : 'bg-mono-20 text-mono-100 dark:bg-mono-140 dark:text-mono-40'
          )}
        >
          {children}
        </span>
      )}
    </NavLink>
  </li>
);
