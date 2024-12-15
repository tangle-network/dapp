import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { useMemo } from 'react';

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
