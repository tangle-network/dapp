import IPDisplay from '@webb-dapp/react-components/IPDisplay/IPDisplay';
import { SpaceBox } from '@webb-dapp/ui-components';
import { CloseButton } from '@webb-dapp/ui-components/Buttons/CloseButton';
import { Logo } from '@webb-dapp/webb-ui-components';
import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';

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
  min-width: ${({ isMobile }) => (isMobile ? '100vw' : '230px')};
  max-width: ${({ isMobile }) => (isMobile ? '100vw' : '230px')};
  width: ${({ isMobile }): string => (isMobile ? '100vw' : '230px')};
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

  return useMemo(
    () => (
      <SidebarActiveContext.Provider value={data}>
        <SidebarRoot collapse={collapse} isMobile={isMobile}>
          <LogoContainer>
            <div className={'webb-logo'}>
              <Logo />
            </div>
            {isMobile && <CloseButton onClick={() => setSidebarDisplay(false)} />}
          </LogoContainer>
          <IPDisplay />
          <SpaceBox height={16} />
          {config.products ? <Products collapse={collapse} data={config.products} /> : null}
          {config.socialPlatforms ? <SocialPlatform collapse={collapse} data={config.socialPlatforms} /> : null}
        </SidebarRoot>
      </SidebarActiveContext.Provider>
    ),
    [data, collapse, isMobile, config.products, config.socialPlatforms, setSidebarDisplay]
  );
};
