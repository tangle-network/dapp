// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { WebbError, WebbErrorCodes } from '../webb-error';
import { ChainType, ChainTypeId, EVMChainId, InternalChainId, SubstrateChainId } from './chain-id.enum';

export const byteArrayToNum = (arr: number[]): number => {
  let n = 0;

  for (const i of arr) {
    n = n * 256 + i;
  }

  return n;
};

/**
 * @param num - the number to be converted
 * @param min - the minimum bytes the array should hold (in the case of requiring empty bytes to match rust values)
 * @returns
 */
export const numToByteArray = (num: number, min: number): number[] => {
  let arr = [];

  while (num > 0) {
    arr.push(num % 256);
    num = Math.floor(num / 256);
  }

  arr.reverse();

  // maintain minimum number of bytes
  while (arr.length < min) {
    arr = [0, ...arr];
  }

  return arr;
};

export const computeChainIdType = (chainType: ChainType, chainId: number | InternalChainId): number => {
  const chainTypeArray = numToByteArray(chainType, 2);
  const chainIdArray = numToByteArray(chainId, 4);
  const fullArray = [...chainTypeArray, ...chainIdArray];

  return byteArrayToNum(fullArray);
};

export const parseChainIdType = (chainIdType: number): ChainTypeId => {
  const byteArray = numToByteArray(chainIdType, 4);
  const chainType = byteArrayToNum(byteArray.slice(0, 2));
  const chainId = byteArrayToNum(byteArray.slice(2));

  return { chainId, chainType };
};

export const internalChainIdToChainId = (chainType: ChainType, internalId: InternalChainId) => {
  switch (chainType) {
    case ChainType.EVM:
      return internalChainIdIntoEVMId(internalId);
    case ChainType.Substrate:
      return internalChainIdIntoSubstrateId(internalId);
    default:
      throw WebbError.from(WebbErrorCodes.ChainIdTypeUnformatted);
  }
};

export const chainTypeIdToInternalId = (chainTypeId: ChainTypeId): InternalChainId => {
  switch (chainTypeId.chainType) {
    case ChainType.EVM:
      return evmIdIntoInternalChainId(chainTypeId.chainId);
    case ChainType.Substrate:
      return substrateIdIntoInternalChainId(chainTypeId.chainId as SubstrateChainId);
    // case ChainType.SubstrateDevelopment:
    //   return substrateDevelopIdIntoInternalChainId(chainTypeId.chainId as SubstrateDevelopChainId);
    default:
      throw new Error('chainTypeId not handled in chainTypeIdToInternalId');
  }
};

export const evmIdIntoInternalChainId = (evmId: number | string): InternalChainId => {
  switch (Number(evmId) as EVMChainId) {
    case EVMChainId.EthereumMainNet:
      return InternalChainId.EthereumMainNet;
    case EVMChainId.Ropsten:
      return InternalChainId.Ropsten;
    case EVMChainId.Rinkeby:
      return InternalChainId.Rinkeby;
    case EVMChainId.Kovan:
      return InternalChainId.Kovan;
    case EVMChainId.Goerli:
      return InternalChainId.Goerli;
    case EVMChainId.Edgeware:
      return InternalChainId.Edgeware;
    case EVMChainId.Beresheet:
      return InternalChainId.EdgewareTestNet;
    case EVMChainId.HarmonyTestnet1:
      return InternalChainId.HarmonyTestnet1;
    case EVMChainId.HarmonyTestnet0:
      return InternalChainId.HarmonyTestnet0;
    case EVMChainId.HarmonyMainnet0:
      return InternalChainId.HarmonyMainnet0;
    case EVMChainId.Ganache:
      return InternalChainId.Ganache;
    case EVMChainId.Shiden:
      return InternalChainId.Shiden;
    case EVMChainId.OptimismTestnet:
      return InternalChainId.OptimismTestnet;
    case EVMChainId.ArbitrumTestnet:
      return InternalChainId.ArbitrumTestnet;
    case EVMChainId.PolygonTestnet:
      return InternalChainId.PolygonTestnet;
    case EVMChainId.HermesLocalnet:
      return InternalChainId.HermesLocalnet;
    case EVMChainId.AthenaLocalnet:
      return InternalChainId.AthenaLocalnet;
    case EVMChainId.DemeterLocalnet:
      return InternalChainId.DemeterLocalnet;
  }
};

export const internalChainIdIntoEVMId = (chainId: InternalChainId | number | string): EVMChainId => {
  switch (Number(chainId) as InternalChainId) {
    case InternalChainId.Edgeware:
      return EVMChainId.Edgeware;
    case InternalChainId.EdgewareTestNet:
      return EVMChainId.Beresheet;
    case InternalChainId.EthereumMainNet:
      return EVMChainId.EthereumMainNet;
    case InternalChainId.Rinkeby:
      return EVMChainId.Rinkeby;
    case InternalChainId.Ropsten:
      return EVMChainId.Ropsten;
    case InternalChainId.Kovan:
      return EVMChainId.Kovan;
    case InternalChainId.Goerli:
      return EVMChainId.Goerli;
    case InternalChainId.HarmonyTestnet0:
      return EVMChainId.HarmonyTestnet0;
    case InternalChainId.HarmonyTestnet1:
      return EVMChainId.HarmonyTestnet1;
    case InternalChainId.HarmonyMainnet0:
      return EVMChainId.HarmonyMainnet0;
    case InternalChainId.Ganache:
      return EVMChainId.Ganache;
    case InternalChainId.Shiden:
      return EVMChainId.Shiden;
    case InternalChainId.OptimismTestnet:
      return EVMChainId.OptimismTestnet;
    case InternalChainId.ArbitrumTestnet:
      return EVMChainId.ArbitrumTestnet;
    case InternalChainId.PolygonTestnet:
      return EVMChainId.PolygonTestnet;
    case InternalChainId.HermesLocalnet:
      return EVMChainId.HermesLocalnet;
    case InternalChainId.AthenaLocalnet:
      return EVMChainId.AthenaLocalnet;
    case InternalChainId.DemeterLocalnet:
      return EVMChainId.DemeterLocalnet;
    default:
      throw Error(`unsupported evm id: ${chainId}`);
  }
};

export const substrateIdIntoInternalChainId = (chainId: SubstrateChainId): InternalChainId => {
  switch (Number(chainId) as SubstrateChainId) {
    case SubstrateChainId.Edgeware:
      return InternalChainId.Edgeware;
    case SubstrateChainId.EggStandalone:
      return InternalChainId.EggStandalone;
    case SubstrateChainId.ProtocolSubstrateStandalone:
      return InternalChainId.ProtocolSubstrateStandalone;
    case SubstrateChainId.Kusama:
      return InternalChainId.Kusama;
    case SubstrateChainId.Polkadot:
      return InternalChainId.Polkadot;
    default:
      throw Error(`Unsupported substrate live id: ${chainId}`);
  }
};

export const internalChainIdIntoSubstrateId = (chainId: InternalChainId | number | string): SubstrateChainId => {
  switch (Number(chainId) as InternalChainId) {
    case InternalChainId.Edgeware:
      return SubstrateChainId.Edgeware;
    case InternalChainId.EggStandalone:
      return SubstrateChainId.EggStandalone;
    default:
      throw Error(`Internal Id ${chainId} is not a substrate live id`);
  }
};

// export const substrateDevelopIdIntoInternalChainId = (chainId: SubstrateDevelopChainId): InternalChainId => {
//   switch (Number(chainId) as SubstrateDevelopChainId) {
//     case SubstrateDevelopChainId.EggDevelopStandalone:
//       return InternalChainId.EggDevelopStandalone;
//     case SubstrateDevelopChainId.DkgSubstrateStandalone:
//       return InternalChainId.DkgSubstrateStandalone;
//     case SubstrateDevelopChainId.ProtocolSubstrateStandalone:
//       return InternalChainId.ProtocolSubstrateStandalone;
//     default:
//       throw Error(`Unsupported substrate development id: ${chainId}`);
//   }
// };

// export const internalChainIdIntoSubstrateDevelopId = (chainId: InternalChainId | number | string): SubstrateDevelopChainId => {
//   switch (Number(chainId) as InternalChainId) {
//     case InternalChainId.EggStandalone:
//       return SubstrateDevelopChainId.EggDevelopStandalone;
//     case InternalChainId.DkgSubstrateStandalone:
//       return SubstrateDevelopChainId.DkgSubstrateStandalone;
//     case InternalChainId.ProtocolSubstrateStandalone:
//       return SubstrateDevelopChainId.ProtocolSubstrateStandalone;
//     default:
//       throw Error(`Internal Id ${chainId} is not a substrate develop id`);
//   }
// };
