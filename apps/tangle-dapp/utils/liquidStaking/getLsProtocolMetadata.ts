import {
  LS_ETHEREUM_MAINNET_LIQUIFIER,
  LS_TANGLE_RESTAKING_PARACHAIN,
} from '../../constants/liquidStaking/constants';
import { LsProtocolNetworkId } from '../../constants/liquidStaking/types';

const getLsProtocolNetwork = (protocolType: LsProtocolNetworkId) => {
  switch (protocolType) {
    case LsProtocolNetworkId.ETHEREUM_MAINNET_LIQUIFIER:
      return LS_ETHEREUM_MAINNET_LIQUIFIER;
    case LsProtocolNetworkId.TANGLE_RESTAKING_PARACHAIN:
      return LS_TANGLE_RESTAKING_PARACHAIN;
  }
};

export default getLsProtocolNetwork;
