import { Chain } from 'viem';

/** the default decimals */
export const DEFAULT_DECIMALS = 18;

/** Big int zero */
export const ZERO_BIG_INT = BigInt(0);

export const DEFAULT_EVM_CURRENCY = {
  decimals: DEFAULT_DECIMALS,
  name: 'Ether',
  symbol: 'ETH',
} as const satisfies Chain['nativeCurrency'];

export * from './tangle';
