import { u128 } from '@polkadot/types';
import { formatBalance } from '@polkadot/util';

import { TOKEN_UNIT } from '../../constants';
import { getPolkadotApiPromise } from './api';

export const formatTokenBalance = async (
  balance: u128
): Promise<string | undefined> => {
  const api = await getPolkadotApiPromise();

  if (!api) return balance.toString();

  if (balance.toString() === '0') return `0 ${TOKEN_UNIT}`;

  const chainDecimals = await api.registry.chainDecimals;
  const balanceFormatType = {
    decimals: chainDecimals[0],
    withUnit: TOKEN_UNIT,
  };

  const formattedBalance = formatBalance(balance, balanceFormatType);

  return formattedBalance;
};
