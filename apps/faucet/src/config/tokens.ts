import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';

// Record of token symbol to token address
type TokenConfigType = Record<string, string>;

// TODO: We should fetch the token info (e.g. symbol, decimals, name, ...) from the chain
const tokens: Record<string, TokenConfigType> = {
  [PresetTypedChainId.AthenaOrbit]: {
    webbtTNT: '0x6aBC6e8E4E4a1fcB43341CeC49cBd5FA3b494520',
  },
  [PresetTypedChainId.HermesOrbit]: {
    webbtTNT: '0x6aBC6e8E4E4a1fcB43341CeC49cBd5FA3b494520',
  },
  [PresetTypedChainId.DemeterOrbit]: {
    webbtTNT: '0x6aBC6e8E4E4a1fcB43341CeC49cBd5FA3b494520',
  },
  [PresetTypedChainId.TangleTestnet]: {
    webbtTNT: '0x6aBC6e8E4E4a1fcB43341CeC49cBd5FA3b494520',
  },
};

export default tokens;
