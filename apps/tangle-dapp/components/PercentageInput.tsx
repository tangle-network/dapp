import BackspaceDeleteFillIcon from '@webb-tools/icons/BackspaceDeleteFillIcon';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import { Button, Input } from '@webb-tools/webb-ui-components';
import Decimal from 'decimal.js';
import { FC, useCallback } from 'react';

import useCustomInputValue from '../hooks/useCustomInputValue';
import InputWrapper, { InputWrapperProps } from './InputWrapper';

export type PercentageInputProps = {
  id: string;
  title: string;
  value: number | null;
  setValue: (newValue: number | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
  wrapperProps?: Partial<InputWrapperProps>;
  useStandardBoundaries?: boolean;
};

const PercentageInput: FC<PercentageInputProps> = ({
  id,
  title,
  value,
  setValue: setValueOnParent,
  placeholder,
  isDisabled = false,
  wrapperProps,
  useStandardBoundaries = true,
}) => {
  const parsePercentage = useCallback(
    (string: string) => {
      try {
        if (isNaN(parseFloat(string))) {
          return new Error('Invalid percentage');
        }

        const parsedValue = new Decimal(string).div(100).toNumber();

        // Limit the value between 0 to 100% if requested.
        // This is the most common percentage behavior.
        return useStandardBoundaries
          ? Math.max(0, Math.min(1, parsedValue))
          : parsedValue;
      } catch (error) {
        return ensureError(error);
      }
    },
    [useStandardBoundaries],
  );

  const formatPercentage = useCallback(
    (value: number): string => new Decimal(value).times(100).toString(),
    [],
  );

  const {
    displayValue,
    setDisplayValue,
    errorMessage,
    setValue,
    handleKeyDown,
  } = useCustomInputValue<number>({
    setValue: setValueOnParent,
    format: formatPercentage,
    parse: parsePercentage,
    suffix: '%',
  });

  const clearAction =
    value === null ? undefined : (
      <Button size="sm" variant="utility" onClick={() => setValue(null)}>
        <BackspaceDeleteFillIcon className="fill-current dark:fill-current" />
      </Button>
    );

  return (
    <InputWrapper
      id={id}
      title={title}
      isDisabled={isDisabled}
      errorMessage={errorMessage ?? undefined}
      actions={clearAction}
      {...wrapperProps}
    >
      <Input
        id={id}
        inputClassName="placeholder:text-md"
        type="text"
        placeholder={placeholder}
        size="sm"
        autoComplete="off"
        value={displayValue}
        onChange={setDisplayValue}
        onKeyDown={handleKeyDown}
        isDisabled={isDisabled}
        isControlled
      />
    </InputWrapper>
  );
};

export default PercentageInput;
