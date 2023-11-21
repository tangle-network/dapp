import { u128 } from '@polkadot/types';

import { formatTokenBalance, getPolkadotApiPromise } from '../../constants';
import { StatsMetricReturnType } from '../../types';

export const getTotalStakedAmount = async (
  address?: string
): Promise<StatsMetricReturnType> => {
  const api = await getPolkadotApiPromise();

  if (!api || !address) return NaN;

  try {
    const data = await api.query.staking.ledger(address);
    const ledger = data.unwrapOrDefault();

    const totalStaked = ledger.total.toBn() as u128;

    const availableTokenBalance = await formatTokenBalance(totalStaked);

    return availableTokenBalance ?? NaN;
  } catch (e) {
    console.error(e);

    return NaN;
  }
};
