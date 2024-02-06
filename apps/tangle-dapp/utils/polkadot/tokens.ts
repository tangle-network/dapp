import { BN, formatBalance } from '@polkadot/util';

import { TANGLE_TOKEN_DECIMALS, TANGLE_TOKEN_UNIT } from '../../constants';

export const formatTokenBalance = (balance: BN, includeUnit = true): string => {
  return formatBalance(balance, {
    decimals: TANGLE_TOKEN_DECIMALS,
    withUnit: includeUnit ? TANGLE_TOKEN_UNIT : false,
  });
};
