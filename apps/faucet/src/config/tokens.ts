import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { zeroAddress } from 'viem';

// Record of token symbol to token address
type TokenConfigType = Record<string, string>;

// TODO: We should fetch the token info (e.g. symbol, decimals, name, ...) from the chain
const tokens: Record<string, TokenConfigType> = {
  [PresetTypedChainId.AthenaOrbit]: {
    ETH: zeroAddress,
  },
  [PresetTypedChainId.HermesOrbit]: {
    ETH: zeroAddress,
  },
  [PresetTypedChainId.DemeterOrbit]: {
    ETH: zeroAddress,
  },
  [PresetTypedChainId.TangleTestnet]: {
    tTNT: zeroAddress,
    webbtTNT: '0x58BA29259Aab901179A07899235e3CB88afE9079',
  },
};

export default tokens;
