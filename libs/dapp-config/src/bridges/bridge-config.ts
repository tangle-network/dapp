import { CurrencyRole } from '@webb-tools/dapp-types';

import { ApiConfig } from '../api-config';
import { CurrencyConfig } from '../currencies';

let bridgeConfigByAsset: ApiConfig['bridgeByAsset'];

export const getBridgeConfigByAsset = async (
  currencies: Record<number, CurrencyConfig>,
  anchors: ApiConfig['anchors']
): Promise<ApiConfig['bridgeByAsset']> => {
  // If the bridge config is already calculated, return it
  if (bridgeConfigByAsset) {
    return bridgeConfigByAsset;
  }

  const bridgeByAsset: ApiConfig['bridgeByAsset'] = {};

  const fungibleCurrencies = Object.values(currencies).filter(
    (currency) => currency.role === CurrencyRole.Governable
  );

  await Promise.allSettled(
    fungibleCurrencies.map(async (currency) => {
      if (!anchors[currency.id]) {
        console.error(`No anchor config for currency ${currency.id}`);
        return;
      }

      bridgeByAsset[currency.id] = {
        asset: currency.id,
        anchors: anchors[currency.id],
      };
    })
  );

  bridgeConfigByAsset = bridgeByAsset;

  return bridgeByAsset;
};
