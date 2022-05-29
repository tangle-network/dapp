// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { expect } from 'chai';

import { ChainType, ChainTypeId } from './chain-id.enum';
import { byteArrayToNum, computeChainIdType, numToByteArray, parseChainIdType } from './chain-utils';

describe('test various conversion functions', () => {
  it('byte array to num converts correctly', () => {
    const arr = [2, 0, 0, 0, 122, 105];
    const result = 2199023286889;

    expect(byteArrayToNum(arr)).to.deep.equal(result);
  });

  it('numToByteArray converts correctly', () => {
    const arrResult = [2, 0, 0, 0, 122, 105];
    const number = 2199023286889;

    expect(numToByteArray(number, 4)).to.deep.equal(arrResult);
  });

  it('numToByteArray converts hexstring values correctly', () => {
    const evmResult = [1, 0];

    expect(numToByteArray(ChainType.EVM, 2)).to.deep.equal(evmResult);
    const kusamaParachainResult = [3, 17];

    expect(numToByteArray(ChainType.KusamaParachain, 2)).to.deep.equal(kusamaParachainResult);
  });

  it('numToByteArray maintains minimum size with leading zeroes', () => {
    const arrResult = [0, 0, 122, 105];
    const number = 31337;

    expect(numToByteArray(number, 4)).to.deep.equal(arrResult);
  });

  it('computeChainIdType converts correctly', () => {
    const chainType = ChainType.Substrate;
    const chainId = 31337;
    const chainIdTypeResult = 2199023286889;

    expect(computeChainIdType(chainType, chainId)).to.deep.equal(chainIdTypeResult);
  });

  it('typeAndIdFromChainIdType converts correctly', () => {
    const chainIdType = 2199023286889;
    const chainTypeResult = ChainType.Substrate;
    const chainIdResult = 31337;

    const result: ChainTypeId = {
      chainId: chainIdResult,
      chainType: chainTypeResult,
    };

    expect(parseChainIdType(chainIdType)).to.deep.equal(result);
  });
});
