import { ReactComponent as WebbLogo } from '@webb-dapp/react-components/assets/webb-icon.svg';
import { useStore } from '@webb-dapp/react-environment';
import { useDimensions } from '@webb-dapp/react-environment/layout';
import { NetworkManager } from '@webb-dapp/ui-components/NetworkManger/NetworkManager';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { below } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import { AccountManager } from '../AccountManager/AccountManager';
import { ThemeSwitcher } from './ThemeSwitcher';

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
  z-index: 100;

  background: ${({ theme }) => theme.mainBackground};
  .webb-logo {
    min-width: 75px;
    max-width: 75px;
    z-index: 101;
  }
  .div {
    z-index: 101;
  }

  ul {
    height: 100%;
    display: flex;
    margin: auto;
    padding: 0;
    list-style: none;
    z-index: 101;

    li {
      z-index: 101;
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
  //width: 244px;
`;

const RightNavigation = styled.div`
  display: flex;
  align-items: center;
  ${below.sm`
	  margin-left: auto;
	`}
  margin-right: 30px;
`;
const NavigationWrapper = styled.ul`
  flex: 1;
  margin: 0 6rem !important;
`;
type AppBarProps = {};

const AppBar: React.FC<AppBarProps> = () => {
  const { size, width } = useDimensions();
  const isMobile = useMemo(() => {
    return width <= size.sm;
  }, [width, size]);
  const { setTheme, theme } = useStore('ui');

  const isDarkTheme = theme === 'dark';
  return (
    <AppBarWrapper>
      <WebbLogo className={'webb-logo'} />
      <SpacerDiv />
      {!isMobile && (
        <NavigationWrapper>
          <li className={'active'}>
            <NavLink to={'/tornado'}>Tornados</NavLink>
          </li>
          <li className={'active'}>
            <NavLink to={'/bridge'}>Bridge</NavLink>
          </li>
          <li className={'active'}>
            <NavLink to={'/wrap-unwrap'}>Wrap/Unwrap</NavLink>
          </li>
        </NavigationWrapper>
      )}
      <RightNavigation>
        <ThemeSwitcher
          active={isDarkTheme ? 'dark' : 'light'}
          onChange={(next) => {
            setTheme(next === 'light' ? 'default' : 'dark');
          }}
        />
        {!isMobile && <NetworkManager />}
        <AccountManager />
      </RightNavigation>
    </AppBarWrapper>
  );
};
export default AppBar;
