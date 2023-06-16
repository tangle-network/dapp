import { CurrencyRole } from '@webb-tools/dapp-types';

import { ApiConfig } from '../api-config';
import { CurrencyConfig } from '../currencies';

export const getBridgeConfigByAsset = (
  currencies: Record<number, CurrencyConfig>,
  anchors: ApiConfig['anchors']
): ApiConfig['bridgeByAsset'] => {
  const bridgeByAsset: ApiConfig['bridgeByAsset'] = {};

  const fungibleCurrencies = Object.values(currencies).filter(
    (currency) => currency.role === CurrencyRole.Governable
  );

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
