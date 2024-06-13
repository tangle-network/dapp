import { BN } from '@polkadot/util';
import { useCallback, useState } from 'react';
import { z } from 'zod';

import formatBn, { FormatOptions } from '../utils/formatBn';
import parseChainUnits from '../utils/parseChainUnits';

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
  decimals: number,
  minErrorMessage?: string,
  maxErrorMessage?: string,
): string | null {
  const schema = z
    .string()
    .transform((value) => (value === '' ? null : value))
    .transform((value) =>
      value === null ? null : parseChainUnits(value, decimals),
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

const INPUT_AMOUNT_FORMAT: Partial<FormatOptions> = {
  includeCommas: false,
  fractionLength: undefined,
};

type Options = {
  amount: BN | null;
  min?: BN | null;
  max?: BN | null;
  errorOnEmptyValue?: boolean;
  setAmount?: (newAmount: BN | null) => void;
  minErrorMessage?: string;
  maxErrorMessage?: string;
  decimals: number;
};

const useInputAmount = ({
  amount,
  min = null,
  max = null,
  errorOnEmptyValue = false,
  setAmount,
  minErrorMessage,
  maxErrorMessage,
  decimals,
}: Options) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [displayAmount, setDisplayAmount] = useState(
    amount !== null ? formatBn(amount, decimals, INPUT_AMOUNT_FORMAT) : '',
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
        decimals,
        minErrorMessage,
        maxErrorMessage,
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
            : parseChainUnits(newAmountString, decimals),
        );

        setDisplayAmount(newAmountString);
      }
    },
    [
      errorOnEmptyValue,
      max,
      maxErrorMessage,
      min,
      minErrorMessage,
      setAmount,
      decimals,
    ],
  );

  const refreshDisplayAmount = useCallback(
    (newDisplayAmount: BN | null) => {
      setDisplayAmount(
        newDisplayAmount === null
          ? ''
          : formatBn(newDisplayAmount, decimals, INPUT_AMOUNT_FORMAT),
      );
    },
    [decimals],
  );

  return {
    displayAmount,
    refreshDisplayAmount,
    errorMessage,
    handleChange,
  };
};

export default useInputAmount;
