import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { IconButtonProps } from './types';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';

const IconButton = forwardRef<React.ElementRef<'button'>, IconButtonProps>(
  ({ className, tooltip, ...props }, ref) => {
    const content = (
      <button
        {...props}
        type="button"
        ref={ref}
        className={twMerge(
          'p-2 rounded-lg',
          'hover:bg-mono-20 dark:hover:bg-mono-160',
          'text-mono-200 dark:text-mono-0',
          className,
        )}
      />
    );

    return tooltip !== undefined ? (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>

        <TooltipBody>{tooltip}</TooltipBody>
      </Tooltip>
    ) : (
      content
    );
  },
);

IconButton.displayName = 'IconButton';

export default IconButton;
