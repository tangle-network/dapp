import {
  NetworkId,
  TANGLE_MAINNET_NETWORK,
} from '@webb-tools/webb-ui-components/constants/networks';

import { NetworkFeature } from '../types';

export const DEFAULT_NETWORK = TANGLE_MAINNET_NETWORK;

export const NETWORK_FEATURE_MAP: Record<NetworkId, NetworkFeature[]> = {
  [NetworkId.TANGLE_TESTNET]: [NetworkFeature.Faucet],
  [NetworkId.TANGLE_MAINNET]: [NetworkFeature.EraStakersOverview],
  // Assume that local and custom endpoints are using an updated runtime
  // version which includes support for the era stakers overview query.
  [NetworkId.TANGLE_LOCAL_DEV]: [NetworkFeature.EraStakersOverview],
  [NetworkId.CUSTOM]: [NetworkFeature.EraStakersOverview],
  [NetworkId.TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV]: [],
};
