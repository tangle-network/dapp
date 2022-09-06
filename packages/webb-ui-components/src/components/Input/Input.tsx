import cx from 'classnames';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { InputProps } from './types';

export const Input: React.FC<InputProps> = (props) => {
  const {
    className,
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
    type = 'text',
    value,
    ...restProps
  } = props;

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
    () => twMerge(inputClsxBase, inputClsxHover, inputClsxFocus, inputClsxDisabled),
    [inputClsxBase, inputClsxDisabled, inputClsxFocus, inputClsxHover]
  );

  const iconClsx = useMemo(
    () => cx(twMerge('text-mono-140 dark:text-mono-40', isDisabled ? 'text-mono-100 dark:text-mono-120' : '')),
    [isDisabled]
  );

  return (
    <div className={className}>
      <div className='relative shadow-sm'>
        {leftIcon && (
          <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2'>
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
          onChange={onChange}
          {...restProps}
        />

        {rightIcon && (
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
            <span className={iconClsx}>{rightIcon}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <span className='block mt-2 ml-4 body4 font-bold text-red dark:text-red-50'>{errorMessage}</span>
      )}
    </div>
  );
};
