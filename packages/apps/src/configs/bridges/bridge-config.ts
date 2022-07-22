import { AppConfig, CurrencyId } from '@webb-dapp/api-providers';

import { anchorsConfig } from '../anchors/anchor-config';

export const bridgeConfigByAsset: AppConfig['bridgeByAsset'] = {
  [CurrencyId.webbETH]: {
    asset: CurrencyId.webbETH,
    anchors: anchorsConfig[CurrencyId.webbETH],
  },
  [CurrencyId.WEBB]: {
    asset: CurrencyId.WEBB,
    anchors: anchorsConfig[CurrencyId.WEBB],
  },
  [CurrencyId.webbDEV]: {
    asset: CurrencyId.webbDEV,
    anchors: anchorsConfig[CurrencyId.webbDEV],
  },
  [CurrencyId.TEST]: {
    asset: CurrencyId.TEST,
    anchors: anchorsConfig[CurrencyId.TEST],
  },
};
