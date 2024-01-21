import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useCallback, useEffect, useState } from 'react';

import { formatTokenBalance } from '../../constants/polkadot';
import useAccountBalances, { AccountBalances } from './useAccountBalances';

export default function useFormattedAccountBalances(
  includeUnits = true
): Record<keyof AccountBalances, string | null> {
  const [formattedBalances, setFormattedBalances] = useState<
    Record<keyof AccountBalances, string | null>
  >({
    total: null,
    free: null,
    locked: null,
  });

  const balances = useAccountBalances();
  const { notificationApi } = useWebbUI();

  const formatSingleBalance = useCallback(
    async (balanceKey: keyof AccountBalances) => {
      if (balances === null) {
        return;
      }

      const nextFormattedBalance = await formatTokenBalance(
        balances[balanceKey],
        includeUnits
      );

      setFormattedBalances((prevBalances) => ({
        ...prevBalances,
        [balanceKey]: nextFormattedBalance,
      }));
    },
    [balances, includeUnits]
  );

  useEffect(() => {
    if (balances === null) {
      setFormattedBalances({
        total: null,
        free: null,
        locked: null,
      });

      return;
    }

    formatSingleBalance('total');
    formatSingleBalance('free');
    formatSingleBalance('locked');
  }, [balances, formatSingleBalance, includeUnits, notificationApi]);

  return formattedBalances;
}
