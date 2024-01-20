import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useEffect, useState } from 'react';

import { formatTokenBalance } from '../constants';
import useActiveAccountBalances, {
  AccountBalances,
} from './useActiveAccountBalances';

export default function useFormattedBalances(
  includeUnits = true
): Record<keyof AccountBalances, string | null> {
  const [formattedBalances, setFormattedBalances] = useState<
    Record<keyof AccountBalances, string | null>
  >({
    total: null,
    free: null,
    locked: null,
  });

  const balances = useActiveAccountBalances();
  const { notificationApi } = useWebbUI();

  useEffect(() => {
    if (balances === null) {
      setFormattedBalances({
        total: null,
        free: null,
        locked: null,
      });

      return;
    }

    console.debug(
      'Formatting balances:',
      balances.total.toString(),
      balances.locked.toString(),
      balances.free.toString()
    );

    let isMounted = true;

    const formatSingleBalance = async (balanceKey: keyof AccountBalances) => {
      try {
        const nextFormattedBalance = await formatTokenBalance(
          balances[balanceKey],
          includeUnits
        );

        if (isMounted) {
          setFormattedBalances((prevBalances) => ({
            ...prevBalances,
            [balanceKey]: nextFormattedBalance,
          }));
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        notificationApi({
          variant: 'error',
          message: 'Error formatting balance',
          secondaryMessage: error instanceof Error ? error.message : undefined,
        });

        setFormattedBalances((prevBalances) => ({
          ...prevBalances,
          [balanceKey]: null,
        }));
      }
    };

    formatSingleBalance('total');
    formatSingleBalance('free');
    formatSingleBalance('locked');

    return () => {
      isMounted = false;
    };
  }, [balances, includeUnits, notificationApi]);

  return formattedBalances;
}
