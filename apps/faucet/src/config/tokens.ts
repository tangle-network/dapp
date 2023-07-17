import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';

// Record of token symbol to token address
type TokenConfigType = Record<string, string>;

// TODO: We should fetch the token info (e.g. symbol, decimals, name, ...) from the chain
const tokens: Record<string, TokenConfigType> = {
  [PresetTypedChainId.AthenaOrbit]: {
    webbWETH: '0x915EbFAd9c4Af2F420782a5F03BD544f9a1FF1d1',
  },
  [PresetTypedChainId.HermesOrbit]: {
    webbWETH: '0x915EbFAd9c4Af2F420782a5F03BD544f9a1FF1d1',
  },
  [PresetTypedChainId.DemeterOrbit]: {
    webbWETH: '0x915EbFAd9c4Af2F420782a5F03BD544f9a1FF1d1',
  },
};

export default tokens;
