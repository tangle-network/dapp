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

      setDisplayAmount(cleanAmountString);

      const amountOrError = safeParseInputAmount({
        amountString: newAmountString,
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
      else if (setAmount !== undefined && !newAmountString.endsWith('.')) {
        setErrorMessage(null);
        setAmount(amountOrError);
      }
    },
    [
      decimals,
      errorOnEmptyValue,
      max,
      maxErrorMessage,
      min,
      minErrorMessage,
      setAmount,
    ],
  );

  const updateDisplayAmountManual = useCallback(
    (amount: BN) => {
      setDisplayAmount(formatBn(amount, decimals, INPUT_AMOUNT_FORMAT));
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

  return {
    displayAmount,
    errorMessage,
    handleChange,
    updateDisplayAmountManual,
  };
};

export default useInputAmount;
