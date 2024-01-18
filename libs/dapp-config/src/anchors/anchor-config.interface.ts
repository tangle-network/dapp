// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/**
 * A record of typed chain id to anchor identifier (address on evm and tree id on substrate)
 */
export type ChainAddressConfig = Record<number, string>;

/**
 * {@inheritdoc ChainAddressConfig}
 */
export type AnchorConfigEntry = ChainAddressConfig;
