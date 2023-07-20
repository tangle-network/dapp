// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export * from './ChainId';
export * from './Currency';
export * from './InteractiveFeedback';
export * from './Props';
export * from './Storage';
export { default as Storage } from './Storage';
export * from './WalletId';
export * from './WebbError';
export * from './appMode';
export * from './utils';

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
