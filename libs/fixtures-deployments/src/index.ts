// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export * from './substrate';
export * from './evm';

// The cached fixture URI is defined in this fixtures-deployments package; however, the
// dapp-packages that build the entire dapp define the contents of this cached-fixtures/ folder.
export function getCachedFixtureURI(fileName: string) {
  return `/solidity-fixtures/solidity-fixtures/${fileName}`;
}
