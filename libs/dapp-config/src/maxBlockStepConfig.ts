import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';

export type MaxBlockStepConfigType = {
  default: number;
  [typedChainId: number]: number;
};

const maxBlockStepCfg: MaxBlockStepConfigType = {
  default: 2_048,

  [PresetTypedChainId.ArbitrumTestnet]: 16_777_216,
};

export default maxBlockStepCfg;
