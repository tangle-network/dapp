import React, { FC, ChangeEventHandler, useState, useEffect, forwardRef, useCallback, useMemo, useRef, FocusEvent, FocusEventHandler } from 'react';
import clsx from 'clsx';
import { noop } from 'lodash';
import './NumberInput.scss';

const NUMBER_PATTERN = '^[0-9]*(\\.)?[0-9]*$';
const numberReg = new RegExp(NUMBER_PATTERN);

const getValidNumber = (input: string, min?: number, max?: number): [boolean, string] => {
  if (!input) {
    return [true, ''];
  }

  if (numberReg.test(input)) {
    const _num = Number(input);

    if (min !== undefined && _num < min) {
      input = String(min);
    }

    if (max !== undefined && _num >= max) {
      input = String(max);
    }

    return [true, input];
  }

  return [false, ''];
};

export interface NumberInputProps {
  className?: string;
  value?: number | string;
  onChange?: (value: number) => any;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  max?: number;
  min?: number;
}

export const NumberInput: FC<NumberInputProps> = forwardRef<HTMLInputElement, NumberInputProps>(({
  className,
  disabled,
  id,
  name,
  max = Number.MAX_VALUE,
  min = 0,
  onBlur,
  onChange,
  onFocus,
  placeholder = '0.0',
  value
}, ref) => {
  const [_value, _setValue] = useState<string>('');
  const valueRef = useRef<string>('');
  const isInEditMode = useRef<boolean>(false);

  const _onChange = useMemo(() => onChange || noop, [onChange]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback((originEvent) => {
    const originInput = originEvent.currentTarget.value;
    const [isValidNumber, validNumber] = getValidNumber(originInput, min, max);

    // trigger value change event when is a valid number and is changed, otherwise do nothing
    if (isValidNumber) {
      _setValue(validNumber);
      valueRef.current = validNumber;
      _onChange(Number(validNumber));
    }
  }, [_setValue, _onChange, min, max]);

  const _onBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    if (onBlur) onBlur(e);

    isInEditMode.current = false;
  }, [onBlur, isInEditMode]);

  const _onFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    if (onFocus) onFocus(e);

    isInEditMode.current = true;
  }, [onFocus, isInEditMode]);

  useEffect(() => {
    // dont update value if user is input
    if (isInEditMode.current) return;

    _setValue(value ? value.toString() : '');
  }, [value, _setValue, isInEditMode, _value]);

  return (
    <input
      autoComplete='off'
      className={clsx('aca-number-input', className)}
      disabled={disabled}
      id={id}
      inputMode='decimal'
      max={max}
      min={min}
      name={name}
      onBlur={_onBlur}
      onChange={handleChange}
      onFocus={_onFocus}
      pattern={NUMBER_PATTERN}
      placeholder={placeholder}
      ref={ref as any}
      value={_value}
    />
  );
});

NumberInput.displayName = 'NumberInput';
