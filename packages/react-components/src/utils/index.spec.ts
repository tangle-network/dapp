import { thousand, getTokenName, formatHash, formatBalance, formatNumber } from './index';
import { Fixed18 } from '@acala-network/app-util';

describe('test utils', () => {
  test('formatNumbebr should work', () => {
    expect(formatNumber(1000.00, { decimalLength: 6, removeEmptyDecimalParts: false, removeTailZero: false })).toEqual('1,000.000000')
    expect(formatNumber(1000.00, { decimalLength: 2, removeEmptyDecimalParts: false, removeTailZero: true})).toEqual('1,000')
    expect(formatNumber(1000.00, { decimalLength: 2, removeEmptyDecimalParts: true, removeTailZero: false})).toEqual('1,000')
    expect(formatNumber(1000.00, { decimalLength: 2, removeEmptyDecimalParts: true, removeTailZero: true })).toEqual('1,000')
    expect(formatNumber('1000.00', { decimalLength: 6, removeEmptyDecimalParts: false, removeTailZero: false })).toEqual('1,000.000000')
    expect(formatNumber(Fixed18.fromNatural(1000), { decimalLength: 6, removeEmptyDecimalParts: false, removeTailZero: false })).toEqual('1,000.000000')
    expect(formatNumber(1000.123456789, { decimalLength: 6, removeEmptyDecimalParts: true, removeTailZero: true })).toEqual('1,000.123456')
    expect(formatNumber(1000.123000000, { decimalLength: 6, removeEmptyDecimalParts: true, removeTailZero: true })).toEqual('1,000.123')
    expect(formatNumber(1e10, { decimalLength: 6, removeEmptyDecimalParts: true, removeTailZero: true })).toEqual('10,000,000,000')
  });


  test('thousand notation should work', () => {
    expect(thousand('100')).toEqual('100');
    expect(thousand('1000')).toEqual('1,000');
    expect(thousand('1000000')).toEqual('1,000,000');
  });

  test('getTokenName should work', () => {
    expect(getTokenName('AUSD')).toEqual('aUSD');
  });

  test('formatHash should work', () => {
    expect(formatHash('0x123456789abcdef')).toEqual('0x1234......abcdef');
    expect(formatHash('')).toEqual('');
  });

  test('formatBalance should work', () => {
    // eslint-disabled
    // @ts-ignore
    expect(formatBalance().toString()).toEqual(Fixed18.ZERO.toString());
    expect(formatBalance(12).toString()).toEqual(Fixed18.fromNatural(12).toString());
    expect(formatBalance('12').toString()).toEqual(Fixed18.fromNatural(12).toString());
    expect(formatBalance(Fixed18.fromNatural(12)).toString()).toEqual(Fixed18.fromNatural(12).toString());
  });
});