import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';

import { formatTokenBalance } from '../constants';

/**
 * Format a token balance for display.
 *
 * @param balance Token balance to format. `null` is allowed for
 * convenience; it will be returned as `null`, so that the caller
 * can handle it appropriately (ie. display a loading indicator).
 *
 * @param includeUnit Whether to include the Tangle token unit in the
 * formatted balance.
 *
 * @returns Formatted token balance, if the async step to obtain the
 * chain decimals has completed. Otherwise, `null` until it completes.
 *
 * @remarks
 * Since the formatting of token balances involves an async step to
 * obtain the chain decimals, this hook is an useful abstraction of
 * that process to avoid having to manage state and `useEffect`.
 *
 * @example
 * ```ts
 * const { total } = useAccountBalances();
 * const formattedTotal: string | null = useFormattedBalance(total, false);
 * ```
 */
const useFormattedBalance = (
  balance: BN | null,
  includeUnit?: boolean
): string | null => {
  const [formattedBalance, setFormattedBalance] = useState<string | null>(null);

  useEffect(() => {
    if (balance === null) {
      setFormattedBalance(null);

      return;
    }

    const format = async () => {
      const nextFormattedBalance = await formatTokenBalance(
        balance,
        includeUnit
      );

      setFormattedBalance(nextFormattedBalance);
    };

    format();

    // TODO: Handle cleanup.
  }, [balance, includeUnit]);

  return formattedBalance;
};

export default useFormattedBalance;
