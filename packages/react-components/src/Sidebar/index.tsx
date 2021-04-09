import { useApi, useSetting } from '@webb-dapp/react-hooks';
import { styled } from '@webb-dapp/ui-components';
import React, { FC, useMemo, useState } from 'react';

import { Account } from './Account';
import { SidebarActiveContext } from './context';
import { Logo } from './Logo';
import { Products } from './Products';
import { Slider } from './Slider';
import { SocialPlatform } from './SocialPlatform';
import { SidebarConfig } from './types';

export * from './types';

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
  background: var(--card-background);
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
  const { chainInfo } = useApi();
  const { selectableEndpoints } = useSetting();

  const products = useMemo(() => {
    const connected = chainInfo;

    return config.products?.filter((product) => {
      const itemFeatures = product.requiredFeatures;
      const selectedEndpoint = Object.values(selectableEndpoints)
        .flat()
        .filter(
          (endpoint) => String(endpoint.name).toLocaleLowerCase() == String(connected.chainName).toLocaleLowerCase()
        );

      if (!selectedEndpoint[0] || !itemFeatures) {
        return false;
      }

      return itemFeatures.reduce((acc: boolean, reqFeat) => {
        return acc && selectedEndpoint[0].features[reqFeat];
      }, true);
    });
  }, [chainInfo, config.products, selectableEndpoints]);

  return useMemo(
    () => (
      <SidebarActiveContext.Provider value={data}>
        <SidebarRoot collapse={collapse}>
          <Logo collapse={collapse} />

          {showAccount ? <Account collapse={collapse} /> : null}
          {products ? <Products collapse={collapse} data={products} /> : null}
          {config.socialPlatforms ? <SocialPlatform collapse={collapse} data={config.socialPlatforms} /> : null}
          <Slider target={active} />
        </SidebarRoot>
      </SidebarActiveContext.Provider>
    ),
    [data, collapse, showAccount, products, config.socialPlatforms, active]
  );
};
