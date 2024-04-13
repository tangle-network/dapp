import {
  TANGLE_MAINNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
} from '@webb-tools/webb-ui-components/constants/networks';

import { NetworkFeature } from '../types';

export const DEFAULT_NETWORK = TANGLE_MAINNET_NETWORK;

export const NETWORK_FEATURE_MAP: Record<string, NetworkFeature[] | undefined> =
  {
    [TANGLE_TESTNET_NATIVE_NETWORK.name]: [NetworkFeature.Faucet],
  };
