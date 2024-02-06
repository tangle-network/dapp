import { BN, formatBalance } from '@polkadot/util';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import { getPolkadotApiPromise } from './api';

export const formatTokenBalance = async (
  balance: BN,
  includeUnit = true
): Promise<string> => {
  const api = await getPolkadotApiPromise();

  // Use 18 as default decimals as a fallback.
  const decimals = api.registry.chainDecimals[0] || 18;

  return formatBalance(balance, {
    decimals,
    withUnit: includeUnit ? TANGLE_TOKEN_UNIT : false,
  });
};
