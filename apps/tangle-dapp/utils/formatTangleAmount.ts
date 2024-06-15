import { BN, formatBalance } from '@polkadot/util';
import { ToBn } from '@polkadot/util/types';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';

import { TokenSymbol } from '../types';

const formatTangleAmount = (
  balance: BN | bigint | ToBn,
  tokenSymbol?: TokenSymbol,
  options: Partial<Parameters<typeof formatBalance>[1]> = {},
): string => {
  return formatBalance(balance, {
    decimals: TANGLE_TOKEN_DECIMALS,
    withZero: false,
    forceUnit: '-',
    withUnit: tokenSymbol ?? false,
    ...options,
  });
};

export default formatTangleAmount;
