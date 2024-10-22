import { useCallback, useEffect, useState } from 'react';

import cleanNumericInputString from '../utils/cleanNumericInputString';

export type CustomInputValueProps<T> = {
  value?: T | null;
  isNumericDecimal?: boolean;
  suffix?: string;
  setValue: (newValue: T | null) => void;
  parse: (string: string) => T | Error;
  format: (value: T) => string;
};

const END_ZEROES_REGEX = /\.0+$/;

function useCustomInputValue<T>({
  value: initialValue,
  isNumericDecimal = true,
  suffix,
  setValue: setValueOnConsumer,
  parse,
  format,
}: CustomInputValueProps<T>) {
  const formatDisplayValue = useCallback(
    (value: T | null) => {
      if (value === null) {
        return '';
      }

      return `${format(value)}${suffix ?? ''}`;
    },
    [format, suffix],
  );

  const [displayValue, setDisplayValue] = useState<string>(
    formatDisplayValue(initialValue ?? null),
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Attempt to parse the display value once the input's value
  // changes.
  useEffect(() => {
    if (displayValue === '') {
      return;
    }

    const suffixLength = suffix?.length ?? 0;

    const displayValueMinusSuffix = displayValue.substring(
      0,
      displayValue.length - suffixLength,
    );

    const cleanDisplayValue = isNumericDecimal
      ? cleanNumericInputString(displayValue)
      : displayValueMinusSuffix;

    // Edge cases when parsing numeric decimal values.
    if (isNumericDecimal) {
      // Let the user type the decimal digits before attempting to
      // parse the value.
      if (cleanDisplayValue.endsWith('.')) {
        return;
      }
      // Special case to allow for values like `1.0001` without immediately
      // parsing it as `1.0` -> `1`.
      else if (END_ZEROES_REGEX.test(cleanDisplayValue)) {
        return;
      }
    }

    const parsedValue = parse(cleanDisplayValue);

    if (parsedValue instanceof Error) {
      setErrorMessage(parsedValue.message);
    } else {
      setErrorMessage(null);
      setValueOnConsumer(parsedValue);
      setDisplayValue(formatDisplayValue(parsedValue));
    }
  }, [
    format,
    formatDisplayValue,
    displayValue,
    isNumericDecimal,
    parse,
    setDisplayValue,
    setValueOnConsumer,
    suffix,
  ]);

  const setValue = useCallback(
    (newValue: T | null) => {
      setValueOnConsumer(newValue);

      if (newValue === null) {
        setDisplayValue('');
        setErrorMessage(null);
      } else {
        setDisplayValue(formatDisplayValue(newValue));
      }
    },
    [setValueOnConsumer, formatDisplayValue],
  );

  return {
    displayValue,
    setDisplayValue,
    setValue,
    errorMessage,
  };
}

export default useCustomInputValue;
