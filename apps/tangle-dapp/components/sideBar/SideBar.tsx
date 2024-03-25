'use client';

import { SideBar as SideBarCmp } from '@webb-tools/webb-ui-components';
import { setSideBarCookieOnToggle } from '@webb-tools/webb-ui-components/next-utils';
import { usePathname } from 'next/navigation';
import { type FC } from 'react';

import useNetworkState from '../../hooks/useNetworkState';
import getSideBarProps from './sideBarProps';

interface SideBarProps {
  isExpandedAtDefault?: boolean;
}

const SideBar: FC<SideBarProps> = ({ isExpandedAtDefault }) => {
  const pathname = usePathname();
  const { network } = useNetworkState();
  console.log('network :', network);

  const sideBarProps = getSideBarProps(
    network?.polkadotExplorer,
    network?.evmExplorer
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
