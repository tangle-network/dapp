'use client';

import { useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import getSidebarProps from './sidebarProps';

export default function useSidebarProps() {
  const { network } = useNetworkStore();

  const sidebarProps = useMemo(
    () =>
      getSidebarProps({
        polkadotJsDashboardUrl: network.polkadotJsDashboardUrl,
        nativeExplorerUrl: network.nativeExplorerUrl,
        evmExplorerUrl: network.evmExplorerUrl,
      }),
    [
      network.evmExplorerUrl,
      network.nativeExplorerUrl,
      network.polkadotJsDashboardUrl,
    ],
  );

  return sidebarProps;
}
