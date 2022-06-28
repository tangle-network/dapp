// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

// must match u16 in rust.
// Each ChainType has its own namespace of ChainIDs.
export enum ChainType {
  None = 0x0000,
  EVM = 0x0100,
  Substrate = 0x0200,
  SubstrateDevelopment = 0x0250,
  PolkadotRelayChain = 0x0301,
  KusamaRelayChain = 0x0302,
  PolkadotParachain = 0x0310,
  KusamaParachain = 0x0311,
}

export interface ChainTypeId {
  chainType: ChainType;
  chainId: EVMChainId | SubstrateChainId;
}

// Enums for network IDs / SS58 encodings for Substrate chains
export enum SubstrateChainId {
  Edgeware = 7,
  ProtocolSubstrateStandalone = 1080,
  EggStandalone = 1081, // Used for EggNet Standalone test deployment
  Kusama = 2,
  Polkadot = 0,
}

// INTERNAL CHAIN IDS
// ONLY APPEND OR NOTES WILL BREAK
// TODO: Modify this to use typed chain Ids for the enum values
export enum InternalChainId {
  Edgeware,
  EdgewareTestNet,
  EdgewareLocalNet,
  EthereumMainNet,
  Rinkeby,
  Ropsten,
  Kovan,
  Goerli,
  HarmonyTestnet1,
  HarmonyTestnet0,
  HarmonyMainnet0,
  Ganache,
  Shiden,
  OptimismTestnet,
  ArbitrumTestnet,
  PolygonTestnet,
  ProtocolSubstrateStandalone,
  HermesLocalnet,
  AthenaLocalnet,
  EggStandalone,
  EggDevelopStandalone,
  DkgSubstrateStandalone,
  DemeterLocalnet,
  Kusama,
  Polkadot,
  MoonbaseAlpha,
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
