import { AppConfig, CurrencyId } from '@webb-dapp/api-providers';

import { chainsConfig as EvmNetworks } from './evm';
import { chainsConfig as SubstrateNetworks } from './substrate';

export const getSupportedCurrenciesOfChain = (typedChainId: number): CurrencyId[] => {
  return chainsConfig[typedChainId].currencies;
};

export const chainsConfig: AppConfig['chains'] = {
  ...EvmNetworks,
  ...SubstrateNetworks,
};
