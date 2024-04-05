import { BN } from '@polkadot/util';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import convertAmountStringToChainUnits from '../../utils/convertAmountStringToChainUnits';
import formatBnToDisplayAmount from '../../utils/formatBnToDisplayAmount';

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
  errorOnEmptyValue: boolean,
  minErrorMessage?: string,
  maxErrorMessage?: string
): string | null {
  const schema = z
    .string()
    .transform((value) => (value === '' ? null : value))
    .transform((value) =>
      value === null ? null : convertAmountStringToChainUnits(value)
    )
    .refine((amount) => !errorOnEmptyValue || amount !== null, {
      message: 'No amount given',
    })

    .refine((amount) => amount === null || min === null || amount.gte(min), {
      // TODO: Show what the min value is.
      message: minErrorMessage ?? 'Amount is below minimum',
    })
    .refine((amount) => amount === null || max === null || amount.lte(max), {
      // TODO: Show what the max value is.
      message: maxErrorMessage ?? 'Amount is above maximum',
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
  errorOnEmptyValue: boolean,
  setAmount?: (newAmount: BN | null) => void,
  minErrorMessage?: string,
  maxErrorMessage?: string
) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [displayAmount, setDisplayAmount] = useState(
    amount !== null ? formatBnToDisplayAmount(amount) : ''
  );

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

      setDisplayAmount(newAmountString);

      const errorMessage = validateInputAmount(
        newAmountString,
        min,
        max,
        errorOnEmptyValue,
        minErrorMessage,
        maxErrorMessage
      );

      setErrorMessage(errorMessage);

      // If there was no error on the validation of the new amount string,
      // convert it to chain units and set it as the new amount.
      if (
        errorMessage === null &&
        setAmount !== undefined &&
        !newAmountString.endsWith('.')
      ) {
        // Allow the amount string to be removed, by setting its value
        // to null.
        setAmount(
          newAmountString === ''
            ? null
            : convertAmountStringToChainUnits(newAmountString)
        );
      }
    },
    [errorOnEmptyValue, max, maxErrorMessage, min, minErrorMessage, setAmount]
  );

  const refreshDisplayAmount = useCallback((newDisplayAmount: BN) => {
    setDisplayAmount(formatBnToDisplayAmount(newDisplayAmount));
  }, []);

  return {
    displayAmount,
    refreshDisplayAmount,
    errorMessage,
    handleChange,
  };
};

export default useInputAmount;
