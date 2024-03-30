import { WEBB_NETWORKS } from '@webb-tools/webb-ui-components/constants';
import { TANGLE_TESTNET_NATIVE_NETWORK } from '@webb-tools/webb-ui-components/constants';

import { NetworkFeature } from '../types';

export const DEFAULT_NETWORK = TANGLE_TESTNET_NATIVE_NETWORK;

export const ALL_WEBB_NETWORKS = WEBB_NETWORKS.flatMap(
  (network) => network.networks
);

export const LIVE_AND_TEST_NETWORKS = ALL_WEBB_NETWORKS.filter(
  (network) =>
    network.networkType === 'live' || network.networkType === 'testnet'
);

export const DEV_NETWORKS = ALL_WEBB_NETWORKS.filter(
  (network) => network.networkType === 'dev'
);

export const NETWORK_FEATURE_MAP: Record<string, NetworkFeature[] | undefined> =
  {
    [TANGLE_TESTNET_NATIVE_NETWORK.name]: [NetworkFeature.Faucet],
  };
