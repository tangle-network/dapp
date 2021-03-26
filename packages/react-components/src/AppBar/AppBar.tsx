import React from 'react';
import styled from 'styled-components';
import { ReactComponent as WebbLogo } from '@webb-dapp/react-components/assets/webb-icon.svg';
import { NavLink } from 'react-router-dom';
import { basePallet } from '@webb-dapp/ui-components/styling/colors/base-pallet';

import { Text } from '../Text/Text';

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
      height: 100%;
      min-width: 70px;
      margin: 0 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 0 5px;

      :after {
        content: '';
        display: block;
        height: 5px;
        width: 100%;
        background: ${basePallet.primary};
        border-radius: 16px;
        position: absolute;
        bottom: 0;
      }
    }
  }
`;
type AppBarProps = {};

const AppBar: React.FC<AppBarProps> = ({}) => {
  return (
    <AppBarWrapper>
      <WebbLogo className={'webb-logo'} />
      <ul>
        <li>
          <Text color={'primary'}>zkProff</Text>
        </li>
        <li>
          <NavLink to={'/governance'}>zkProof</NavLink>
        </li>
        <li>
          <NavLink to={'/how-it-works'}>how it works</NavLink>
        </li>
      </ul>
    </AppBarWrapper>
  );
};
export default AppBar;
