'use client';

import { SideBar as SideBarCmp } from '@webb-tools/webb-ui-components';
import { setSideBarCookieOnToggle } from '@webb-tools/webb-ui-components/next-utils';
import { usePathname } from 'next/navigation';
import { type FC, useMemo } from 'react';

import useNetworkState from '../../hooks/useNetworkState';
import getSideBarProps from './sideBarProps';

interface SideBarProps {
  isExpandedAtDefault?: boolean;
}

const SideBar: FC<SideBarProps> = ({ isExpandedAtDefault }) => {
  const pathname = usePathname();
  const { network } = useNetworkState();

  const sideBarProps = useMemo(
    () =>
      getSideBarProps(network?.polkadotExplorerUrl, network?.evmExplorerUrl),
    [network]
  );

  return (
    <SideBarCmp
      {...sideBarProps}
      pathnameOrHash={pathname}
      className="hidden lg:block !z-0"
      isExpandedAtDefault={isExpandedAtDefault}
      onSideBarToggle={() => setSideBarCookieOnToggle()}
    />
  );
};

export default SideBar;
