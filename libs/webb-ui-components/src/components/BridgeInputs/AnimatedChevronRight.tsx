import { ChevronRight } from '@webb-tools/icons';
import { ComponentProps, memo } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Extract icon to prevent re-render and keep the animation
 */
export const AnimatedChevronRight = memo<ComponentProps<typeof ChevronRight>>(
  ({ className, ...props }) => (
    <ChevronRight
      {...props}
      className={twMerge(
        'inline-block',
        'transition-transform duration-300 ease-in-out group-radix-state-open:rotate-90',
        className
      )}
    />
  )
);
