// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

export * from './ChainId';
export * from './Currency';
export * from './InteractiveFeedback';
export * from './Props';
export * from './WalletId';
export * from './WebbError';
export * from './TransactionState';

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
