'use client';

import { SideBarMenu as SideBarMenuCmp } from '@webb-tools/webb-ui-components';
import { usePathname } from 'next/navigation';
import { FC } from 'react';

import useNetworkState from '../../hooks/useNetworkState';
import getSideBarProps from './sideBarProps';

const SideBarMenu: FC = () => {
  const pathname = usePathname();
  const { network } = useNetworkState();

  const sideBarProps = getSideBarProps(
    network?.polkadotExplorerUrl,
    network?.evmExplorerUrl
  );

  return (
    <SideBarMenuCmp
      {...sideBarProps}
      pathnameOrHash={pathname}
      className="lg:hidden"
    />
  );
};

export default SideBarMenu;
