import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
import { zeroAddress } from 'viem';

// Record of token symbol to token address
type TokenConfigType = Record<string, string>;

// TODO: We should fetch the token info (e.g. symbol, decimals, name, ...) from the chain
const tokens: Record<string, TokenConfigType> = {
  [PresetTypedChainId.AthenaOrbit]: {
    ETH: zeroAddress,
    webbtTNT: '0x7F07E8FF927DA7a900f1876Be7FE87Eb61cCeF6F',
  },
  [PresetTypedChainId.HermesOrbit]: {
    ETH: zeroAddress,
    webbtTNT: '0x7F07E8FF927DA7a900f1876Be7FE87Eb61cCeF6F',
  },
  [PresetTypedChainId.DemeterOrbit]: {
    ETH: zeroAddress,
    webbtTNT: '0x7F07E8FF927DA7a900f1876Be7FE87Eb61cCeF6F',
  },
  [PresetTypedChainId.TangleTestnet]: {
    tTNT: zeroAddress,
    webbtTNT: '0x7F07E8FF927DA7a900f1876Be7FE87Eb61cCeF6F',
  },
};

export default tokens;
