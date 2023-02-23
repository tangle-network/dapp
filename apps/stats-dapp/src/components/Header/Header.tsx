import {
  webbAppConfig,
  logoConfig,
  headerNavs,
} from '@webb-tools/webb-ui-components/constants';
import {
  Button,
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Logo,
  MenuItem,
  ThemeSwitcherButton,
} from '@webb-tools/webb-ui-components';
import {
  BookOpenLineIcon,
  ThreeDotsVerticalIcon,
  ExternalLinkLine,
} from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import cx from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import { NetworkSelector } from '../NetworkSelector/NetworkSelector';
import { Network } from '@webb-tools/webb-ui-components/constants';

type HeaderProps = {
  selectedNetwork: Network;
  setUserSelectedNetwork: (network: Network) => void;
};

export const Header: FC<HeaderProps> = ({
  selectedNetwork,
  setUserSelectedNetwork,
}) => {
  // // A function to verify the user input before setting the connection.
  // const verifyEndpoint = async (maybeEndpoint: string) => {
  //   // verify graphql service at endpoint:
  //   const req = await fetch(`${maybeEndpoint}?query=%7B__typename%7D`);
  //   if (req.ok) {
  //     return true;
  //   } else {
  //     throw false;
  //   }
  // };

  return (
    <header className="bg-mono-0 dark:bg-mono-180">
      <div className="relative flex items-center justify-between py-4 mb-6 max-w-[1160px] mx-auto">
        <NavLink to={logoConfig.path}>
          <Logo />
        </NavLink>

        <nav className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full bg-mono-20 dark:bg-mono-140 py-1.5">
          <ul className="flex items-center space-x-9">
            {headerNavs.map(({ name, path }) => (
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

              <DropdownBody className="mt-6 w-[280px] dark:bg-mono-180">
                <MenuItem
                  className="px-4 py-3.5 pt-4 border-b border-mono-40 dark:border-mono-140 hover:bg-mono-0 dark:hover:bg-mono-180"
                  icon={<ExternalLinkLine size="lg" />}
                  onClick={() => {
                    window.open(selectedNetwork.polkadotExplorer, '_blank');
                  }}
                >
                  <Typography variant="label" fw="bold">
                    {selectedNetwork.name}
                  </Typography>
                </MenuItem>

                <MenuItem
                  className="px-4 py-3.5 border-b border-mono-40 dark:border-mono-140 hover:bg-mono-0  dark:hover:bg-mono-180"
                  icon={<BookOpenLineIcon size="lg" />}
                  onClick={() => {
                    window.open('https://docs.webb.tools', '_blank');
                  }}
                >
                  <Typography variant="label" fw="bold">
                    Documentation
                  </Typography>
                </MenuItem>

                <MenuItem className="px-4 py-2 hover:bg-mono-0 dark:hover:bg-mono-180">
                  <Typography variant="label" fw="bold">
                    Advanced
                  </Typography>

                  <Typography variant="body1" className="pt-4">
                    Data Source
                  </Typography>

                  <div className="pt-4">
                    <NetworkSelector
                      selectedNetwork={selectedNetwork}
                      setUserSelectedNetwork={setUserSelectedNetwork}
                    />
                  </div>
                </MenuItem>
              </DropdownBody>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};

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
