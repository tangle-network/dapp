import {
  LS_TANGLE_LOCAL,
  LS_TANGLE_MAINNET,
  LS_TANGLE_RESTAKING_PARACHAIN,
  LS_TANGLE_TESTNET,
} from '../../constants/liquidStaking/constants';
import { LsNetwork, LsNetworkId } from '../../constants/liquidStaking/types';

const getLsNetwork = (networkId: LsNetworkId): LsNetwork => {
  switch (networkId) {
    case LsNetworkId.TANGLE_RESTAKING_PARACHAIN:
      return LS_TANGLE_RESTAKING_PARACHAIN;
    case LsNetworkId.TANGLE_MAINNET:
      return LS_TANGLE_MAINNET;
    case LsNetworkId.TANGLE_TESTNET:
      return LS_TANGLE_TESTNET;
    case LsNetworkId.TANGLE_LOCAL:
      return LS_TANGLE_LOCAL;
  }
};

export default getLsNetwork;
