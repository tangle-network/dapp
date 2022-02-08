import { ChainId, ChainType } from '@webb-dapp/apps/configs';

// byte array to number
export const byteArrayToNum = (arr: number[]): number => {
  let n = 0;
  for (let i of arr) n = n * 256 + i;
  return n;
};

// number to byte array
export const numToByteArrayMin4Bytes = (num: number): number[] => {
  let arr = [];
  while (num > 0) {
    arr.push(num % 256);
    num = Math.floor(num / 256);
  }
  arr.reverse();
  // maintain minimum of 4 bytes
  while (arr.length < 4) {
    arr = [0, ...arr];
  }
  return arr;
};

// for converting chainType/hex string to a byte array
export const chainTypeToByteArray = (chainType: ChainType) => {
  let str = chainType.toString(16);
  // need to maintain the leading zero
  if (str.length < 4) {
    str = '0' + str;
  }
  let arr = [];
  for (let i = 0; i < str.length; i += 2) {
    let strSlice = str.slice(i, i + 2);
    let byte = parseInt(strSlice, 16);
    arr.push(byte || 0);
  }
  return arr;
};

export const computeChainIdType = (chainType: ChainType, chainId: number | ChainId): number => {
  let chainTypeArray = chainTypeToByteArray(chainType);
  let chainIdArray = numToByteArrayMin4Bytes(chainId);
  let fullArray = [...chainTypeArray, ...chainIdArray];
  return byteArrayToNum(fullArray);
};
