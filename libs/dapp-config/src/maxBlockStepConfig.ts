import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';

export type MaxBlockStepConfigType = {
  default: number;
  [typedChainId: number]: number;
};

/**
 * The max block step is used to determine
 * the maximum number of blocks to fetch per request.
 */
const maxBlockStepCfg: MaxBlockStepConfigType = {
  default: 2 ** 11,

  [PresetTypedChainId.ArbitrumTestnet]: 2 ** 24,

  [PresetTypedChainId.Goerli]: 2 ** 11,

  [PresetTypedChainId.MoonbaseAlpha]: 2 ** 13,

  [PresetTypedChainId.PolygonTestnet]: 2 ** 17,

  [PresetTypedChainId.Sepolia]: 2 ** 15,

  [PresetTypedChainId.AvalancheFuji]: 2 ** 11,

  [PresetTypedChainId.ScrollAlpha]: 2 ** 20,
};

export default maxBlockStepCfg;
