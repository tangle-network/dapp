import { ChainType, ChainTypeId, EVMChainId, InternalChainId, SubstrateChain } from '@webb-dapp/apps/configs';

export const byteArrayToNum = (arr: number[]): number => {
  let n = 0;
  for (let i of arr) n = n * 256 + i;
  return n;
};

/**
 * @param num the number to be converted
 * @param min the minimum bytes the array should hold (in the case of requiring empty bytes to match rust values)
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
  let chainTypeArray = numToByteArray(chainType, 2);
  let chainIdArray = numToByteArray(chainId, 4);
  let fullArray = [...chainTypeArray, ...chainIdArray];
  return byteArrayToNum(fullArray);
};

export const typeAndIdFromChainIdType = (chainIdType: number): ChainTypeId => {
  let byteArray = numToByteArray(chainIdType, 4);
  let chainType = byteArrayToNum(byteArray.slice(0, 2));
  let chainId = byteArrayToNum(byteArray.slice(2));
  return { chainType, chainId };
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
  }
};

export const internalChainIdIntoEVMId = (chainId: InternalChainId | Number | String): EVMChainId => {
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
    default:
      throw Error(`unsupported chain ${chainId}`);
  }
};

export const internalChainIdIntoSubstrateId = (chainId: InternalChainId | Number | String): number => {
  switch (Number(chainId) as InternalChainId) {
    case InternalChainId.Edgeware:
      return SubstrateChain.Edgeware;
    default:
      throw Error(`unsupported chain ${chainId}`);
  }
};

export const internalChainIdToChainId = (chainType: ChainType, internalId: InternalChainId) => {
  switch (chainType) {
    case ChainType.EVM:
      return internalChainIdIntoEVMId(internalId);
    case ChainType.Substrate:
      return internalChainIdIntoSubstrateId(internalId);
    default:
      throw new Error('chainType not handled in internalChainIdToChainId');
  }
};

// CURRENTLY UNNECESSARY SINCE JS/TS AUTOMATICALLY CONVERTS HEXSTRINGS TO NUMBERS, BUT PERHAPS USEFUL LATER
// for converting chainType/hex string to a byte array of two bytes
// export const chainTypeToByteArray = (chainType: ChainType) => {
//   let str = chainType.toString(16);
//   // need to maintain the leading zero
//   if (str.length < 4) {
//     str = '0' + str;
//   }
//   let arr = [];
//   for (let i = 0; i < str.length; i += 2) {
//     let strSlice = str.slice(i, i + 2);
//     let byte = parseInt(strSlice, 16);
//     arr.push(byte || 0);
//   }
//   return arr;
// };
