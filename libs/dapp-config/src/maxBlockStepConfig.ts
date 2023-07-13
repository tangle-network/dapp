import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';

export type MaxBlockStepConfigType = {
  default: number;
  [typedChainId: number]: number;
};

const maxBlockStepCfg: MaxBlockStepConfigType = {
  default: 2048,

  [PresetTypedChainId.ArbitrumTestnet]: 262144,
};

export default maxBlockStepCfg;
