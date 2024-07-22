import { BN, formatBalance } from '@polkadot/util';
import { ToBn } from '@polkadot/util/types';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';

import { TangleTokenSymbol } from '../types';

const formatTangleBalance = (
  balance: BN | bigint | ToBn,
  tokenSymbol?: TangleTokenSymbol,
  options: Partial<Parameters<typeof formatBalance>[1]> = {},
): string => {
  return formatBalance(balance, {
    decimals: TANGLE_TOKEN_DECIMALS,
    withZero: false,
    // TODO: There is a bug here, since small balances will show up as 0 because of this option.
    // This ensures that the balance is always displayed in the
    // base unit, preventing the conversion to larger or smaller
    // units (e.g. kilo, milli, etc.).
    forceUnit: '-',
    withUnit: tokenSymbol ?? false,
    ...options,
  });
};

export default formatTangleBalance;
