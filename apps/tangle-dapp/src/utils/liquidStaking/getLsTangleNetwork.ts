import {
  Network,
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_MAINNET_NETWORK,
  TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK,
  TANGLE_RESTAKING_PARACHAIN_TESTNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
} from '@webb-tools/webb-ui-components/constants/networks';

import { IS_PRODUCTION_ENV } from '../../constants/env';
import { LsNetworkId } from '../../constants/liquidStaking/types';

// TODO: Obtain the Tangle network directly from the adapter's `tangleNetwork` property instead of using this helper method.
const getLsTangleNetwork = (networkId: LsNetworkId): Network => {
  switch (networkId) {
    case LsNetworkId.TANGLE_MAINNET:
      return TANGLE_MAINNET_NETWORK;
    case LsNetworkId.TANGLE_TESTNET:
      return TANGLE_TESTNET_NATIVE_NETWORK;
    case LsNetworkId.TANGLE_LOCAL:
      return TANGLE_LOCAL_DEV_NETWORK;
    case LsNetworkId.TANGLE_RESTAKING_PARACHAIN:
      return IS_PRODUCTION_ENV
        ? TANGLE_RESTAKING_PARACHAIN_TESTNET_NETWORK
        : TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK;
  }
};

export default getLsTangleNetwork;
