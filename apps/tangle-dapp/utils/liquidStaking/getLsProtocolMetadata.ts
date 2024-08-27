import {
  LS_ETHEREUM_MAINNET_LIQUIFIER,
  LS_TANGLE_RESTAKING_PARACHAIN,
} from '../../constants/liquidStaking/constants';
import { LsProtocolType } from '../../constants/liquidStaking/types';

const getLsProtocolTypeMetadata = (protocolType: LsProtocolType) => {
  switch (protocolType) {
    case LsProtocolType.ETHEREUM_MAINNET_LIQUIFIER:
      return LS_ETHEREUM_MAINNET_LIQUIFIER;
    case LsProtocolType.TANGLE_RESTAKING_PARACHAIN:
      return LS_TANGLE_RESTAKING_PARACHAIN;
  }
};

export default getLsProtocolTypeMetadata;
