// Copyright 2024 @tangle-network/
// SPDX-License-Identifier: Apache-2.0

export * from './ChainId';
export * from './Currency';
export * from './Props';
export * from './Storage';
export { default as Storage } from './Storage';
export * from './WalletId';
export * from './WebbError';
export * from './utils';
export * from './TypedChainId';

export const zeroAddress = '0x0000000000000000000000000000000000000000';
export const ZERO = 'ZERO';

export const isZero = (value: string | number) => {
  if (value === zeroAddress) {
    return true;
  }

  if (value === 'ZERO') {
    return true;
  }

  return value === 0;
};

export function checkNativeAddress(tokenAddress: string): boolean {
  if (tokenAddress === zeroAddress || tokenAddress === '0') {
    return true;
  }
  return false;
}
