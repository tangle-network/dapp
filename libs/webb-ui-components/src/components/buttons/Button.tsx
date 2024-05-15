import { getFlexBasic } from '@webb-tools/icons/utils.js';
import cx from 'classnames';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import ButtonSpinner from './ButtonSpinner.js';
import { ButtonContentProps, ButtonProps } from './types.js';
import { useButtonProps } from './use-button-props.js';
import { getButtonClassNameByVariant } from './utils.js';

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
const Button = React.forwardRef<HTMLElement, ButtonProps>((props, ref) => {
  const {
    as: asProps,
    children,
    className,
    isDisabled,
    isFullWidth,
    isLoading,
    leftIcon,
    loadingText,
    rightIcon,
    size = 'md',
    spinner,
    spinnerPlacement = 'start',
    variant = 'primary',
    ...restProps
  } = props;

  const [buttonProps, { tagName: Component }] = useButtonProps({
    tagName: asProps,
    isDisabled,
    ...restProps,
  });

  const mergedClassName = twMerge(
    'max-w-max',
    cx({ 'w-full max-w-none justify-center': isFullWidth }),
    getButtonClassNameByVariant(variant, size),
    className
  );

  const contentProps = { children, leftIcon, rightIcon, variant };

  return (
    <Component
      {...restProps}
      {...buttonProps}
      disabled={buttonProps.disabled || isLoading}
      className={cx(mergedClassName)}
      ref={ref}
    >
      {isLoading && spinnerPlacement === 'start' && (
        <ButtonSpinner hasLabel={!!loadingText}>{spinner}</ButtonSpinner>
      )}
      {isLoading ? (
        loadingText || (
          <span className="opacity-0">
            <ButtonContent {...contentProps} />
          </span>
        )
      ) : (
        <ButtonContent {...contentProps} />
      )}
      {isLoading && spinnerPlacement === 'end' && (
        <ButtonSpinner hasLabel={!!loadingText} placement="end">
          {spinner}
        </ButtonSpinner>
      )}
    </Component>
  );
});

/***** Internal components */

function ButtonContent(props: ButtonContentProps) {
  const { children, leftIcon, rightIcon, variant } = props;

  return (
    <>
      {leftIcon && (
        <span
          className={cx(
            variant === 'link' ? 'mr-1' : 'mr-2',
            'block !text-inherit',
            'grow-0 shrink-0',
            getFlexBasic(leftIcon.props.size)
          )}
        >
          {leftIcon}
        </span>
      )}
      {/* The whitespace-nowrap class is added here to prevent text wrapping */}
      <span className={cx('block !text-inherit whitespace-nowrap')}>
        {children}
      </span>
      {rightIcon && (
        <span
          className={cx(
            variant === 'link' ? 'ml-1' : 'ml-2',
            'block !text-inherit',
            'grow-0 shrink-0',
            getFlexBasic(rightIcon.props.size)
          )}
        >
          {rightIcon}
        </span>
      )}
    </>
  );
}

export default Button;
