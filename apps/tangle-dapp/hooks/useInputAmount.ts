import { BN } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';

import formatBn, { FormatOptions } from '../utils/formatBn';
import parseChainUnits, {
  ChainUnitParsingError,
} from '../utils/parseChainUnits';

type SafeParseInputAmountOptions = {
  amountString: string;
  min: BN | null;
  max: BN | null;
  errorOnEmptyValue: boolean;
  decimals: number;
  minErrorMessage?: string;
  maxErrorMessage?: string;
};

function safeParseInputAmount(
  options: SafeParseInputAmountOptions,
): BN | string | null {
  const result = parseChainUnits(options.amountString, options.decimals);

  if (!(result instanceof BN)) {
    switch (result) {
      case ChainUnitParsingError.EmptyAmount:
        return options.errorOnEmptyValue ? 'Amount is required' : null;
      case ChainUnitParsingError.ExceedsDecimals:
        return `Amount cannot exceed ${options.decimals} decimal places`;
    }
  } else if (options.min !== null && result.lt(options.min)) {
    return options.minErrorMessage ?? `Amount is below the minimum`;
  } else if (options.max !== null && result.gt(options.max)) {
    return options.maxErrorMessage ?? `Amount is above the maximum`;
  }

  return result;
}

const INPUT_AMOUNT_FORMAT: Partial<FormatOptions> = {
  includeCommas: true,
  fractionMaxLength: undefined,
};

type Options = {
  amount: BN | null;
  min?: BN | null;
  max?: BN | null;
  errorOnEmptyValue?: boolean;
  minErrorMessage?: string;
  maxErrorMessage?: string;
  decimals: number;
  setAmount?: (newAmount: BN | null) => void;
};

const useInputAmount = ({
  amount,
  min = null,
  max = null,
  errorOnEmptyValue = false,
  minErrorMessage,
  maxErrorMessage,
  decimals,
  setAmount,
}: Options) => {
  // TODO: Need to display the error message when the amount is invalid, and it is the first time the input is rendered (i.e. the initial amount is invalid).

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [displayAmount, setDisplayAmount] = useState(
    amount !== null ? formatBn(amount, decimals, INPUT_AMOUNT_FORMAT) : '',
  );

  const handleChange = useCallback(
    (newAmountString: string) => {
      let wasPeriodSeen = false;

      const cleanAmountString = newAmountString
        .split('')
        .filter((char) => {
          if (char === '.' && !wasPeriodSeen) {
            wasPeriodSeen = true;

            return true;
          }

          // Only consider digits. Ignore any other characters.
          return char.match(/\d/);
        })
        .join('');

      // Nothing to do.
      if (displayAmount === cleanAmountString) {
        return;
      }

      // TODO: Format the new amount string to include commas. Use `INPUT_AMOUNT_FORMAT`.
      setDisplayAmount(cleanAmountString);

      const amountOrError = safeParseInputAmount({
        amountString: cleanAmountString,
        min,
        max,
        errorOnEmptyValue,
        decimals,
        minErrorMessage,
        maxErrorMessage,
      });

      // There was an error on the validation of the new amount string.
      if (typeof amountOrError === 'string') {
        setErrorMessage(amountOrError);
      }
      // If there was no error on the validation of the new amount string,
      // convert it to chain units and set it as the new amount.
      else if (setAmount !== undefined && !cleanAmountString.endsWith('.')) {
        setErrorMessage(null);
        setAmount(amountOrError);
      }
    },
    [
      decimals,
      displayAmount,
      errorOnEmptyValue,
      max,
      maxErrorMessage,
      min,
      minErrorMessage,
      setAmount,
    ],
  );

  const setDisplayAmount_ = useCallback(
    (amount: BN) => {
      setDisplayAmount(
        formatBn(amount, decimals, {
          ...INPUT_AMOUNT_FORMAT,
          includeCommas: false,
        }),
      );
    },
    [decimals],
  );

  useEffect(() => {
    // If the amount is null, then the display amount should always be empty.
    // This handle the case where the amount is set to null after submitting a tx
    // but the display amount is not updated
    if (!amount) {
      setDisplayAmount('');
    }
  }, [amount]);

  const trySetAmount = useCallback(
    (newAmount: BN): boolean => {
      // Only accept the new amount if it is within the min and max bounds.
      if (max !== null && newAmount.gt(max)) {
        return false;
      } else if (min !== null && newAmount.lt(min)) {
        return false;
      }
      // No closure was provided to set the new amount.
      else if (setAmount === undefined) {
        return false;
      }

      setAmount(newAmount);

      // TODO: Update the display amount to reflect the new amount. Must format the BN to a string.

      return true;
    },
    [max, min, setAmount],
  );

  return {
    displayAmount,
    errorMessage,
    handleChange,
    trySetAmount,
    setDisplayAmount: setDisplayAmount_,
  };
};

export default useInputAmount;
