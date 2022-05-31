import { AppConfig, InternalChainId, WebbCurrencyId } from '@webb-dapp/api-providers';

import { chainsConfig as EvmNetworks } from './evm';
import { chainsConfig as SubstrateNetworks } from './substrate';

export const getSupportedCurrenciesOfChain = (chainId: InternalChainId): WebbCurrencyId[] => {
  return chainsConfig[chainId].currencies;
};

export const chainsConfig: AppConfig['chains'] = {
  ...EvmNetworks,
  ...SubstrateNetworks,
};
