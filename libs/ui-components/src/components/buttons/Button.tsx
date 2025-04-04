'use client';

import { getFlexBasic } from '@tangle-network/icons/utils';
import cx from 'classnames';
import { twMerge } from 'tailwind-merge';
import ButtonSpinner from './ButtonSpinner';
import { ButtonContentProps, ButtonProps } from './types';
import { useButtonProps } from './use-button-props';
import { getButtonClassNameByVariant } from './utils';
import { forwardRef } from 'react';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';

/**
 * The Button Component
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
const Button = forwardRef<HTMLElement, ButtonProps>((props, ref) => {
  const {
    as: asProps,
    children,
    className,
    isDisabled,
    isFullWidth,
    isLoading,
    leftIcon,
    loadingText,
    // TODO: Icons don't inherit the color of the button's variant, they just stay white.
    rightIcon,
    size = 'md',
    spinner,
    spinnerPlacement = 'start',
    variant = 'primary',
    isJustIcon,
    disabledTooltip,
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
    isJustIcon && variant === 'utility' ? 'p-2' : '',
    className,
  );

  const contentProps = { children, leftIcon, rightIcon, variant };

  const button = (
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

  // If the button isn't disabled or a tooltip for the disabled state isn't
  // provided, just return the button as is.
  if (disabledTooltip === undefined || !isDisabled) {
    return button;
  }

  return (
    <Tooltip>
      {/** TODO: Erroring due to need for `asChild`, but when `asChild` is passed, the tooltip doesn't appear. */}
      <TooltipTrigger>{button}</TooltipTrigger>

      <TooltipBody>{disabledTooltip}</TooltipBody>
    </Tooltip>
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
            children ? (variant === 'link' ? 'mr-1' : 'mr-2') : null,
            'block !text-inherit',
            'grow-0 shrink-0',
            getFlexBasic(leftIcon.props.size),
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
            children ? (variant === 'link' ? 'ml-1' : 'ml-2') : null,
            'block !text-inherit',
            'grow-0 shrink-0',
            getFlexBasic(rightIcon.props.size),
          )}
        >
          {rightIcon}
        </span>
      )}
    </>
  );
}

export default Button;
