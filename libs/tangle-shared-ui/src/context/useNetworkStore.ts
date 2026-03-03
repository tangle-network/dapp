'use client';

import { Network } from '@tangle-network/ui-components/constants/networks';
import { create } from 'zustand';

import { DEFAULT_NETWORK, DEFAULT_EVM_NETWORK } from '../constants/networks';
import { TangleTokenSymbol } from '../types';

/**
 * A store for Network info to use when creating/using
 * Polkadot API instances.
 *
 * - `network`: Legacy field for Substrate-based networks
 * - `network2`: Current EVM network (used by NetworkSelectionButton)
 */
const useNetworkStore = create<{
  network: Network;
  network2: Network;
  setNetwork: (network: Network) => void;
  nativeTokenSymbol: TangleTokenSymbol;
}>((set) => ({
  network: DEFAULT_NETWORK,
  network2: DEFAULT_EVM_NETWORK,
  nativeTokenSymbol: DEFAULT_NETWORK.tokenSymbol,
  setNetwork: (network) =>
    set({
      network,
      network2: network,
      nativeTokenSymbol: network.tokenSymbol,
    }),
}));

export default useNetworkStore;
