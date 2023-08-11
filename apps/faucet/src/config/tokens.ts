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
    webbtTNT: '0x1920d33AB0EC499b23Ca655a690164961c63A076',
  },
};

export default tokens;
