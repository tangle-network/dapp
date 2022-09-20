import cx from 'classnames';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { ButtonSpinner } from './ButtonSpinner';
import { ButtonContentProps, ButtonProps } from './types';
import { useButtonProps } from './use-button-props';
import { getButtonClassNameByVariant } from './utils';

/**
 * The Webb Button Component
 *
 * Props:
 *
 * - `isLoading`: If `true`, the button will show a spinner
 * - `isDisabled`: If `true`, the button will be disabled
 * - `loadingText`: The label to show in the button when `isLoading` is true. If no text is passed, it only shows the spinner
 * - `variant`: The button variant (default `primary`)
 * - `leftIcon`: If added, the button will show an icon before the button's label
 * - `rightIcon`:If added, the button will show an icon after the button's label
 * - `iconSpacing`: The space between the button icon and label, the spacing number will match the spacing in design sytem
 * - `spinner`: Replace the spinner component when `isLoading` is set to `true`
 * - `spinnerPlacement`: It determines the placement of the spinner when `isLoading` is `true`
 * - `size`: The button size
 *
 * @example
 *
 * ```jsx
 *  <Button variant="secondary">Button</Button>
 *  <Button variant="utility" isLoading>Button</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    as: asProps,
    children,
    className,
    iconSpacing = 2,
    isDisabled,
    isLoading,
    leftIcon,
    loadingText,
    rightIcon,
    size = 'md',
    spinner,
    spinnerPlacement = 'start',
    varirant = 'primary',
    ...restProps
  } = props;

  const [buttonProps, { tagName: Component }] = useButtonProps({ tagName: asProps, isDisabled, ...restProps });

  const mergedClassName = twMerge(getButtonClassNameByVariant(varirant, size), className);

  const contentProps = { children, iconSpacing, leftIcon, rightIcon };

  return (
    <div className={cx('inline-block', isDisabled ? 'cursor-not-allowed' : '')}>
      <Component
        {...restProps}
        {...buttonProps}
        disabled={buttonProps.disabled || isLoading}
        className={mergedClassName}
        ref={ref}
      >
        {isLoading && spinnerPlacement === 'start' && (
          <ButtonSpinner label={loadingText} spacing={iconSpacing}>
            {spinner}
          </ButtonSpinner>
        )}

        {isLoading ? (
          loadingText || (
            <span className='opacity-0'>
              <ButtonContent {...contentProps} />
            </span>
          )
        ) : (
          <ButtonContent {...contentProps} />
        )}

        {isLoading && spinnerPlacement === 'end' && (
          <ButtonSpinner label={loadingText} spacing={iconSpacing} placement='end'>
            {spinner}
          </ButtonSpinner>
        )}
      </Component>
    </div>
  );
});

/***** Internal components */

function ButtonContent(props: ButtonContentProps) {
  const { children, iconSpacing = 2, leftIcon, rightIcon } = props;

  return (
    <>
      {leftIcon && <span className={`mr-${iconSpacing}`}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={`mt-${iconSpacing}`}>{rightIcon}</span>}
    </>
  );
}
