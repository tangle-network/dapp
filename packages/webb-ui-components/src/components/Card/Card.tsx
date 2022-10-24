import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { CardProps } from './types';

/**
 * The `Card` component
 * Sets up styles, and spacing vertically between `block` components
 *
 * @example
 *
 * ```jsx
 * <Card>
 *   <TitleWithInfo title='Token Selector' variant='h4' />
 *   <div className='flex items-center space-x-4'>
 *     <TokenSelector>ETH</TokenSelector>
 *     <TokenSelector>DOT</TokenSelector>
 *     <TokenSelector isActive>KSM</TokenSelector>
 *   </div>
 * </Card>;
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
