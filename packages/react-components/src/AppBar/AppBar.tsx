import { Icon, IconButton } from '@mui/material';
import WEBBLogo from '@webb-dapp/apps/configs/logos/chains/WebbLogo';
import { useStore, useWebContext } from '@webb-dapp/react-environment';
import { useDimensions } from '@webb-dapp/react-environment/layout';
import { WalletSelect } from '@webb-dapp/ui-components/Inputs/WalletSelect/WalletSelect';
import { NetworkManager } from '@webb-dapp/ui-components/NetworkManager/NetworkManager';
import { FontFamilies } from '@webb-dapp/ui-components/styling/fonts/font-families.enum';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { Avatar, ThemeSwitcher as NewThemeSwitcher } from '@webb-dapp/webb-ui-components';
import { Typography } from '@webb-dapp/webb-ui-components/typograhy';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { NoteAccount } from '../NoteAccount/NoteAccount';
import { ThemeSwitcher } from './ThemeSwitcher';

const AppBarWrapper = styled.div`
  max-height: 65px;
  width: 100%;
  margin: auto;
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  z-index: 100;

  background: ${({ theme }) => theme.mainBackground};
  .webb-logo {
    width: 75px;
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

const LowerSection = styled.div`
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: center;
`;

const RightNavigation = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;

  .theme-wrapper {
    ${above.xs`
      margin-right: 0.5rem;
    `}
  }
`;

type AppBarProps = {
  toggleSidebarDisplay: () => void;
};

const AppBar: React.FC<AppBarProps> = ({ toggleSidebarDisplay }) => {
  const { activeChain, noteManager: noteAccount } = useWebContext();
  const { size, width } = useDimensions();
  const isMobile = useMemo(() => {
    return width <= size.sm;
  }, [width, size]);
  const { pageTitle, setTheme, theme } = useStore('ui');

  return isMobile ? (
    <>
      <AppBarWrapper>
        <div className={'webb-logo'}>
          <WEBBLogo />
        </div>
        <RightNavigation>
          <NetworkManager />
          <div className='theme-wrapper'>
            <ThemeSwitcher
              active={theme === 'dark' ? 'dark' : 'light'}
              onChange={(next) => {
                setTheme(next === 'light' ? 'default' : 'dark');
              }}
            />
            <NewThemeSwitcher />
          </div>
          <IconButton onClick={toggleSidebarDisplay}>
            <Icon>menu</Icon>
          </IconButton>
        </RightNavigation>
      </AppBarWrapper>
      <LowerSection>
        <Typography variant='h3' fw='bold'>
          {pageTitle?.toString()}
        </Typography>
      </LowerSection>
    </>
  ) : (
    <AppBarWrapper>
      <Typography variant='h3' fw='bold' className='mr-4'>
        {pageTitle?.toString()}
      </Typography>
      <Avatar src='https://broken.link.com/broken-pic.jpg' alt='Haha' size='md' fallback='SA' />
      <RightNavigation>
        <NetworkManager />
        {activeChain && <WalletSelect />}
        <NoteAccount />
        <ThemeSwitcher
          active={theme === 'dark' ? 'dark' : 'light'}
          onChange={(next) => {
            setTheme(next === 'light' ? 'default' : 'dark');
          }}
        />
        <NewThemeSwitcher />
      </RightNavigation>
    </AppBarWrapper>
  );
};
export default AppBar;
