import { BN } from '@polkadot/util';
import { useCallback, useState } from 'react';

import convertAmountStringToChainUnits from '../../utils/convertAmountStringToChainUnits';
import { DECIMAL_REGEX } from './AmountInput';

/**
 * Utility function to keep a BN within a range.
 */
function clamp(amount: BN, min: BN, max: BN): BN {
  return BN.max(BN.min(amount, max), min);
}

const useInputAmount = (min: BN | null, max: BN | null, used?: BN | null) => {
  const [amount, setAmount] = useState<BN | null>(null);

  const handleChange = useCallback(
    (newValue: string) => {
      // Do nothing if the input is invalid or empty.
      if (
        !DECIMAL_REGEX.test(newValue) ||
        max === null ||
        min === null ||
        (used !== undefined && used === null)
      ) {
        return;
      }

      const remaining = used === undefined ? max : max.sub(used);

      // Keep the amount within range.
      const newAmount = clamp(
        convertAmountStringToChainUnits(newValue),
        min,
        remaining
      );

      setAmount(newAmount);
    },
    [max, min, used]
  );

  const setAmountOverride = useCallback(
    (newValue: BN | null) => {
      if (newValue === null) {
        setAmount(null);

        return;
      }
      // Not yet ready.
      else if (max === null || min === null) {
        return;
      }

      setAmount(clamp(newValue, min, max));
    },
    [max, min]
  );

  return { amount, setAmount: setAmountOverride, handleChange };
};

export default useInputAmount;
