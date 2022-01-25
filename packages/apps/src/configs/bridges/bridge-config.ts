import { anchorsConfig, ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { AppConfig } from '@webb-dapp/react-environment/webb-context';

// todo change to wrappedTokenAddresses (they are  governed token wrapper contract)
// todo change to Fixed anchors
// todo: Add change to Fixed variable anchors

export const bridgeConfigByAsset: AppConfig['bridgeByAsset'] = {
  [WebbCurrencyId.webbWETH]: {
    asset: WebbCurrencyId.webbWETH,
    anchors: anchorsConfig[WebbCurrencyId.webbWETH],
  },
};

export const getAnchorAddressForBridge = (
  assetId: WebbCurrencyId,
  chainId: number,
  amount: number
): string | undefined => {
  const linkedAnchorConfig = bridgeConfigByAsset[assetId]?.anchors.find(
    (anchor) => anchor.amount === amount.toString()
  );
  if (!linkedAnchorConfig) {
    throw new Error('Unsupported configuration for bridge');
  }

  const anchorAddress = linkedAnchorConfig.anchorAddresses[chainId as ChainId];
  return anchorAddress;
};
