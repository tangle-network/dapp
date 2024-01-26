import { BN } from '@polkadot/util';
import { useEffect, useState } from 'react';

import { formatTokenBalance } from '../constants';

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
