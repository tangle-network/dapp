import IPDisplay from '@webb-dapp/react-components/IPDisplay/IPDisplay';
import { useStore } from '@webb-dapp/react-environment';
import { SpaceBox } from '@webb-dapp/ui-components';
import { CloseButton } from '@webb-dapp/ui-components/Buttons/CloseButton';
import React, { FC, useMemo, useState } from 'react';
import styled from 'styled-components';

import { ThemeSwitcher } from '../AppBar/ThemeSwitcher';
import { WebbFullNameLogo } from '../assets/WebbFullNameLogo';
import { SidebarActiveContext } from './context';
import { Products } from './Products';
import { SocialPlatform } from './SocialPlatform';
import { SidebarConfig } from './types';

interface SidebarProps {
  collapse: boolean;
  isMobile: boolean;
  config: SidebarConfig;
  setSidebarDisplay: (value: boolean) => void;
}

const SidebarRoot = styled.div<{ collapse: boolean; isMobile: boolean }>`
  position: ${({ isMobile }) => (isMobile ? 'fixed' : 'relative')};
  display: ${({ collapse }): string => (collapse ? 'none' : 'flex')};
  flex-direction: column;
  height: 100vh;
  width: ${({ isMobile }): string => (isMobile ? '100vw' : '200px')};
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  transition: width 500ms ease;
  background: ${({ theme }) => theme.menuBackground};
  z-index: 300;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 20px;
`;

export const Sidebar: FC<SidebarProps> = ({ collapse, config, isMobile, setSidebarDisplay }) => {
  const [active, setActive] = useState<HTMLElement | null>(null);
  const data = useMemo(
    () => ({
      active,
      setActive,
    }),
    [active, setActive]
  );
  const { setTheme, theme } = useStore('ui');
  const isDarkTheme = theme === 'dark';

  return useMemo(
    () => (
      <SidebarActiveContext.Provider value={data}>
        <SidebarRoot collapse={collapse} isMobile={isMobile}>
          <LogoContainer>
            <div className={'webb-logo'}>
              <WebbFullNameLogo />
            </div>
            {isMobile && <CloseButton onClick={() => setSidebarDisplay(false)} />}
          </LogoContainer>
          <IPDisplay />
          <SpaceBox height={16} />
          {config.products ? <Products collapse={collapse} data={config.products} /> : null}
          <ThemeSwitcher
            active={isDarkTheme ? 'dark' : 'light'}
            onChange={(next) => {
              setTheme(next === 'light' ? 'default' : 'dark');
            }}
          />
          <div style={{ height: '10px' }}></div>
          {config.socialPlatforms ? <SocialPlatform collapse={collapse} data={config.socialPlatforms} /> : null}
        </SidebarRoot>
      </SidebarActiveContext.Provider>
    ),
    [data, collapse, isMobile, config.products, config.socialPlatforms, isDarkTheme, setSidebarDisplay, setTheme]
  );
};
