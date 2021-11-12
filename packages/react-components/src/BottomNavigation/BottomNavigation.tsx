import { useDimensions } from '@webb-dapp/react-environment/layout';
import { basePallet } from '@webb-dapp/ui-components/styling/colors/base-pallet';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const BottomNavigationWrapper = styled.nav`
  max-height: 55px;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;
type BottomNavigationProps = {};
const NavigationWrapper = styled.ul`
  height: 100%;
  display: flex;
  margin: auto;
  padding: 0;
  list-style: none;

  li {
    a {
      font-size: 0.76rem;
      white-space: nowrap;
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
        background: ${basePallet.primary};
        border-radius: 16px;
        position: absolute;
        bottom: -3px;
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
          background: ${basePallet.primary};
          border-radius: 16px;
          position: absolute;

          left: 5%;
        }
      }
    }
  }
`;

export const BottomNavigation: React.FC<BottomNavigationProps> = () => {
  const { size, width } = useDimensions();
  const isMobile = useMemo(() => {
    return width <= size.sm;
  }, [width, size]);
  if (!isMobile) {
    return null;
  }
  return (
    <BottomNavigationWrapper>
      <ul>
        <NavigationWrapper>
          <li className={'active'}>
            <NavLink to={'/mixer'} activeclassname={'active'}>
              zkBridge
            </NavLink>
          </li>
          <li>
            <NavLink to={'/statistics'}>Statistics</NavLink>
          </li>
          <li>
            <NavLink to={'/governance'}>Governance</NavLink>
          </li>
          <li>
            <NavLink to={'/how-it-works'}>How it works</NavLink>
          </li>
        </NavigationWrapper>
      </ul>
    </BottomNavigationWrapper>
  );
};
