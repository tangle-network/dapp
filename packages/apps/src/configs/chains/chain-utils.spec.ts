import React from 'react';
import { ChainType, ChainId } from './chain-id.enum';

import { byteArrayToNum, chainTypeToByteArray, numToByteArrayMin4Bytes, computeChainIdType } from './chain-utils';
describe('test various conversion functions', () => {
  test('byte array to num converts correctly', () => {
    const arr = [2, 0, 0, 0, 122, 105];
    const result = 2199023286889;
    expect(byteArrayToNum(arr)).toEqual(result);
  });

  test('chainTypeToByteArray converts correctly', () => {
    let evmResult = [1, 0];
    expect(chainTypeToByteArray(ChainType.EVM)).toEqual(evmResult);
    let kusamaParachainResult = [3, 17];
    expect(chainTypeToByteArray(ChainType.KusamaParachain)).toEqual(kusamaParachainResult);
  });

  test('numToByteArrayMin4Bytes converts correctly', () => {
    let arrResult = [2, 0, 0, 0, 122, 105];
    let number = 2199023286889;
    expect(numToByteArrayMin4Bytes(number)).toEqual(arrResult);
  });

  test('numToByteArrayMin4Bytes maintains minimum size with leading zeroes', () => {
    let arrResult = [0, 0, 122, 105];
    let number = 31337;
    expect(numToByteArrayMin4Bytes(number)).toEqual(arrResult);
  });

  test('computeChainIdType converts correctly', () => {
    let chainType = ChainType.Substrate;
    let chainId = 31337;
    let chainIdTypeResult = 2199023286889;
    expect(computeChainIdType(chainType, chainId)).toEqual(chainIdTypeResult);
  });
});
