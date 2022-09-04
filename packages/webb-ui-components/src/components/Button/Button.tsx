import React from 'react';
import { twMerge } from 'tailwind-merge';

import { ButtonSpinner } from './ButtonSpinner';
import { ButtonContentProps, ButtonProps } from './types';
import { getButtonClassNameByVariant } from './utils';

export const Button: React.FC<ButtonProps> = (props) => {
  const {
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
  } = props;

  const mergedClassName = twMerge(getButtonClassNameByVariant(varirant, size), className);

  const contentProps = { children, iconSpacing, leftIcon, rightIcon };

  return (
    <button disabled={isDisabled || isLoading} data-loading={isLoading} className={mergedClassName}>
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
    </button>
  );
};

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
