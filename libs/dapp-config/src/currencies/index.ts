import { zeroAddress } from 'viem';

export * from './currency-config.interface';

export const DEFAULT_EVM_CURRENCY = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
  address: zeroAddress,
} as const;
