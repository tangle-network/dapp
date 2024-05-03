import { BN, formatBalance } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';

export const formatTokenBalance = (
  balance: BN | bigint,
  tokenSymbol?: string
): string => {
  return formatBalance(balance, {
    decimals: TANGLE_TOKEN_DECIMALS,
    withZero: false,
    withUnit: tokenSymbol ?? false,
  });
};
