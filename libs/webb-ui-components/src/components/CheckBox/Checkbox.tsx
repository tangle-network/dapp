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
    spacingClassName = 'ml-4',
    labelClassName: labelClsxProp,
    wrapperClassName,
    labelVariant = 'body1',
    id,
  } = props;

  const inputClsx =
    'form-checkbox peer transition-none bg-mono-0 w-[18px] h-[18px] rounded border border-mono-100 outline-none dark:bg-mono-180';
  const inputHoverClsx =
    'hover:bg-blue-10 hover:border-blue-40 hover:shadow-sm hover:shadow-blue-10 dark:hover:bg-blue-120 dark:hover:border-blue-90 dark:hover:shadow-none';
  const inputCheckedClsx = 'checked:bg-blue-70 dark:checked:bg-blue-50';
  const inputDisabledClsx =
    'disabled:border-mono-60 disabled:cursor-not-allowed disabled:bg-mono-0 disabled:shadow-none dark:disabled:bg-mono-140 dark:disabled:border-mono-120';

  const mergedInputClsx = twMerge(
    inputClsx,
    inputHoverClsx,
    inputCheckedClsx,
    inputDisabledClsx,
    className
  );

  const labelClsx = cx(
    'inline-block peer-disabled:cursor-not-allowed',
    isDisabled ? 'text-mono-120' : 'text-mono-140 dark:text-mono-20',
    labelVariant,
    spacingClassName
  );
  const mergedLabelClsx = twMerge(labelClsx, labelClsxProp);

  return (
    <label className={twMerge('inline-flex min-h-[28px]', wrapperClassName)}>
      <input
        id={id}
        type="checkbox"
        className={mergedInputClsx}
        checked={isChecked}
        onChange={onChange}
        disabled={isDisabled}
        {...inputProps}
      />
      {children && <label className={mergedLabelClsx}>{children}</label>}
    </label>
  );
};
