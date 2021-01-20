import { get } from 'lodash';

import { Codec } from '@polkadot/types/types';
import { Fixed18 } from '@acala-network/app-util';
import { FixedPointNumber } from '@acala-network/sdk-core';

import { LAMINAR_SENDER_ADDRESS, LAMINAR_WATCHER_ADDRESS, FAUCET_ADDRESS, systemAccounts } from './account-consts';

export const thousand = (num: string | string): string => {
  const _num = num.toString();
  const reg = /(?!\b)(?=(\d{3})+\b)/g;

  return _num.replace(reg, ',');
};

export interface FormatNumberConfig {
  decimalLength: number;
  removeTailZero: boolean;
  removeEmptyDecimalParts: boolean;
}

export const formatNumber = (num: string | number | Fixed18 | FixedPointNumber | undefined, config: FormatNumberConfig = { decimalLength: 6, removeEmptyDecimalParts: true, removeTailZero: true }): string => {
  let _num = '0';

  if (num instanceof Fixed18) {
    _num = num.toFixed(18, 2);
  } else if (num instanceof FixedPointNumber) {
    _num = num.toString(18, 2);
  } else {
    _num = (new FixedPointNumber(num || 0)).toString(18, 2);
  }

  let [i, d] = _num.split('.');

  // test if the i is a validate number at first
  if (!/^-?[0-9]*$/.test(i)) return 'N/A';

  if (config.decimalLength) {
    d = (d || '').slice(0, config.decimalLength).padEnd(config.decimalLength, '0');
  }

  if (d && config.removeTailZero) {
    d = d.replace(/(\d*?)0*$/, '$1');
  }

  if (d && config.removeEmptyDecimalParts) {
    if (/^0*$/.test(d)) {
      return thousand(i);
    }
  }

  if (!d) {
    return thousand(i);
  }

  return [thousand(i), d].join('.');
};

export const formatHash = (hash: string, name = true): string => {
  if (name) {
    if (hash === LAMINAR_SENDER_ADDRESS || hash === LAMINAR_WATCHER_ADDRESS) {
      return 'Laminar';
    }

    if (hash === FAUCET_ADDRESS) {
      return 'Faucet';
    }

    if (Reflect.has(systemAccounts, hash)) {
      return get(systemAccounts, [hash, 'name']);
    }
  }

  return hash.replace(/(\w{6})\w*?(\w{6}$)/, '$1......$2');
};

export const formatAddress = (address: string, isMini?: boolean): string => {
  if (address === LAMINAR_WATCHER_ADDRESS || address === LAMINAR_SENDER_ADDRESS) {
    return 'Laminar';
  }

  if (address === FAUCET_ADDRESS) {
    return 'Faucet';
  }

  if (Reflect.has(systemAccounts, address)) {
    return get(systemAccounts, [address, 'name']);
  }

  return !isMini
    ? address.replace(/(\w{6})\w*?(\w{6}$)/, '$1......$2')
    : address.replace(/(\w{6})\w*$/, '$1...');
};

export const formatBalance = (balance: FixedPointNumber | Fixed18 | Codec | number | string | undefined): number => {
  if (typeof balance === 'number') return balance;

  if (typeof balance === 'string') return Number(balance);

  if (balance instanceof FixedPointNumber) return balance.toNumber();

  if (balance instanceof Fixed18) return balance.toNumber(6, 3);

  try {
    // for Codec
    return FixedPointNumber.fromInner(balance?.toString() || 0).toNumber(6);
  } catch (e) {
    // swallow error
  }

  return 0;
};

export const formatDuration = (duration: number): number => {
  const DAY = 1000 * 60 * 60 * 24;

  return FixedPointNumber.fromRational(duration, DAY).toNumber();
};
