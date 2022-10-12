import cx from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { InputProps } from './types';

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
    debounceTime = 0,
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
    value: initialValue = '',
    ...restProps
  } = props;
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange?.(value ?? '');
    }, debounceTime);

    return () => clearTimeout(timeout);
  }, [debounceTime, onChange, value]);

  // Override the size of left icon prop to 'md'
  const leftIcon = useMemo(() => {
    if (!leftIconProp) {
      return;
    }
    return React.cloneElement(leftIconProp, { ...leftIconProp.props, size: 'md' });
  }, [leftIconProp]);

  // Override the size of right icon prop to 'md'
  const rightIcon = useMemo(() => {
    if (!rightIconProp) {
      return;
    }
    return React.cloneElement(rightIconProp, { ...rightIconProp.props, size: 'md' });
  }, [rightIconProp]);

  const isInvalid = useMemo(() => isInvalidProp || errorMessage, [isInvalidProp, errorMessage]);

  const paddingX = useMemo(
    () =>
      leftIconProp && rightIconProp
        ? ('px-8' as const)
        : leftIconProp
        ? ('pl-8 pr-4' as const)
        : rightIconProp
        ? ('pl-4 pr-8' as const)
        : ('px-4' as const),
    [leftIconProp, rightIconProp]
  );

  const inputClsxBase = useMemo(
    () =>
      cx(
        'form-input w-full transition-none body1 bg-mono-0 rounded-lg text-mono-140 dark:bg-mono-200 dark:text-mono-40 invalid:border-red-40 py-2',
        'placeholder:italic placeholder:text-mono-100 dark:placeholder:text-mono-120',
        paddingX,
        isInvalid ? ('border-red-40' as const) : ('border-mono-80 dark:border-mono-120' as const)
      ),
    [isInvalid, paddingX]
  );
  const inputClsxHover = useMemo(() => 'hover:border-blue-40 dark:hover:border-blue-70', []);
  const inputClsxFocus = useMemo(
    () => 'focus:bg-blue-0 focus:border-blue-40 dark:focus:bg-blue-120 dark:focus:border-blue-70',
    []
  );
  const inputClsxDisabled = useMemo(
    () =>
      'disabled:text-mono-100 dark:disabled:text-mono-120 disabled:bg-mono-40 dark:disabled:bg-mono-160 disabled:cursor-not-allowed disabled:hover:border-mono-80 dark:disabled:hover:border-mono-120',
    []
  );

  const mergedInputClsx = useMemo(
    () =>
      size === 'md'
        ? twMerge(inputClsxBase, inputClsxHover, inputClsxFocus, inputClsxDisabled)
        : cx(
            'border-none w-full bg-transparent focus:ring-0 p-0 body1 font-bold',
            'placeholder:text-mono-100 dark:placeholder:text-mono-80 text-mono-200 dark:text-mono-0'
          ),
    [inputClsxBase, inputClsxDisabled, inputClsxFocus, inputClsxHover, size]
  );

  const iconClsx = useMemo(
    () => cx(twMerge('text-mono-140 dark:text-mono-40', isDisabled ? 'text-mono-100 dark:text-mono-120' : '')),
    [isDisabled]
  );

  return (
    <div className={className}>
      <div className={cx('relative', { 'shadow-sm': size === 'md' })}>
        {leftIcon && (
          <div className='absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none'>
            <span className={iconClsx}>{leftIcon}</span>
          </div>
        )}

        <input
          size={htmlSize}
          type={type}
          name={id}
          id={id}
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={isRequired}
          className={mergedInputClsx}
          value={value}
          onChange={(eve) => setValue(eve.target.value)}
          {...restProps}
        />

        {rightIcon && (
          <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
            <span className={iconClsx}>{rightIcon}</span>
          </div>
        )}
      </div>

      {errorMessage && <span className='block mt-2 ml-4 utility text-red dark:text-red-50'>{errorMessage}</span>}
    </div>
  );
};
