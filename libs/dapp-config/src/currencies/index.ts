import { ZERO_ADDRESS } from '@webb-tools/utils';

export * from './currency-config.interface';

export const DEFAULT_EVM_CURRENCY = {
  name: 'Webb Ether',
  symbol: 'ETH',
  decimals: 18,
  address: ZERO_ADDRESS,
} as const;
