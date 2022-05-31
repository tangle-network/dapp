// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { InternalChainId } from '../chains';

export type ChainAddressConfig = { [key in InternalChainId]?: string };

export type FixedAnchorConfigEntry = {
  type: 'fixed';
  amount: string;
  // EVM based
  anchorAddresses: ChainAddressConfig;
  // Substrate based
  anchorTreeIds: ChainAddressConfig;
};

export type VAnchorConfigEntry = {
  type: 'variable';
  anchorAddresses: ChainAddressConfig;
  anchorTreeIds: ChainAddressConfig;
};

export type AnchorConfigEntry = FixedAnchorConfigEntry | VAnchorConfigEntry;
