// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { InternalChainId } from '../chains';
import { WebbCurrencyId } from '../enums';
import { AppConfig } from '../';

export const getFixedAnchorAddressForBridge = (
  assetId: WebbCurrencyId,
  chainId: number,
  amount: number,
  bridgeConfigByAsset: AppConfig['bridgeByAsset']
): string | undefined => {
  const linkedAnchorConfig = bridgeConfigByAsset[assetId]?.anchors.find(
    (anchor) => anchor.type === 'fixed' && anchor.amount === amount.toString()
  );

  if (!linkedAnchorConfig) {
    throw new Error('Unsupported configuration for bridge');
  }

  const anchorAddress = linkedAnchorConfig.anchorAddresses[chainId as InternalChainId];

  return anchorAddress;
};

export const getVariableAnchorAddressForBridge = (
  assetId: WebbCurrencyId,
  chainId: number,
  bridgeConfigByAsset: AppConfig['bridgeByAsset']
): string | undefined => {
  const linkedAnchorConfig = bridgeConfigByAsset[assetId]?.anchors.find((anchor) => anchor.type === 'variable');

  if (!linkedAnchorConfig) {
    throw new Error('Unsupported configuration for bridge');
  }

  const anchorAddress = linkedAnchorConfig.anchorAddresses[chainId as InternalChainId];

  return anchorAddress;
};
