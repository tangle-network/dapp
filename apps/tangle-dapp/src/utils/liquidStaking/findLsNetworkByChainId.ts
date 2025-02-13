import {
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_MAINNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
} from '@tangle-network/ui-components/constants/networks';
import { LsNetworkId } from '../../constants/liquidStaking/types';

const findLsNetworkByChainId = (networkId: number): LsNetworkId | null => {
  switch (networkId) {
    case TANGLE_LOCAL_DEV_NETWORK.id:
      return LsNetworkId.TANGLE_LOCAL;
    case TANGLE_TESTNET_NATIVE_NETWORK.id:
      return LsNetworkId.TANGLE_TESTNET;
    case TANGLE_MAINNET_NETWORK.id:
      return LsNetworkId.TANGLE_MAINNET;
    default:
      return null;
  }
};

export default findLsNetworkByChainId;
