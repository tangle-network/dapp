import { Chain } from 'viem';

/** The default native currency index in the asset registry pallet */
export const DEFAULT_NATIVE_INDEX = 0;

/** the default decimals */
export const DEFAULT_DECIMALS = 18;

/** Big int zero */
export const ZERO_BIG_INT = BigInt(0);

export const ZERO_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

export const DEFAULT_EVM_CURRENCY = {
  decimals: DEFAULT_DECIMALS,
  name: 'Ether',
  symbol: 'ETH',
} as const satisfies Chain['nativeCurrency'];

export * from './tangle';
