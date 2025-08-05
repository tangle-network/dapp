import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { useMemo } from 'react';

import getSidebarProps from './sidebarProps';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';

export default function useSidebarProps() {
  const { network } = useNetworkStore();
  const networkFeatures = useNetworkFeatures();

  const sidebarProps = useMemo(
    () =>
      getSidebarProps({
        polkadotJsDashboardUrl: network.polkadotJsDashboardUrl,
        nativeExplorerUrl: network.explorerUrl,
        evmExplorerUrl: network.evmExplorerUrl,
        networkFeatures,
      }),
    [
      network.evmExplorerUrl,
      network.explorerUrl,
      network.polkadotJsDashboardUrl,
      networkFeatures,
    ],
  );

  return sidebarProps;
}
