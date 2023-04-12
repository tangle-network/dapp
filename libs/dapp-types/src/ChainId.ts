// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';

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
    EVMChainId.EthereumMainNet
  ),

  Goerli = calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli),

  Sepolia = calculateTypedChainId(ChainType.EVM, EVMChainId.Sepolia),

  HarmonyTestnet1 = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.HarmonyTestnet1
  ),

  HarmonyTestnet0 = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.HarmonyTestnet0
  ),

  Ganache = calculateTypedChainId(ChainType.EVM, EVMChainId.Ganache),

  Shiden = calculateTypedChainId(ChainType.EVM, EVMChainId.Shiden),

  OptimismTestnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.OptimismTestnet
  ),

  ArbitrumTestnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.ArbitrumTestnet
  ),

  PolygonTestnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.PolygonTestnet
  ),

  ProtocolSubstrateStandalone = calculateTypedChainId(
    ChainType.Substrate,
    SubstrateChainId.ProtocolSubstrateStandalone
  ),

  LocalTangleStandalone = calculateTypedChainId(
    ChainType.Substrate,
    SubstrateChainId.LocalTangleStandalone
  ),

  DkgSubstrateStandalone = calculateTypedChainId(
    ChainType.Substrate,
    SubstrateChainId.ProtocolSubstrateStandalone
  ),

  Kusama = calculateTypedChainId(
    ChainType.KusamaRelayChain,
    SubstrateChainId.Kusama
  ),

  Polkadot = calculateTypedChainId(
    ChainType.PolkadotRelayChain,
    SubstrateChainId.Polkadot
  ),

  MoonbaseAlpha = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.MoonbaseAlpha
  ),

  AvalancheFuji = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.AvalancheFuji
  ),

  ScrollAlpha = calculateTypedChainId(ChainType.EVM, EVMChainId.ScrollAlpha),

  HermesLocalnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.HermesLocalnet
  ),

  AthenaLocalnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.AthenaLocalnet
  ),

  DemeterLocalnet = calculateTypedChainId(
    ChainType.EVM,
    EVMChainId.DemeterLocalnet
  ),
}

export { EVMChainId, SubstrateChainId };
