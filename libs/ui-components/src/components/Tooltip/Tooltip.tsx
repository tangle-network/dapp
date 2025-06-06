'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import cx from 'classnames';
import { twMerge } from 'tailwind-merge';

import { TooltipBodyProps, TooltipProps, TooltipTriggerProps } from './types';

/**
 * The `ToolTipBody` component, use after the `TooltipTrigger`.
 * Represents the popup content of the tooltip.
 * Must use inside the `Tooltip` component.
 *
 * @example
 *
 * ```jsx
 *    <ToolTipBody className='max-w-[185px] w-auto'>
 *      <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>
 *    </ToolTipBody>
 * ```
 */
export const TooltipBody: React.FC<TooltipBodyProps> = ({
  button,
  children,
  className,
  title,
  isDisablePortal,
  ...props
}) => {
  const inner = (
    <TooltipPrimitive.Content
      sideOffset={4}
      className={cx(
        'radix-side-top:animate-slide-down-fade',
        'radix-side-right:animate-slide-left-fade',
        'radix-side-bottom:animate-slide-up-fade',
        'radix-side-left:animate-slide-right-fade',
        'inline-flex items-center break-all rounded px-3 py-2',
        'bg-mono-20 dark:bg-mono-200',
        'border border-mono-60 dark:border-mono-180',
        'shadow-sm z-[9999]',
      )}
      {...props}
    >
      <div
        className={twMerge(
          'body2 text-mono-140 dark:text-mono-80 text-center break-normal font-normal min-w-0 max-w-[250px]',
          className,
        )}
      >
        {title && <h6 className="mb-2 utility">{title}</h6>}
        {children}
        {button && <div className="flex justify-end mt-4">{button}</div>}
      </div>
    </TooltipPrimitive.Content>
  );

  if (isDisablePortal) {
    return inner;
  }

  return <TooltipPrimitive.Portal>{inner}</TooltipPrimitive.Portal>;
};

/**
 * The `TooltipTrigger` component, wrap around a trigger component like `Button` or `Chip` or a html tag.
 * Must use inside the `Tooltip` component.
 *
 * @example
 *
 * ```jsx
 *    <ToolTipTrigger>
 *      <Chip color='blue'>Text only</Chip>
 *    </ToolTipTrigger>
 * ```
 */
export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <TooltipPrimitive.Trigger className={className} {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  );
};

/**
 * The `Tooltip` component.
 *
 * @example
 *
 * ```jsx
 *    <Tooltip isDefaultOpen>
 *      <ToolTipTrigger>
 *        <Chip color='blue'>Text only</Chip>
 *      </ToolTipTrigger>
 *      <ToolTipBody className='max-w-[185px] w-auto'>
 *        <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>
 *      </ToolTipBody>
 *    </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  isDefaultOpen,
  isDisableHoverableContent,
  isOpen,
  onChange,
  delayDuration = 100,
  ...props
}) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root
        {...props}
        defaultOpen={isDefaultOpen}
        open={isOpen}
        onOpenChange={onChange}
        disableHoverableContent={isDisableHoverableContent}
        delayDuration={delayDuration}
      >
        {children}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
