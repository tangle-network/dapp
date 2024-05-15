import { CurrencyRole } from '@webb-tools/dapp-types';

import { ApiConfig } from '../api-config';
import { CurrencyConfig } from '../currencies';

/**
 * Calculate the bridge config by the fungible curencies
 * and the supported anchors for each fungible currency
 * @param currencies the currencies config
 * @param anchors the anchors config
 * @returns the bridge config by asset
 */
export const getBridgeConfigByAsset = (
  currencies: Record<number, CurrencyConfig>,
  anchors: ApiConfig['anchors']
): ApiConfig['bridgeByAsset'] => {
  const bridgeByAsset: ApiConfig['bridgeByAsset'] = {};

  // Get all fungible currencies
  const fungibleCurrencies = Object.values(currencies).filter(
    (currency) => currency.role === CurrencyRole.Governable
  );

  // Calculate the bridge config by the fungible currencies
  // and the supported anchors for each fungible currency
  fungibleCurrencies.forEach((currency) => {
    if (!anchors[currency.id]) {
      console.error(`No anchor config for currency ${currency.id}`);
      return;
    }

    bridgeByAsset[currency.id] = {
      asset: currency.id,
      anchors: anchors[currency.id],
    };
  });

  return bridgeByAsset;
};
