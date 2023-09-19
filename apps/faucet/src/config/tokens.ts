import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { zeroAddress } from 'viem';

// Record of token symbol to token address
type TokenConfigType = Record<string, string>;

// TODO: We should fetch the token info (e.g. symbol, decimals, name, ...) from the chain
const tokens: Record<string, TokenConfigType> = {
  [PresetTypedChainId.AthenaOrbit]: {
    ORBt: zeroAddress,
  },
  [PresetTypedChainId.HermesOrbit]: {
    ORBt: zeroAddress,
  },
  [PresetTypedChainId.DemeterOrbit]: {
    ORBt: zeroAddress,
  },
  [PresetTypedChainId.TangleTestnet]: {
    tTNT: zeroAddress,
    webbtTNT: '0xEcb698796cf96be16D7f5Bc8997fd13677409d2b',
  },
};

export default tokens;
