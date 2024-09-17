import {
  LS_ETHEREUM_MAINNET_LIQUIFIER,
  LS_TANGLE_MAINNET,
  LS_TANGLE_RESTAKING_PARACHAIN,
} from '../../constants/liquidStaking/constants';
import { LsNetwork, LsNetworkId } from '../../constants/liquidStaking/types';

const getLsNetwork = (networkId: LsNetworkId): LsNetwork => {
  switch (networkId) {
    case LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER:
      return LS_ETHEREUM_MAINNET_LIQUIFIER;
    case LsNetworkId.TANGLE_RESTAKING_PARACHAIN:
      return LS_TANGLE_RESTAKING_PARACHAIN;
    case LsNetworkId.TANGLE_MAINNET:
      return LS_TANGLE_MAINNET;
  }
};

export default getLsNetwork;
