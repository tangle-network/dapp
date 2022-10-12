import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import cx from 'classnames';
import { cloneElement, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { TooltipBodyProps, TooltipProps, TooltipTriggerProps } from './types';

/**
 * The `ToolTipBody` component, use after the `TooltipTrigger`.
 * Reresents the popup content of the tooltip.
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
export const TooltipBody: React.FC<TooltipBodyProps> = ({ button, children, className, title, ...props }) => {
  return (
    <TooltipPrimitive.Content
      sideOffset={4}
      className={cx(
        'radix-side-top:animate-slide-down-fade',
        'radix-side-right:animate-slide-left-fade',
        'radix-side-bottom:animate-slide-up-fade',
        'radix-side-left:animate-slide-right-fade',
        'inline-flex items-center break-all rounded p-2 min-w-0 max-w-[300px]',
        'bg-mono-20 dark:bg-mono-160',
        'webb-shadow-sm'
      )}
      {...props}
    >
      <TooltipPrimitive.Arrow className='fill-current text-mono-20 dark:text-mono-160 webb-shadow-sm' />
      <div className={twMerge('body4 text-mono-140 dark:text-mono-80 font-normal', className)}>
        {title && <h6 className='mb-2 utility'>{title}</h6>}
        {children}
        {button && <div className='flex justify-end mt-4'>{button}</div>}
      </div>
    </TooltipPrimitive.Content>
  );
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
export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ children, className, ...props }) => {
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
  className,
  isDefaultOpen,
  isDisableHoverableContent,
  isOpen,
  onChange,
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
      >
        {children}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
