import { ReactComponent as WebbLogo } from '@webb-dapp/react-components/assets/webb-icon.svg';
import { basePallet } from '@webb-dapp/ui-components/styling/colors/base-pallet';
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { lightPallet } from '@webb-dapp/ui-components/styling/colors';
import { IconButton, Icon } from '@material-ui/core';
import { AccountBar, ChainName } from '@webb-dapp/react-components';
import { useApi } from '@webb-dapp/react-hooks';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { SettingsManager } from '@webb-dapp/ui-components/SettingsManager/SettingsManager';
import { AccountManager } from '../AccountManager/AccountManager';

const AppBarWrapper = styled.nav`
  min-height: 65px;
  width: 100%;
  max-width: 1440px;
  margin: auto;
  display: flex;
  flex: 1;
  align-items: center;

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
        color: ${lightPallet.primaryText};
        font-family: ${FontFamilies.AvenirNext};
        :after {
          content: '';
          display: block;
          height: 5px;
          width: 0%;
          background: ${basePallet.primary};
          border-radius: 16px;
          position: absolute;
          bottom: 0;
          margin: auto;
          transition: width ease-in-out 0.3s;
        }

        &.active {
          color: ${lightPallet.primary};
          font-weight: bold;

          :after {
            content: '';
            display: block;
            height: 5px;
            width: 90%;
            background: ${basePallet.primary};
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

const AccountWrapper = styled.div`
  display: flex;
  align-items: center;
`;

type AppBarProps = {};

const AppBar: React.FC<AppBarProps> = () => {
  const { connected } = useApi();
  return (
    <AppBarWrapper>
      <WebbLogo className={'webb-logo'} />
      <ul>
        <li className={'active'}>
          <NavLink to={'/mixer'} activeClassName={'active'}>
            ZkProff
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
      </ul>
      <AccountWrapper>
        <SettingsManager />
        {connected && <AccountManager />}
      </AccountWrapper>
    </AppBarWrapper>
  );
};
export default AppBar;
