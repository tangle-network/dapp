'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from '@tangle-network/icons';
import cx from 'classnames';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { DropdownButtonProps } from './types';

/**
 * The `DropdownMenu` trigger function, must use inside the `Dropdown` component
 */
export const DropdownButton = forwardRef<
  HTMLButtonElement,
  DropdownButtonProps
>(
  (
    {
      className,
      icon,
      label,
      size,
      isFullWidth,
      isHideArrowIcon,
      arrowElement = <ChevronDown />,
      ...props
    },
    ref,
  ) => {
    const arrowIconDefaultClassNames =
      'mx-2 transition-transform duration-300 ease-in-out enabled:group-radix-state-open:rotate-180';

    return (
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          {...props}
          className={twMerge(
            cx(
              'border rounded-lg uppercase group',
              'transition-none transition-[border-radius]',
              'pl-4 py-2',
              isFullWidth && 'inline-block w-full',
              size === 'md' ? 'min-w-[176px]' : 'min-w-[96px]',
              'flex items-center justify-between',
              'bg-mono-0 dark:bg-mono-180',
              'border-mono-80 dark:border-mono-120',
              'text-mono-140 dark:text-mono-40',
              'hover:enabled:border-blue-40 dark:hover:enabled:border-blue-70',
              'enabled:radix-state-open:border-blue-40 dark:enabled:radix-state-open:border-blue-70',
              'enabled:radix-state-open:bg-blue-0 dark:enabled:radix-state-open:bg-blue-120',
              size !== 'sm' && 'enabled:radix-state-open:rounded-t-lg',
              size !== 'sm' && 'enabled:radix-state-open:rounded-b-none',
            ),
            className,
          )}
          ref={ref}
        >
          <div className="flex items-center max-w-full gap-2 overflow-x-hidden">
            {icon && <span className="text-inherit">{icon}</span>}

            {typeof label === 'string' ? (
              <span
                className={cx(
                  'text-inherit',
                  size === 'md' ? 'body1' : 'body2',
                )}
              >
                {label}
              </span>
            ) : (
              label
            )}
          </div>

          {!isHideArrowIcon &&
            (typeof arrowElement === 'string' ? (
              <span className={arrowIconDefaultClassNames}>{arrowElement}</span>
            ) : React.isValidElement(arrowElement) ? (
              React.cloneElement(arrowElement as React.ReactElement, {
                className: twMerge(
                  cx(
                    arrowIconDefaultClassNames,
                    (arrowElement as React.ReactElement).props?.className,
                  ),
                ),
              })
            ) : (
              <div className={arrowIconDefaultClassNames}>{arrowElement}</div>
            ))}
        </button>
      </DropdownMenuPrimitive.Trigger>
    );
  },
);
