// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

// The ChainAddressConfig maps the TypedChainId to the appropriate address or treeId.
export type ChainAddressConfig = Record<number, string>;

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
