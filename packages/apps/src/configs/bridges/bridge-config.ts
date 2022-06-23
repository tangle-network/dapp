import { AppConfig, WebbCurrencyId } from '@webb-dapp/api-providers';

import { anchorsConfig } from '../anchors/anchor-config';

export const bridgeConfigByAsset: AppConfig['bridgeByAsset'] = {
  [WebbCurrencyId.webbWETH]: {
    asset: WebbCurrencyId.webbWETH,
    anchors: anchorsConfig[WebbCurrencyId.webbWETH],
  },
  [WebbCurrencyId.WEBB]: {
    asset: WebbCurrencyId.WEBB,
    anchors: anchorsConfig[WebbCurrencyId.WEBB],
  },
  [WebbCurrencyId.webbDEV]: {
    asset: WebbCurrencyId.webbDEV,
    anchors: anchorsConfig[WebbCurrencyId.webbDEV],
  },
  [WebbCurrencyId.TEST]: {
    asset: WebbCurrencyId.TEST,
    anchors: anchorsConfig[WebbCurrencyId.TEST],
  },
};
