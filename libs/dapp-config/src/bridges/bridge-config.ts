import { ApiConfig } from '..';
import { CurrencyId } from '@nepoche/dapp-types';

import { anchorsConfig } from '../anchors/anchor-config';

export const bridgeConfigByAsset: ApiConfig['bridgeByAsset'] = {
  [CurrencyId.webbETH]: {
    asset: CurrencyId.webbETH,
    anchors: anchorsConfig[CurrencyId.webbETH],
  },
  [CurrencyId.WEBBSQR]: {
    asset: CurrencyId.WEBBSQR,
    anchors: anchorsConfig[CurrencyId.WEBBSQR],
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
