import { AppConfig, WebbCurrencyId } from '@webb-dapp/api-providers';
import { anchorsConfig } from '@webb-dapp/apps/configs';
import { LoggerService } from '@webb-tools/app-util';
const logger = LoggerService.get('bridge-config');

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
};
