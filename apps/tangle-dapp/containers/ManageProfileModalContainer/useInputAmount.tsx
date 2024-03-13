import { BN } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

import convertAmountStringToChainUnits from '../../utils/convertAmountStringToChainUnits';
import convertChainUnitsToNumber from '../../utils/convertChainUnitsToNumber';

/**
 * Regular expression to validate the input amount.
 *
 * It matches any number with at most one decimal point.
 */
const VALUE_REGEX = /^\d*(\.\d*)?$/;

function validateInputAmount(
  amountString: string,
  min: BN | null,
  max: BN | null,
  minErrorMessage: string
): string | null {
  const schema = z
    .string()
    .transform((value) => (value === '' ? null : value))
    .transform((value) =>
      value === null ? null : convertAmountStringToChainUnits(value)
    )
    .refine((amount) => amount === null || min === null || amount.gte(min), {
      message: minErrorMessage,
    })
    .refine((amount) => amount === null || max === null || amount.lte(max), {
      message: 'Not enough available balance',
    });

  const result = schema.safeParse(amountString);

  // Pick the first error message, since the input component does
  // not support displaying a list of error messages.
  return !result.success ? result.error.issues[0].message : null;
}

const useInputAmount = (
  amount: BN | null,
  min: BN | null,
  max: BN | null,
  minErrorMessage: string,
  setAmount?: (newAmount: BN | null) => void
) => {
  const [amountString, setAmountString] = useState(
    amount !== null ? convertChainUnitsToNumber(amount) : ''
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update the amount string when the amount changes.
  useEffect(() => {
    setAmountString(amount === null ? '' : convertChainUnitsToNumber(amount));
  }, [amount]);

  const handleChange = useCallback(
    (newAmountString: string) => {
      const digitCount = newAmountString
        .split('')
        .filter((char) => char !== '.').length;

      // Any amount of 18 decimals can fit in 28 digits.
      // Anything above that is considered invalid because it would
      // have higher precision than the chain supports.
      const MAX_DIGITS = 28;

      // Ignore invalid input characters.
      if (!VALUE_REGEX.test(newAmountString) || digitCount > MAX_DIGITS) {
        return;
      }

      setAmountString(newAmountString);

      const errorMessage = validateInputAmount(
        newAmountString,
        min,
        max,
        minErrorMessage
      );

      setErrorMessage(errorMessage);

      // If there was no error on the validation of the new amount string,
      // convert it to chain units and set it as the new amount.
      if (
        errorMessage === null &&
        setAmount !== undefined &&
        !newAmountString.endsWith('.')
      ) {
        const newAmount =
          newAmountString === ''
            ? null
            : convertAmountStringToChainUnits(newAmountString);

        setAmount(newAmount);
      }
    },
    [max, min, minErrorMessage, setAmount]
  );

  return { amountString, setAmountString, errorMessage, handleChange };
};

export default useInputAmount;
