import { zeroAddress } from 'viem';

export * from './currency-config.interface.js';

export const DEFAULT_EVM_CURRENCY = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
  address: zeroAddress,
} as const;

export const ORBIT_NATIVE_CURRENCY = {
  name: 'Orbit ETH',
  symbol: 'ORBt',
  decimals: 18,
  address: zeroAddress,
} as const;
