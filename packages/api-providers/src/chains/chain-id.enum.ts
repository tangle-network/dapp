// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ChainType } from '@webb-tools/sdk-core';

export interface TypedChainId {
  chainType: ChainType;
  chainId: EVMChainId | SubstrateChainId;
}

// Enums for network IDs / SS58 encodings for Substrate chains
export enum SubstrateChainId {
  Edgeware = 7,
  ProtocolSubstrateStandalone = 1080,
  LocalTangleStandalone = 1081, // Used for Tangle Standalone test deployment
  Kusama = 2,
  Polkadot = 0,
}

// Pre-calculated TypedChainId values that are supported in the dapp
export enum PresetTypedChainId {
  EthereumMainNet = 1099511627777,
  Rinkeby = 1099511627780,
  Ropsten = 1099511627779,
  Kovan = 1099511627818,
  Goerli = 1099511627781,
  HarmonyTestnet1 = 1101178327777,
  HarmonyTestnet0 = 1101178327776,
  HarmonyMainnet0 = 1101178227776,
  Ganache = 1099511629113,
  Shiden = 1099511628112,
  OptimismTestnet = 1099511627845,
  ArbitrumTestnet = 1099512049387,
  PolygonTestnet = 1099511707777,
  ProtocolSubstrateStandalone = 2199023256632,
  LocalTangleStandalone = 2199023256633,
  DkgSubstrateStandalone,
  Kusama = 3307124817922,
  Polkadot = 3302829850624,
  MoonbaseAlpha = 1099511629063,
  HermesLocalnet = 1099511632777,
  AthenaLocalnet = 1099511632778,
  DemeterLocalnet = 1099511632779,
}

export enum EVMChainId {
  /* Default EVM Chains on MetaMask */
  EthereumMainNet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Kovan = 42,
  Goerli = 5,
  Ganache = 1337,

  /* Added EVM Chains on MetaMask */
  Edgeware = 2021,
  Beresheet = 2022,
  HarmonyTestnet0 = 1666700000,
  HarmonyTestnet1 = 1666700001,
  HarmonyMainnet0 = 1666600000,
  Shiden = 336,
  OptimismTestnet = 69,
  ArbitrumTestnet = 421611,
  PolygonTestnet = 80001,
  HermesLocalnet = 5001,
  AthenaLocalnet = 5002,
  DemeterLocalnet = 5003,
  MoonbaseAlpha = 1287,
}
