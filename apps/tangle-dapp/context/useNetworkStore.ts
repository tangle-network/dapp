'use client';

import { Network } from '@webb-tools/webb-ui-components/constants/networks';
import { create } from 'zustand';

import { DEFAULT_NETWORK } from '../constants/networks';

/**
 * A store for Network info to use when creating/using
 * Polkadot API instances.
 */
const useNetworkStore = create<{
  rpcEndpoint: string;
  network: Network;
  setNetwork: (network: Network) => void;
  nativeTokenSymbol: string;
}>((set) => ({
  rpcEndpoint: DEFAULT_NETWORK.wsRpcEndpoint,
  network: DEFAULT_NETWORK,
  nativeTokenSymbol: DEFAULT_NETWORK.nativeTokenSymbol,
  setNetwork: (network) =>
    set({
      network,
      rpcEndpoint: network.wsRpcEndpoint,
      nativeTokenSymbol: network.nativeTokenSymbol,
    }),
}));

export default useNetworkStore;
