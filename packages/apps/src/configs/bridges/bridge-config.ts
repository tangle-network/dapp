import { anchorsConfig } from '@webb-dapp/apps/configs';
import { AppConfig, InternalChainId, WebbCurrencyId } from '@webb-tools/api-providers';
import { LoggerService } from '@webb-tools/app-util';
const logger = LoggerService.get('bridge-config');

// todo change to wrappedTokenAddresses (they are  governed token wrapper contract)
// todo change to Fixed anchors
// todo: Add change to Fixed variable anchors

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

export const getAnchorAddressForBridge = (
  assetId: WebbCurrencyId,
  chainId: InternalChainId,
  amount: number
): string | undefined => {
  const linkedAnchorConfig = bridgeConfigByAsset[assetId]?.anchors.find(
    (anchor) => anchor.amount === amount.toString()
  );
  if (!linkedAnchorConfig) {
    throw new Error('Unsupported configuration for bridge');
  }

  // Compute the internal chain id
  const anchorAddress = linkedAnchorConfig.anchorAddresses[chainId];
  return anchorAddress;
};
