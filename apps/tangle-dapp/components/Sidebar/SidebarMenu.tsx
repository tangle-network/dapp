'use client';

import { SideBarMenu as SideBarMenuCmp } from '@webb-tools/webb-ui-components';
import { usePathname } from 'next/navigation';
import { FC, useMemo } from 'react';

import useNetworkState from '../../hooks/useNetworkState';
import getSidebarProps from './sidebarProps';

const SidebarMenu: FC = () => {
  const pathname = usePathname();
  const { network } = useNetworkState();

  const sidebarProps = useMemo(
    () =>
      getSidebarProps(network?.polkadotExplorerUrl, network?.evmExplorerUrl),
    [network?.evmExplorerUrl, network?.polkadotExplorerUrl]
  );

  return (
    <SideBarMenuCmp
      {...sidebarProps}
      pathnameOrHash={pathname}
      className="lg:hidden"
    />
  );
};

export default SidebarMenu;
