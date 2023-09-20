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
    webbtTNT: '0x210898d3D331803aCef9a5E39d9B252914D760EF',
  },
};

export default tokens;
