import { Switch } from '@material-ui/core';
import { ReactComponent as WebbLogo } from '@webb-dapp/react-components/assets/webb-icon.svg';
import { useStore } from '@webb-dapp/react-environment';
import { useDimensions } from '@webb-dapp/react-environment/layout';
import { useApi } from '@webb-dapp/react-hooks';
import { useLocalStorage } from '@webb-dapp/react-hooks/useLocalStorage';
import { SettingsManager } from '@webb-dapp/ui-components/SettingsManager/SettingsManager';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { below } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import { AccountManager } from '../AccountManager/AccountManager';

const AppBarWrapper = styled.nav`
  height: 65px;
  max-height: 65px;
  width: 100%;
  max-width: 1440px;
  margin: auto;
  display: flex;
  flex: 1;
  align-items: center;
  padding: 0 10px;

  ${below.sm`
	 background:#fff;
	`}
  .webb-logo {
    max-width: 100px;
  }

  ul {
    height: 100%;
    display: flex;
    margin: auto;
    padding: 0;
    list-style: none;

    li {
      a {
        height: 100%;
        min-width: 70px;
        margin: 0 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 0 5px;
        color: ${({ theme }) => theme.primaryText};
        font-family: ${FontFamilies.AvenirNext};

        :after {
          content: '';
          display: block;
          height: 5px;
          width: 0%;
          background: ${({ theme }) => theme.primary};
          border-radius: 16px;
          position: absolute;
          bottom: 0;
          margin: auto;
          transition: width ease-in-out 0.3s;
        }

        &.active {
          color: ${({ theme }) => theme.primary};
          font-weight: bold;

          :after {
            content: '';
            display: block;
            height: 5px;
            width: 90%;
            background: ${({ theme }) => theme.primary};
            border-radius: 16px;
            position: absolute;
            bottom: 0;
            left: 5%;
          }
        }
      }
    }
  }
`;

const SpacerDiv = styled.div`
  width: 201px;
`;

const AccountWrapper = styled.div`
  display: flex;
  align-items: center;
  ${below.sm`
	  margin-left: auto;

	`}
`;
const NavigationWrapper = styled.ul``;
type AppBarProps = {};

const AppBar: React.FC<AppBarProps> = () => {
  const { connected } = useApi();
  const { size, width } = useDimensions();
  const isMobile = useMemo(() => {
    return width <= size.sm;
  }, [width, size]);
  const ui = useStore('ui');
  const isDarkTheme = ui.theme === 'primary';
  return (
    <AppBarWrapper>
      <WebbLogo className={'webb-logo'} />
      <SpacerDiv />
      {!isMobile && (
        <NavigationWrapper>
          <li className={'active'}>
            <NavLink to={'/mixer'} activeClassName={'active'}>
              zkBridge
            </NavLink>
          </li>
          {/*        <li>
          <NavLink to={'/statistics'}>Statistics</NavLink>
        </li>
        <li>
          <NavLink to={'/governance'}>Governance</NavLink>
        </li>
        <li>
          <NavLink to={'/how-it-works'}>How it works</NavLink>
        </li>*/}
        </NavigationWrapper>
      )}
      <AccountWrapper>
        <Switch
          checked={isDarkTheme}
          onClick={() => {
            ui.setTheme(isDarkTheme ? 'secondary' : 'primary');
          }}
        />
        {!isMobile && <SettingsManager />}
        {connected && <AccountManager />}
      </AccountWrapper>
    </AppBarWrapper>
  );
};
export default AppBar;
