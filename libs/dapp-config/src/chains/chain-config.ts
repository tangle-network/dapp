import { ChainConfig } from './chain-config.interface';
import { chainsConfig as EvmNetworks } from './evm';
import { chainsConfig as SubstrateNetworks } from './substrate';

export const chainsConfig: Record<number, ChainConfig> = {
  ...EvmNetworks,
  ...SubstrateNetworks,
};
