import React, { FC, useMemo, useState } from 'react';

import { styled } from '@webb-dapp/ui-components';

import { SidebarConfig } from './types';
import { Logo } from './Logo';
import { Products } from './Products';
import { SocialPlatform } from './SocialPlatform';
import { Account } from './Account';
import { ChainName } from '../ChainName';
import { SidebarActiveContext } from './context';
import { Slider } from './Slider';

export * from './types';

const CChainName = styled(ChainName)`
  margin: 16px 0;
`;

interface SidebarProps {
  showAccount: boolean;
  collapse: boolean;
  config: SidebarConfig;
}

const SidebarRoot = styled.div<{ collapse: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: ${({ collapse }): string => (collapse ? '68px' : '240px')};
  box-shadow: 0 20px 20px 0 rgba(12, 28, 90, 0.09);
  transition: width 500ms ease;
`;

export const Sidebar: FC<SidebarProps> = ({ collapse, config, showAccount = true }) => {
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
        <SidebarRoot collapse={collapse}>
          <Logo collapse={collapse} />
          <CChainName collapse={collapse} />
          {showAccount ? <Account collapse={collapse} /> : null}
          {config.products ? <Products collapse={collapse} data={config.products} /> : null}
          {config.socialPlatforms ? <SocialPlatform collapse={collapse} data={config.socialPlatforms} /> : null}
          <Slider target={active} />
        </SidebarRoot>
      </SidebarActiveContext.Provider>
    ),
    [active, collapse, data, config, showAccount]
  );
};
