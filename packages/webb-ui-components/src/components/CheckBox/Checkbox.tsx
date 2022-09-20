import cx from 'classnames';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { CheckBoxProps } from './types';

/**
 * The `CheckBox` component
 *
 * Props:
 *
 * - `isDisabled`: If `true`, the checkbox will be disabled
 * - `spacing`: The spacing between the checkbox and its label text (default: `4`)
 * - `isChecked`: If `true`, the checkbox will be checked.
 * - `onChange`: The callback invoked when the checked state of the `Checkbox` changes
 * - `inputProps`: Additional props to be forwarded to the `input` element
 * - `htmlFor`: Input id and value for `htmlFor` attribute of `<label></label>` tag
 * - `labelClassName`: Class name in case of overriding the tailwind class of the `<label></label>` tag
 * - `wrapperClassName`: Class name in case of overriding the tailwind class of the checkbox container
 *
 * @example
 *
 * ```jsx
 *  <CheckBox />
 *  <CheckBox isDisabled />
 *  <CheckBox isDisabled>Check mark</CheckBox>
 * ```
 */
export const CheckBox: React.FC<CheckBoxProps> = (props) => {
  const {
    children,
    className,
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
      <label className='inline-flex justify-center items-center min-h-[28px]'>
        <input
          type='checkbox'
          className={mergedInputClsx}
          checked={isChecked}
          onChange={onChange}
          disabled={isDisabled}
          {...inputProps}
        />
        {children && <label className={mergedLabelClsx}>{children}</label>}
      </label>
    </span>
  );
};
