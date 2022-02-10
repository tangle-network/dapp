import { ChainType, InternalChainId } from '@webb-dapp/apps/configs';

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

// ! ChainId should NOT be InternalChainId
export interface ChainTypeId {
  chainType: ChainType;
  chainId: number;
}

export const typeAndIdFromChainIdType = (chainIdType: number): ChainTypeId => {
  let byteArray = numToByteArray(chainIdType, 4);
  let chainType = byteArrayToNum(byteArray.slice(0, 2));
  let chainId = byteArrayToNum(byteArray.slice(2));
  return { chainType, chainId };
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
