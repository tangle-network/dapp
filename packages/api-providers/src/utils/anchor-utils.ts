// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { CurrencyId } from '../enums';
import { AppConfig } from '../';

export const getVariableAnchorAddressForBridge = (
  assetId: CurrencyId,
  typedChainId: number,
  bridgeConfigByAsset: AppConfig['bridgeByAsset']
): string | undefined => {
  const linkedAnchorConfig = bridgeConfigByAsset[assetId]?.anchors.find((anchor) => anchor.type === 'variable');

  if (!linkedAnchorConfig) {
    throw new Error('Unsupported configuration for bridge');
  }

  const anchorAddress = linkedAnchorConfig.anchorAddresses[typedChainId];

  return anchorAddress;
};
