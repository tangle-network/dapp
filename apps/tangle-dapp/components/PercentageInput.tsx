import BackspaceDeleteFillIcon from '@webb-tools/icons/BackspaceDeleteFillIcon';
import { Button, Input } from '@webb-tools/webb-ui-components';
import { FC, useCallback } from 'react';

import useCustomInputValue from '../hooks/useCustomInputValue';
import ensureError from '../utils/ensureError';
import InputWrapper, { InputWrapperProps } from './InputWrapper';

export type PercentageInputProps = {
  id: string;
  title: string;
  value: number | null;
  setValue: (newValue: number | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
  wrapperOverrides?: Partial<InputWrapperProps>;
  useStandardBoundaries?: boolean;
};

const PercentageInput: FC<PercentageInputProps> = ({
  id,
  title,
  value,
  setValue: setValueOnParent,
  placeholder,
  isDisabled = false,
  wrapperOverrides,
  useStandardBoundaries = true,
}) => {
  const parsePercentage = useCallback(
    (string: string) => {
      try {
        const parsedValue = parseFloat(string) / 100;

        if (isNaN(parsedValue)) {
          return new Error('Invalid percentage');
        }

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
    (value: number): string => (value * 100).toString(),
    [],
  );

  const { displayValue, setDisplayValue, errorMessage, setValue } =
    useCustomInputValue<number>({
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
      {...wrapperOverrides}
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
        isDisabled={isDisabled}
        isControlled
      />
    </InputWrapper>
  );
};

export default PercentageInput;
