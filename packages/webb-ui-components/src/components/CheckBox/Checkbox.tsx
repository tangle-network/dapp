import cx from 'classnames';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { CheckBoxProps } from './types';

export const CheckBox: React.FC<CheckBoxProps> = (props) => {
  const {
    children,
    className,
    htmlFor,
    inputProps = {},
    isChecked,
    isDisabled,
    onChange,
    spacing = 4,
    labelClassName: labelClsxProp,
    wrapperClassName,
  } = props;

  const inputClsx = 'form-checkbox peer transition-none bg-mono-0 w-[18px] h-[18px] rounded border border-mono-80 ';
  const inputHoverClsx = 'hover:bg-blue-0 hover:border-blue-50 hover:shadow-sm hover:shadow-blue-10';
  const inputCheckedClsx = 'checked:bg-blue dark:checked:bg-blue-30';
  const inputDisabledClsx =
    'disabled:border-mono-60 disabled:cursor-not-allowed disabled:bg-mono-0 disabled:shadow-none dark:disabled:bg-mono-140 dark:disabled:border-mono-120';

  const mergedInputClsx = twMerge(inputClsx, inputHoverClsx, inputCheckedClsx, inputDisabledClsx, className);

  const spacingClx = `ml-${spacing}` as const;
  const labelClsx = cx(
    'inline-block body1 peer-disabled:cursor-not-allowed',
    isDisabled ? 'text-mono-120' : 'text-mono-140 dark:text-mono-20',
    spacingClx
  );
  const mergedLabelClsx = twMerge(labelClsx, labelClsxProp);

  return (
    <span className={wrapperClassName}>
      <label className='inline-flex justify-center items-center min-h-[28px]' htmlFor={htmlFor}>
        <input
          type='checkbox'
          className={mergedInputClsx}
          checked={isChecked}
          onChange={onChange}
          disabled={isDisabled}
          {...inputProps}
        />
        {children && (
          <label htmlFor={htmlFor} className={mergedLabelClsx}>
            {children}
          </label>
        )}
      </label>
    </span>
  );
};
