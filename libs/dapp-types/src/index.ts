// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export * from './ChainId.js';
export * from './Currency.js';
export * from './InteractiveFeedback.js';
export * from './Props.js';
export * from './Storage.js';
export { default as Storage } from './Storage.js';
export * from './WalletId.js';
export * from './WebbError.js';
export * from './appMode.js';
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
