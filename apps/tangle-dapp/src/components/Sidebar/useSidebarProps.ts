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
        evmExplorerUrl: network.evmExplorerUrl,
        networkFeatures,
      }),
    [network.evmExplorerUrl, networkFeatures],
  );

  return sidebarProps;
}
