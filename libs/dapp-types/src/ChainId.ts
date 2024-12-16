// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { calculateTypedChainId, ChainType } from './TypedChainId';

import EVMChainId from './EVMChainId';
import SubstrateChainId from './SubstrateChainId';

export interface TypedChainId {
  chainType: ChainType;
  chainId: EVMChainId | SubstrateChainId;
}

// Pre-calculated TypedChainId values that are supported in the dapp
export enum PresetTypedChainId {
  EthereumMainNet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.EthereumMainNet,
  ),

  Goerli = calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli),

  Sepolia = calculateTypedChainId(ChainType.EVM, EVMChainId.Sepolia),

  Holesky = calculateTypedChainId(ChainType.EVM, EVMChainId.Holesky),

  HarmonyTestnet1 = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.HarmonyTestnet1,
  ),

  HarmonyTestnet0 = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.HarmonyTestnet0,
  ),

  Ganache = calculateTypedChainId(ChainType.EVM, EVMChainId.Ganache),

  Shiden = calculateTypedChainId(ChainType.EVM, EVMChainId.Shiden),

  OptimismTestnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.OptimismTestnet,
  ),

  ArbitrumTestnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.ArbitrumTestnet,
  ),

  PolygonTestnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.PolygonTestnet,
  ),

  TangleMainnetNative = calculateTypedChainId(
    ChainType.Substrate,
    SubstrateChainId.TangleMainnetNative,
  ),

  TangleTestnetNative = calculateTypedChainId(
    ChainType.Substrate,
    SubstrateChainId.TangleTestnetNative,
  ),

  TangleLocalNative = calculateTypedChainId(
    ChainType.Substrate,
    SubstrateChainId.TangleLocalNative,
  ),

  Kusama = calculateTypedChainId(
    ChainType.KusamaRelayChain,
    SubstrateChainId.Kusama,
  ),

  Polkadot = calculateTypedChainId(
    ChainType.PolkadotRelayChain,
    SubstrateChainId.Polkadot,
  ),

  RococoPhala = calculateTypedChainId(
    ChainType.Substrate,
    SubstrateChainId.RococoPhala,
  ),

  MoonbaseAlpha = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.MoonbaseAlpha,
  ),

  AvalancheFuji = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.AvalancheFuji,
  ),

  ScrollSepolia = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.ScrollSepolia,
  ),

  Polygon = calculateTypedChainId(ChainType.EVM, EVMChainId.Polygon),

  Arbitrum = calculateTypedChainId(ChainType.EVM, EVMChainId.Arbitrum),

  Optimism = calculateTypedChainId(ChainType.EVM, EVMChainId.Optimism),

  Linea = calculateTypedChainId(ChainType.EVM, EVMChainId.Linea),

  Base = calculateTypedChainId(ChainType.EVM, EVMChainId.Base),

  BSC = calculateTypedChainId(ChainType.EVM, EVMChainId.BSC),

  // Localnets
  HermesLocalnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.HermesLocalnet,
  ),

  AthenaLocalnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.AthenaLocalnet,
  ),

  DemeterLocalnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.DemeterLocalnet,
  ),

  TangleLocalEVM = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.TangleLocalEVM,
  ),

  TangleTestnetEVM = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.TangleTestnetEVM,
  ),

  TangleMainnetEVM = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.TangleMainnetEVM,
  ),
}

export { EVMChainId, SubstrateChainId };
