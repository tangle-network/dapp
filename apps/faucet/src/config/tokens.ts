import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';

// Record of token symbol to token address
type TokenConfigType = Record<string, string>;

// TODO: We should fetch the token info (e.g. symbol, decimals, name, ...) from the chain
const tokens: Record<string, TokenConfigType> = {
  [PresetTypedChainId.AthenaOrbit]: {
    webbtTNT: '0x631f0dAfEC5ECd9391FAA65830Cb19fD7e156EE8',
  },
  [PresetTypedChainId.HermesOrbit]: {
    webbtTNT: '0x631f0dAfEC5ECd9391FAA65830Cb19fD7e156EE8',
  },
  [PresetTypedChainId.DemeterOrbit]: {
    webbtTNT: '0x631f0dAfEC5ECd9391FAA65830Cb19fD7e156EE8',
  },
};

export default tokens;
