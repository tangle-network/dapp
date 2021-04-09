import { ReactComponent as WebbLogo } from '@webb-dapp/react-components/assets/webb-icon.svg';
import { useDimensions } from '@webb-dapp/react-environment/layout';
import { useApi } from '@webb-dapp/react-hooks';
import { SettingsManager } from '@webb-dapp/ui-components/SettingsManager/SettingsManager';
import { lightPallet } from '@webb-dapp/ui-components/styling/colors';
import { basePallet } from '@webb-dapp/ui-components/styling/colors/base-pallet';
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

  return (
    <AppBarWrapper>
      <WebbLogo className={'webb-logo'} />
      {!isMobile && (
        <NavigationWrapper>
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
        </NavigationWrapper>
      )}
      <AccountWrapper>
        {!isMobile && <SettingsManager />}
        {connected && <AccountManager />}
      </AccountWrapper>
    </AppBarWrapper>
  );
};
export default AppBar;
