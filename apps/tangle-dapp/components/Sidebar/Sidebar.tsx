'use client';

import { SideBar as SideBarCmp } from '@webb-tools/webb-ui-components';
import { setSidebarCookieOnToggle } from '@webb-tools/webb-ui-components/next-utils';
import { usePathname } from 'next/navigation';
import { type FC, useMemo } from 'react';

import useNetworkState from '../../hooks/useNetworkState';
import getSidebarProps from './sidebarProps';

interface SidebarProps {
  isExpandedAtDefault?: boolean;
}

const Sidebar: FC<SidebarProps> = ({ isExpandedAtDefault }) => {
  const pathname = usePathname();
  const { network } = useNetworkState();

  const sidebarProps = useMemo(
    () =>
      getSidebarProps(network?.polkadotExplorerUrl, network?.evmExplorerUrl),
    [network]
  );

  return (
    <SideBarCmp
      {...sidebarProps}
      pathnameOrHash={pathname}
      className="hidden lg:block !z-0"
      isExpandedAtDefault={isExpandedAtDefault}
      onSideBarToggle={() => setSidebarCookieOnToggle()}
    />
  );
};

export default Sidebar;
