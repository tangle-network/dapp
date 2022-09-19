import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { CardProps } from './types';

/**
 * The `Card` component
 * Setup styles, spacing vertically between `block` components
 *
 * @example
 *
 * ```jsx
 *  <Card>
 *    ...
 *  </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className, ...props }, ref) => {
  const cardClsx = useMemo(
    () => twMerge('flex flex-col w-full p-4 space-y-6 rounded-lg bg-mono-0 dark:bg-mono-160', className),
    [className]
  );

  return (
    <div {...props} className={cardClsx} ref={ref}>
      {children}
    </div>
  );
});
