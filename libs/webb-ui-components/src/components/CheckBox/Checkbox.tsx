import { InformationLine } from '@webb-tools/icons/InformationLine';
import cx from 'classnames';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip/Tooltip';
import Button from '../buttons/Button';
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
    id,
    info,
    inputProps = {},
    isChecked,
    isDisabled,
    labelClassName: labelClsxProp,
    labelVariant = 'body1',
    onChange,
    spacingClassName = 'ml-2',
    wrapperClassName,
  } = props;

  const inputClsx =
    'form-checkbox peer transition-none bg-mono-0 w-[18px] h-[18px] rounded border-2 border-mono-100 outline-none dark:bg-mono-180 focus:ring-offset-0 focus:ring-0';

  const inputHoverClsx =
    'enabled:hover:shadow-sm enabled:hover:shadow-blue-10 dark:hover:shadow-none';

  const inputCheckedClsx =
    'checked:!bg-blue-50 checked:hover:bg-blue-50 checked:active:!bg-blue-60 dark:checked:active:!bg-blue-40';

  const inputDisabledClsx =
    'disabled:border-mono-60 dark:disabled:border-mono-140 disabled:cursor-not-allowed disabled:shadow-none';

  const inputCursorClsx =
    'cursor-pointer disabled:cursor-not-allowed peer-disabled:cursor-not-allowed';

  const mergedInputClsx = twMerge(
    inputCursorClsx,
    inputClsx,
    inputHoverClsx,
    inputCheckedClsx,
    inputDisabledClsx,
    className,
  );

  const labelClsx = cx(
    'inline-block peer-disabled:cursor-not-allowed peer-disabled:text-mono-100',
    'text-mono-140 dark:text-mono-20',
    labelVariant,
    spacingClassName,
  );

  const mergedLabelClsx = twMerge(labelClsx, labelClsxProp);

  return (
    <label className={twMerge('inline-flex', wrapperClassName)}>
      <div className="min-w-[28px]">
        <div className="relative group min-h-[28px]">
          <input
            id={id}
            type="checkbox"
            className={twMerge(
              mergedInputClsx,
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            )}
            checked={isChecked}
            onChange={onChange}
            disabled={isDisabled}
            {...inputProps}
          />
          <span
            className={twMerge(
              'w-[34px] h-[34px] rounded-full',
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'bg-[rgba(89,83,249,0.10)] group-active:bg-[rgba(89,83,249,0.20)]',
              'dark:bg-[rgba(89,83,249,0.20)] dark:group-active:bg-[rgba(89,83,249,0.30)]',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out',
            )}
          />
        </div>
      </div>

      {children && <span className={mergedLabelClsx}>{children}</span>}

      {info && (
        <Tooltip delayDuration={100}>
          <TooltipTrigger className="ml-1 text-center" asChild>
            <span className="cursor-pointer peer-disabled:text-mono-120">
              <InformationLine className="!fill-current pointer-events-none" />
            </span>
          </TooltipTrigger>

          <TooltipBody
            title={info.title}
            className="max-w-[185px] break-normal"
            button={
              info.buttonProps && (
                <Button {...info.buttonProps} variant="utility" size="sm">
                  {info.buttonText ?? 'Learn more'}
                </Button>
              )
            }
          >
            {info.content}
          </TooltipBody>
        </Tooltip>
      )}
    </label>
  );
};
