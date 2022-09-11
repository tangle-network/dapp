// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';

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
  OptimismTestnet = 420,
  ArbitrumTestnet = 421613,
  PolygonTestnet = 80001,
  HermesLocalnet = 5001,
  AthenaLocalnet = 5002,
  DemeterLocalnet = 5003,
  MoonbaseAlpha = 1287,
}

// Pre-calculated TypedChainId values that are supported in the dapp
export enum PresetTypedChainId {
  EthereumMainNet = calculateTypedChainId(ChainType.EVM, EVMChainId.EthereumMainNet),
  Rinkeby = calculateTypedChainId(ChainType.EVM, EVMChainId.Rinkeby),
  Ropsten = calculateTypedChainId(ChainType.EVM, EVMChainId.Ropsten),
  Kovan = calculateTypedChainId(ChainType.EVM, EVMChainId.Kovan),
  Goerli = calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli),
  HarmonyTestnet1 = calculateTypedChainId(ChainType.EVM, EVMChainId.HarmonyTestnet1),
  HarmonyTestnet0 = calculateTypedChainId(ChainType.EVM, EVMChainId.HarmonyTestnet0),
  HarmonyMainnet0 = calculateTypedChainId(ChainType.EVM, EVMChainId.HarmonyMainnet0),
  Ganache = calculateTypedChainId(ChainType.EVM, EVMChainId.Ganache),
  Shiden = calculateTypedChainId(ChainType.EVM, EVMChainId.Shiden),
  OptimismTestnet = calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet),
  ArbitrumTestnet = calculateTypedChainId(ChainType.EVM, EVMChainId.ArbitrumTestnet),
  PolygonTestnet = calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet),
  ProtocolSubstrateStandalone = calculateTypedChainId(
    ChainType.Substrate,
    SubstrateChainId.ProtocolSubstrateStandalone
  ),
  LocalTangleStandalone = calculateTypedChainId(ChainType.Substrate, SubstrateChainId.LocalTangleStandalone),
  DkgSubstrateStandalone = calculateTypedChainId(ChainType.Substrate, SubstrateChainId.ProtocolSubstrateStandalone),
  Kusama = calculateTypedChainId(ChainType.KusamaRelayChain, SubstrateChainId.Kusama),
  Polkadot = calculateTypedChainId(ChainType.PolkadotRelayChain, SubstrateChainId.Polkadot),
  MoonbaseAlpha = calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha),
  HermesLocalnet = calculateTypedChainId(ChainType.EVM, EVMChainId.HermesLocalnet),
  AthenaLocalnet = calculateTypedChainId(ChainType.EVM, EVMChainId.AthenaLocalnet),
  DemeterLocalnet = calculateTypedChainId(ChainType.EVM, EVMChainId.DemeterLocalnet),
}
