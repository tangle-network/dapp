'use client';

import cx from 'classnames';
import { Input as SharedInput } from '@tangle-network/ui/primitives';
import { cloneElement, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { InputProps } from './types';
import { Typography } from '../../typography/Typography';

/**
 * The `Input` component
 *
 * Props:
 *
 * - `id`: The input id
 * - `htmlSize`: The native HTML `size` attribute to be passed to the `input`
 * - `isRequired`: The `required` attribute of input tab
 * - `isDisabled`: The `disabled` attribute of input tab
 * - `isRequired`: If `true`, the form control will be readonly
 * - `isValid`: If `true`, the input will change to the error state
 * - `value`: The input value, change the value by `onChange` function for controlled component
 * - `onChange`: The `onChange` function to control the value of the input
 * - `errorMessage`: The error message to be displayed if the input is invalid
 * - `leftIcon`: If added, the input will show an icon before the input value
 * - `rightIcon`: If added, the button will show an icon after the input value
 *
 * @example
 *
 * ```jsx
 *  <Input id='default' />
 *  <Input id='placeholder' placeholder='With placeholder' className='mt-3' />
 *  <Input id='readonly' value='Readonly' isReadOnly className='mt-3' />
 *  <Input
 *    id='disabled'
 *    isDisabled
 *    value='isDisabled'
 *    leftIcon={<Graph className='fill-current dark:fill-current' />}
 *    className='mt-3'
 *  />
 *  <Input id='invalid' isInvalid value='isInvalid' className='mt-3' />
 *  <Input id='withError' isInvalid value='With Error' errorMessage='Error message' className='mt-3' />
 *  <Input id='iconLeft' value='Icon left' leftIcon={<Coin size='xl' />} className='mt-3' />
 *  <Input id='iconRight' value='Icon right' rightIcon={<Search size='xl' />} className='mt-3' />
 * ```
 */
export const Input: React.FC<InputProps> = (props) => {
  const {
    className,
    debounceTime,
    errorMessage,
    htmlSize,
    id,
    isDisabled,
    isInvalid: isInvalidProp,
    isReadOnly,
    isRequired,
    leftIcon: leftIconProp,
    onChange,
    rightIcon: rightIconProp,
    size = 'md',
    type = 'text',
    value: propValue = '',
    inputRef,
    inputClassName,
    isControlled = false,
    ...restProps
  } = props;
  const [value, setValue] = useState('');
  const [cursor, setCursor] = useState<number | null>(null);

  const controlledValue = isControlled ? propValue : value;

  useEffect(() => {
    if (!debounceTime) {
      return;
    }

    const timeout = setTimeout(() => {
      onChange?.(controlledValue ?? '');
    }, debounceTime);

    return () => clearTimeout(timeout);
  }, [debounceTime, onChange, controlledValue]);

  useEffect(() => {
    inputRef?.current?.setSelectionRange(cursor, cursor);
  }, [inputRef, cursor, controlledValue]);

  // Override the size of left icon prop to 'md'.
  const leftIcon = useMemo(() => {
    if (!leftIconProp) {
      return;
    }

    return cloneElement(leftIconProp, {
      ...leftIconProp.props,
      size: 'md',
    });
  }, [leftIconProp]);

  // Override the size of right icon prop to 'md'.
  const rightIcon = useMemo(() => {
    if (!rightIconProp) {
      return;
    }
    return cloneElement(rightIconProp, {
      ...rightIconProp.props,
      size: 'md',
    });
  }, [rightIconProp]);

  const isInvalid = isInvalidProp || errorMessage;

  const paddingX =
    leftIconProp && rightIconProp
      ? ('px-8' as const)
      : leftIconProp
        ? ('pl-8 pr-4' as const)
        : rightIconProp
          ? ('pl-4 pr-8' as const)
          : ('px-4' as const);

  const mergedInputClsx = twMerge(
    paddingX,
    size === 'sm' && 'border-0 bg-transparent h-auto p-0',
    inputClassName,
  );

  const iconClsx = twMerge(
    'text-mono-140 dark:text-mono-40',
    isDisabled && 'text-mono-100 dark:text-mono-120',
  );

  return (
    <div className={className}>
      <div className={cx('relative', { 'shadow-sm': size === 'md' })}>
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-2">
            <span className={iconClsx}>{leftIcon}</span>
          </div>
        )}

        <SharedInput
          ref={(element) => {
            if (inputRef) Object.assign(inputRef, { current: element });
            if (element && htmlSize !== undefined) element.size = htmlSize;
          }}
          variant={isInvalid ? 'error' : 'default'}
          aria-invalid={isInvalid ? true : undefined}
          type={type}
          name={id}
          id={id}
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={isRequired}
          className={mergedInputClsx}
          value={controlledValue}
          onChange={(e) => {
            setCursor(e.target.selectionStart);

            isControlled && onChange !== undefined
              ? onChange(e.target.value)
              : setValue(e.target.value);
          }}
          {...restProps}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <span className={iconClsx}>{rightIcon}</span>
          </div>
        )}
      </div>

      {/** NOTE: Replace with `ErrorMessage` component. */}
      {errorMessage !== undefined && (
        <Typography
          component="p"
          variant="body4"
          fw="bold"
          className="mt-2 text-red-70 dark:text-red-50"
        >
          {errorMessage}
        </Typography>
      )}
    </div>
  );
};
