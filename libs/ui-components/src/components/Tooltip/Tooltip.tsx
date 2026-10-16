'use client';

import {
  Tooltip as SharedTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@tangle-network/ui/primitives';
import { forwardRef, type ElementRef } from 'react';
import { twMerge } from 'tailwind-merge';
import type { TooltipBodyProps, TooltipProps } from './types';

// Keep the established public prop names and composed title/action content.
// The shared package owns rendering, portal placement, state and motion.
export const TooltipBody = forwardRef<
  ElementRef<typeof TooltipContent>,
  TooltipBodyProps
>(({ button, children, className, title, isDisablePortal, ...props }, ref) => (
  <TooltipContent
    ref={ref}
    sideOffset={4}
    {...props}
    portal={!isDisablePortal}
  >
    <div
      className={twMerge(
        'body2 !text-inherit text-center break-normal font-normal min-w-0 max-w-[250px]',
        className,
      )}
    >
      {title && <h6 className="mb-2 utility !text-inherit">{title}</h6>}
      {children}
      {button && <div className="flex justify-end mt-4">{button}</div>}
    </div>
  </TooltipContent>
));
TooltipBody.displayName = 'TooltipBody';

export { TooltipTrigger };

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  isDefaultOpen,
  isDisableHoverableContent,
  isOpen,
  onChange,
  delayDuration = 100,
  ...props
}) => (
  <TooltipProvider>
    <SharedTooltip
      {...props}
      defaultOpen={isDefaultOpen}
      open={isOpen}
      onOpenChange={onChange}
      disableHoverableContent={isDisableHoverableContent}
      delayDuration={delayDuration}
    >
      {children}
    </SharedTooltip>
  </TooltipProvider>
);
