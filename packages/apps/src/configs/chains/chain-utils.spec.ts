import { ChainType, InternalChainId } from './chain-id.enum';

import {
  byteArrayToNum,
  numToByteArray,
  computeChainIdType,
  typeAndIdFromChainIdType,
  ChainTypeId,
} from './chain-utils';
describe('test various conversion functions', () => {
  test('byte array to num converts correctly', () => {
    const arr = [2, 0, 0, 0, 122, 105];
    const result = 2199023286889;
    expect(byteArrayToNum(arr)).toEqual(result);
  });

  test('numToByteArray converts correctly', () => {
    let arrResult = [2, 0, 0, 0, 122, 105];
    let number = 2199023286889;
    expect(numToByteArray(number, 4)).toEqual(arrResult);
  });

  test('numToByteArray converts hexstring values correctly', () => {
    let evmResult = [1, 0];
    expect(numToByteArray(ChainType.EVM, 2)).toEqual(evmResult);
    let kusamaParachainResult = [3, 17];
    expect(numToByteArray(ChainType.KusamaParachain, 2)).toEqual(kusamaParachainResult);
  });

  test('numToByteArray maintains minimum size with leading zeroes', () => {
    let arrResult = [0, 0, 122, 105];
    let number = 31337;
    expect(numToByteArray(number, 4)).toEqual(arrResult);
  });

  test('computeChainIdType converts correctly', () => {
    let chainType = ChainType.Substrate;
    let chainId = 31337;
    let chainIdTypeResult = 2199023286889;
    expect(computeChainIdType(chainType, chainId)).toEqual(chainIdTypeResult);
  });

  test('typeAndIdFromChainIdType converts correctly', () => {
    let chainIdType = 2199023286889;
    let chainTypeResult = ChainType.Substrate;
    let chainIdResult = 31337;

    let result: ChainTypeId = {
      chainType: chainTypeResult,
      chainId: chainIdResult,
    };
    expect(typeAndIdFromChainIdType(chainIdType)).toEqual(result);
  });
});
