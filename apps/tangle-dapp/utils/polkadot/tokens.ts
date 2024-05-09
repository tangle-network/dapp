import { BN, formatBalance } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';

export const formatTokenBalance = (
  balance: BN | bigint,
  tokenSymbol?: string,
  options: Parameters<typeof formatBalance>[1] = {}
): string => {
  return formatBalance(balance, {
    decimals: TANGLE_TOKEN_DECIMALS,
    withZero: false,
    forceUnit: '-',
    withUnit: tokenSymbol ?? false,
    ...options,
  });
};
