'use client';

import { Network } from '@tangle-network/ui-components/constants/networks';
import { create } from 'zustand';

import { DEFAULT_NETWORK } from '../constants/networks';
import { TangleTokenSymbol } from '../types';

/**
 * A store for Network info to use when creating/using
 * Polkadot API instances.
 */
const useNetworkStore = create<{
  network: Network;
  network2?: Network;
  setNetwork: (network: Network) => void;
  nativeTokenSymbol: TangleTokenSymbol;
}>((set) => ({
  network: DEFAULT_NETWORK,
  nativeTokenSymbol: DEFAULT_NETWORK.tokenSymbol,
  setNetwork: (network) =>
    set({
      network,
      network2: network,
      nativeTokenSymbol: network.tokenSymbol,
    }),
}));

export default useNetworkStore;
