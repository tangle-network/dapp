'use client';

import { useEffect } from 'react';
import { useChainId, useAccount } from 'wagmi';
import {
  Network,
  NETWORK_MAP,
} from '@tangle-network/ui-components/constants/networks';
import useNetworkStore from '../context/useNetworkStore';

/**
 * Hook that syncs the network store with wagmi's current chain.
 * Should be used once at the app provider level.
 *
 * @param availableNetworks - Optional list of networks to match against.
 *   If provided, only networks in this list will be synced.
 */
const useNetworkSync = (availableNetworks?: Network[]) => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const setNetwork = useNetworkStore((store) => store.setNetwork);
  const currentNetwork = useNetworkStore((store) => store.network2);

  useEffect(() => {
    // Only sync when connected and chainId changes
    if (!isConnected || !chainId) {
      return;
    }

    // Find network matching the current chain ID
    let matchedNetwork: Network | undefined;

    if (availableNetworks) {
      // Match against provided networks
      matchedNetwork = availableNetworks.find(
        (network) => network.evmChainId === chainId,
      );
    } else {
      // Match against all known networks
      matchedNetwork = Object.values(NETWORK_MAP).find(
        (network) => network?.evmChainId === chainId,
      );
    }

    // Only update if we found a match and it's different from current
    if (matchedNetwork && matchedNetwork.id !== currentNetwork?.id) {
      setNetwork(matchedNetwork);
    }
  }, [chainId, isConnected, availableNetworks, setNetwork, currentNetwork?.id]);
};

export default useNetworkSync;
