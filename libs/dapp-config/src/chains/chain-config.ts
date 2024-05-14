import { ChainConfig } from './chain-config.interface.js';
import { chainsConfig as EvmNetworks } from './evm/index.js';
import { chainsConfig as SubstrateNetworks } from './substrate/index.js';

export const chainsConfig: Record<number, ChainConfig> = {
  ...EvmNetworks,
  ...SubstrateNetworks,
};
