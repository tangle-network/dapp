import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { useMemo } from 'react';

import getSidebarProps from './sidebarProps';

export default function useSidebarProps() {
  const { network } = useNetworkStore();

  const sidebarProps = useMemo(
    () =>
      getSidebarProps({
        polkadotJsDashboardUrl: network.polkadotJsDashboardUrl,
        nativeExplorerUrl: network.explorerUrl,
        evmExplorerUrl: network.evmExplorerUrl,
      }),
    [
      network.evmExplorerUrl,
      network.explorerUrl,
      network.polkadotJsDashboardUrl,
    ],
  );

  return sidebarProps;
}
