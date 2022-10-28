// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

// The ChainAddressConfig maps the TypedChainId to the appropriate address or treeId.
export type ChainAddressConfig = Record<number, string>;
export type AnchorConfigEntry = ChainAddressConfig;
